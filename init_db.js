
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    course TEXT,
    exp DATE
  )`);
 
  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    token TEXT PRIMARY KEY,
    student_id TEXT,
    expires INTEGER,
    revoked INTEGER DEFAULT 0,
    created_at INTEGER,
    FOREIGN KEY(student_id) REFERENCES students(id)
  )`);
db.run(`INSERT OR IGNORE INTO students (id, name, course, exp) VALUES
  ('S001','Apolinario Velez Willian Antonio','A - Informática','2026-07-31'),
  ('S002','Lisseth Britney Arreaga Moran','A - Informática','2026-07-31'),
  ('S003','George Luis Arteaga Candelario','A - Informática','2026-07-31'),
  ('S004','Elkin Guillermo Barcia Avila','A - Informática','2026-07-31'),
  ('S005','Danny Jair Caicedo Balladares','A - Informática','2026-07-31'),
  ('S006','Walter Issac Caicedo Jacho','A - Informática','2026-07-31'),
  ('S007','Kenneth Israel Candelario Rodriguez','A - Informática','2026-07-31'),
  ('S008','Jordy Stiven Cordova Mendoza','A - Informática','2026-07-31'),
  ('S009','Stalin Andres Cruz Tomala','A - Informática','2026-07-31'),
  ('S010','Anthony Samuel Echerre Menendez','A - Informática','2026-07-31'),
  ('S011','Xavier Santos España Vera','A - Informática','2026-07-31'),
  ('S012','Emily Jacqueline Fariño Villegas','A - Informática','2026-07-31'),
  ('S013','Angelina Jolie Franco Freire','A - Informática','2026-07-31'),
  ('S014','Elizabeth Sara Mesias Pluas','A - Informática','2026-07-31'),
  ('S015','Mejia Fernanda Mejia Herrera','A - Informática','2026-07-31'),
  ('S016','Romina Carolina Ortiz Marcial','A - Informática','2026-07-31'),
  ('S017','Dylan Jeshua Ortiz Zambrano','A - Informática','2026-07-31'),
  ('S018','Julio Adrian Parra Solorzano','A - Informática','2026-07-31'),
  ('S019','Justin Stalin Parraga Guerrero','A - Informática','2026-07-31'),
  ('S020','Alcides Junior Parrales Yunga','A - Informática','2026-07-31'),
  ('S021','Johnny Alexis Pincay Cordero','A - Informática','2026-07-31'),
  ('S022','Alan Gabriel Pincay Mendoza','A - Informática','2026-07-31'),
  ('S023','Jair Adrian Poveda Herrera','A - Informática','2026-07-31'),
  ('S024','Danna Paulette Plua Decaro','A - Informática','2026-07-31'),
  ('S025','Jose Daniel Quijije Navarrete','A - Informática','2026-07-31'),
  ('S026','Jhon Ariel Ramos Salas','A - Informática','2026-07-31'),
  ('S027','Andy Bruce Sellan Molineros','A - Informática','2026-07-31'),
  ('S028','Angel Fabricio Suarez Vera','A - Informática','2026-07-31'),
  ('S029','Rossemberd Stiven Tigua Holguin','A - Informática','2026-07-31'),
  ('S030','Milagros Isabel Tomala Suarez','A - Informática','2026-07-31'),
  ('S031','Victor Emanuel Valdez Rodriguez','A - Informática','2026-07-31'),
  ('S032','David Eliseo Vera Briones','A - Informática','2026-07-31'),
  ('S033','Ashely Pierina Villacreses Bermudez','A - Informática','2026-07-31')
`);

db.run(`INSERT OR IGNORE INTO students (id, name, course, exp) VALUES
  ('S034','ACOSTA CANTOS ELKIN MANUEL','B - Informática','2026-07-31'),
  ('S035','BASURTO BOZA SANTIAGO ANTONIO','B - Informática','2026-07-31'),
  ('S036','BERMEO MACIAS ALEX AARON','B - Informática','2026-07-31'),
  ('S037','CAICHE CHILLAMBO MAITTE LISBETH','B - Informática','2026-07-31'),
  ('S038','CHIQUITO GRANOBLE ELVIS ADRIAN','B - Informática','2026-07-31'),
  ('S039','ESPINOZA MORAN KIANA ANELIS','B - Informática','2026-07-31'),
  ('S040','FUENTES GOMEZ JEAN PIERE','B - Informática','2026-07-31'),
  ('S041','GALARZA ROMERO CHRISTIAN ANDRES','B - Informática','2026-07-31'),
  ('S042','JURADO WONG YANDEL YOLFRE','B - Informática','2026-07-31'),
  ('S043','LAZO QUISHPE KERLY BELINDA','B - Informática','2026-07-31'),
  ('S044','LINDAO CASTAÑEDA GERALDINE BETZABETH','B - Informática','2026-07-31'),
  ('S045','MATA QUIMI ALEXANDER PAUL','B - Informática','2026-07-31'),
  ('S046','MONTIEL MAYOR DARLY MIGUEL','B - Informática','2026-07-31'),
  ('S047','MORAN CALDERON SHIRLEY NAOMI','B - Informática','2026-07-31'),
  ('S048','MOREIRA PIVAQUE ANTHONY JOSE','B - Informática','2026-07-31'),
  ('S049','NAZARENO SANCHEZ ANALIA JAZMIN','B - Informática','2026-07-31'),
  ('S050','ORDOÑEZ VARGAS JEREMIAS JOSUE','B - Informática','2026-07-31'),
  ('S051','PARRALES REYES AGUSTIN ELIAS','B - Informática','2026-07-31'),
  ('S052','PILCO TOMALA PAULINA JUDITH','B - Informática','2026-07-31'),
  ('S053','PINCAY BURGOS DAVID DANIEL','B - Informática','2026-07-31'),
  ('S054','PINCAY TAPUY MICHELLE ANDREA','B - Informática','2026-07-31'),
  ('S055','PONCE SINCHE VALERIA ZULAY','B - Informática','2026-07-31'),
  ('S056','QUIMI DEMERA LUIS ALBERTO','B - Informática','2026-07-31'),
  ('S057','QUINDE CASTRO JESUS JOSE','B - Informática','2026-07-31'),
  ('S058','RODRIGUEZ GUERRERO MARIA DE LOS ANGELES','B - Informática','2026-07-31'),
  ('S059','RUIZ VILLALVA JEREMY GABRIEL','B - Informática','2026-07-31'),
  ('S060','SALVADOR ZUÑIGA MELINA VIVIANA','B - Informática','2026-07-31'),
  ('S061','SANTANA SALAS DEREK JESUS','B - Informática','2026-07-31'),
  ('S062','SARCO URIÑA MIRELIS JULEYSI','B - Informática','2026-07-31'),
  ('S063','VILLA ARANA JEREMY WILLIAM','B - Informática','2026-07-31'),
  ('S064','VILLARROEL SOLEDISPA WALTER STEVEN','B - Informática','2026-07-31'),
  ('S065','ZAMORA QUIJIJE MELANY ANAHI','B - Informática','2026-07-31')
`);

db.run(`
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    course TEXT,
    tutor TEXT,
    status TEXT,          -- asistido, atraso o no_llego
    date TEXT DEFAULT (date('now')),
    time TEXT DEFAULT (time('now', 'localtime'))
  )
`);



db.run(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    tutor TEXT,
    phone TEXT
  );
`);

db.run(`
  INSERT OR IGNORE INTO courses (name, tutor, phone)
  VALUES 
    ('A - Informática', 'Lic. Victor Pangay', '+593990139973'),
    ('B - Informática', 'Lic. Rosa Guastay', '+593982435261');
`);


db.run("INSERT OR IGNORE INTO courses (name, tutor) VALUES ('A - Informática', 'Lic. Victor Pangay'), ('B - Informática', 'Lic. Rosa Guastay');");



  console.log('✅ Base de datos inicializada');
  db.close();
});
