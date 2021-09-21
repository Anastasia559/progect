var express = require('express');
var router = express.Router();
const COOKIE = require(require('path').join(__dirname, '../../cookies.js'));
const db = require('../../DB');


router.get('/getUserInfo', async function (req, res, next) {
  console.log('/getUserInfo');
  let id_user = COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id;
  const { rows } = await db.query('SELECT "id_enrollee_ORT", "NumberSert" From public."Enrollee_ORT" WHERE "id_enrollee_ORT" =$1 LIMIT 1', [id_user])
  res.send(rows);
});

module.exports = router;