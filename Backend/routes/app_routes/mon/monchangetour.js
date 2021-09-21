var express = require('express');
var router = express.Router();
const db = require('../../DB');




router.get('/VTour', async function (req, res, next) {
  console.log('/VTour');
  const { rows } = await db.query(`SELECT *	FROM "VTour" ORDER BY tour, id_bk`, [])
  res.send(rows);
});


router.get('/getbudgetcontract', async function (req, res, next) {
  console.log('/getbudgetcontract');
  const { rows } = await db.query(`SELECT *	FROM "Budget_contract"`, [])
  res.send(rows);
});


router.post('/add_upd_del_tour', async function (req, res, next) {
  console.log('/add_upd_del_tour action: ', req.body.action);
    console.log(req.body);
  const ass = await db.query(`SELECT * From "fn_tour_ins_upd_del"(
  	$1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, 
  [	req.body.action,
	21,
	req.body.tour,
	req.body.id_bk, 
	req.body.begin_date,
	req.body.end_date, 
	req.body.confirm_begin_date, 
	req.body.confirm_end_date,
	req.body.otozvat_begin_date, 
	req.body.otozvat_end_date
  ])
  res.send({ "res": true });
});


router.get('/gettourinfo', async function (req, res, next) {
  console.log('/gettourinfo');
  const { rows } = await db.query('SELECT * FROM "VTour" WHERE id_tour = $1', [req.query.id_tour])
  res.send(rows[0]);
});


module.exports = router;