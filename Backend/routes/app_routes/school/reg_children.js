var express = require('express');
var router = express.Router();
const COOKIE = require(require('path').join(__dirname, '../../cookies.js'));
const db = require('../../DB');
const utils = require('./utils');
const SMS = require('../../modules/sms');


router.get('/getLearning', async function (req, res, next) {
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
  const {crypto,password}=utils.generatePassword()
  const {rows} = await db.query(`SELECT * FROM "fn_Enrolle_Abiturient_Insert" ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, 
  [req.body.telefon_ab, req.body.fam, req.body.name, req.body.patronimyc, req.body.datebirth, req.body.male, req.body.id_learning, 1, req.body.id_school, 1,crypto]);
  console.log(rows)
  console.log("body String", String(req.body.telefon_ab))
   if (rows[0].id){
         const shMessage = `Уважаемый ${req.body.name}! Ваш логин: ${rows[0].NumberSerts} пароль: ${password} https://2020.edu.gov.kg/spuz/authformabit`;
        SMS.sendSMS(rows[0].NumberSerts, utils.getPhoneToBase(String(req.body.telefon_ab)), shMessage, 5, 1)
  }
  return res.send({ "res": true, number:rows[0].NumberSerts, status:rows[0].sms});
 });

router.post('/updatePassword', async function (req, res, next) {
  console.log('/updatePassword');
  const {crypto,password}=utils.generatePassword()
  const {rows} = await db.query(`UPDATE "Enrollee_ORT" SET "password"=$1 WHERE "id_enrollee_ORT"=$2`, 
  [crypto, req.body.id]);
  console.log(rows)
  console.log("body String", String(req.body.telefon_ab))
   if (rows[0].id){
         const shMessage = `Уважаемый ${req.body.name}! Ваш логин: ${rows[0].NumberSerts} пароль: ${password} https://2020.edu.gov.kg/spuz/authformabit`;
        SMS.sendSMS(rows[0].NumberSerts, utils.getPhoneToBase(String(req.body.telefon_ab)), shMessage, 5, 1)
  }
  return res.send({ "res": true, number:rows[0].NumberSerts, status:rows[0].sms});
 });

router.get('/getAbiturientSpisok', async function (req, res, next) {
  console.log('/getAbiturientSpisok');
  console.log(req.query);
  const { rows } = await db.query(`
  SELECT * FROM "fn_Enrolle_Abiturient_select"(${req.query.id_learning}, ${req.query.id_school}, 1)
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
    male,
    "NumberSert"
  FROM "Abiturient" JOIN public."Enrollee_ORT"
  ON "Abiturient"."id_enrollee_ORT" = public."Enrollee_ORT"."id_enrollee_ORT"
  WHERE id_abiturient = ${req.query.id_abiturient}
  `);
  res.send(rows);
});

router.post('/updateAbitinfo', async function (req, res, next) {
  console.log('/updateAbitinfo');
  const {rows} = await db.query(`SELECT * FROM "fn_Enrolle_Abiturient_Update" ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
  [req.body.id_abiturient, req.body.id_enrollee_ORT, req.body.telefon, req.body.surname_ab, req.body.names_ab, req.body.patronymic_ab, req.body.birthdate_ab, req.body.male_ab, 2]);
  return res.send({ "res": true, status:rows[0].sms});
});

router.post('/RemoveAbitinfo', async function (req, res, next) {
  console.log('/RemoveAbitinfo');
  console.log(req.body);
  const ass = await db.query(`SELECT * FROM "fn_Enrolle_Abiturient_Delete" ($1, $2, $3)`, 
  [req.body.id_abiturient, req.body.id_enrollee_ORT, 3]);
  res.send({ "res": true });
});
module.exports = router;

