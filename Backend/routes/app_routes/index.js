const Express = require('express')
const app = Express()
const COOKIE = require(require('path').join(__dirname, '../cookies.js'))
const monroutes = require('./mon/indexmon.js')
const vuzroutes = require('./vuz/indexvuz.js')
const abitroutes = require('./abit/indexabit.js')
const schoolroutes = require('./school/indexschool.js')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const Mon = (req, res, next) => {
  console.log('/api/mon/  MON middle')
  if (COOKIE.CHECK_OPT(req, 12)) {
    next()
  } else res.json({ error: 'mon middle not auth' })
}

const Vuz = (req, res, next) => {
  console.log('/api/vuz/  Vuz middle')
  if (COOKIE.CHECK_OPT(req, 33)) {
    next()
  } else res.json({ error: 'vuz middle not auth' })
}

const Abit = (req, res, next) => {
  console.log('/api/abit/  Abit middle')
  // console.log(req)
  if (COOKIE.CHECK_OPT(req, 15)) {
    // setTimeout(() => {
    //   console.log(req.body.id_abiturient)
    // }, 2000)
      next()
  } else res.json({ error: 'Abit middle not auth' })
}

const School = (req, res, next) => {
  console.log('/api/school/  School middle')
  if (COOKIE.CHECK_OPT(req, 11)) {
    next()
  } else res.json({ error: 'School middle not auth' })
}

app.use('/mon', Mon, monroutes)
app.use('/vuz', Vuz, vuzroutes)
app.use('/abit', Abit, abitroutes)
app.use('/school', School, schoolroutes)

module.exports = app
