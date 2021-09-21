var express = require('express');
const { re } = require('mathjs');
var router = express.Router();
const db = require('../../DB');

router.get('/getFaculty', async function (req, res, next) {
    console.log('/getFaculty');
    const { rows } = await db.query('SELECT id_faculty, faculty From public."Faculty" WHERE id_university = $1', [req.query.id_university]);
    res.send(rows);
});

router.get('/getDirection', async function (req, res, next) {
    console.log('/getDirection');
    const { rows } = await db.query('SELECT id_direction, direction From public."Direction" WHERE id_faculty = $1', [req.query.id_faculty]);
    res.send(rows);
});

router.get('/getLearning', async function (req, res, next) {
    console.log('/getLearning');
    const { rows } = await db.query('SELECT id_learning, learning From public."Learning"', []);
    res.send(rows);
});

router.get('/getSpecialty', async function (req, res, next) {
    console.log('/getSpecialty');
    const { rows } = await db.query(`SELECT id_specialty, specialty From public."Specialty" 
    WHERE id_direction = $1 AND id_learning=$2`, [req.query.id_direction, req.query.id_learning]);
    res.send(rows);
});

router.get('/getBk', async function (req, res, next) {
    console.log('/getBk');
    const { rows } = await db.query('SELECT id_bk, bk From public."Budget_contract"', []);
    res.send(rows);
});


router.get('/getTour', async function (req, res, next) {
    console.log('/getTour');
    const { rows } = await db.query('SELECT tour From public."Tour" WHERE id_bk=$1', [req.query.id_bk]);
    res.send(rows);
});


router.post('/postReceptInfoSpisok', async function (req, res, next) {
    console.log('/postReceptInfoSpisok');
    const { rows } = await db.query(`
    SELECT 
        public."ReceptInfo"."id_ReceptInfo", 
        public."Admission_plan".kol_plan,
        public."PlaseSertORT"."NamePlase",
        public."ReceptInfo"."NumberSert",
        public."ReceptInfo"."BallOnRepsTest",
        public."ReceptInfo".dop_ball,
        public."ReceptInfo"."BallOnRepsTest" + public."ReceptInfo".dop_ball AS sum_ball,
        public."ReceptInfo"."DateReg",
        public."ReceptInfo"."Recom_for_reccept",
		CONCAT  (public."Abiturient"."surname", ' ', public."Abiturient"."names", ' ', public."Abiturient"."patronymic") AS "AbitFio",
		public."ReceptInfo"."Confirm_for_reccept",
		public."ReceptInfo"."Recepted"
    FROM public."ReceptInfo" INNER JOIN public."Admission_plan"
        ON public."ReceptInfo".id_admission_plan = public."Admission_plan".id_admission_plan
        INNER JOIN public."PlaseSertORT"
        ON public."ReceptInfo"."id_PlaseSertORT" = public."PlaseSertORT"."id_PlaseSertORT"
		INNER JOIN public."Abiturient"
		ON public."ReceptInfo"."id_enrollee_ORT" = public."Abiturient"."id_enrollee_ORT"
    WHERE 
    public."Admission_plan".id_specialty = $1 AND
    public."Admission_plan".id_bk = $2 AND 
    public."ReceptInfo".tour = $3
    `,
        [req.body.id_specialty, req.body.id_bk, req.body.tour])
    res.send(rows);
});


router.post('/UpdateRecept', async function (req, res, next) {
    console.log('/UpdateRecept');
    const ass = await db.query(`UPDATE public."ReceptInfo"
	SET "${req.body.label}" = NOT "${req.body.label}"
	WHERE "id_ReceptInfo" = $1
  `, [req.body.id_ReceptInfo])
    res.send({ "res": true });
});

module.exports = router;