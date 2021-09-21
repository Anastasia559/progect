var express = require('express');
var router = express.Router();
const db = require('../../DB');


router.get('/getspuzinfo', async function (req, res, next) {
  console.log('/getspuzinfo');
  const { rows } = await db.query('SELECT * From public."University" WHERE id_university = $1', [req.query.id_university]);
  res.send(rows[0]);
});



router.post('/updatespuz', async function (req, res, next) {
  console.log('/updatespuz');
  // const { rows } = await db.query(`INSERT INTO public."University"(
  const ass = await db.query(`UPDATE public."University"
	SET  
  s_university=$1, 
  university_name=$2, 
  university_address=$3, 
  university_url=$4, 
  university_supervisor=$5, 
  supervisor_position=$6, 
  s_university_kg=$7, 
  university_name_kg=$8
	WHERE id_university=$9
  `, [
      req.body.s_university
    , req.body.university_name
    , req.body.university_address
    , req.body.university_url
    , req.body.university_supervisor
    , req.body.supervisor_position
    , req.body.s_university_kg
    , req.body.university_name_kg
    , req.body.id_university])
  res.send({ "res": true });
});

module.exports = router;