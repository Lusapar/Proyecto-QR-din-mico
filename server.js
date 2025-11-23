const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("✔️ API Proyecto QR Dinámico funcionando. Usa /verify, /generate, etc.");
});
const db = new sqlite3.Database('./db.sqlite');
db.run('PRAGMA foreign_keys = OFF;'); 
const PORT = process.env.PORT || 3000;
// 🔒 API KEY
const API_KEY = process.env.GENERATE_API_KEY || 'clave_demo_123';

// 🔐 Generar token aleatorio
function genToken(len = 24) {
  return crypto.randomBytes(len).toString('hex');
}
// ⏰ Horario habilitado: desde 00:00 hasta antes de las 14:00
function estaEnHorarioHabilitado() {
  const ahora = new Date();
  const horas = ahora.getHours();   // 0 - 23
  const minutos = ahora.getMinutes();
  const totalMin = horas * 60 + minutos;

  const limiteFinMin = 14 * 60; // 14:00 → 14 * 60 = 840

  // Habilitado solo desde 00:00 hasta 13:59
  return totalMin < limiteFinMin;
}

  function normalizarCurso(cursoRaw = "") {
  const c = (" " + cursoRaw.toLowerCase() + " ");

  if (c.includes(" a ") || c.includes(" a-") || c.includes(" a -")) {
    return "A - Informática";
  }
  if (c.includes(" b ") || c.includes(" b-") || c.includes(" b -")) {
    return "B - Informática";
  }
  return cursoRaw.trim();
}

// Fecha muy lejana solo para rellenar la columna expires (ya NO se usa para lógica)
const FAR_FUTURE_EXPIRES = Math.floor(
  new Date('2099-01-01T00:00:00Z').getTime() / 1000
);

// Middleware de API key
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (!key || key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ===================== /generate =====================
app.post('/generate', requireApiKey, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });

  db.get('SELECT id, name, course, exp FROM students WHERE id = ?', [id], (err, student) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const now = Math.floor(Date.now() / 1000);

    // 🔁 Reutilizar token NO revocado (ya no revisamos expires)
    db.get(
      `SELECT token, expires FROM tokens
       WHERE student_id = ? AND revoked = 0
       ORDER BY created_at DESC LIMIT 1`,
      [id],
      (err2, existing) => {
        if (err2) return res.status(500).json({ error: 'DB error' });

        if (existing) {
          const payload = {
            id: student.id,
            token: existing.token,
            // Mantengo expires solo por compatibilidad, pero es súper lejano
            expires: new Date(existing.expires * 1000).toISOString()
          };
          console.log(`♻️ Reutilizando token activo de ${id}`);
          return res.json({ status: 'ok', reused: true, payload, student });
        }

        // 🆕 Crear nuevo token (SIN expiración real)
        const token = genToken();
        const expires = FAR_FUTURE_EXPIRES;

        db.run(
          'INSERT INTO tokens (token, student_id, expires, created_at) VALUES (?, ?, ?, ?)',
          [token, id, expires, now],
          (err3) => {
            if (err3) return res.status(500).json({ error: 'DB insert error' });

            const payload = {
              id: student.id,
              token,
              expires: new Date(expires * 1000).toISOString()
            };
            console.log(`✅ Nuevo token generado para ${id}`);
            res.json({ status: 'ok', reused: false, payload, student });
          }
        );
      }
    );
  });
});

// ===================== /verify =====================
app.get('/verify', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'token required' });

  // ⏰ Primero: validar horario
  if (!estaEnHorarioHabilitado()) {
    console.log('⏰ Intento de uso fuera de horario');
    return res.json({
      status: 'disabled_time',
      message: '⏰ El QR está deshabilitado. Solo funciona hasta las 14:00.'
    });
  }

  const now = Math.floor(Date.now() / 1000);



  db.get(
    `SELECT t.token, t.student_id, t.expires, t.revoked, 
            s.name, s.course, s.exp AS student_exp
     FROM tokens t
     LEFT JOIN students s ON s.id = t.student_id
     WHERE t.token = ?`,
    [token],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!row) return res.json({ status: 'not_found' });
      if (row.revoked) return res.json({ status: 'revoked' });
      // ❌ Ya no usamos expiración del token para bloquear
      // if (row.expires < now) return res.json({ status: 'expired' });

      const studentExp = new Date(row.student_exp).getTime() / 1000;
      if (studentExp < now) return res.json({ status: 'student_expired' });

      const nowDate = new Date();
      const today = nowDate.toISOString().split('T')[0];
      const hours = nowDate.getHours();
      const minutes = nowDate.getMinutes();

      // Asistencia o atraso (según la hora)
      let status = "asistido";
      if (hours > 7 || (hours === 7 && minutes > 1)) status = "atraso";

const cursoNorm = normalizarCurso(row.course);
console.log("📌 curso raw:", row.course, "→ cursoNorm:", cursoNorm);

      db.get(
  `SELECT tutor, phone FROM courses
   WHERE LOWER(name) = LOWER(?)
   LIMIT 1`,
  [cursoNorm],
  (err2, course) => {
    const tutor = course ? course.tutor : "Sin asignar";
    const phone = course ? course.phone : null;

    // sigue tu db.all(...) normal aquí



          db.all(
            `SELECT id, status FROM attendance 
             WHERE student_id = ? AND date = ? 
             ORDER BY id ASC`,
            [row.student_id, today],
            (err3, records) => {
              if (err3) {
                console.error("⚠️ Error al consultar registros:", err3.message);
                return res.status(500).json({ error: 'DB error' });
              }

              // 1er escaneo → ENTRADA
              if (records.length === 0) {
                db.run(
                  `INSERT INTO attendance 
                   (student_id, course, tutor, status, date) 
                   VALUES (?, ?, ?, ?, ?)`,
                  [row.student_id, row.course, tutor, status, today],
                  (err4) => {
                    if (err4)
                      console.error("⚠️ Error registrando asistencia:", err4.message);
                    else
                      console.log(`✅ Entrada registrada: ${row.name} (${row.course})`);
                    return res.json({
                      status: 'valid',
                      action: 'entrada',
                      student: { id: row.student_id, name: row.name, course: row.course }
                    });
                  }
                );
              }

              // 2do escaneo → SALIDA y se revoca el token
              else if (records.length === 1) {
                db.run(
                  `INSERT INTO attendance 
                   (student_id, course, tutor, status, date) 
                   VALUES (?, ?, ?, ?, ?)`,
                  [row.student_id, row.course, tutor, 'salida', today],
                  (err5) => {
                    if (err5)
                      console.error("⚠️ Error registrando salida:", err5.message);
                    else
                      console.log(`👋 Salida registrada: ${row.name} (${row.course})`);

                    db.run('UPDATE tokens SET revoked = 1 WHERE token = ?', [token]);
                    return res.json({
                      status: 'valid',
                      action: 'salida',
                      student: { id: row.student_id, name: row.name, course: row.course }
                    });
                  }
                );
              }

              // 3er intento o más → bloqueado
              else {
                console.log(`🚫 Intento extra: ${row.name} (${row.course})`);
                return res.json({ status: 'limit_reached' });
              }
            }
          );
        }
      );
    }
  );
});

// ===================== /revoke =====================
app.post('/revoke', requireApiKey, (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });

  db.run('UPDATE tokens SET revoked = 1 WHERE token = ?', [token], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Token not found' });
    res.json({ status: 'revoked' });
  });
});

// ❌ Eliminado el borrado periódico de tokens expirados, ya no se usan expiraciones reales
// setInterval(() => {
//   const now = Math.floor(Date.now() / 1000);
//   db.run('DELETE FROM tokens WHERE expires < ?', [now]);
// }, 600000);

// ===================== /active-tokens =====================
app.get('/active-tokens', requireApiKey, (req, res) => {
  db.all(
    `SELECT t.token, t.student_id, t.expires, s.name, s.course
     FROM tokens t
     LEFT JOIN students s ON s.id = t.student_id
     WHERE t.revoked = 0
     ORDER BY t.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    }
  );
});

// ===================== /register-attendance =====================
app.post('/register-attendance', (req, res) => {
  const { student_id, course, status } = req.body;
  if (!student_id || !course || !status) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  db.get('SELECT tutor FROM courses WHERE name = ?', [course], (err, courseRow) => {
    if (err) return res.status(500).json({ error: 'Error buscando tutor' });
    if (!courseRow) return res.status(404).json({ error: 'Curso no encontrado' });

    const tutor = courseRow.tutor;
    const today = new Date().toISOString().split('T')[0];

    db.get(
      `SELECT id FROM attendance WHERE student_id = ? AND date = ?`,
      [student_id, today],
      (err4, existing) => {
        if (err4) {
          console.error("⚠️ Error comprobando duplicado:", err4.message);
          return res.status(500).json({ error: 'Error comprobando duplicado' });
        }

        if (existing) {
          console.log(`⚠️ Ya registrado hoy: ${student_id} (${course})`);
          return res.json({ status: 'duplicate', message: 'Estudiante ya registrado hoy' });
        }

        db.run(
          'INSERT INTO attendance (student_id, course, tutor, status, date) VALUES (?, ?, ?, ?, ?)',
          [student_id, course, tutor, status, today],
          function (err3) {
            if (err3) return res.status(500).json({ error: 'DB insert error' });
            console.log(`📋 Asistencia registrada: ${student_id} (${course}) - ${status}`);
            res.json({ status: 'ok', tutor, id: this.lastID });
          }
        );
      }
    );
  });
});

// ===================== Rutas de consulta de asistencia =====================
app.get('/attendance', (req, res) => {
  const { course } = req.query;

  let sql = `
  SELECT 
    a.student_id,
    s.name,
    a.course,
    COALESCE(a.tutor, c.tutor) AS tutor,
    c.phone,
    a.status,
    a.date
  FROM attendance a
  LEFT JOIN students s ON s.id = a.student_id
  LEFT JOIN courses c 
    ON LOWER(TRIM(c.name)) = LOWER(TRIM(a.course))
`;


  const params = [];

  if (course) {
    sql += ' WHERE a.course = ?';
    params.push(course);
  }

  sql += ' ORDER BY a.date DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});


// ===================== /students =====================
app.get('/students', (req, res) => {
  const { course } = req.query;
  if (!course) return res.status(400).json({ error: 'course required' });

  db.all('SELECT id, name, course FROM students WHERE course LIKE ?', [`%${course}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// 🌙 A las 00:00 reactivar todos los tokens (nuevo día)
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    db.run('UPDATE tokens SET revoked = 0');
    console.log('🌙 Todos los QR reactivados automáticamente (nuevo día)');
  }
}, 60000);

app.listen(PORT, () => console.log(`✅ Servidor ejecutándose en puerto ${PORT}`));
