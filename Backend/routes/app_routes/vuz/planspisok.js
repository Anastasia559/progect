var express = require('express');
var router = express.Router();
const db = require('../../DB');


router.get('/getLearning', async function (req, res, next) {
    console.log('/getLearning');
    const { rows } = await db.query('SELECT id_learning, learning From public."Learning"', []);
    res.send(rows);
});

router.get('/getAdmissionPlanSpisok', async function (req, res, next) {
    console.log('/getAdmissionPlanSpisok');
    const { rows } = await db.query(`
    SELECT 
    specialty_cipher, 
    specialty, 
    id_admission_plan, 
    id_years, 
    public."Admission_plan".id_specialty, 
    public."Admission_plan".id_bk, 
	bk,
	kol_plan, 
    "Beneficiary_plan", 
    smeta_doki, 
    smeta_education, 
    public."Admission_plan".id_discipline,
	discipline
    FROM public."Admission_plan" INNER JOIN public."Specialty"
    ON public."Admission_plan".id_specialty = public."Specialty".id_specialty
	INNER JOIN public."Discipline"
	ON public."Admission_plan".id_discipline = public."Discipline".id_discipline
	INNER JOIN public."Budget_contract"
	ON public."Admission_plan".id_bk = public."Budget_contract".id_bk
    WHERE id_university = $1 AND id_learning = $2`,
        [req.query.id_university, req.query.id_learning])
    res.send(rows);
});


router.get('/getRemoveAdmissionPlan', async function (req, res, next) {
    console.log('/getRemoveAdmissionPlan');
    console.log(req.body);
    const { rows, err } = await db.query('DELETE FROM public."Admission_plan" WHERE id_admission_plan=$1', [req.query.id_admission_plan])
    if (!err) {
        res.send({ "res": true });
    } else {
        res.send({ "res": false });
    }
});



module.exports = router;