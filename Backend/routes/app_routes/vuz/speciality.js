var express = require('express');
var router = express.Router();
const db = require('../../DB');

router.get('/getProfession', async function (req, res, next) {
  console.log('/getProfession');
  const { rows } = await db.query('SELECT id_profession, profession_ru From "Profession" Order By profession_ru', []);
  res.send(rows);
});

router.get('/getLearning', async function (req, res, next) {
  console.log('/getLearning');
  const { rows } = await db.query('SELECT id_learning, learning From "Learning" Order By id_learning', []);
  res.send(rows);
});

router.get('/getSpecialtySpisok', async function (req, res, next) {
  console.log('/getSpecialtySpisok');
  const { rows } = await db.query(`
  SELECT id_specialty,
         id_university,
         specialty_cipher,
         specialty,
         id_specialty_avn,
         id_learning,
         specialty_kg,
         "Specialty".id_profession,
         profession_ru
  FROM "Specialty" LEFT JOIN "Profession" ON "Specialty".id_profession = "Profession".id_profession
  WHERE id_university = $1 
    AND id_learning=$2 ;`,
  [req.query.id_university, 
  req.query.id_learning]);
  res.send(rows);
});

router.post('/AddSpecialty', async function (req, res, next) {
  console.log('/AddSpecialty');
  const ass = await db.query(`INSERT INTO public."Specialty"(
    id_university,
    id_learning,
    specialty_cipher,
    specialty,
    id_specialty_avn,
    specialty_kg,
    id_profession)
   VALUES ( 
     $1, 
     $2, 
     $3, 
     $4, 
     $5,
     $6,
     $7);`, [
    req.body.id_university
    , req.body.id_learning
    , req.body.specialty_cipher
    , req.body.specialty
    , req.body.id_specialty_avn
    , req.body.specialty_kg
    , req.body.id_profession
  ])
  res.send({ "res": true });
});


router.get('/getSpecialtyinfo', async function (req, res, next) {
  console.log('/getSpecialtyinfo');
  const { rows } = await db.query('SELECT *	FROM "Specialty" WHERE id_specialty = $1', [req.query.id_specialty])
  res.send(rows[0]);
});


router.post('/updateSpecialty', async function (req, res, next) {
  console.log('/updateSpecialty');
  console.log(req.body);
  const ass = await db.query(`UPDATE public."Specialty"
	SET  
  id_profession=$2,
  specialty_cipher=$3,
  specialty=$4,
  id_specialty_avn=$5,
  specialty_kg=$6
	WHERE id_specialty=$1
  `, [req.body.id_specialty
    , req.body.id_profession
    , req.body.specialty_cipher
    , req.body.specialty
    , req.body.id_specialty_avn
    , req.body.specialty_kg
  ])
  res.send({ "res": true });
});


router.post('/removeSpecialty', async function (req, res, next) {
  console.log('/removeSpecialty');
  const { rows, err } = await db.query('DELETE FROM public."Specialty"	WHERE id_specialty=$1', [req.body.id_specialty])
  if (!err) {
    res.send({ "res": true });
  } else {
    res.send({ "res": false });
  }
});




module.exports = router;