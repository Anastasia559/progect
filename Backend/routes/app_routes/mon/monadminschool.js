var express = require('express');
var router = express.Router();
const db = require('../../DB');
const md5 = require('md5');


router.get('/getdistrict', async function (req, res, next) {
  console.log('/getdistrict');
  const { rows } = await db.query(`SELECT *	FROM "District" WHERE id_region=$1`, [req.query.id_region])
   rows.sort(function (a, b) {
            return (a.district < b.district) ? -1 : 1;
          });
  res.send(rows);
});

router.get('/getvillage', async function (req, res, next) {
  console.log('/getvillage');
  const { rows } = await db.query(`SELECT *	FROM "Village" WHERE id_district=$1`, [req.query.id_district])
  rows.sort(function (a, b) {
            return (a.village < b.village) ? -1 : 1;
          });
  res.send(rows);
});

router.get('/spisokschool', async function (req, res, next) {
  console.log('/spisokschool');
  const { rows } = await db.query(`SELECT id_school_users, school_name, fio_director, school_phone, login_school	FROM "Users_school" WHERE id_village = $1 ORDER BY school_name`, [req.query.id_village])
  res.send(rows);
});

router.post('/addschooladmin', async function (req, res, next) {
  console.log('/addschooladmin');
  console.log(req.body);
  let cryptoPass = md5(req.body.password_school);
  const ass = await db.query(`SELECT * From "fn_users_school_insert" 
    ( 
     $1, 
     $2, 
     $3, 
     $4, 
     $5, 
     $6,
     $7,
     $8,
     $9
     );`, [
     6
    ,req.body.id_region
    , req.body.id_district
    , req.body.id_village
    , req.body.school_name
    , req.body.fio_director
    , req.body.login_school
    , cryptoPass
    , req.body.school_phone])
  res.send({ "res": true });
});

router.get('/getschoolinfo', async function (req, res, next) {
  console.log('/getschoolinfo');
  const { rows } = await db.query('SELECT school_name, fio_director, school_phone, login_school	FROM "Users_school" WHERE id_school_users = $1', [req.query.id_school_users])
  res.send(rows[0]);
});

router.post('/updateadminschool', async function (req, res, next) {
  console.log('/updateadminschool');
  let cryptoPass = md5(req.body.password_school);
  const ass = await db.query(`UPDATE public."Users_school"
	SET 
	school_name=$2,
	fio_director=$3,
	login_school=$4,
	password_school=$5,
	school_phone=$6 
  	WHERE id_school_users=$1
  `, [req.body.id_school_users
    , req.body.school_name
    , req.body.fio_director
    , req.body.login_school
    , cryptoPass
    , req.body.school_phone])
  res.send({ "res": true });
});

module.exports = router;