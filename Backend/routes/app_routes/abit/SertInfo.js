var express = require('express');
var router = express.Router();
const db = require('../../DB');


router.get('/getSertInfo', async function (req, res, next) {
  console.log('/getSertInfo');
  const { rows } = await db.query(`
  SELECT
    "NumberSert",
    "BallOnRepsTest",
    "ORT_biology",
    "ORT_history",
    "ORT_chemistry",
    "ORT_physics",
    "ORT_english",
    "ORT_math",
    "ORT_kyrgyz",
    "ORT_russian",
    "NamePlase",
    "ColorSert"
  From public."Enrollee_ORT" INNER JOIN public."PlaseSertORT"
  ON public."Enrollee_ORT"."id_PlaseSertORT" = public."PlaseSertORT"."id_PlaseSertORT"
  WHERE "id_enrollee_ORT" = $1
  `, [req.query.id_enrollee_ORT]);
  res.send(rows[0]);
});

module.exports = router;