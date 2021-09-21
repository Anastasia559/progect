var express = require('express');
var router = express.Router();
const db = require('../../DB');


router.get('/getEnrolleeHistory', async function (req, res, next) {
  console.log('/getEnrolleeHistory');
  const { rows } = await db.query(`
  SELECT * FROM public."fn_EnrolleeHistory_reg"(
    $1, 
    1
  )
  `, [req.query.NumberSert]);
  res.send(rows);
});

module.exports = router;