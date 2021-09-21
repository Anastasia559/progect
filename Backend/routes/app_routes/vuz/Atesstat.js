var express = require('express');
var router = express.Router();
const db = require('../../DB');

router.get('/getLearningR', async function (req, res, next) {
    console.log('/getLearningR');
    const { rows } = await db.query('SELECT id_learning, learning From "Learning" WHERE id_learning < 3', []);
    res.send(rows);
});

router.get('/getSpecialtyR', async function (req, res, next) {
    console.log('/getSpecialtyR');
    const { rows } = await db.query(`SELECT id_specialty, specialty 
                                       From "Specialty" 
                                       WHERE id_university = $1 AND id_learning=$2
                                       Order By specialty`, [req.query.id_university, req.query.id_learning]);
    res.send(rows);
});

router.get('/getBkR', async function (req, res, next) {
    console.log('/getBkR');
    const { rows } = await db.query('SELECT id_bk, bk From "Budget_contract"', []);
    res.send(rows);
});

router.get('/getIdAdminPlan', async function (req, res, next) {
    console.log('/getIdAdminPlan');
    const { rows } = await db.query(`SELECT id_admission_plan
            FROM public."Admission_plan"
            WHERE
            id_years = 21 AND
            id_specialty = $1 AND
            id_bk = $2
            LIMIT 1
    `, [req.query.id_specialty, req.query.id_bk]);
    res.send(rows);
});

router.get('/getTourR', async function (req, res, next) {
    console.log('/getTourR');
    const { rows } = await db.query('SELECT tour From "VTourActiv" WHERE id_bk=$1', [req.query.id_bk]);
    res.send(rows);
});

router.get('/getAbiturientRegistraziyList', async function (req, res, next) {
    console.log('/getAbiturientRegistraziyList');
    const { rows } = await db.query(`Select * From "fn_Abiturient_registraziy_list"($1, $2, $3, $4)`,
        [req.query.id_university, req.query.id_admission_plan, req.query.tour, req.query.id_bk]);
    res.send(rows);
});





module.exports = router;