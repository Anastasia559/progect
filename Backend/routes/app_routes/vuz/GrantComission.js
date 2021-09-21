var express = require('express');
var router = express.Router();
const db = require('../../DB');

router.get('/getGrantPosition', async function (req, res, next) {
    console.log('/getGrantPosition');
    const { rows } = await db.query(`
        SELECT 
            "id_grant_position",
            "grant_position"
        FROM "Grant_position"`,
        []);
    res.send(rows);
});

router.get('/getGrantCommissionSpisok', async function (req, res, next) {
    console.log('/getGrantCommissionSpisok');
    const { rows } = await db.query(`
        SELECT * FROM "Grant_commission" WHERE id_university=$1 AND id_grant_position=$2`,
        [req.query.id_university, req.query.id_grant_position]);
    res.send(rows);
});

router.post('/AddGrantCommission', async function (req, res, next) {
    console.log('/AddGrantCommission');
    const ass = await db.query(`INSERT INTO public."Grant_commission"(
        "id_university",
        "id_grant_position",
        "grant_commission"
    )
   VALUES ( 
     $1,
     $2,
     $3
     );`, [
        req.body.id_university,
        req.body.id_grant_position,
        req.body.grant_commission
    ])
    res.send({ "res": true });
});

router.post('/RemoveGrantCommission', async function (req, res, next) {
    console.log('/RemoveGrantCommission');
    const { rows, err } = await db.query('DELETE FROM public."Grant_commission"	WHERE id_grant_commission=$1', [req.body.id_grant_commission])
    if (!err) {
        res.send({ "res": true });
    } else {
        res.send({ "res": false });
    }
});

module.exports = router;