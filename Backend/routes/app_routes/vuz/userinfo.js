var express = require('express');
var router = express.Router();
const COOKIE = require(require('path').join(__dirname, '../../cookies.js'));
const db = require('../../DB');


router.get('/getuserfio', async function (req, res, next) {
  console.log('/getuserfio');
  let id_user = COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id;
  const { rows } = await db.query('SELECT fio_users, id_university From public."Users" WHERE id_users =$1', [id_user])
  res.send(rows);
});

module.exports = router;