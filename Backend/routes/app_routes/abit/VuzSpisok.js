var express = require('express');
var router = express.Router();
const db = require('../../DB');


router.get('/getEnrolleeHistoryInfo', async function (req, res, next) {
  console.log('/getEnrolleeHistoryInfo');
  const { rows } = await db.query(`
  SELECT * FROM public."fn_EnrolleeHistory"(
    $1, 
    1
  )
  `, [req.query.NumberSert]);
  res.send(rows);
});

module.exports = router;