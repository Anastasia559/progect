var express = require('express');
var router = express.Router();
const db = require('../../DB');


router.get('/getTourInfo', async function (req, res, next) {
  console.log('/getTourInfo');
  const { rows } = await db.query(`
  SELECT * FROM public."V_tour_select"
  `, []);
  res.send(rows);
});

module.exports = router;