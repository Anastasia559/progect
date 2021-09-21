var express = require('express')
var router = express.Router()
const PATH = require('path')
const fileUpload = require('express-fileupload')
const fs = require('fs-extra')

const db = require('../../DB')
const CONSTANTS = require('./Constants')

router.get('/getMale', async function (req, res, next) {
  console.log('/getMale')
  const { rows } = await db.query(`SELECT * From public."Pol" `, [])
  res.send(rows)
})

router.get('/getAbitInfo', async function (req, res, next) {
  console.log('/getAbitInfo')
  const { rows } = await db.query(
    `SELECT * From public."Abiturient" WHERE "id_enrollee_ORT" = $1 `,
    [req.query.id_enrollee_ORT]
  )
  res.send(rows[0])
})

router.post('/updateAbiturient', async function (req, res, next) {
  console.log('/updateAbiturient')
  console.log(req.body)

  const { rows: check } = await db.query(
    `SELECT * From public."Abiturient" WHERE "id_abiturient" = $1`,
    [req.body.id_abiturient]
  )
  console.log(check.length)
  if (check.length == 1) {
    console.log('update ')
    const { rows } = await db.query(
      `
      UPDATE public."Abiturient" SET  
      "beneficiary_status"=$2,
      "surname"=$3,
      "names"=$4,
      "patronymic"=$5,
      "birthdate"=$6,
      "male"=$7,
      "serial_pas"=$8,
      "number_pas"=$9,
      "date_given_pas"=$10,
      "inn"=$11,
      "StreetHomeAddress"=$12,
      "SeriesAD"=$13,
      "NumberAD"=$14,
      "id_abiturient_category"=$15
      WHERE "id_abiturient"=$1
  `,
      [
        req.body.id_abiturient,
        req.body.beneficiary_status,
        req.body.surname,
        req.body.names,
        req.body.patronymic,
        req.body.birthdate,
        req.body.male,
        req.body.serial_pas,
        req.body.number_pas,
        req.body.date_given_pas,
        req.body.inn,
        req.body.StreetHomeAddress,
        req.body.SeriesAD,
        req.body.NumberAD,
        req.body.id_abiturient_category
      ]
    )
  } else {
    console.log('insert ')
    const ass = await db.query(
      `INSERT INTO public."Abiturient"(
      "id_enrollee_ORT",
      "beneficiary_status",
      "surname",
      "names",
      "patronymic",
      "birthdate",
      "male",
      "serial_pas",
      "number_pas",
      "date_given_pas",
      "inn",
      "StreetHomeAddress",
      "SeriesAD",
      "NumberAD",
      "id_abiturient_category")
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
       $12,
       $13,
       $14,
       $15
       );`,
      [
        req.body.id_enrollee_ORT,
        req.body.beneficiary_status,
        req.body.surname,
        req.body.names,
        req.body.patronymic,
        req.body.birthdate,
        req.body.male,
        req.body.serial_pas,
        req.body.number_pas,
        req.body.date_given_pas,
        req.body.inn,
        req.body.StreetHomeAddress,
        req.body.SeriesAD,
        req.body.NumberAD,
        req.body.id_abiturient_category
      ]
    )
  }
  res.send({ res: true })
})

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

router.get('/abiturientCategory', async function (req, res, next) {
  console.log('/abiturientCategory')

  const { rows } = await db.query(
    `SELECT * From public."Abiturient_category"`,[]
  )
  res.send(rows);
})



module.exports = router
