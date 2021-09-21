var express = require('express');
var router = express.Router();
const COOKIE = require(require('path').join(__dirname, '../../cookies.js'));
const db = require('../../DB');


router.get('/getuser_fio_school', async function (req, res, next) {
  console.log('/getuser_fio_school');
  let id_user = COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id;
  const { rows } = await db.query('SELECT id_school_users, fio_director, school_name From public."Users_school" WHERE id_school_users =$1', [id_user])
  res.send(rows);
});

module.exports = router;