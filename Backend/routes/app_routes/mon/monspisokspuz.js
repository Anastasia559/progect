var express = require('express');
var router = express.Router();
const db = require('../../DB');




router.get('/spisokspuz', async function (req, res, next) {
  console.log('/spisokspuz');
  const { rows } = await db.query('SELECT * From public."VUniversity"', [])
  res.send(rows);
});

router.get('/getregion', async function (req, res, next) {
  console.log('/getregion');
  const { rows } = await db.query('SELECT * FROM public."Region" WHERE region_visible = true', [])
  rows.sort(function (a, b) {
            return (a.region < b.region) ? -1 : 1;
          });
  res.send(rows);
});

router.get('/getspuzinfo', async function (req, res, next) {
  console.log('/getspuzinfo');
  const { rows } = await db.query('SELECT * From public."University" WHERE id_university = $1', [req.query.id_university])
  res.send(rows[0]);
});

router.post('/removespuz', async function (req, res, next) {
  console.log('/removespuz');
  const { rows } = await db.query('SELECT * From "fn_university_delete"($1)', [req.body.id_university])
  if (rows[0].id_univer == 0) {
    res.send({ "res": true });
  } else {
    res.send({ "res": false });
  }
});


router.post('/addspuz', async function (req, res, next) {
  console.log('/addspuz');
  // const { rows } = await db.query(`INSERT INTO public."University"(
  const ass = await db.query(`INSERT INTO public."University"(
    id_region, 
    s_university, 
    university_name, 
    university_address, 
    university_url, 
    university_supervisor, 
    supervisor_position, 
    s_university_kg, 
    university_name_kg, 
    university_sort)
   VALUES ( 
     $1, 
     $2, 
     $3, 
     $4, 
     $5, 
     $6, 
     $7, 
     $8, 
     $9, 
     $10
     );`, [req.body.id_region
    , req.body.s_university
    , req.body.university_name
    , req.body.university_address
    , req.body.university_url
    , req.body.university_supervisor
    , req.body.supervisor_position
    , req.body.s_university_kg
    , req.body.university_name_kg
    , req.body.university_sort])
  res.send({ "res": true });
});


router.post('/updatespuz', async function (req, res, next) {
  console.log('/updatespuz');
  // const { rows } = await db.query(`INSERT INTO public."University"(
  const ass = await db.query(`UPDATE public."University"
	SET  
  id_region=$1, 
  s_university=$2, 
  university_name=$3, 
  university_address=$4, 
  university_url=$5, 
  university_supervisor=$6, 
  supervisor_position=$7, 
  s_university_kg=$8, 
  university_name_kg=$9, 
  university_sort=$10
	WHERE id_university=$11
  `, [req.body.id_region
    , req.body.s_university
    , req.body.university_name
    , req.body.university_address
    , req.body.university_url
    , req.body.university_supervisor
    , req.body.supervisor_position
    , req.body.s_university_kg
    , req.body.university_name_kg
    , req.body.university_sort
    , req.body.id_university])
  res.send({ "res": true });
});









module.exports = router;