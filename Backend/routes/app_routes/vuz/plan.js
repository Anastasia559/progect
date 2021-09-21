var express = require('express');
var router = express.Router();
const db = require('../../DB');

router.get('/getLearning', async function (req, res, next) {
    console.log('/getLearning');
    const { rows } = await db.query('SELECT id_learning, learning From "Learning"', []);
    res.send(rows);
});

router.get('/getSpecialty', async function (req, res, next) {
    console.log('/getSpecialty');
    const { rows } = await db.query(`SELECT id_specialty, specialty 
                                       From "Specialty" 
                                       WHERE id_university = $1 AND id_learning=$2
                                       Order By specialty`, [req.query.id_university, req.query.id_learning]);
    res.send(rows);
});

router.get('/getBk', async function (req, res, next) {
    console.log('/getBk');
    const { rows } = await db.query('SELECT id_bk, bk From "Budget_contract"', []);
    res.send(rows);
});


router.get('/getDiscipline', async function (req, res, next) {
    console.log('/getDiscipline');
    const { rows } = await db.query('SELECT * From "Discipline" Order By discipline', []);
    res.send(rows);
});

router.get('/getAdmissionPlanInfo', async function (req, res, next) {
    console.log('/getAdmissionPlanInfo');
    const { rows } = await db.query('SELECT * FROM "Admission_plan" WHERE id_specialty = $1 AND id_bk = $2',
        [req.query.id_specialty, req.query.id_bk])
    res.send(rows);
});

router.post('/AddAdmissionPlan', async function (req, res, next) {
    console.log('/AddAdmissionPlan');
    const ass = await db.query(`INSERT INTO public."Admission_plan"(
            "id_years",
            "id_specialty",
            "id_bk",
            "kol_plan",
            "internal_test",
            "smeta_doki",
            "smeta_education",
            "id_discipline"
            )
   VALUES ( 
    21,
    ${req.body.id_specialty},
    ${req.body.id_bk},   
    ${req.body.kol_plan}, 
    ${req.body.internal_test},
    ${req.body.smeta_doki}, 
    ${req.body.smeta_education},  
    ${req.body.id_discipline}
     )`, [])
    res.send({ "res": true });
});

router.post('/UpdateAdmissionPlan', async function (req, res, next) {
    console.log('/UpdateAdmissionPlan');
    const ass = await db.query(`UPDATE public."Admission_plan"
	SET
    "kol_plan"=${req.body.kol_plan}, 
    "internal_test"=${req.body.internal_test},
    "smeta_doki"=${req.body.smeta_doki}, 
    "smeta_education"=${req.body.smeta_education},  
    "id_discipline"=${req.body.id_discipline}
	WHERE "id_specialty"=${req.body.id_specialty} AND "id_bk"=${req.body.id_bk}
  `, [])
    res.send({ "res": true });
});


router.post('/RemoveAdmissionPlan', async function (req, res, next) {
    console.log('/RemoveAdmissionPlan');
    const { rows, err } = await db.query('DELETE FROM public."Admission_plan" WHERE id_admission_plan=$1', [req.body.id_admission_plan])
    if (!err) {
        res.send({ "res": true });
    } else {
        res.send({ "res": false });
    }
});




module.exports = router;