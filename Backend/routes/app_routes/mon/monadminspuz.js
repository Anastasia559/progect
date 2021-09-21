var express = require('express');
var router = express.Router();
const db = require('../../DB');
const md5 = require('md5');


router.get('/spisokadminspuz', async function (req, res, next) {
  console.log('/spisokadminspuz');
  const { rows } = await db.query(`SELECT id_users, fio_users, id_university, university_name, login
	FROM "VUsers"`, [])
  res.send(rows);
});

router.get('/getspisokspuz', async function (req, res, next) {
  console.log('/getspisokspuz');
  const { rows } = await db.query(`SELECT * From "fn_university_user_select"()`, [])
  rows.sort(function (a, b) {
            return (a.university_name < b.university_name) ? -1 : 1;
          });
  res.send(rows);
});



router.post('/addadminspuz', async function (req, res, next) {
  console.log('/addadminspuz');

  let cryptoPass = md5(req.body.password);
  const ass = await db.query(`INSERT INTO public."Users"(
    id_role,
	id_years,
	id_university,
	fio_users,
	login,
	password)
   VALUES ( 
     $1, 
     $2, 
     $3, 
     $4, 
     $5, 
     $6
     );`, [
     3
    ,21
    , req.body.id_university
    , req.body.fio_users
    , req.body.login
    , cryptoPass])
  res.send({ "res": true });
});



router.get('/getadminspuzinfo', async function (req, res, next) {
  console.log('/getadminspuzinfo');
  const { rows } = await db.query('SELECT fio_users, login From public."Users" WHERE id_university = $1', [req.query.id_university])
  res.send(rows[0]);
});



router.post('/updateadminspuz', async function (req, res, next) {
  console.log('/updateadminspuz');
  let cryptoPass = md5(req.body.password);
  const ass = await db.query(`UPDATE public."Users"
	SET  
  fio_users=$2, 
  login=$3, 
  password=$4
	WHERE id_university=$1
  `, [req.body.id_university
    ,req.body.fio_users
    , req.body.login
    , cryptoPass])
  res.send({ "res": true });
});

module.exports = router;