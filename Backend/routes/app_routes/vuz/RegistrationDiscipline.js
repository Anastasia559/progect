var express = require('express');
var router = express.Router();
const db = require('../../DB');
const PATH = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const CONSTANTS = require('./Constants')


router.post(
  '/uploadImage',
  fileUpload({
    limits: {
      files: 1, // 1 file
      fileSize: 5 * 1024 * 1024 //5mb max-size
    }
  }),
  (req, res) => {
    console.log('/uploadImage')
    const sampleFile = req.files.file,
      id = req.body.id_abiturient,
      fieldFront = req.body.type,
      name = id + '_' + Date.now() + PATH.parse(sampleFile.name).ext,
      uploadPath = PATH.join(__dirname, '../../../abitdata/') + name

    let field
    switch (fieldFront) {
      case 'atestatA':
        field = 'photoAtestA'
        break
      case 'atestatB':
        field = 'photoAtestB'
        break
      default:
        field = 'documentA'
        break
      case 'documentB':
          field = 'documentB'
          break
    }
    sampleFile.mv(uploadPath, function (err) {
      if (err) return res.status(500).send({ error: err.message })
      //start
      db.callback(
        `SELECT * From public."Abiturient" WHERE "id_abiturient" = $1`,
        [id],
        (err1, result1) => {
          if (err1) {
            return res.send({ type: 'err1', res: 0 })
          }
          const rowCount = result1.rowCount
          if (rowCount == 1) {
            console.log('update ')
            db.callback(
              `UPDATE public."Abiturient" SET "${field}"=$2 WHERE "id_abiturient"=$1`,
              [id, name],
              (errUpdate, resultUpdate) => {
                if (errUpdate) {
                  res.send({ res: 0, name: null, type: 'insert err' })
                }
                return res.send({
                  res: resultUpdate.rowCount,
                  name,
                  type: 'update'
                })
              }
            )
          } else {
            console.log('insert ')
            db.callback(
              `INSERT INTO public."Abiturient"("id_enrollee_ORT","${field}") VALUES ($1,$2);`,
              [id, name],
              (errInsert, resultInsert) => {
                if (errInsert) {
                  return res.send({ res: 0, name: null, type: 'insert err' })
                }

                return res.send({
                  res: resultInsert.rowCount,
                  name,
                  type: 'insert'
                })
              }
            )
          }
        }
      )
      //end
    })
  }
)


router.get('/getMale', async function (req, res, next) {
  console.log('/getMale');
  const { rows } = await db.query(`SELECT * From public."Pol" `, []);
  res.send(rows);
});

router.get('/getAbitInfoD', async function (req, res, next) {
  console.log('/getAbitInfoDD');
  const { rows } = await db.query(`SELECT * From public."Abiturient" WHERE "id_enrollee_ORT" = $1 `, [req.query.id_enrollee_ORT]);
  res.send(rows[0]);
});






router.get('/getAbitRegDisc', async function (req, res, next) {
  console.log('/getAbitRegDisc');
  const { rows } = await db.query(`SELECT * FROM "fn_Abiturient_registraziy_discipline"($1, $2, $3, $4)`,
    [req.query.id_learning, req.query.id_admission_plan, req.query.id_abiturient, req.query.tour]);
  res.send(rows);
});

// router.get('/getAbitDiscUpd', async function (req, res, next) {
//   console.log('/getAbitDiscUpd');
//   console.log(req.query)
//   const { rows, err } = await db.query(`UPDATE public."Abiturient_discipline"
//                                           SET  ball_discipline = $1
//                                           WHERE id_abiturient_discipline = $2`,
//     [req.query.ball_new, req.query.id_abit_discip]);
//   if (!err) {
//     res.send({ "res": true });
//   } else {
//     res.send({ "res": false });
//   }
// });

router.get('/getAbitDiscUpd', async function (req, res, next) {
  console.log('/getAbitDiscUpdEEEEE');
  console.log(req.query)
  const { rows, err } = await db.query(`CALL "SP_Abiturient_discipline_upd" (${req.query.id_abit_discip}, ${req.query.ball_new});`,);
  if (!err) {
    res.send({ "res": true });
  } else {
    res.send({ "res": false });
  }
});

router.get('/SPAbiturientDisciplineFull', async function (req, res, next) {
  console.log('/SPAbiturientDisciplineFull');
  console.log(req.query)
  const { rows, err } = await db.query(`CALL "SP_Abiturient_discipline_full" (${req.query.id_admission_plan}, ${req.query.id_abiturient}, ${req.query.tour}, ${req.query.tests_ball});`,);
  if (!err) {
    res.send({ "res": true });
  } else {
    res.send({ "res": false });
  }
});

router.get('/getAbitInfo', async function (req, res, next) {
  console.log('/getAbitInfo')
  const { rows } = await db.query(
    `SELECT * From public."Abiturient" WHERE "id_enrollee_ORT" = $1 `,
    [req.query.id_enrollee_ORT]
  )
  res.send(rows[0])
})


router.post('/downloadImage', function (req, res, next) {
  // router.post('/upload', upload.single('file'), function (req, res, next) {
  console.log('downloadImage', req.body)

  if (!fs.existsSync(CONSTANTS.UPLOAD_PATH + req.body.file)) {
    console.log('existsSync', CONSTANTS.UPLOAD_PATH)
    return res.send({ exist: false, file: null })
  } else {
    console.log('existsSync else')
    let bitmap = fs.readFileSync(CONSTANTS.UPLOAD_PATH + req.body.file)
    return res.send({
      exist: true,
      file: new Buffer.from(bitmap).toString('base64')
    })
  }
})
module.exports = router;