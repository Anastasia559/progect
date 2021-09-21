var express = require('express');
var router = express.Router();
const COOKIE = require(require('path').join(__dirname, '../../cookies.js'));
const db = require('../../DB');


router.get('/getLearningC', async function (req, res, next) {
  console.log('/getLearning');
  const { rows } = await db.query('SELECT id_learning, learning From "Learning" WHERE id_learning < 3 Order By id_learning', []);
  res.send(rows);
});

router.get('/getMale', async function (req, res, next) {
  console.log('/getMale');
  const { rows } = await db.query(`
  SELECT * From public."Pol" 
  `, []);
  res.send(rows);
});


router.post('/Addchildren', async function (req, res, next) {
  console.log('/Addchildren');
  const ass = await db.query(`SELECT * FROM "fn_Enrolle_Abiturient_Insert" ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
  [req.body.telefon_ab, req.body.fam, req.body.name, req.body.patronimyc, req.body.datebirth, req.body.male, req.body.id_learning, 1, req.body.id_university, 2]);
  res.send({ "res": true });
});

router.get('/getAbiturientSpisok', async function (req, res, next) {
  console.log('/getAbiturientSpisok');
  const { rows } = await db.query(`
  SELECT * FROM "fn_Enrolle_Abiturient_select"(${req.query.id_learning}, ${req.query.id_university}, 2)
  `);
  res.send(rows);
});

router.get('/getAbitinfo', async function (req, res, next) {
  console.log('/getAbitinfo');
  const { rows } = await db.query(`
  SELECT 
    id_abiturient,
    "Abiturient"."id_enrollee_ORT",
    surname,
    names,
    patronymic,
    birthdate,
    telefon_ab,
    male
  FROM "Abiturient" JOIN public."Enrollee_ORT"
  ON "Abiturient"."id_enrollee_ORT" = public."Enrollee_ORT"."id_enrollee_ORT"
  WHERE id_abiturient = ${req.query.id_abiturient}
  `);
  res.send(rows);
});

router.post('/updateAbitinfo', async function (req, res, next) {
  console.log('/updateAbitinfo');
  const ass = await db.query(`SELECT * FROM "fn_Enrolle_Abiturient_Update" ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
  [req.body.id_abiturient, req.body.id_enrollee_ORT, req.body.telefon, req.body.surname_ab, req.body.names_ab, req.body.patronymic_ab, req.body.birthdate_ab, req.body.male_ab, 2]);
  res.send({ "res": true });
});

router.post('/getRemoveAbitinfo', async function (req, res, next) {
  console.log('/getRemoveAbitinfo');
  console.log(req.body);
  const ass = await db.query(`SELECT * FROM "fn_Enrolle_Abiturient_Delete" ($1, $2, $3)`, 
  [req.body.id_abiturient, req.body.id_enrollee_ORT, 3]);
  res.send({ "res": true });
});
module.exports = router;

