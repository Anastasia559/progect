var express = require('express');
var router = express.Router();
const db = require('../../DB');

router.get('/getUsersSpisok', async function (req, res, next) {
  console.log('/getUsersSpisok');
  const { rows } = await db.query(`SELECT "id_users_university", "fio_users_university"
                                       FROM "Users_university" 
                                      WHERE "id_university" = $1 
                                   ORDER BY "fio_users_university"`,
    [req.query.id_university]);
  res.send(rows);
});

router.get('/getSpecialtyA', async function (req, res, next) {
  console.log('/getSpecialtyA');
  console.log(req.body);
  const { rows } = await db.query('SELECT id_specialty, specialty From "Specialty" WHERE id_university = $1 AND id_learning = $2', [req.query.id_university, req.query.id_learning]);
  res.send(rows);
});

router.get('/getBK', async function (req, res, next) {
  console.log('/getBK');
  const { rows } = await db.query('SELECT * From "Budget_contract"', []);
  res.send(rows);
});

router.get('/getUserAccessSpisok', async function (req, res, next) {
  console.log('/getUserAccessSpisok');
  const { rows } = await db.query(`SELECT id_users_university_access, learning, specialty, bk
  FROM "Users_university_access" INNER JOIN "Specialty" 
  ON "Users_university_access".id_specialty = "Specialty".id_specialty
  INNER JOIN "Budget_contract"  
  ON "Users_university_access".id_bk = "Budget_contract".id_bk
  INNER JOIN "Learning"
  ON "Specialty".id_learning = "Learning".id_learning
  WHERE id_users_university = $1`,
    [req.query.id_users_university]);
  res.send(rows);
});


router.post('/AddUsersUniversityAccess', async function (req, res, next) {
  console.log('/AddUsersUniversityAccess');
  const ass = await db.query(`INSERT INTO "Users_university_access"
                                        ( id_users_university,  id_specialty, id_bk)
                                 VALUES ( $1, $2, $3);`, [
    req.body.id_users_university
    , req.body.id_specialty
    , req.body.id_bk
  ])
  res.send({ "res": true });
});

router.post('/RemoveUsersUniversityAccess', async function (req, res, next) {
  console.log('/RemoveUsersUniversityAccess');
  const { rows, err } = await db.query('DELETE FROM "Users_university_access"	WHERE id_users_university_access=$1', [req.body.id_users_university_access])
  if (!err) {
    res.send({ "res": true });
  } else {
    res.send({ "res": false });
  }
});




module.exports = router;