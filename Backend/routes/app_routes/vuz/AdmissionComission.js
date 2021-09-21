var express = require('express');
var router = express.Router();
const db = require('../../DB');
const md5 = require('md5');

router.get('/getUsersUniversitySpisok', async function (req, res, next) {
    console.log('/getUsersUniversitySpisok');
    const { rows } = await db.query(`
        SELECT 
            "id_users_university",
            "fio_users_university",
            "login_university",
            "official_phone",
            "mobile_phone",
            "whatsapp",
            "telegram",
            "email",
            "instagram",
            "facebook"
        FROM "Users_university" 
  WHERE "id_university" = $1 `,
        [req.query.id_university]);
    res.send(rows);
});


router.post('/AddUsersUniversity', async function (req, res, next) {
    console.log('/AddUsersUniversity');
    console.log(req.body);
    let cryptoPass = md5(req.body.password_university);
    const ass = await db.query(`INSERT INTO public."Users_university"(
    "id_university", 
    "id_role", 
    "fio_users_university", 
    "login_university", 
    "password_university", 
    "official_phone", 
    "mobile_phone", 
    "whatsapp", 
    "telegram", 
    "email", 
    "instagram", 
    "facebook"
    )
   VALUES ( 
     $1,
     $2,
     $3,
     $4,
     $5,
     $6,
     $7,
     $8,
     $9,
     $10,
     $11,
     $12
     );`, [
        req.body.id_university,
        4,
        req.body.fio_users_university,
        req.body.login_university,
        cryptoPass,
        req.body.official_phone,
        req.body.mobile_phone,
        req.body.whatsapp,
        req.body.telegram,
        req.body.email,
        req.body.instagram,
        req.body.facebook
    ])
    res.send({ "res": true });
});

router.get('/getUsersUniversityinfo', async function (req, res, next) {
    console.log('/getUsersUniversityinfo');
    const { rows } = await db.query(`SELECT 
    "fio_users_university", 
    "login_university", 
    "password_university", 
    "official_phone", 
    "mobile_phone", 
    "whatsapp", 
    "telegram", 
    "email", 
    "instagram", 
    "facebook" FROM "Users_university" WHERE id_users_university = $1`, [req.query.id_users_university])
    res.send(rows[0]);
});

router.post('/UpdateUsersUniversity', async function (req, res, next) {
    console.log('/UpdateUsersUniversity');
    let cryptoPass = md5(req.body.password_university);
    const ass = await db.query(`UPDATE public."Users_university"
	SET  
    "fio_users_university"=$1,
    "login_university"=$2, 
    "password_university"=$3, 
    "official_phone"=$4, 
    "mobile_phone"=$5, 
    "whatsapp"=$6, 
    "telegram"=$7, 
    "email"=$8, 
    "instagram"=$9, 
    "facebook"=$10
	WHERE id_users_university=$11
  `, [  req.body.fio_users_university,
        req.body.login_university,
        cryptoPass,
        req.body.official_phone,
        req.body.mobile_phone,
        req.body.whatsapp,
        req.body.telegram,
        req.body.email,
        req.body.instagram,
        req.body.facebook,
        req.body.id_users_university
    ])
    res.send({ "res": true });
});

router.post('/RemoveUsersUniversity', async function (req, res, next) {
    console.log('/RemoveUsersUniversity');
    const { rows, err } = await db.query('DELETE FROM public."Users_university"	WHERE id_users_university=$1', [req.body.id_users_university])
    if (!err) {
        res.send({ "res": true });
    } else {
        res.send({ "res": false });
    }
});

module.exports = router;