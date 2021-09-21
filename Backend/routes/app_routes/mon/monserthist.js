var express = require('express');
var router = express.Router();
const db = require('../../DB');


router.get('/search_enrollee', async function (req, res, next) {
  console.log('/search_enrollee');
  console.log('/search_enrollee--', req.query.NumberSert);
  const { rows } = await db.query(`SELECT * FROM public."fn_EnrolleeHistory_reg"($1, $2)`, [req.query.NumberSert, 1])
  res.send(rows);
});

module.exports = router;