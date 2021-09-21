var express = require('express');
var router = express.Router();
const db = require('../../DB');

router.get('/getRegion', async function (req, res, next) {
  console.log('/getRegion');
  const { rows } = await db.query(`
  SELECT * From public."Region" WHERE region_visible = true 
  `, []);
  res.send(rows);
});

router.get('/getUniversity', async function (req, res, next) {
  console.log('/getUniversity');
  const { rows } = await db.query(`
  SELECT * FROM "fn_university_select"(
    $1, 
    $2
  ) 
  `, [req.query.id_region, 1]);
  res.send(rows);
});

router.get('/getLearning', async function (req, res, next) {
  console.log('/getLearning');
  const { rows } = await db.query(`
  SELECT id_learning, learning, learning_kg, id_direction
	FROM public."VEnrolleeLearningSelect"
  `);
  res.send(rows);
});

router.get('/getSpecialty', async function (req, res, next) {
  console.log('/getSpecialty');
  const { rows } = await db.query(`
  SELECT id_specialty, specialty, specialty_kg, id_direction, id_learning
	FROM public."VEnrolleeSpecialtySelect"
  WHERE id_direction = $1 AND id_learning = $2
  `, [req.query.id_university, req.query.id_learning]);
  res.send(rows);
});

router.get('/getBk', async function (req, res, next) {
  console.log('/getBk');
  const { rows } = await db.query(`
  SELECT id_admission_plan, id_specialty, id_bk, bk, discipline
	FROM public."VEnrolleeBKSelect"
  WHERE id_specialty = $1 
  `, [req.query.id_specialty]);
  res.send(rows);
});

router.get('/getTour', async function (req, res, next) {
  console.log('/getTour');
  const { rows } = await db.query(`
  SELECT id_bk, tour, begin_date, end_date, vremy
	FROM public."VTourActiv"
    WHERE id_bk = $1 
    `, [req.query.id_bk]);
  res.send(rows);
});

router.get('/getVacant', async function (req, res, next) {
  console.log('/getVacant', req.query);
  const { rows } = await db.query(`
  SELECT * FROM "fn_enrolle_required_additional"(
    $1, 
    $2
  )
    `, [req.query.id_admission_plan, req.query.tour]);
  res.send(rows);
});

router.post('/EnrolleeReg', async function (req, res, next) {
  console.log('/EnrolleeReg');
  const { rows } = await db.query(`
  CALL "sp_enrollee_reg_insert"(
    '${req.body.NumberSert}', 
    ${req.body.id_admission_plan}, 
    ${req.body.tour} 
  )
    `, []);
  res.send({ "res": true });
});

module.exports = router;