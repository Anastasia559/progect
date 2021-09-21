const express = require('express');
const router = express.Router();
const Cookies = require('cookies');
const https = require('https');
const fs = require('fs-extra');
const path = require('path');
const hbs = require('handlebars');
const i18n = require('i18n');
const COOKIE = require(require('path').join(__dirname, './cookies.js'));
const request = require('request');
const bodyParser = require('body-parser');
const SMS = require('./modules/sms');
const CHECKSMSDIR = require('./modules/checksmsdirector');
const CHECKSMSABIT = require('./modules/checksmsabiturient');
const NOTICESMSABIT = require('./modules/noticesmsabiturientforconfirm');
const math = require("mathjs");
const md5 = require('md5');
const db = require('./DB');
const routes = require('./app_routes/index.js');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const { round } = require('mathjs')

//CHECKSMSDIR.checksmsdirector();
//CHECKSMSABIT.checksmsabiturient();
//NOTICESMSABIT.noticesmsabiturientforconfirm();

router.use('/api', routes);


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


hbs.registerHelper('trimString', function (passedString, startstring, endstring) {
  var theString = passedString.substring(startstring, endstring);
  return new hbs.SafeString(theString)
});


hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});




// register hbs helpers in res.locals' context which provides this.locale
hbs.registerHelper('__', function () {
  return i18n.__.apply(this, arguments);
});
hbs.registerHelper('__n', function () {
  return i18n.__n.apply(this, arguments);
});
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '!=':
      return (v1 != v2) ? options.fn(this) : options.inverse(this);
    case '!==':
      return (v1 !== v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});
hbs.registerHelper("math", function (lvalue, operator, rvalue, options) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    "+": lvalue + rvalue,
    "-": lvalue - rvalue,
    "*": lvalue * rvalue,
    "/": lvalue / rvalue,
    "%": lvalue % rvalue
  }[operator];
});


hbs.registerHelper("round", function (lvalue, options) {
  return round(parseFloat(lvalue))
});
router.use(function (req, res, next) {
  res.locals.langiskg = req.cookies.locale === 'kg' ? 1 : 0;
  next();
});

var multer = require('multer');
var fileName;
var storage = multer.diskStorage({
  destination: './abitdata',
  filename: function (req, file, callback) {
    fileName = file.fieldname + '-' + Date.now() + '.' + file.mimetype.substring(6, 12)
    callback(null, fileName);
  }
});
var storage_monmessage = multer.diskStorage({
  destination: './monmessage',
  filename: function (req, file, callback) {
    fileName = file.fieldname + '-' + Date.now() + '.' + file.mimetype.substring(6, 12)
    callback(null, fileName);
  }
});


/* GET home page. */
router.all('/logout', function (req, res) {
  if (req.body.login === 'logout') {
    COOKIE.DISPOSE(req, res);
  }
  res.redirect('/spuz');
});

router.all('/', function (req, res) {
  console.log('/')

  if (req.body.login === 'logout') {
    COOKIE.DISPOSE(req, res);
  }
  var title = res.__('Главная');
  res.render('index', { title: title, index: true });
});


router.all('/mon', function (req, res) {
  console.log('/mon')
  if (COOKIE.CHECK_OPT(req, 12)) {
    res.render('mon', { layout: false });
  } else res.redirect('/spuz/authformmon');
});

router.all('/vuz', function (req, res) {
  console.log('/vuz')
  if (COOKIE.CHECK_OPT(req, 33)) {
    res.render('vuz', { layout: false });
  } else res.redirect('/spuz/authformvuz');
});

router.all('/abit', function (req, res) {
  console.log('/abit')
  if (COOKIE.CHECK_OPT(req, 15)) {
    res.render('abit', { layout: false });
  } else res.redirect('/spuz/authformabit');
});


router.all('/school', function (req, res) {
  console.log('/school')
  if (COOKIE.CHECK_OPT(req, 11)) {
    res.render('school', { layout: false });
  } else res.redirect('/spuz/authformschool');
});


router.all('/authformmon', async function (req, res) {
  console.log('/authformmon');
  if (COOKIE.CHECK_OPT(req, 12)) { res.redirect('/spuz/mon'); }
  else if (req && req.body && req.body.login && req.body.password) {

    async function tt() {
      let cryptoPass = md5(req.body.password);
       console.log(cryptoPass);
      const { rows, err } = await db.query('SELECT id_users, id_role, login FROM public."Users" WHERE login = $1 AND password = $2 AND id_role = 2 limit 1', [req.body.login, cryptoPass])
      if (err) {
        res.render('authformMon', { title: res.__('') });
      }
      if (rows.length > 0) {
        let role = rows[0].id_role;
        let login = rows[0].login;
        let userid = rows[0].id_users;
        if (COOKIE.CHECK_OPT(req, role, login)) {
          COOKIE.LOGIN(req, res, role, login, userid);
          if (role == 2) {
            res.redirect('/spuz/mon');
          };
        } else res.render('authformMon', { title: res.__('Учетные данные введены неправильно!!') });
      } else res.render('authformMon', { title: res.__('Учетные данные введены неправильно!!!') });
    } tt()
  } else res.render('authformMon', { title: res.__('') });
});

router.all('/authformvuz', async function (req, res) {
  console.log('/authformvuz');
  if (COOKIE.CHECK_OPT(req, 33)) { res.redirect('/spuz/vuz'); }
  else if (req && req.body && req.body.login && req.body.password) {
    async function tt() {
      let cryptoPass = md5(req.body.password);
      const { rows, err } = await db.query('SELECT id_users, id_role, login FROM public."Users" WHERE login = $1 AND password = $2 AND id_role = 3 limit 1', [req.body.login, cryptoPass])
      if (err) {
        res.render('authformVuz', { title: res.__('') });
      }
      if (rows.length > 0) {
        let role = rows[0].id_role;
        let login = rows[0].login;
        let userid = rows[0].id_users;
        let fio = rows[0].fio_users;
        if (COOKIE.CHECK_OPT(req, role, login)) {
          COOKIE.LOGIN(req, res, role, login, userid, fio);
          if (role == 3) {
            res.redirect('/spuz/vuz');
          };
        } else res.render('authformVuz', { title: res.__('Учетные данные введены неправильно!!!') });
      } else res.render('authformVuz', { title: res.__('Учетные данные введены неправильно!!!') });
    } tt()
  } else res.render('authformVuz', { title: res.__('') });
});

router.all('/authformabit', async function (req, res) {
  if (COOKIE.CHECK_OPT(req, 15)) { res.redirect('/spuz/abit'); }
  else if (req && req.body && req.body.login && req.body.password) {
    async function tt() {
      let cryptoPass = md5(req.body.password);
      const { rows, err } = await db.query('SELECT "id_enrollee_ORT" AS "id_users", 5 AS "id_role", "NumberSert" AS "login" FROM public."Enrollee_ORT" WHERE "NumberSert" = $1 AND "password" = $2 limit 1', [req.body.login, cryptoPass])
      if (err) {
        res.render('authformAbit', { title: res.__('') });
      }
      if (rows.length > 0) {
        let role = rows[0].id_role;
        let login = rows[0].login;
        let userid = rows[0].id_users;
        let fio = "Абитуриент " + rows[0].id_users;
        if (COOKIE.CHECK_OPT(req, role, login)) {
          COOKIE.LOGIN(req, res, role, login, userid, fio);
          if (role == 5) {
            res.redirect('/spuz/abit');
          };
        } else res.render('authformAbit', { title: res.__('Учетные данные введены неправильно!!!') });
      } else res.render('authformAbit', { title: res.__('Учетные данные введены неправильно!!!') });
    } tt()
  } else res.render('authformAbit', { title: res.__('') });
});




router.all('/authformschool', function (req, res) {
	console.log('/authformschool', req.body);
	const { Pool } = require('pg')
	const pool = new Pool({
	  host: 'localhost',
	  port: 5432,
	  database: 'ort',
	  user: 'backend',
	  password: 'xSJasdarhhusEwG7a4jo',
	  max: 20,
	  idleTimeoutMillis: 30000,
	  connectionTimeoutMillis: 2000
	})
  async function ff (str) {
    let fetch = require('node-fetch')
    let url =
      'http://localhost:8180/api/external/CryptPassword/0625E692-AD94-4E01-91E6-89D6FFEFA207/' +
      str
    let settings = { method: 'Get' }
    let response = await fetch(url, settings)

    let data = await response.json()
    return await data.cryptPassword
  }

  async function getCryptPassword (str) {
    return await ff(str)
  }

  if (COOKIE.CHECK_OPT(req, 11)) {
    res.redirect('/spuz/school')
  } else if (req && req.body && req.body.login && req.body.password) {
    async function tt () {
      let cryptoPass = await getCryptPassword(req.body.password)

      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query(
          'SELECT * FROM public."Users_school"	WHERE login_school = $1 AND password_school = $2 limit 1',
          [req.body.login, cryptoPass],
          (err, result) => {
            release()
            if (err) {
              return console.error('Error executing query', err.stack)
            }
            if (result.rowCount > 0) {
              let role = result.rows[0].id_role
              let login = result.rows[0].login_school
              let userid = result.rows[0].id_school_users
              checkSchool(result.rows[0])
              if (COOKIE.CHECK_OPT(req, role, login)) {
                COOKIE.LOGIN(req, res, role, login, userid)

                if (role == 6) {
                  res.redirect('/spuz/school')
                }
              } else
                res.render('authformSchool', {
                  title: res.__('')
                })
            } else
              res.render('authformSchool', {
                title: res.__('')
              })
          }
        )
      })
    }
    tt()
  } else
    res.render('authformSchool', { title: res.__('') })
})


async function checkSchool(record) {
	console.log(record);
	console.log(record.id_school_users);

      const { rows, err } = await db.query('SELECT id_school_users, login_school, id_role, fio_director FROM public."Users_school" WHERE id_school_users = $1 limit 1', [record.id_school_users])
      if (err) {
        res.render('authformSchool', { title: res.__('') });
      }
      if (rows.length > 0) {
        console.log('School have in base!!!');
      } else {
      	console.log('School have not in base!!!')
	      	const { rows, err } = await db.query(`INSERT INTO public."Users_school"(
						id_school_users, 
						id_role, 
						id_region, 
						id_district, 
						id_village, 
						school_name, 
						fio_director, 
						school_phone)
				VALUES (
						$1, 
						$2, 
						$3, 
						$4, 
						$5, 
						$6, 
						$7, 
						$8
						);`,[
						record.id_school_users,
						6,
						record.id_region,
						record.id_district,
						record.id_village,
						record.school_name,
						record.fio_director,
						record.school_phone
						])
		      if (err) {
		        res.render('authformSchool', { title: res.__('') });
		      }


      }
}






// router.all('/authformschool', async function (req, res) {
//   // console.log('/authformschool', req.body);
//   if (COOKIE.CHECK_OPT(req, 11)) { res.redirect('/spuz/school'); }
//   else if (req && req.body && req.body.login && req.body.password) {
//     async function tt() {
//       let cryptoPass = md5(req.body.password);
//       //let cryptoPass = req.body.password;
//       const { rows, err } = await db.query('SELECT id_school_users, login_school, id_role, fio_director FROM public."Users_school" WHERE "login_school" = $1 AND "password_school" = $2 AND "id_role" = 6 limit 1', [req.body.login, cryptoPass])
//       if (err) {
//         res.render('authformSchool', { title: res.__('') });
//       }
//       if (rows.length > 0) {
//         let role = rows[0].id_role;
//         let login = rows[0].login_school;
//         let userid = rows[0].id_school_users;
//         let fio = rows[0].fio_director;
//         if (COOKIE.CHECK_OPT(req, role, login)) {
//           COOKIE.LOGIN(req, res, role, login, userid, fio);
//           if (role == 6) {
//             res.redirect('/spuz/school');
//           };
//         } else res.render('authformSchool', { title: res.__('Учетные данные введены неправильно!!!') });
//       } else res.render('authformSchool', { title: res.__('Учетные данные введены неправильно!!!') });
//     } tt()
//   } else res.render('authformSchool', { title: res.__('') });
// });




router.all('/authform', function (req, res) {
  if (COOKIE.CHECK_OPT(req, 11)) {
    res.redirect('/spuz/school');
  }
  else if (COOKIE.CHECK_OPT(req, 22)) {
    res.redirect('/soomo');
  }
  else if (req && req.body && req.body.login && req.body.password) {
    async function tt() {
      let cryptoPass = md5(req.body.password);
      const { rows } = await db.query('SELECT id_school_users, login_school, id_role FROM public."Users_school"	WHERE login_school = $1 AND password_school = $2 limit 1', [req.body.login, cryptoPass])
      if (rows.length > 0) {
        let role = rows[0].id_role;
        let login = rows[0].login_school;
        let userid = rows[0].id_school_users;

        if (COOKIE.CHECK_OPT(req, role, login)) {
          COOKIE.LOGIN(req, res, role, login, userid);

          if (role == 6) {
            res.redirect('/spuz/school');
          };
          if (role == 7) {
            res.redirect('/spuz/soomo');
          };
        } else res.render('authform', { title: res.__('Форма восстановления номера') });
      } else res.render('authform', { title: res.__('Форма восстановления номера') });
    } tt()
  } else res.render('authform', { title: res.__('Форма восстановления номера') });
});




router.all('/authformsoomo', async function (req, res) {
  if (COOKIE.CHECK_OPT(req, 11)) { res.redirect('/spuz/school'); }
  else if (COOKIE.CHECK_OPT(req, 22)) { res.redirect('/spuz/soomo'); }
  else if (req && req.body && req.body.login && req.body.password) {
    async function tt() {
      let cryptoPass = md5(req.body.password);
      const { rows } = await db.query('SELECT id_school_users, login_school, id_role FROM public."Users_school"	WHERE login_school = $1 AND password_school = $2 limit 1', [req.body.login, cryptoPass])
      if (rows.length > 0) {
        let role = rows[0].id_role;
        let login = rows[0].login_school;
        let userid = rows[0].id_school_users;

        if (COOKIE.CHECK_OPT(req, role, login)) {
          COOKIE.LOGIN(req, res, role, login, userid);

          if (role == 6) {
            res.redirect('/spuz/school');
          };
          if (role == 7) {
            res.redirect('/spuz/soomo');
          };
        } else res.render('authformsoomo', { title: res.__('Форма восстановления номера') });
      } else res.render('authformsoomo', { title: res.__('Форма восстановления номера') });
    } tt()
  } else res.render('authformsoomo', { title: res.__('Форма восстановления номера') });

});







////  soomo choose 
router.get('/soomo', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 22)) {

    res.render('restore/soomo_choice', {
      title: res.__('Формы для изменения'),
      id: COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id

    });
  } else res.render('authform', { title: res.__('Форма входа') });
});


router.get('/zoomo_vuz_report', async function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 22)) {
    const { rows } = await db.query('SELECT * From "fn_enrollee_zoomo_vuz"()', [])
    res.render('restore/zoomo_vuz_report', { layout: false, obj: rows });
  } else res.redirect('/');
});




////////// restorearmyverify
router.all('/restorearmyverify', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 22)) {
    const perPage = 100;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`SELECT count(*) OVER() AS full_count, "id_new_enrollee_ORT", "NumberSert", verified, date_verified,soomo_username, date_created FROM public."New_Enrollee_ORT" LIMIT $1 OFFSET $2`, [perPage, ((page - 1) * perPage)], (err, result) => {
        release()
        if (err) {
          // res.json({message:res.__('Файлы загужены!')});
          return console.error('Error executing query', err.stack)
        }
        if (result.rows > 0) {
          result.rows.sort(function (a, b) {
            return (a.NumberSert < b.NumberSert) ? -1 : 1;
          });
        };
        const title = res.__('Подтверждение данных сертификата после военной службы');
        if (result.rows < 1) {
          const title = res.__('Подтверждение данных сертификата после военной службы') + "  " + res.__('Нет данных');
          const notEmpty = false;
          const currentPage = 1;
          const itemCount = 1;
          const pageCount = 1;
          const nextPage = 1;
          const students = 0;
        }
        else {
          const currentPage = page;
          const itemCount = result.rows[0].full_count;
          const pageCount = Math.ceil(result.rows[0].full_count / perPage);
          const nextPage = (result.rows[0].full_count == (page - 1)) ? page : page + 1;
          const students = result.rows;
          const notEmpty = true;
        };
        res.render('restore/restore_after_army_verify', {
          title: title,
          notEmpty: notEmpty,
          currentPage: page,
          itemCount: itemCount,
          pageCount: pageCount,
          nextPage: nextPage,
          students: students
        });
      })
    });
  } else res.render('authform', { title: res.__('Форма входа') });
});

////// ajax verify
router.post('/restorearmyverifyajax', function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 22)) {

    // function to encode file data to base64 encoded string
    function base64_encode(file) {
      // read binary data
      var bitmap = fs.readFileSync('abitdata/' + file);
      // convert binary data to base64 encoded string
      return new Buffer.from(bitmap).toString('base64');
    }

    if (req.body['number'] == null ||
      req.body['id'] == null
    ) {
      res.json({ message: res.__('Ошибка, пустая форма!') });
    }
    else {
      const number = req.body['number'];
      const id = req.body['id'];

      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT "New_Enrollee_ORT".*, "Users_school".fio_director, "Users_school".school_phone,  "Users_school".school_name, "District".district FROM public."New_Enrollee_ORT"  JOIN "Users_school" ON "Users_school".id_school_users::varchar="New_Enrollee_ORT".school_user_id JOIN  "District" ON "District".id_district="Users_school".id_district WHERE "id_new_enrollee_ORT"=$1 AND "NumberSert"=$2', [id, number], (err, result) => {
          release()
          if (err) {
            res.json({ message: res.__('Ошибка, неправильные данные!') });
            return console.error('Error executing query', err.stack)
          }

          res.json({
            message: res.__('Ok!'),
            director: result.rows[0].fio_director,
            phone: result.rows[0].school_phone,
            school: result.rows[0].school_name,
            district: result.rows[0].district,
            number: result.rows[0].NumberSert,
            ball: result.rows[0].BallOnRepsTest,
            place: result.rows[0].id_PlaseSertORT,
            bio: result.rows[0].ORT_biology,
            his: result.rows[0].ORT_history,
            che: result.rows[0].ORT_chemistry,
            phi: result.rows[0].ORT_physics,
            eng: result.rows[0].ORT_english,
            mat: result.rows[0].ORT_math,
            kgz: result.rows[0].ORT_kyrgyz,
            rus: result.rows[0].ORT_russian,
            ort: base64_encode(result.rows[0].ort),
            pas: base64_encode(result.rows[0].passport),
            pas2: base64_encode(result.rows[0].passport2),
            mil: base64_encode(result.rows[0].military),
            ate: base64_encode(result.rows[0].diploma)
          });

        })
      });

    }
  }

  else res.status(404).json({ error: res.__('Войдите снова!') });
  // else res.render('authform', {title: res.__('Форма входа')});

});



////// ajax verify restorearmyverifyajaxres
router.post('/restorearmyverifyajaxres', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 22)) {

    function getPhoneToBase(phone) {
      let getNumber = phone.replace('0', '996');
      return getNumber;
    };


    function generatePassword() {
      var length = 5,
        charset = "abcdefghijkmnpqrstuvxyzABCDEFGHJKLMNPQRSTUVXYZ23456789",
        cryptVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        cryptVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return cryptVal;
    }

    async function ff(str) {
      let fetch = require('node-fetch');
      let url = "http://localhost:8180/api/external/CryptPassword/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + str;
      let settings = { method: "Get" };
      let response = await fetch(url, settings);
      let data = await response.json();
      return await data.cryptPassword
    }

    async function getCryptPassword(str) {
      return await ff(str);
    }


    if (req.body['number'] == null ||
      req.body['id'] == null ||
      req.body['active'] == null
    ) {
      res.json({ message: res.__('Ошибка, пустой запрос!') });
    }
    else {
      const number = req.body['number'];
      const id = req.body['id'];
      const active = req.body['active'];

      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT * FROM public."New_Enrollee_ORT" WHERE "NumberSert" = $1 AND "id_new_enrollee_ORT"=$2', [number, id], (err, result) => {
          release()
          if (err) {
            res.json({ message: res.__('Ошибка, пустой запрос!') });
            return console.error('Error executing query', err.stack)
          }
          const phone = result.rows[0].telefon_ab;
          const numberSert = result.rows[0].NumberSert;
          const ball = result.rows[0].BallOnRepsTest;
          const place = result.rows[0].id_PlaseSertORT;
          const ort_biology = result.rows[0].ORT_biology;
          const ort_history = result.rows[0].ORT_history;
          const ort_chemistry = result.rows[0].ORT_chemistry;
          const ort_physics = result.rows[0].ORT_physics;
          const ort_english = result.rows[0].ORT_english;
          const ort_math = result.rows[0].ORT_math;
          const ort_kyrgyz = result.rows[0].ORT_kyrgyz;
          const ort_russian = result.rows[0].ORT_russian;

          pool.connect((err, client, release) => {
            if (err) {
              return console.error('Error acquiring client', err.stack)
            }
            client.query('UPDATE public."New_Enrollee_ORT" SET verified = $1, date_verified=CURRENT_TIMESTAMP, soomo_username=$4, soomo_user_id=$5 WHERE "NumberSert" = $2 AND "id_new_enrollee_ORT"=$3',
              [active, number, id, COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].username, COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id], (err, result) => {
                release()
                if (err) {
                  res.json({ message: res.__('Ошибка, пустой запрос!') });
                  return console.error('Error executing query', err.stack)
                }
                if (active == '1') {
                  pool.connect((err, client, release) => {
                    if (err) { return console.error('Error acquiring client', err.stack) }


                    async function tt() {
                      let pass = generatePassword()
                      let cryptoPass = await getCryptPassword(pass);
                      const values = [cryptoPass, phone,
                        number, ball, ort_biology, ort_history,
                        ort_chemistry, ort_physics, ort_english, ort_kyrgyz,
                        ort_russian, ort_math, place];

                      const text = 'INSERT INTO public."Enrollee_ORT" (password,telefon_ab, "NumberSert","BallOnRepsTest","ORT_biology","ORT_history","ORT_chemistry", "ORT_physics",  "ORT_english", "ORT_kyrgyz", "ORT_russian","ORT_math", "id_PlaseSertORT") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)';

                      client.query(text, values, (err, result) => {
                        release()
                        if (err) {
                          return console.error('Error executing query', err.stack)
                        }

                        let shMessage = `Уважаемый Абитуриент! Ваш логин: ${number} пароль: ${pass} https://2020.edu.gov.kg/personalcabinet/#enrollee`;
                        SMS.sendSMS(number, phone, shMessage, 5, 3)
                      })
                    } tt()
                  });
                }
                else if (active == '0') {
                  let shMessage = `Уважаемый Абитуриент! Ваш сертификат: ${number}. Ваши данные подлежат к уточнению свяжитесь с нами!, ЦООМО`;
                  SMS.sendSMS(number, phone, shMessage, 5, 5)
                };




                res.json({
                  message: res.__('Успешно сохранен!')
                });



              })

          });


        })
      });


    }
  } else res.render('authform', { title: res.__('Форма входа') });

});


//////////////   restore soomo army 




router.get('/restoresertfrommesagesoomosearchid', async function (req, res, next) {


  function base64_encode(file) {
    if (!fs.existsSync('abitdata/' + file)) {
      var bitmap = fs.readFileSync('abitdata/' + 'fileNF.png');
      return new Buffer.from(bitmap).toString('base64');
    }
    else {
      bitmap = fs.readFileSync('abitdata/' + file);
      return new Buffer.from(bitmap).toString('base64');
    }
  }
  if (COOKIE.CHECK_OPT(req, 22)) {

    if (req.query.number == null ||
      req.query.id == null
    ) {
      res.redirect('/soomo');
    }
    else {
      const number = req.query.number;
      const id = req.query.id;

      const { rows } = await db.query(`SELECT id_message_soomo, "Message_to_soomo"."NumberSert", ab_fio, 
      "Message_to_soomo".region, "Message_to_soomo".district, school, abit_phone, message,  
      passport, passport2, diploma, military, ort, TO_CHAR(datecreate, 'YYYY-MM-DD HH:MM') AS senddate,
      "Enrollee_ORT"."NumberSert" AS db_numberSert, 
      CONCAT('0', SUBSTRING("Enrollee_ORT"."telefon_ab",4,12)) AS db_telefon_ab, 
      school_name AS db_school_name, "District".district AS db_district_name,
      "Region".region AS db_region_name
      FROM public."Message_to_soomo"
      LEFT JOIN public."Enrollee_ORT"
      ON "Message_to_soomo"."NumberSert" = "Enrollee_ORT"."NumberSert"
      LEFT JOIN public."Users_school"
      ON "Enrollee_ORT".id_school = "Users_school".id_school_users
      LEFT JOIN public."District" 
      ON "Users_school".id_district = "District".id_district
      LEFT JOIN public."Region"
      ON "District".id_region = "Region".id_region
      WHERE "Message_to_soomo"."id_message_soomo" = $1`, [id])

      res.render('restore/restoresertfrommesagesearchid', {
        title: res.__('Подтверждение данных'),
        number: rows[0].NumberSert,
        ab_fio: rows[0].ab_fio,
        region: rows[0].region,
        district: rows[0].district,
        school: rows[0].school,
        abit_phone: rows[0].abit_phone,
        message: rows[0].message,
        senddate: rows[0].senddate,
        id: rows[0].id_message_soomo,
        ort: rows[0].ort == "" ? "" : base64_encode(rows[0].ort),
        pas: rows[0].passport == "" ? "" : base64_encode(rows[0].passport),
        pas2: rows[0].passport2 == "" ? "" : base64_encode(rows[0].passport2),
        ate: rows[0].diploma == "" ? "" : base64_encode(rows[0].diploma),
        mil: rows[0].military == "" ? "" : base64_encode(rows[0].military),
        dbsert: rows[0].db_numbersert,
        dbphone: rows[0].db_telefon_ab,
        dbschool: rows[0].db_school_name,
        dbdistrict: rows[0].db_district_name,
        dbregion: rows[0].db_region_name
      });
    }
  } else res.render('authform', { title: res.__('Форма входа') });
});




router.get('/restoresertfrommesagesoomosearchidarmy', async function (req, res, next) {

  // function to encode file data to base64 encoded string
  function base64_encode(file) {
    if (!fs.existsSync('abitdata/' + file)) {
      var bitmap = fs.readFileSync('abitdata/' + 'fileNF.png');
      return new Buffer.from(bitmap).toString('base64');
    }
    else {
      bitmap = fs.readFileSync('abitdata/' + file);
      return new Buffer.from(bitmap).toString('base64');
    }
  }
  if (COOKIE.CHECK_OPT(req, 22)) {

    if (req.query.number == null ||
      req.query.id == null
    ) {
      res.redirect('/soomo');
    }
    else {
      const number = req.query.number;
      const id = req.query.id;

      const { rows } = await db.query(`SELECT id_message_soomo, "Message_to_soomo"."NumberSert", ab_fio, 
      "Message_to_soomo".region, "Message_to_soomo".district, school, abit_phone, message,  
      passport, passport2, diploma, military, ort, TO_CHAR(datecreate, 'YYYY-MM-DD HH:MM') AS senddate,
      "Enrollee_ORT"."NumberSert" AS db_numberSert, 
      CONCAT('0', SUBSTRING("Enrollee_ORT"."telefon_ab",4,12)) AS db_telefon_ab, 
      school_name AS db_school_name, "District".district AS db_district_name,
      "Region".region AS db_region_name
      FROM public."Message_to_soomo"
      LEFT JOIN public."Enrollee_ORT"
      ON "Message_to_soomo"."NumberSert" = "Enrollee_ORT"."NumberSert"
      LEFT JOIN public."Users_school"
      ON "Enrollee_ORT".id_school = "Users_school".id_school_users
      LEFT JOIN public."District" 
      ON "Users_school".id_district = "District".id_district
      LEFT JOIN public."Region"
      ON "District".id_region = "Region".id_region
      WHERE "Message_to_soomo"."id_message_soomo" = $1`, [id])

      res.render('restore/restoresertfrommesagesearchidarmy', {
        title: res.__('Подтверждение данных'),
        number: rows[0].NumberSert,
        ab_fio: rows[0].ab_fio,
        region: rows[0].region,
        district: rows[0].district,
        school: rows[0].school,
        abit_phone: rows[0].abit_phone,
        message: rows[0].message,
        senddate: rows[0].senddate,
        id: rows[0].id_message_soomo,
        ort: rows[0].ort == "" ? "" : base64_encode(rows[0].ort),
        pas: rows[0].passport == "" ? "" : base64_encode(rows[0].passport),
        pas2: rows[0].passport2 == "" ? "" : base64_encode(rows[0].passport2),
        ate: rows[0].diploma == "" ? "" : base64_encode(rows[0].diploma),
        mil: rows[0].military == "" ? "" : base64_encode(rows[0].military),
        dbsert: rows[0].db_numbersert,
        dbphone: rows[0].db_telefon_ab,
        dbschool: rows[0].db_school_name,
        dbdistrict: rows[0].db_district_name,
        dbregion: rows[0].db_region_name
      });
    }
  } else res.render('authform', { title: res.__('Форма входа') });
});




router.post('/restoresertfrommesagesoomoajax', function (req, res, next) {

  // function to encode file data to base64 encoded string
  function base64_encode(file) {
    if (!fs.existsSync(file)) {
      var bitmap = fs.readFileSync('abitdata/' + 'fileNF.png');
      return new Buffer.from(bitmap).toString('base64');
    }
    else {
      bitmap = fs.readFileSync('abitdata/' + file);
      return new Buffer.from(bitmap).toString('base64');
    }
  }
  if (COOKIE.CHECK_OPT(req, 22)) {

    if (req.body['number'] == null ||
      req.body['id'] == null
    ) {
      res.json({ message: res.__('Ошибка, пустая форма!') });
    }
    else {
      const number = req.body['number'];
      const id = req.body['id'];
      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT  * FROM public."Message_to_soomo"  WHERE "Message_to_soomo"."id_message_soomo"=$1 AND "Message_to_soomo"."NumberSert"=$2', [id, number], (err, result) => {
          release()
          if (err) {
            res.json({ message: res.__('Ошибка, пустая форма!') });
            return console.error('Error executing query', err.stack)
          }
          res.json({
            message: res.__('Ok!'),
            number: result.rows[0].NumberSert,
            ab_fio: result.rows[0].ab_fio,
            region: result.rows[0].region,
            district: result.rows[0].district,
            school: result.rows[0].school,
            abit_phone: result.rows[0].abit_phone,
            message: result.rows[0].message,
            isort: result.rows[0].ort == "" ? false : true,
            ispas: result.rows[0].passport == "" ? false : true,
            ispas2: result.rows[0].passport2 == "" ? false : true,
            isate: result.rows[0].diploma == "" ? false : true,
            ismil: result.rows[0].military == "" ? false : true,
            id: result.rows[0].id_message_soomo,
            ort: result.rows[0].ort == "" ? "" : base64_encode(result.rows[0].ort),
            pas: result.rows[0].passport == "" ? "" : base64_encode(result.rows[0].passport),
            pas2: result.rows[0].passport2 == "" ? "" : base64_encode(result.rows[0].passport2),
            ate: result.rows[0].diploma == "" ? "" : base64_encode(result.rows[0].diploma),
            mil: result.rows[0].military == "" ? "" : base64_encode(result.rows[0].military)
          });

        })
      });

    }
  } else res.render('authform', { title: res.__('Форма входа') });
});




router.all('/restoresertfrommesagesoomoarmy', async function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 22)) {
    const perPage = 50;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const type = req.query.type ? req.query.type == 'null' ? null : parseInt(req.query.type) : null;

    let text = "";
    let values = [];


    if (type == null) {

      text = `SELECT count(*) OVER() AS full_count,  id_message_soomo, "NumberSert",
  ab_fio,message, abit_phone, action FROM public."Message_to_soomo" 
  WHERE is_military IS TRUE AND action IS NULL AND id_message_soomo > 8500 LIMIT $1 OFFSET $2`
      values = [perPage, ((page - 1) * perPage)]

    } else {
      text = `SELECT count(*) OVER() AS full_count,  id_message_soomo, "NumberSert",
      ab_fio,message, abit_phone, action FROM public."Message_to_soomo" 
      WHERE is_military IS TRUE AND action=$3 LIMIT $1 OFFSET $2`
      values = [perPage, ((page - 1) * perPage), type]
    };
    const { rows } = await db.query(text, values)
    

    rows.sort(function (a, b) {
      return (a.id_message_soomo < b.id_message_soomo) ? -1 : 1;
    });
    let title = res.__('Подтверждение данных сертификата после военной службы') + "  " + res.__('Нет данных');
    let notEmpty = false;
    let currentPage = 1;
    let itemCount = 1;
    let pageCount = 1;
    let nextPage = 1;
    let messages = 0;



    if (rows.length > 0) {
      title = res.__('Подтверждение данных сертификата после военной службы');
      currentPage = page;
      itemCount = rows[0].full_count;
      pageCount = Math.ceil(rows[0].full_count / perPage);
      nextPage = (rows[0].full_count == (page - 1)) ? page : page + 1;
      messages = rows;
      notEmpty = true;

    }


    res.render('restore/restoresertfrommesagefilterarmy', {
      title: title,
      notEmpty: notEmpty,
      currentPage: currentPage,
      itemCount: itemCount,
      pageCount: pageCount,
      nextPage: nextPage,
      type: type,
      messages: messages
    });
  } else res.render('authform', { title: res.__('Форма входа') });
});



router.all('/restoresertfrommesagesoomo', async function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 22)) {
    const perPage = 50;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const type = req.query.type ? req.query.type == 'null' ? null : parseInt(req.query.type) : null;

    let text = "";
    let values = [];


    if (type == null) {

      text = `SELECT count(*) OVER() AS full_count,  id_message_soomo, "NumberSert",
  ab_fio,message, abit_phone, action FROM public."Message_to_soomo" 
  WHERE is_military IS FALSE AND action IS NULL AND id_message_soomo > 8500 LIMIT $1 OFFSET $2`
      values = [perPage, ((page - 1) * perPage)]

    } else {
      text = `SELECT count(*) OVER() AS full_count,  id_message_soomo, "NumberSert",
      ab_fio,message, abit_phone, action FROM public."Message_to_soomo" 
      WHERE is_military IS FALSE AND action=$3 LIMIT $1 OFFSET $2`
      values = [perPage, ((page - 1) * perPage), type]
    };

    const { rows } = await db.query(text, values)
    console.log('/restoresertfrommesagesoomo');

    rows.sort(function (a, b) {
      return (a.id_message_soomo < b.id_message_soomo) ? -1 : 1;
    });
    let title = res.__('Подтверждение данных сертификата') + "  " + res.__('Нет данных');
    let notEmpty = false;
    let currentPage = 1;
    let itemCount = 1;
    let pageCount = 1;
    let nextPage = 1;
    let messages = 0;



    if (rows.length > 0) {
      title = res.__('Подтверждение данных сертификата');
      currentPage = page;
      itemCount = rows[0].full_count;
      pageCount = Math.ceil(rows[0].full_count / perPage);
      nextPage = (rows[0].full_count == (page - 1)) ? page : page + 1;
      messages = rows;
      notEmpty = true;

    }


    res.render('restore/restoresertfrommesagefilter', {
      title: title,
      notEmpty: notEmpty,
      currentPage: currentPage,
      itemCount: itemCount,
      pageCount: pageCount,
      nextPage: nextPage,
      type: type,
      messages: messages
    });
  } else res.render('authform', { title: res.__('Форма входа') });
});


router.all('/serchsert', async function (req, res) {
  if (req.body.searchText.length > 6) {
    let sert = String(req.body.searchText);

    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }

      client.query(`SELECT id_message_soomo, "NumberSert",
                  ab_fio,message, abit_phone, action FROM public."Message_to_soomo" 
                  WHERE id_message_soomo>7000 AND "NumberSert" = '${sert}'`,
        (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }

          const serts = result.rows.length > 0 ? JSON.parse(JSON.stringify(result.rows)) : { error: res.__('Не найдено!') };
          return res.json(serts);
        })
    });
  } else {
    return res.status(404).json({ message: res.__('Минимальная длина 7 символов!') });
  };
});


router.get('/restoresertfrommesagesoomosearch', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 22)) {
    var id = req.query.id;

    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`SELECT "Region".region, district, school_name, "NumberSert", telefon_ab, id_school FROM public."Enrollee_ORT" 
                                            INNER JOIN public."Users_school" ON id_school = id_school_users INNER JOIN public."District"
                                            ON "Users_school".id_district = "District".id_district INNER JOIN public."Region" 
                                            ON "District".id_region = "Region".id_region WHERE  "NumberSert"=${id} LIMIT 1`, (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }

        var title = res.__('Поиск');
        res.render('restore/restoresertfrommesagesoomosearch', {
          title: title,
          layout: false,
          obj: result.rows
        });
      })
    })
  } else res.redirect('/');
});









////  school choose 
router.get('/school', function (req, res, next) {
  console.log('/school')
  if (COOKIE.CHECK_OPT(req, 11)) {

    res.render('restore/school_choice', {
      title: res.__('Формы для изменения')
    });
  } else res.render('authform', { title: res.__('Форма входа') });
});

////////// restoreafterarmy
router.get('/restoreafterarmy', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 11)) {

    res.render('restore/restore_after_army', {
      title: res.__('Форма ввода данных сертификата после военной службы')
    });
  } else res.render('authform', { title: res.__('Форма входа') });

});


router.get('/fromsoomo', async function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 11)) {
    let user_id = COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id;
    const { rows } = await db.query(`SELECT district, school_name, fio_director, id_school, CONCAT(SUBSTRING(telefon_ab,0,10),'***' ) AS telefon_ab, "NumberSert", "BallOnRepsTest", "ORT_biology", "ORT_history", "ORT_chemistry", "ORT_physics", 
				"ORT_english", "ORT_math", "ORT_kyrgyz", "ORT_russian", CASE WHEN LENGTH(password) > 5 THEN 1 ELSE 0 END AS connect
				FROM public."Enrollee_ORT"
				INNER JOIN public."Users_school"
				ON id_school = id_school_users
				INNER JOIN public."District"
				ON "Users_school".id_district = "District".id_district
				WHERE id_school = ${user_id}`, [])

    var title = res.__('Данные по ЦООМО');
    res.render('restore/fromsoomo', {
      title: title,
      messages: rows
    });
  } else res.render('authform', { title: res.__('Форма входа') });
});


router.get('/restorephonefrommesage', async function (req, res, next) {

  function getPhoneToBase(phone) {
    let getNumber = phone.replace('0', '996');
    return getNumber;
  }

  if (COOKIE.CHECK_OPT(req, 11)) {
    var datetime = new Date();


    let user_id = COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id;


    if (req.query.numbersert && req.query.abit_phone && req.query.ab_fio && req.query.action) {
      let sqlquery = {};
      if (req.query.action == '1') {
        sqlquery = `UPDATE public."Enrollee_ORT" SET telefon_ab = '${getPhoneToBase(req.query.abit_phone)}' WHERE "NumberSert"= '${req.query.numbersert}' AND id_school = ${user_id};`
      } else {
        sqlquery = `SELECT 1`;
      }

      const { rows } = await db.query(sqlquery, [])

      let shMessage = {};
      if (req.query.action == '1') {
        shMessage = `Ваша заявка одобрена. Номер телефона на портале https://2020.edu.gov.kg/auth изменен. Просьба зарегистрироваться`;
      } else {
        shMessage = `Ваша заявка отклонена. Номер телефона на портале https://2020.edu.gov.kg не изменен. Свяжитесь с директором Вашей школы!`;
      }
      SMS.sendSMS(req.query.numbersert, getPhoneToBase(req.query.abit_phone.toString()), shMessage, 5, 2)

      const { rows: obj } = await db.query('UPDATE public."Message_to_mon" SET action=$1, actiondate=$2	WHERE "NumberSert" = $3', [req.query.action, datetime, req.query.numbersert])

      res.redirect('spuz/restorephonefrommesage');

    } else {
      const { rows: arr } = await db.query(`SELECT "Message_to_mon"."NumberSert",id_message, ab_fio, abit_phone, message, datecreate, action, CONCAT('0', SUBSTRING(telefon_ab,4,12)) AS old_phone
									FROM public."Message_to_mon"
									INNER JOIN public."Users_school"
									ON "Message_to_mon".id_school = "Users_school".id_school_users
									INNER JOIN public."Enrollee_ORT"
									ON "Message_to_mon"."NumberSert" = "Enrollee_ORT"."NumberSert"
									WHERE to_role = 6 AND id_school_users = $1`, [user_id])
      res.render('restore/restorephonefrommesage', {
        messages: arr.sort(function (a, b) {
          return (a.datecreate < b.datecreate) ? -1 : 1;
        })
      });
    }
  } else res.render('authform', { title: res.__('Форма входа') });
});



router.post('/restorearmyupload', function (req, res) {

  if (COOKIE.CHECK_OPT(req, 11)) {

    function getPhoneToBase(phone) {
      let getNumber = phone.replace('0', '996');
      return getNumber;
    };
    var upload = multer({ storage: storage }).fields([{ name: 'passport', maxCount: 1 }, { name: 'passport2', maxCount: 1 }, { name: 'military', maxCount: 1 }, { name: 'ort', maxCount: 1 }, { name: 'atestat', maxCount: 1 }]);
    upload(req, res, function (err) {

      if (req.files['passport'] == null
        || req.files['passport2'] == null
        || req.files['military'] == null
        || req.files['atestat'] == null
        || req.files['ort'] == null
        || req.body['numberSert'] == null
        || req.body['phone'] == null
        || req.body['ball'] == null
        || req.body['ort_biology'] == null
        || req.body['ort_history'] == null
        || req.body['ort_chemistry'] == null
        || req.body['ort_physics'] == null
        || req.body['ort_math'] == null
        || req.body['ort_english'] == null
        || req.body['ort_kyrgyz'] == null
        || req.body['ort_russian'] == null
      ) {
        res.status(400).send({ message: res.__('Ошибка, пустая форма!') });
      }
      else {

        let passport = req.files['passport'][0].filename;
        let passport2 = req.files['passport2'][0].filename;
        let military = req.files['military'][0].filename;
        let diploma = req.files['atestat'][0].filename;
        let ort = req.files['ort'][0].filename;
        let numberSert = req.body['numberSert'];
        let phone = req.body['phone'];

        let ball = req.body['ball'];

        let place = req.body['place'];
        let ort_biology = req.body['ort_biology'];
        let ort_history = req.body['ort_history'];
        let ort_chemistry = req.body['ort_chemistry'];
        let ort_physics = req.body['ort_physics'];
        let ort_math = req.body['ort_math'];
        let ort_english = req.body['ort_english'];
        let ort_kyrgyz = req.body['ort_kyrgyz'];
        let ort_russian = req.body['ort_russian'];
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query('INSERT INTO public."New_Enrollee_ORT" (passport, passport2, military, diploma, ort, "id_PlaseSertORT", "NumberSert",school_username, school_user_id, "BallOnRepsTest", "ORT_biology", "ORT_history", "ORT_chemistry", "ORT_physics", "ORT_english", "ORT_math", "ORT_kyrgyz", "ORT_russian", telefon_ab) VALUES  ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)',
            [passport, passport2, military, diploma, ort, place, numberSert, COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].username, COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id, ball, ort_biology, ort_history, ort_chemistry, ort_physics, ort_english, ort_math, ort_kyrgyz, ort_russian, getPhoneToBase(phone.toString())],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }

              res.send({ message: res.__('Файлы загружены!') });
            })
        });
      };
    });
  } else res.redirect('/authform');

});

///////  end army 
//////////////  add sert begin
router.all('/addsert', function (req, res) {
  if (COOKIE.CHECK_OPT(req, 7)) {
    res.render('restore/addsert',
      {
        title: res.__('Форма добавления сертификата')
        , logout: 1
      }
    );
  } else res.redirect('/authform');
});

router.get('/add_sert', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 7)) {
    var place = req.query.place ? parseInt(req.query.place) : 0;
    var phone = req.query.phone ? String(req.query.phone) : 0;
    var numberSert = req.query.numberSert ? String(req.query.numberSert) : 0;
    var ball = req.query.ball ? parseInt(req.query.ball) : 0;
    var ort_biology = req.query.ort_biology ? parseInt(req.query.ort_biology) : 0;
    var ort_history = req.query.ort_history ? parseInt(req.query.ort_history) : 0;
    var ort_chemistry = req.query.ort_chemistry ? parseInt(req.query.ort_chemistry) : 0;
    var ort_physics = req.query.ort_physics ? parseInt(req.query.ort_physics) : 0;
    var ort_english = req.query.ort_english ? parseInt(req.query.ort_english) : 0;
    var ort_kyrgyz = req.query.ort_kyrgyz ? parseInt(req.query.ort_kyrgyz) : 0;
    var ort_russian = req.query.ort_russian ? parseInt(req.query.ort_russian) : 0;
    var ort_math = req.query.ort_math ? parseInt(req.query.ort_math) : 0;



    function getPhoneToBase(phone) {
      let getNumber = phone.replace('0', '996');
      return getNumber;
    }


    pool.connect((err, client, release) => {

      if (err) {
        // COOKIE.DISPOSE(req, res);
        // res.redirect('/authform');
        return console.error('Error acquiring client', err.stack)

      }

      client.query(`INSERT INTO  "Enrollee_ORT" ("NumberSert", "BallOnRepsTest", "ORT_biology","ORT_history","ORT_chemistry",
    "ORT_physics", "ORT_english", "ORT_kyrgyz", "ORT_russian", "ORT_math", "id_PlaseSertORT", "telefon_ab","id_school")
    VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, 1782)`,
        [numberSert, ball, ort_biology, ort_history, ort_chemistry, ort_physics, ort_english, ort_kyrgyz, ort_russian, ort_math, place, getPhoneToBase(phone)],
        (err, result) => {
          release()
          if (err) {
            const textjson = {
              "message": 0,
              "error": err.stack

            }
            res.json(textjson)
            return console.error('Error acquiring client', err.stack)
          } else {
            if (phone.length == 10) {
              let shMessage = `Уважаемый абитуриент. Ваш сертификат зарегистрирован в базу, просим зарегистрироваться. https://2020.edu.gov.kg/auth`;
              SMS.sendSMS(numberSert, getPhoneToBase(phone.toString()), shMessage, 5, 3);

            } else {
              numberSert = numberSert + ' Номера телефона неправильно, SMS не отправлен!'
            };

            const textjson = {
              "numbersert": numberSert,
              "message": 1
            }
            res.json(textjson)
          }
        })
    });

  } else res.redirect('/authform');

});
/// end add sert




router.all('/restoresert', function (req, res) {

  if (COOKIE.CHECK_OPT(req, 7)) {
    res.render('restore/restore_sert',
      {
        title: res.__('Форма исправления сертификата')
        , logout: 1
      }
    );
  } else res.redirect('/authform');
});


router.all('/updatesert', function (req, res) {

  if (COOKIE.CHECK_OPT(req, 7)) {
    res.render('restore/restore_sert2',
      {
        title: res.__('Форма исправления сертификата')
        , logout: 1
      }
    );
  } else res.redirect('/authform');
});



router.all('/restorephone', function (req, res) {

  if (COOKIE.CHECK_OPT(req, 11)) {
    res.render('restore/restorephone2',
      {
        title: res.__('Форма восстановления номера')
        , logout: 1
      }
    );
  } else res.redirect('/authform');

});


router.get('/restore_search', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 11)) {
    var numberSert = req.query.numberSert;
    var numberPhone = req.query.phone;
    var ball = req.query.ball;
    var ort_biology = req.query.ort_biology;
    var ort_history = req.query.ort_history;
    var ort_chemistry = req.query.ort_chemistry;
    var ort_physics = req.query.ort_physics;
    var ort_english = req.query.ort_english;
    var ort_kyrgyz = req.query.ort_kyrgyz;
    var ort_russian = req.query.ort_russian;
    var ort_math = req.query.ort_math;
    var next = req.query.next;

    function getPhoneMask(telefon_ab) {
      let getNumber = telefon_ab.replace('996', '0');
      return getNumber.substring(0, 3) + '*****' + getNumber.substring(8, 10);
    }

    function getPhoneToBase(phone) {
      let getNumber = phone.replace('0', '996');
      return getNumber;
    }

    function generatePassword() {
      var length = 5,
        charset = "abcdefghijkmnpqrstuvxyzABCDEFGHJKLMNPQRSTUVXYZ23456789",
        cryptVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        cryptVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return cryptVal;
    }

    async function ff(str) {
      let fetch = require('node-fetch');
      let url = "http://localhost:8180/api/external/CryptPassword/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + str;
      let settings = { method: "Get" };
      let response = await fetch(url, settings);
      let data = await response.json();
      return await data.cryptPassword
    }

    async function getCryptPassword(str) {
      return await ff(str);
    }


    pool.connect((err, client, release) => {

      if (err) {
        COOKIE.DISPOSE(req, res);
        res.redirect('/authform');

        return console.error('Error acquiring client', err.stack)
      }
      client.query(`SELECT * FROM "Enrollee_ORT" WHERE "Enrollee_ORT"."NumberSert" = $1`, [numberSert],
        (err, result) => {
          release()
          if (err) {
            COOKIE.DISPOSE(req, res);
            res.redirect('/authform');
            return console.error('Error executing query', err.stack)
          } else {

            if (result.rowCount > 0
              //&& result.rows[0].BallOnRepsTest >= 110
              && result.rows[0].BallOnRepsTest == ball
              && result.rows[0].NumberSert == numberSert
              && result.rows[0].ORT_biology == ort_biology
              && result.rows[0].ORT_history == ort_history
              && result.rows[0].ORT_chemistry == ort_chemistry
              && result.rows[0].ORT_physics == ort_physics
              && result.rows[0].ORT_math == ort_math
              && result.rows[0].ORT_english == ort_english
              && result.rows[0].ORT_kyrgyz == ort_kyrgyz
              && result.rows[0].ORT_russian == ort_russian
            ) {
              var phone_old = result.rows[0].telefon_ab;

              if (next == 1) {
                //input  phone 
                pool.connect((err, client, release) => {
                  if (err) {
                    COOKIE.DISPOSE(req, res);
                    res.redirect('/authform');
                    return console.error('Error acquiring client', err.stack)
                  }
                  async function tt() {
                    let pass = generatePassword()
                    let cryptoPass = await getCryptPassword(pass);
                    client.query('UPDATE public."Enrollee_ORT" SET password = $1, telefon_ab=$3 WHERE "NumberSert" = $2',
                      [cryptoPass, numberSert, getPhoneToBase(numberPhone.toString())],
                      (err, result) => {
                        release()
                        if (err) {
                          COOKIE.DISPOSE(req, res);
                          res.redirect('/authform');
                          return console.error('Error executing query', err.stack)
                        }
                        let shMessage = `Уважаемый Абитуриент! Ваш логин: ${numberSert} пароль: ${pass} https://2020.edu.gov.kg/personalcabinet/#enrollee`;
                        SMS.sendSMS(numberSert, getPhoneToBase(numberPhone.toString()), shMessage, 5, 6)
                        pool.connect((err, client, release) => {
                          if (err) {
                            COOKIE.DISPOSE(req, res);
                            res.redirect('/authform');
                            return console.error('Error acquiring client', err.stack)
                          }
                          client.query('UPDATE public."Update_phone" SET phone_old = $1, phone_new=$2 WHERE "NumberSert" = $3 AND user_id=$4',
                            [phone_old, getPhoneToBase(numberPhone.toString()), numberSert, COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id],
                            (err, result) => {
                              release()
                              if (err) {
                                COOKIE.DISPOSE(req, res);
                                res.redirect('/authform');
                                return console.error('Error executing query', err.stack)
                              }

                            })
                        });


                        res.render('restore/restore_search', {
                          layout: false,
                          phoneChanged: 1
                        });
                      })
                  } tt()
                });
              }
              else {  // after input sert send phone to chek
                async function send_phone() {
                  let phone = result.rows[0].telefon_ab;
                  if (phone == null) { ph = res.__('нет') }
                  else { ph = getPhoneMask(phone) };
                  res.render('restore/restore_search', {
                    layout:
                      false,
                    phone: ph
                  });
                } send_phone()
              }

            } else {
              res.render('restore/restore_search', {
                layout: false,
                inputFalse: 1
              });
            }
          }
        })
    });


  } else res.redirect('/authform');
});





router.get('/restore_sert_search2', async function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 7)) {
    var next = parseInt(req.query.next);
    var numberSert = (req.query.numberSert);

    var balln = parseInt(req.query.balln);
    var ort_biologyn = parseInt(req.query.ort_biologyn);
    var ort_historyn = parseInt(req.query.ort_historyn);
    var ort_chemistryn = parseInt(req.query.ort_chemistryn);
    var ort_physicsn = parseInt(req.query.ort_physicsn);
    var ort_englishn = parseInt(req.query.ort_englishn);
    var ort_kyrgyzn = parseInt(req.query.ort_kyrgyzn);
    var ort_russiann = parseInt(req.query.ort_russiann);
    var ort_mathn = parseInt(req.query.ort_mathn);
    var placen = parseInt(req.query.placen);

    const { rows } = await db.query(`SELECT "NumberSert", "BallOnRepsTest","ORT_biology","ORT_history","ORT_chemistry",
    "ORT_physics", "ORT_english", "ORT_kyrgyz", "ORT_russian", "ORT_math", "id_PlaseSertORT",
    CONCAT('0', SUBSTRING("Enrollee_ORT"."telefon_ab",4,12)) AS telefon_ab, 
    school_name AS db_school_name, "District".district AS db_district_name,
    "Region".region AS db_region_name
    FROM public."Enrollee_ORT"
    LEFT JOIN public."Users_school"
    ON "Enrollee_ORT".id_school = "Users_school".id_school_users
    LEFT JOIN public."District" 
    ON "Users_school".id_district = "District".id_district
    LEFT JOIN public."Region"
    ON "District".id_region = "Region".id_region
    WHERE "Enrollee_ORT"."NumberSert" = $1`, [numberSert])
    


    if (rows.length == 0) {
      COOKIE.DISPOSE(req, res);
      res.redirect('/authform');
    }


    if (rows.length > 0
      && rows[0].NumberSert == numberSert
    ) {
      var phone_old = rows[0].telefon_ab;
      var school = rows[0].db_school_name;
      var region = rows[0].db_region_name;
      var district = rows[0].db_district_name;
      var ball = rows[0].BallOnRepsTest;
      var NumberSert = rows[0].NumberSert;
      var ort_biology = rows[0].ORT_biology;
      var ort_history = rows[0].ORT_history;
      var ort_chemistry = rows[0].ORT_chemistry;
      var ort_physics = rows[0].ORT_physics;
      var ort_english = rows[0].ORT_english;
      var ort_kyrgyz = rows[0].ORT_kyrgyz;
      var ort_russian = rows[0].ORT_russian;
      var ort_math = rows[0].ORT_math;
      var place = rows[0].id_PlaseSertORT;


      if (next == 1) {
        //input  phone 


        async function tt() {
          const text = 'UPDATE public."Enrollee_ORT" SET "ORT_math"=$2, \
                  "ORT_russian"=$3, "BallOnRepsTest"=$4, "ORT_biology"=$5,  "ORT_history"=$6,\
                 "ORT_chemistry"=$7, "ORT_physics"=$8, "ORT_english"=$9, "ORT_kyrgyz"=$10, "id_PlaseSertORT"=$11  \
                 WHERE "NumberSert" = $1';
          const values = [numberSert, ort_mathn,
            ort_russiann, balln, ort_biologyn, ort_historyn,
            ort_chemistryn, ort_physicsn, ort_englishn, ort_kyrgyzn, placen];

          const { rows } = await db.query(text, values)
          

          if (rows.length == 0) {
            COOKIE.DISPOSE(req, res);
            res.redirect('/authform');
          }

          let shMessage = `Уважаемый Абитуриент! Данные Вашего сертификата(${numberSert}) корректированы. ЦООМО, https://2020.edu.gov.kg`;
          SMS.sendSMS(numberSert, getPhoneToBase(phone_old.toString()), shMessage, 5, 3)

          const old_data = 'numberSert=' + numberSert +
            ';BallOnRepsTest=' + ball + ';ORT_biology=' + ort_biology +
            ';ORT_history=' + ort_history + ';ORT_chemistry=' + ort_chemistry +
            ';ORT_physics=' + ort_physics + ';ORT_english=' + ort_english +
            ';ORT_kyrgyz=' + ort_kyrgyz + ';ORT_russian=' + ort_russian +
            ';ORT_math=' + ort_math + ';Place' + place;
          const new_data =
            'BallOnRepsTest=' + balln + ';ORT_biology=' + ort_biologyn +
            ';ORT_history=' + ort_historyn + ';ORT_chemistry=' + ort_chemistryn +
            ';ORT_physics=' + ort_physicsn + ';ORT_english=' + ort_englishn +
            ';ORT_kyrgyz=' + ort_kyrgyzn + ';ORT_russian=' + ort_russiann +
            ';ORT_math=' + ort_mathn + ';Placen' + placen;

          const { rowsB } = await db.query('INSERT INTO public."Update_sert" (username, user_id, old_data, new_data) VALUES  ($1,$2,$3,$4)',
            [COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].username, COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id, old_data, new_data])
            
          if (rowsB.length == 0) {
            COOKIE.DISPOSE(req, res);
            res.redirect('/authform');
          }




          res.render('restore/restore_sert_search2', {
            layout: false,
            dataChanged: 1

          });
        } tt();
      }
      else {  // after input sert send phone to chek

        let phone = rows[0].telefon_ab;
        var school = rows[0].db_school_name;
        var region = rows[0].db_region_name;
        var district = rows[0].db_district_name;
        var ball = rows[0].BallOnRepsTest;
        var NumberSert = rows[0].NumberSert;
        var ort_biology = rows[0].ORT_biology;
        var ort_history = rows[0].ORT_history;
        var ort_chemistry = rows[0].ORT_chemistry;
        var ort_physics = rows[0].ORT_physics;
        var ort_english = rows[0].ORT_english;
        var ort_kyrgyz = rows[0].ORT_kyrgyz;
        var ort_russian = rows[0].ORT_russian;
        var ort_math = rows[0].ORT_math;

        if (phone == null) { ph = 0 }
        else { ph = phone.replace('996', '0') };
        async function send_phone() {
          const textjson = {
            "phone": ph,
            "school": school,
            "region": region,
            "district": district,
            "ort_math": ort_math,
            "NumberSert": NumberSert,
            "BallOnRepsTest": ball,
            "ort_biology": ort_biology,
            "ort_history": ort_history,
            "ort_chemistry": ort_chemistry,
            "ort_physics": ort_physics,
            "ort_english": ort_english,
            "ort_kyrgyz": ort_kyrgyz,
            "ort_russian": ort_russian,
            "place": place,

          }
          res.json(textjson)

        } send_phone()
      }

    } else {
      res.render('restore/restore_sert_search2', {
        layout: false,
        inputFalse: 1
      });
    }
  } else res.redirect('/authform');

});






router.post('/upload_files', function (req, res) {

  if (COOKIE.CHECK_OPT(req, 11)) {
    var upload = multer({ storage: storage }).fields([{ name: 'passport', maxCount: 1 }, { name: 'passport2', maxCount: 1 }, { name: 'ort', maxCount: 1 }, { name: 'atestat', maxCount: 1 }]);
    upload(req, res, function (err) {

      if (req.files['passport'] == null
        || req.files['passport2'] == null
        || req.files['atestat'] == null
        || req.files['ort'] == null
        || req.body['numberSert'] == null) {
        res.status(400).send({ message: res.__('Ошибка, пустая форма!') });
      }
      else {

        let passport = req.files['passport'][0].filename;
        let passport2 = req.files['passport2'][0].filename;
        let diploma = req.files['atestat'][0].filename;
        let ort = req.files['ort'][0].filename;
        // let tel=req.body['phone'];
        let numberSert = req.body['numberSert'];

        let username = COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].username;
        let user_id = COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query('INSERT INTO public."Update_phone" (passport, passport2, diploma, ort, "NumberSert", username, user_id) VALUES  ($1,$2,$3,$4,$5,$6,$7)',
            [passport, passport2, diploma, ort, numberSert, username, user_id],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              // res.json({ passport: passport, passport2: passport2,ort: ort, diploma: diploma });
              res.send({ message: res.__('Файлы загружены!') });
            })
        });
      };
    });
  } else res.redirect('/authform');
});


// restore sert

router.get('/restore_sert_search', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 7)) {
    var numberPhone = req.query.phone;
    var next = req.query.next;
    var numberSert = req.query.numberSert;
    var ball = req.query.ball;
    var ort_biology = req.query.ort_biology;
    var ort_history = req.query.ort_history;
    var ort_chemistry = req.query.ort_chemistry;
    var ort_physics = req.query.ort_physics;
    var ort_english = req.query.ort_english;
    var ort_kyrgyz = req.query.ort_kyrgyz;
    var ort_russian = req.query.ort_russian;
    var ort_math = req.query.ort_math;
    var numberSertn = req.query.numberSertn;
    var balln = req.query.balln;
    var ort_biologyn = req.query.ort_biologyn;
    var ort_historyn = req.query.ort_historyn;
    var ort_chemistryn = req.query.ort_chemistryn;
    var ort_physicsn = req.query.ort_physicsn;
    var ort_englishn = req.query.ort_englishn;
    var ort_kyrgyzn = req.query.ort_kyrgyzn;
    var ort_russiann = req.query.ort_russiann;
    var ort_mathn = req.query.ort_mathn;

    function getPhoneMask(telefon_ab) {
      let getNumber = telefon_ab.replace('996', '0');
      return getNumber.substring(0, 3) + '*****' + getNumber.substring(8, 10);
    }

    function getPhoneToBase(phone) {
      let getNumber = phone.replace('0', '996');
      return getNumber;
    }

    function generatePassword() {
      var length = 5,
        charset = "abcdefghijkmnpqrstuvxyzABCDEFGHJKLMNPQRSTUVXYZ23456789",
        cryptVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        cryptVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return cryptVal;
    }

    async function ff(str) {
      let fetch = require('node-fetch');
      let url = "http://localhost:8180/api/external/CryptPassword/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + str;
      let settings = { method: "Get" };
      let response = await fetch(url, settings);
      let data = await response.json();
      return await data.cryptPassword
    }

    async function getCryptPassword(str) {
      return await ff(str);
    }


    pool.connect((err, client, release) => {

      if (err) {
        COOKIE.DISPOSE(req, res);
        res.redirect('/authform');
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`SELECT * FROM "Enrollee_ORT" WHERE "Enrollee_ORT"."NumberSert" = $1`, [numberSert],
        (err, result) => {
          release()
          if (err) {
            COOKIE.DISPOSE(req, res);
            res.redirect('/authform');
            return console.error('Error executing query', err.stack)
          } else {

            if (result.rowCount > 0
              && result.rows[0].BallOnRepsTest == ball
              && result.rows[0].NumberSert == numberSert
              && result.rows[0].ORT_biology == ort_biology
              && result.rows[0].ORT_history == ort_history
              && result.rows[0].ORT_chemistry == ort_chemistry
              && result.rows[0].ORT_physics == ort_physics
              && result.rows[0].ORT_math == ort_math
              && result.rows[0].ORT_english == ort_english
              && result.rows[0].ORT_kyrgyz == ort_kyrgyz
              && result.rows[0].ORT_russian == ort_russian
            ) {
              var phone_old = result.rows[0].telefon_ab;

              if (next == 1) {
                //input  phone 
                pool.connect((err, client, release) => {
                  if (err) {
                    COOKIE.DISPOSE(req, res);
                    res.redirect('/authform');
                    return console.error('Error acquiring client', err.stack)
                  }
                  async function tt() {
                    const text = 'UPDATE public."Enrollee_ORT" SET telefon_ab=$2, \
    "NumberSert"=$3, "BallOnRepsTest"=$4, "ORT_biology"=$5,  "ORT_history"=$6,\
    "ORT_chemistry"=$7, "ORT_physics"=$8, "ORT_english"=$9, "ORT_kyrgyz"=$10, \
    "ORT_russian"=$11, "ORT_math"=$12 WHERE "NumberSert" = $1';
                    const values = [numberSert, getPhoneToBase(numberPhone.toString()),
                      numberSertn, balln, ort_biologyn, ort_historyn,
                      ort_chemistryn, ort_physicsn, ort_englishn, ort_kyrgyzn,
                      ort_russiann, ort_mathn];
                    client.query(text, values, (err, result) => {
                      release()
                      if (err) {
                        COOKIE.DISPOSE(req, res);
                        res.redirect('/authform');
                        return console.error('Error executing query', err.stack)
                      }
                      let shMessage = `Уважаемый Абитуриент! Данные Вашего сертификата(${numberSert}) отредактированы. ЦООМО 0(312)664838, https://2020.edu.gov.kg`;
                      SMS.sendSMS(numberSert, getPhoneToBase(numberPhone.toString()), shMessage, 5, 3)

                      pool.connect((err, client, release) => {
                        if (err) {
                          COOKIE.DISPOSE(req, res);
                          res.redirect('/authform');
                          return console.error('Error acquiring client', err.stack)
                        }
                        const old_data = 'numberSert=' + numberSert + ';telefon_ab=' + phone_old +
                          ';BallOnRepsTest=' + ball + ';ORT_biology=' + ort_biology +
                          ';ORT_history=' + ort_history + ';ORT_chemistry=' + ort_chemistry +
                          ';ORT_physics=' + ort_physics + ';ORT_english=' + ort_english +
                          ';ORT_kyrgyz=' + ort_kyrgyz + ';ORT_russian=' + ort_russian +
                          ';ORT_math=' + ort_math;
                        const new_data = 'numberSert=' + numberSertn + ';telefon_ab=' + numberPhone +
                          ';BallOnRepsTest=' + balln + ';ORT_biology=' + ort_biologyn +
                          ';ORT_history=' + ort_historyn + ';ORT_chemistry=' + ort_chemistryn +
                          ';ORT_physics=' + ort_physicsn + ';ORT_english=' + ort_englishn +
                          ';ORT_kyrgyz=' + ort_kyrgyzn + ';ORT_russian=' + ort_russiann +
                          ';ORT_math=' + ort_mathn;;
                        client.query('INSERT INTO public."Update_sert" (username, user_id, old_data, new_data) VALUES  ($1,$2,$3,$4)',
                          [COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].username, COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id, old_data, new_data],
                          (err, result) => {
                            release()
                            if (err) {
                              COOKIE.DISPOSE(req, res);
                              res.redirect('/authform');
                              return console.error('Error executing query', err.stack)
                            }
                          })
                      });



                      res.render('restore/restore_sert_search', {
                        layout: false,
                        dataChanged: 1
                      });
                    })
                  } tt()
                });
              }
              else {  // after input sert send phone to chek

                let phone = result.rows[0].telefon_ab;
                if (phone == null) { ph = 0 }
                else { ph = phone.replace('996', '0') };
                async function send_phone() {
                  // let phone=result.rows[0].telefon_ab;
                  res.render('restore/restore_sert_search', {
                    layout: false,
                    phone: ph

                  });
                } send_phone()
              }

            } else {
              res.render('restore/restore_sert_search', {
                layout: false,
                inputFalse: 1
              });
            }
          }
        })
    });

  } else res.redirect('/authform');

});




router.get('/manual', function (req, res, next) {
  res.render('manual', {
    title: res.__('Инструкция')

  });
});


router.get('/sample', async function (req, res, next) {

  var title = res.__('Образец');
  res.render('sample', { layout: false, title: title });
  //   res.redirect('public/docs/Образец.pdf');
});


router.get('/tutorials', function (req, res, next) {

  var title = res.__('Главная');
  res.render('tutorials', { title: title });
});



router.get('/auth', function (req, res, next) {
  
  var title = res.__('Регистрация');
  res.render('sms/auth', {
    title: title
  });
});

router.get('/authmessage', function (req, res, next) {
  

  var title = res.__('Форма авторизации');
  res.render('sms/authmessege', {
    title: title
  });
});



router.get('/authA', async function (req, res, next) {
  

  // КАПЧА НАЧАЛО
  // if (req.query.grecaptcharesponse === undefined || req.query.grecaptcharesponse === '' || req.query.grecaptcharesponse === null) {
  //   return res.json({ "responseCode": 1, "responseDesc": "Please select captcha" });
  // }
  // var secretKey = "6LfTPq8ZAAAAAA0jgWNIhNeIUne1fHq3bndpWWZa";
  // var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.query.grecaptcharesponse + "&remoteip=" + req.connection.remoteAddress;
  // request(verificationUrl, function (error, response, body) {
  //   body = JSON.parse(body);
  //   if (body.success !== undefined && !body.success) {
  //     return res.json({ "responseCode": 1, "responseDesc": "Failed captcha verification" });
  //   } else {




  //проверка начинается для авторизации
  var numberSert = req.query.numberSert;
  var numberPhone = req.query.numberPhone;
  var act = req.query.act;

  function getPhoneMask(telefon_ab) {
    let getNumber = telefon_ab.replace('996', '0');
    return getNumber.substring(0, 3) + '*****' + getNumber.substring(8, 10);
  }

  function getPhoneToBase(phone) {
    let getNumber = phone.replace('0', '996');
    return getNumber;
  }

  function generatePassword() {
    var length = 5,
      charset = "abcdefghijkmnpqrstuvxyzABCDEFGHJKLMNPQRSTUVXYZ23456789",
      cryptVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      cryptVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return cryptVal;
  }


  if (act == 0) {

    const { rows: obj } = await db.query('SELECT * FROM "V_check_auth" WHERE "V_check_auth"."NumberSert" = $1', [numberSert])

    console.log('/authA проверка начинается для авторизации');
    if (obj.length > 0
      && obj[0].BallOnRepsTest >= obj[0].porogBall
    ) {
      res.render('sms/authA', {
        layout: false,
        phoneMask: "0___ ______",
      });
    } else {
      res.render('sms/authA', {
        layout: false,
        textValueA: 1
      });
    }
  }
  //проверка начинается для отправки сообщении для директоров
  else if (act == 5) {


    const { rows: objA } = await db.query('SELECT * FROM "V_check_auth" WHERE "V_check_auth"."NumberSert" = $1', [numberSert])

    console.log('/authA проверка начинается для отправки сообщении для директоров');


    if (objA.length > 0) {
      let school_phone;
      if (objA[0].school_phone) {
        school_phone = objA[0].school_phone;
      } else {
        school_phone = '000000000000';
      }



      let query = `INSERT INTO public."Message_to_mon"("NumberSert", to_role, ab_fio, id_school, abit_phone, message) 
                                                        VALUES ('` + req.query.numberSert + `', 6, '` + req.query.abitfio + `',` + req.query.id_school + `,'` + req.query.numberPhone + `','` + req.query.message + `')`;
      const { rows: objB } = await db.query(query, [])
      console.log('/authA проверка начинается для авторизации 2');
      let shMessage = `Уважаемый Директор! Вам пришло сообщение от выпускников. https://2020.edu.gov.kg/authform`;
      SMS.sendSMS(req.query.id_school, school_phone, shMessage, 6, 8)
      res.json({ "responseCode": 0, "responseDesc": "Ваше сообщение отправлено директору Вашей школы" });


    } else {
      res.json({ "responseCode": 1, "responseDesc": "Ваше сообщение НЕ ОТПРАВЛЕНО!!! Проверьте веденные данные!!!" });
    }
  }
  //проверка сообщ Директору конец
  else {
    const { rows: objC } = await db.query(`SELECT * FROM "V_check_auth" WHERE "V_check_auth"."NumberSert" = $1 AND
    "V_check_auth".telefon_ab = $2`, [numberSert, getPhoneToBase(numberPhone.toString())])
    console.log('/authA проверка 3');

    if (objC.length > 0
      && objC[0].BallOnRepsTest >= objC[0].porogBall
      && objC[0].NumberSert == numberSert
      && objC[0].telefon_ab == getPhoneToBase(numberPhone.toString())) {



      async function tt() {
        let pass = generatePassword()
        const { rowsE } = await db.query('UPDATE public."Enrollee_ORT" SET password = $1 WHERE "NumberSert" = $2 AND "telefon_ab" = $3',
          [md5(pass), numberSert, getPhoneToBase(numberPhone.toString())])
        console.log('/authA проверка 3');
        let shMessage = `Уважаемый Абитуриент! Ваш логин: ${numberSert} пароль: ${pass} https://2021.edu.gov.kg/personalcabinet/#enrollee`;
        SMS.sendSMS(numberSert, getPhoneToBase(numberPhone.toString()), shMessage, 5, 1)
        res.render('sms/authA', {
          layout: false,
          textValueS: 1
        });
      } tt()


    } else {
      res.render('sms/authA', {
        layout: false,
        textValueB: 1
      });
    }
  }
  //проверка заканчивается
  //}  КАПЧА конец
});



//Отправка сообщения для ЦООМО


router.get('/authmessagetochange', function (req, res, next) {

  var title = res.__('Возникли проблемы с номером сертификата?');
  res.render('sms/authmessagesoomo', {
    title: title
  });
});


router.get('/authmessagearmy', function (req, res, next) {

  var title = res.__('Форма прошедшие срочную военную службу');
  res.render('sms/authmessagearmy', {
    title: title
  });
});



var upload = multer({ storage: storage });
router.post('/upload', upload.single('file'), function (req, res, next) {
  console.log('/upload');

  res.json({
    code: 1,
    filename: fileName
  });
  res.end();
});

var uploadmonmessage = multer({ storage: storage_monmessage });
router.post('/uploadmonmessage', uploadmonmessage.single('file'), function (req, res, next) {

  res.json({
    code: 1,
    filename: fileName
  });
  res.end();
});


router.post('/sendmessagetosoomo', async function (req, res, next) {
  console.log('/sendmessagetosoomo');

  // начало капча
  // if (req.body.grecaptcharesponse === undefined || req.body.grecaptcharesponse === '' || req.body.grecaptcharesponse === null) {
  //   return res.json({ "responseCode": 1, "responseDesc": "Please select captcha" });
  // }
  // var secretKey = "6LfTPq8ZAAAAAA0jgWNIhNeIUne1fHq3bndpWWZa";
  // var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.grecaptcharesponse + "&remoteip=" + req.connection.remoteAddress;
  // request(verificationUrl, function (error, response, body) {
  //   body = JSON.parse(body);
  //   if (body.success !== undefined && !body.success) {
  //     return res.json({ "responseCode": 1, "responseDesc": "Failed captcha verification" });
  //   } else {
  let is_mil = req.body.ismilitary == '1' ? true : false;
  let query = `INSERT INTO public."Message_to_soomo"(
        "NumberSert", ab_fio, region, district, school, abit_phone, passport, passport2, diploma, ort, military, is_military, message)
        VALUES ('` + req.body.numberSert + `','`
    + req.body.abitfio + `','`
    + req.body.region + `','`
    + req.body.district + `','`
    + req.body.school + `','`
    + req.body.abitphone + `','`
    + req.body.textpas1 + `','`
    + req.body.textpas2 + `','`
    + req.body.textatestat + `','`
    + req.body.textsert + `','`
    + req.body.textbilet + `','`
    + is_mil + `','`
    + req.body.message + `')`;

  console.log(req.body.abitfio);
  const { rows } = await db.query(query, [])
  res.json({ "responseCode": 0, "responseDesc": "Ваше сообщение отправлено в адресс ЦООМО" });

  //} конец капча
  //});
});
//Отправка сообщ ЦООМО, конец.









router.get('/norma', function (req, res, next) {

  var title = res.__('Нормативная правовая база');
  res.render('norma', { title: title });
});

router.get('/faqs', async function (req, res, next) {

  var question = (req.cookies.locale == 'ru') ? 'question' : 'question_kg';
  var answer = (req.cookies.locale == 'ru') ? 'answer' : 'answer_kg';

  const { rows } = await db.query('select id_question, "' + question + '" as question, "' + answer + '" as answer from public."Question"  WHERE NOT "Question".hide ORDER BY "Question".id_question ASC;', [])
  console.log('/authform');
  var title = res.__('Вопросы-Ответы');
  res.render('faqs', {
    title: title,
    questions: rows
  });
});



router.get('/universities', async function (req, res, next) {

  var localenametable = (req.cookies.locale == 'ru') ? 'University' : 'VKG_University';

  console.time("universities");
  const { rows } = await db.query('select * from "' + localenametable + '" WHERE id_university>0', [])
  console.timeEnd("universities");
  var title = res.__('Среднее специальное учебное заведение');

  res.render('universities', {
    // layout:false,
    title: title,
    universities: rows.sort(function (a, b) {
      return (a.university_sort < b.university_sort) ? -1 : 1;
    })
  });

});



router.get('/statistics', function (req, res, next) {

  var title = res.__('Статистика');
  res.render('statistics', {
    title: title
  });
});



router.get('/statistics/report_UF', async function (req, res, next) {
  console.log('/statistics/report_UF');

  var table = (req.cookies.locale == 'ru') ? "VAdmissionPlan_RS_ru" : "VAdmissionPlan_RS_kg";
  const { rows } = await db.query('SELECT * FROM "' + table + '"', [])

  rows.sort(function (a, b) {
    return (a.university_name > b.university_name) ? 1 : (a.university_name < b.university_name) ? -1 : (a.faculty > b.faculty) ? 1 : (a.faculty < b.faculty) ? -1 : (a.specialty > b.specialty) ? 1 : -1;
  });

  resultU = rows.reduce(function (r, a) {
    r[a.university_name] = r[a.university_name] || [];
    r[a.university_name].push(a);
    return r;
  }, Object.create(null));
  const objU = JSON.parse(JSON.stringify(resultU));


  for (var i = 0; i < Object.keys(objU).length; i++) {
    resultUF = objU[Object.keys(objU)[i]].reduce(function (r, a) {
      r[a.faculty] = r[a.faculty] || [];
      r[a.faculty].push(a);
      return r;
    }, Object.create(null));
    objU[Object.keys(objU)[i]] = JSON.parse(JSON.stringify(resultUF));

  }
  const objUF = objU;
  var title = res.__('Отчет ВУЗы и факультеты');
  res.render('reports/report_uf', {
    title: title,
    obj: objUF
  });
});

router.get('/enrolconnectreportschoolcountt', function (req, res, next) {

  if (COOKIE.CHECK_OPT(req, 12)) {


    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`SELECT id_school, action, COUNT(*), district, school_name, fio_director, CONCAT('0', SUBSTRING(school_phone,4,12)) AS school_phone
			FROM public."Message_to_mon"
			INNER JOIN public."Users_school"
			ON id_school = id_school_users
			INNER JOIN public."District"
			ON id_village = "District".id_district
			GROUP BY id_school, action, school_name, fio_director, school_phone, district
			HAVING action IS NULL
			ORDER BY COUNT(*) DESC LIMIT 100`, (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }

        var title = res.__('Статистика подключения абитуриентов к Абитуриент Online 2020');
        res.render('reports/enrolconnectreportschoolcount', {
          title: title,
          layout: false,
          obj: result.rows
        });
      })
    })
  } else res.redirect('/');
});





router.get('/enrolconnectreport', async function (req, res, next) {
  console.log('/enrolconnectreport');
  var title = res.__('Статистика подключения абитуриентов к Абитуриент Online 2020');

  const { rows } = await db.query(`SELECT "V_districtConnectedEnrollers".region, "V_districtEnrolers".id_district, "V_districtEnrolers".district, enrollers, connected, filled
      FROM public."V_districtEnrolers" 
      LEFT JOIN public."V_districtConnectedEnrollers"
      ON "V_districtEnrolers".id_district ="V_districtConnectedEnrollers".id_district
      LEFT JOIN public."V_districtFilledEnrollers"
            ON "V_districtEnrolers".id_district ="V_districtFilledEnrollers".id_district
      ORDER BY  region, district`, [])
  var resA = rows;
  resultA = rows.reduce(function (r, a) {
    r[a.region] = r[a.region] || [];
    r[a.region].push(a);
    return r;
  }, Object.create(null));
  const OBJA = JSON.parse(JSON.stringify(resultA));

  const { rows: obj } = await db.query(`SELECT "Region".id_region, "Region".region, COUNT(*) kol_abit  
            FROM public."Enrollee_ORT"
            INNER JOIN public."Users_school"
            ON "Enrollee_ORT".id_school = "Users_school".id_school_users
            INNER JOIN public."District"
            ON "Users_school".id_district = "District".id_district
            INNER JOIN public."Region"
            ON "District".id_region = "Region".id_region
            GROUP BY "Region".id_region, "Region".region`, [])


  obj.sort(function (a, b) {
    return (a.id_region > b.id_region) ? 1 : -1;
  });


  res.render('reports/enrolconnectreport', {
    title: title,
    layout: false,
    obja: resA,
    obj: OBJA,
    objb: obj
  });
});


router.get('/rating', async function (req, res, next) {
  console.log('/rating');
  let lang = (req.cookies.locale == 'ru') ? 1 : 2;
  let bk = req.query.id_bk;
  const { rows } = await db.query(`SELECT * FROM "fn_profession_sr_znachenie"(${lang}, ${bk}) ORDER BY sr_znachenie DESC,  kol DESC`, [])

  let title = (req.query.id_bk == '1') ? res.__('Рейтинг ВУЗов Кыргызской Республики, составленный по результатам конкурса на зачисление на грантовые места') : res.__('Рейтинг ВУЗов Кыргызской Республики, составленный по результатам конкурса на зачисление на контрактные места');
  res.render('reports/rating', {
    title: title,
    layout: false,
    bk: (req.query.id_bk == '1') ? 1 : 2,
    obj: rows
  });
});



router.get('/enrolconnectreportschool', function (req, res, next) {

  var id = req.query.id;
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT "V_districtEnrolers_id".id_district, "V_districtEnrolers_id".district, 
      "V_districtEnrolers_id".school_name, 
      enrollers, connected, filled
      FROM public."V_districtEnrolers_id"
      LEFT JOIN public."V_districtConnectedEnrollers_id"
      ON "V_districtEnrolers_id".id_district = "V_districtConnectedEnrollers_id".id_district
      AND "V_districtEnrolers_id".id_school = "V_districtConnectedEnrollers_id".id_school
      LEFT JOIN public."V_districtFilledEnrollers_id"
      ON "V_districtEnrolers_id".id_district = "V_districtFilledEnrollers_id".id_district
      AND "V_districtEnrolers_id".id_school = "V_districtFilledEnrollers_id".id_school
      WHERE "V_districtEnrolers_id".id_district = $1 `, [id], (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }

      var title = res.__('Статистика подключения школ к Абитуриент Online 2020');
      res.render('reports/enrolconnectreportschool', {
        title: title,
        layout: false,
        obj: result.rows
      });
    })
  })

});







router.get('/statistics/directions', function (req, res, next) {

  var name = req.query.id;


  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('SELECT "VAdmissionPlan".direction  FROM "VAdmissionPlan" GROUP BY	"VAdmissionPlan".direction', (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      result.rows.sort(function (a, b) {
        return (a.direction > b.direction) ? 1 : -1;
      })

      var title = res.__('Справочник направлений');
      res.render('reports/report_directions', {
        title: title,
        directions: result.rows
      });
    })
  })

});


router.get('/statistics/direction', function (req, res, next) {

  var name = req.query.id;

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('SELECT "VAdmissionPlan".* FROM "VAdmissionPlan" WHERE "VAdmissionPlan".direction = ' + name, (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      result.rows.sort(function (a, b) {
        return (a.direction > b.direction) ? 1 : (a.direction < b.direction) ? -1 : (a.university_name < b.university_name) ? -1 : (a.university_name > b.university_name) ? 1 : (a.faculty < b.faculty) ? -1 : (a.faculty > b.faculty) ? 1 : -1;
      })
      resultU = result.rows.reduce(function (r, a) {
        r[a.direction] = r[a.direction] || [];
        r[a.direction].push(a);
        return r;
      }, Object.create(null));
      const objU = JSON.parse(JSON.stringify(resultU));

      for (var i = 0; i < Object.keys(objU).length; i++) {
        resultUF = objU[Object.keys(objU)[i]].reduce(function (r, a) {
          r[a.university_name] = r[a.university_name] || [];
          r[a.university_name].push(a);
          return r;
        }, Object.create(null));
        objU[Object.keys(objU)[i]] = JSON.parse(JSON.stringify(resultUF));
      }
      const objUFS = objU;
      var title = res.__('Отчет специальности');
      res.render('reports/report_spec', {
        title: title,
        direction: result.rows[0].direction,
        obj: objUFS

      });
    })
  })

});







router.get('/pdf_report_uf', function (req, res, next) {

  var id_univ = req.query.id_university;

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }

    const text = id_univ ? 'SELECT * FROM "V_rep_univer_adm_plan" WHERE id_university=' + id_univ : 'SELECT * FROM "V_rep_univer_adm_plan"'

    client.query(text, (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }

      resultU = result.rows.reduce(function (r, a) {
        r[a.s_university] = r[a.s_university] || [];
        r[a.s_university].push(a);
        return r;
      }, Object.create(null));
      const objU = JSON.parse(JSON.stringify(resultU));


      for (var i = 0; i < Object.keys(objU).length; i++) {
        resultUF = objU[Object.keys(objU)[i]].reduce(function (r, a) {
          r[a.s_faculty] = r[a.s_faculty] || [];
          r[a.s_faculty].push(a);
          return r;
        }, Object.create(null));
        objU[Object.keys(objU)[i]] = JSON.parse(JSON.stringify(resultUF));

      }
      const objUF = objU;



      // start---puppeteer
      const pdfFileName = "report_uf-" + Math.random() + ".pdf"
      const data = objUF;

      const buildTemplate = (type) => {
        return `
      <div style ="font-size: 10px; color: #00B7FF; margin-left: 55px; ">
        <span>${type === 'header' ? 'Онлайн зачисления в вузы Кыргызской Республики' : 'AVN'}</span>
        <span class = "date"></span> |
        <span class = "title"></span> |
        <span class = "URL"></span> стр.
        <span class = "pageNumber"></span> /
        <span class = "totalPages"></span> 
      </div>
    `;
      }


      const compile = async function (templateName, data) {

        const filePath = path.join(process.cwd(), 'reports', `./${templateName}.hbs`);
        const html = await fs.readFile(filePath, 'utf-8');
        return hbs.compile(html)(data);
      };


      (async function () {
        try {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.emulateMedia('print');
          const content = await compile('pdf_report_uf', data);

          await page.setContent(content);
          await page.pdf({
            path: pdfFileName,
            displayHeaderFooter: true,
            headerTemplate: buildTemplate('header'),
            footerTemplate: buildTemplate('footer'),
            printBackground: true,
            landscape: false,
            format: 'A4',
            margin: {
              top: 40,
              right: 20,
              bottom: 40,
              left: 20,
            },
          });

          await console.log('done');
          await browser.close();
          await sendToClient();

          process.exit();

        } catch (e) {
          console.log('our error', e);
        }
      })();
      // end---puppeteer


      function sendToClient() {
        var pdfToBrowser = fs.readFileSync(pdfFileName);
        res.contentType("application/pdf");
        res.send(pdfToBrowser);
      }
    })
  })
});


router.get('/reports', async function (req, res, next) {
  console.log('/reports');
  // var localenametableA = (req.cookies.locale == 'ru') ? 'University' : 'VKG_University';
  // var localenametableB = (req.cookies.locale == 'ru') ? 'VAdmissionPlan_RS_ru' : 'VAdmissionPlan_RS_kg';
  var id_univ = req.query.id_university;
  let locale = 2;
    if (req.cookies.locale == 'ru') {
    	locale = 1;
    }
  const query = {
    text:
	        `SELECT * From "fn_admission_plan_vuz"($1, $2)`,
	      values: [locale, id_univ]
  }

  const { rows, err,rowCount } = await db.query(query)
  console.log( rowCount)
  console.log(err)
  if (rowCount==0) {
    console.log("err ------------- ==>>", err)

    show = false;
    university_name = "";
    id_university = "";
    university_supervisor = "";
    university_address = "";
    university_url = "";
    title = res.__('Нет данных');

  var localenametable = (req.cookies.locale == 'ru') ? 'University' : 'VKG_University';
  console.time("universities");
  const {rows: University} = await db.query('select * from "' + localenametable + '" WHERE id_university=$1', [id_univ])
console.log(University) 

   return res.render('reports/report_u', {
      title: title,
      obj: null,
      id_university: id_univ,
      university_name: University[0].university_name,
      show: show,
      university_supervisor: University[0].university_supervisor,
      university_address: University[0].university_address,
      university_url: University[0].university_url
    });
  }

  rows.sort(function (a, b) {
    return (a.university_name > b.university_name) ? 1 : (a.university_name < b.university_name) ? -1 : (a.faculty > b.faculty) ? 1 : (a.faculty < b.faculty) ? -1 : (a.direction_specialty > b.direction_specialty) ? 1 : -1;
  });
  resultU = rows.reduce(function (r, a) {
    r[a.university_name] = r[a.university_name] || [];
    r[a.university_name].push(a);
    return r;
  }, Object.create(null));
  const objU = JSON.parse(JSON.stringify(resultU));

  for (var i = 0; i < Object.keys(objU).length; i++) {
    resultUF = objU[Object.keys(objU)[i]].reduce(function (r, a) {
      r[a.faculty] = r[a.faculty] || [];
      r[a.faculty].push(a);
      return r;
    }, Object.create(null));
    objU[Object.keys(objU)[i]] = JSON.parse(JSON.stringify(resultUF));
  }

  const objUF = objU;
  //check if empty
  function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }


  if (isEmptyObject(rows)) {
    show = false;
    university_name = "";
    id_university = "";
    university_supervisor = "";
    university_address = "";
    university_url = "";
    title = res.__('Нет данных');
  } else {
    id_university = id_univ;
    university_name = rows[0].university_name;
    show = true;
    university_supervisor = rows[0].university_supervisor;
    university_address = rows[0].university_address;
    university_url = rows[0].university_url;
    title = university_name;
  }
  console.log(objUF);
  res.render('reports/report_u', {
    layout: 'layoutVuz',
    title: title,
    obj: objUF,
    id_university: id_univ,
    university_name: university_name,
    show: show,
    university_supervisor: university_supervisor,
    university_address: university_address,
    university_url: university_url
  });
});


router.get('/listdocsenrol', async function (req, res, next) {
  console.log('/listdocsenrol');
  var localenametableA = (req.cookies.locale == 'ru') ? 'VAbiturient_document' : 'VAbiturient_document_kg';
  const query = {
    text: 'SELECT * FROM "' + localenametableA + '"',
  }
  const { rows } = await db.query(query)
  rows.sort(function (a, b) {
    return (a.abiturient_type > b.abiturient_type) ? 1 : (a.abiturient_category < b.abiturient_category) ? -1 : (a.document > b.document) ? 1 : -1;
  });
  resultT = rows.reduce(function (r, a) {
    r[a.abiturient_type] = r[a.abiturient_type] || [];
    r[a.abiturient_type].push(a);
    return r;
  }, Object.create(null));
  const objT = JSON.parse(JSON.stringify(resultT));

  for (var i = 0; i < Object.keys(objT).length; i++) {
    resultTC = objT[Object.keys(objT)[i]].reduce(function (r, a) {
      r[a.abiturient_category] = r[a.abiturient_category] || [];
      r[a.abiturient_category].push(a);
      return r;
    }, Object.create(null));
    objT[Object.keys(objT)[i]] = JSON.parse(JSON.stringify(resultTC));
  }
  const objTC = objT;

  res.render('reports/listdocsenrol', { obj: objTC });
});



router.get('/reportuseraccess', function (req, res, next) {

  var id_univ = req.query.id_university;

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('SELECT * FROM "VUsersUniversityAccess" WHERE id_university = ' + id_univ, (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      result.rows.sort(function (a, b) {
        return (a.faculty > b.faculty) ? 1 : -1
      });
      resultU = result.rows.reduce(function (r, a) {
        r[a.university_name] = r[a.university_name] || [];
        r[a.university_name].push(a);
        return r;
      }, Object.create(null));
      const objU = JSON.parse(JSON.stringify(resultU));


      for (var i = 0; i < Object.keys(objU).length; i++) {
        resultUF = objU[Object.keys(objU)[i]].reduce(function (r, a) {
          r[a.faculty] = r[a.faculty] || [];
          r[a.faculty].push(a);
          return r;
        }, Object.create(null));
        objU[Object.keys(objU)[i]] = JSON.parse(JSON.stringify(resultUF));

      }
      var title = res.__('Контакты состава приемной коммиссии');
      const objUF = objU;
      res.render('reports/reportuseraccess', {
        title: title,
        name: result.rows.length > 0 ? result.rows[0].university_name : title,
        id: result.rows.length > 0 ? result.rows[0].id_university : id_univ,
        obj: objUF,
        isemty: result.rows.length > 0 ? false : true

      });
    })
  })

});

router.get('/contact', async function (req, res, next) {
  console.log('/contact');
  var id_univ = req.query.u;
  const { rows } = await db.query('SELECT * FROM "VContact" WHERE id_university = $1', [id_univ])

  resultU = rows.reduce(function (r, a) {
    r[a.university_name] = r[a.university_name] || [];
    r[a.university_name].push(a);
    return r;
  }, Object.create(null));
  const objU = JSON.parse(JSON.stringify(resultU));


  if (req.cookies.locale == 'ru') {
    for (var i = 0; i < Object.keys(objU).length; i++) {
      resultUF = objU[Object.keys(objU)[i]].reduce(function (r, a) {
        r[a.faculty] = r[a.faculty] || [];
        r[a.faculty].push(a);
        return r;
      }, Object.create(null));
      objU[Object.keys(objU)[i]] = JSON.parse(JSON.stringify(resultUF));
    }
  } else {
    for (var i = 0; i < Object.keys(objU).length; i++) {
      resultUF = objU[Object.keys(objU)[i]].reduce(function (r, a) {
        r[a.faculty_kg] = r[a.faculty_kg] || [];
        r[a.faculty_kg].push(a);
        return r;
      }, Object.create(null));
      objU[Object.keys(objU)[i]] = JSON.parse(JSON.stringify(resultUF));
    }
  };
  //  objU[Object.keys(objU)[i]] = JSON.parse(JSON.stringify(resultUF));

  var title = res.__('Контакты состава приемной коммиссии');
  const objUF = objU;
  res.render('reports/contact', {
    title: title,
    name: rows.length > 0 ? (req.cookies.locale == 'ru') ? rows[0].university_name : rows[0].university_name_kg : res.__('Нет данных'),
    id: rows.length > 0 ? rows[0].id_university : req.query.u,
    obj: objUF,
    isempty: rows.length > 0 ? false : true
     
  });
    console.log(objU);
});




router.all('/additionally', async function (req, res) {

  let tokenask = req.query.token
  //let tokenask = '086fb48a-fc14-4daa-96c1-2cd5e2a01459'
  let fetch = require('node-fetch');
  let url = "http://localhost:8180/api/external/LoginByToken/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + tokenask;
  //let url = "https://enrol.edu.gov.kg/personalcabinet/api/external/LoginByToken/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + tokenask;
  let settings = { method: "Get" };
  let response = await fetch(url, settings);
  let data = await response.json();
  console.log("data: ", data);



  let query = {};
  switch (data.role) {
    case 1:
      res.render('additionally/additionallyAdmin', { layout: false, title: req.query.token, otvet: data.role });
      break;
    case 2:
      query = 'SELECT id_users, id_role, fio_users, login FROM public."Users" WHERE id_users= $1 AND id_role = $2';
      break;
    case 3:
      query = 'SELECT id_users, id_role, fio_users, login FROM public."Users" WHERE id_users= $1 AND id_role = $2';
      break;
    case 4:
      query = 'SELECT id_users_university AS id_users, id_role, fio_users_university AS fio_users, login_university AS login, id_university AS univ FROM public."Users_university" WHERE id_users_university= $1 AND id_role = $2';
      //                    res.render('additionally/additionallyUniversityOperator', {layout: false, title: req.query.token});
      break;
    case 5:
      query = `SELECT "Enrollee_ORT"."NumberSert" AS id_users, 5 AS id_role, "Enrollee_ORT".telefon_ab,
                             concat("Abiturient".surname, ' ', "Abiturient".names, ' ', "Abiturient".patronymic) AS fio_users,  
                             "Enrollee_ORT"."NumberSert" AS login FROM public."Enrollee_ORT" INNER JOIN public."Abiturient"
			     ON "Abiturient"."id_enrollee_ORT" = "Enrollee_ORT"."id_enrollee_ORT"
			     WHERE "Enrollee_ORT"."id_enrollee_ORT" = $1 AND 5 = $2`;
      break;
    default:
      res.render('additionally/additionallyDefault', { layout: false, title: req.query.token, otvet: data.role });
      break;
  }
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(query, [data.userId, data.role],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (result.rowCount > 0) {
          let role = result.rows[0].id_role;
          let login = result.rows[0].login;
          let userid = result.rows[0].id_users;
          let univ_id = result.rows[0].univ_id;


          switch (role) {
            case 1:
              res.render('additionally/additionallyAdmin', { layout: false, title: req.query.token, otvet: data.role });
              break;
            case 2:
              if (!COOKIE.CHECK_OPT(req, 12)) { COOKIE.LOGIN(req, res, role, login, userid); }
              // res.render('additionally/additionallyMinistry', {layout: false, title: req.query.token, otvet: data.role});
              res.redirect('/add_mon');
              break;
            case 3:
              if (!COOKIE.CHECK_OPT(req, 33)) { COOKIE.LOGIN(req, res, role, login, userid); }
              res.render('additionally/additionallyUniversityAdmin', { layout: false, title: 1234, fio: result.rows[0].fio_users });
              break;
            case 4:
              if (!COOKIE.CHECK_OPT(req, 44)) { COOKIE.LOGIN(req, res, role, login, userid, univ_id); }
              res.render('additionally/additionallyUniversityOperator', { layout: false, title: req.query.token, otvet: result.rows[0].fio_users });
              break;
            case 5:
              if (!COOKIE.CHECK_OPT(req, 15)) { COOKIE.LOGIN(req, res, role, login, userid); }
              res.render('additionally/additionallyEnrollee', {
                layout: false, title: tokenask, otvet: data.role, tel: (result.rows[0].telefon_ab).substring(3, 13),
                fio: result.rows[0].fio_users, sert: result.rows[0].login
              });
              break;
            default:
              res.render('additionally/additionallyDefault', { layout: false, title: req.query.token, otvet: data.role });
              break;
          }
        }
      })
  });
});



router.post('/passwordchange', async function (req, res) {



  if (COOKIE.CHECK_OPT(req, 33)) {
    let COOKid = req.cookies.ORTPORTAL
    let userid = COOKIE.SESSIONS[COOKid].id
    let userrole = COOKIE.SESSIONS[COOKid].type
    let userlogin = COOKIE.SESSIONS[COOKid].username

    function CheckPassword(inputtxt) {
      var passw = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,15}$/;
      if (inputtxt.match(passw)) {
        return true;
      } else { return false; }
    }
    if (req.body.newpass === '' || req.body.newpasscheck === '' || req.body.oldpass === '') {
      return res.json({ "responseCode": 1, "responseDesc": "Заполните все поля!" });
    }
    else if (req.body.newpass !== req.body.newpasscheck) {
      return res.json({ "responseCode": 1, "responseDesc": "Новый пароль не правильно подтвердили!" });
    }
    else if (CheckPassword(req.body.newpass) == false) {
      return res.json({ "responseCode": 1, "responseDesc": "Новый пароль не соответствует требованиям сложности!" });
    }
    else if (req.body.newpass === '' || req.body.newpasscheck === '' || req.body.oldpass === '' || req.body.newpass !== req.body.newpasscheck || CheckPassword(req.body.newpass) == false) {
      return res.json({ "responseCode": 1, "responseDesc": "Проверьте введенные данные!" });
    } else {
      let fetch = require('node-fetch');
      let url = "http://localhost:8180/api/external/CryptPassword/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + req.body.oldpass;
      let settings = { method: "Get" };
      let response = await fetch(url, settings);
      let data = await response.json();
      let cryptoldpass = await data.cryptPassword;

      url = "http://localhost:8180/api/external/CryptPassword/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + req.body.newpass;
      response = await fetch(url, settings);
      data = await response.json();
      cryptnewpass = await data.cryptPassword;

      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query('SELECT id_users, id_role, fio_users, password FROM public."Users" WHERE id_users= $1 AND id_role = $2 limit 1',
          [userid, userrole],
          (err, result) => {
            release()
            if (err) {
              return console.error('Error executing query', err.stack)
            }
            if (cryptoldpass !== result.rows[0].password) {
              return res.json({ "responseCode": 1, "responseDesc": "Проверьте введенные данные!!" });
            } else {

              pool.connect((err, client, release) => {
                if (err) {
                  return console.error('Error acquiring client', err.stack)
                }
                client.query('UPDATE public."Users" SET password = $1 WHERE id_users= $2 AND id_role = $3',
                  [cryptnewpass, userid, userrole],
                  (err, result) => {
                    release()
                    if (err) {
                      return console.error('Error executing query', err.stack)
                    }
                    if (result.rowCount > 0) {


                      pool.connect((err, client, release) => {
                        if (err) {
                          return console.error('Error acquiring client', err.stack)
                        }
                        client.query('INSERT INTO public."Update_password"(new_data, old_data, username, user_id, user_role) VALUES ( $1, $2, $3, $4, $5)',
                          [cryptnewpass, cryptoldpass, userlogin, userid, userrole],
                          (err, result) => {
                            release()
                            if (err) {
                              return console.error('Error executing query', err.stack)
                            }
                            if (result.rowCount > 0) {

                              return res.json({ "responseCode": 0, "responseDesc": "Пароль успешно изменен!!!" });
                            }
                          })
                      });
                    } else {
                      return res.json({ "responseCode": 1, "responseDesc": "Проверьте введенные данные!!!" });
                    }
                  })
              });

            }
          })
      });
    }
  } else { res.redirect('/'); }
});




router.all('/Users_school', async function (req, res) {


  let tokenask = req.query.token
  //let tokenask = 'be7030a5-35d5-45f5-a846-5eb79a48ca9b'
  let fetch = require('node-fetch');
  let url = "http://localhost:8180/api/external/LoginByToken/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + tokenask;
  //let url = "https://enrol.edu.gov.kg/personalcabinet/api/external/LoginByToken/0625E692-AD94-4E01-91E6-89D6FFEFA207/" + tokenask;
  let settings = { method: "Get" };
  let response = await fetch(url, settings);
  let data = await response.json();

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('SELECT id_users, id_role, fio_users, login FROM public."Users" WHERE id_users= $1 AND id_role = $2',
      [data.userId, data.role],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }

        if (result.rowCount > 0) {
          let role = result.rows[0].id_role;
          let login = result.rows[0].login;
          let userid = result.rows[0].id_users;
          if (!COOKIE.CHECK_OPT(req, 12)) {
            COOKIE.LOGIN(req, res, role, login, userid);
          }

          pool.connect((err, client, release) => {
            if (err) {
              return console.error('Error acquiring client', err.stack)
            }
            client.query(`SELECT region, district, id_district, village, school_name, fio_director, school_phone, login_school
                FROM public."VUsers_school" WHERE id_district = $1`, [req.query.districtId],
              (err, result) => {
                release()
                if (err) {
                  return console.error('Error executing query', err.stack)
                }
                if (result.rowCount > 0) {
                  result.rows.sort(function (a, b) {
                    return (a.village > b.village) ? 1 : -1
                  });
                  resultU = result.rows.reduce(function (r, a) {
                    r[a.district] = r[a.district] || [];
                    r[a.district].push(a);
                    return r;
                  }, Object.create(null));
                  const objU = JSON.parse(JSON.stringify(resultU));


                  res.render('additionally/users_school', { layout: false, obj: objU, title: req.query.token, otvet: data.role, districtid: req.query.districtId });


                }
              })
          });
        }
      })
  });
});


router.all('/getelements', async function (req, res) {

  let query = '';
  switch (req.body.elem) {
    case 'region':
      query = 'SELECT id_region, region FROM public."Region"';
      break;
    case 'district':
      query = 'SELECT id_district, district FROM public."District" WHERE id_region =' + req.body.selid;
      break;
    case 'village':
      query = 'SELECT id_village, village FROM public."Village" WHERE id_district =' + req.body.selid;
      break;
    case 'school':
      query = 'SELECT id_school_users AS id_school, school_name AS school FROM public."Users_school" WHERE id_village =' + req.body.selid;
      break;
    case 'message':
      query = `INSERT INTO public."Message_to_mon"("NumberSert", ab_fio, id_region, id_district, id_village, name_school, abit_phone, message) VALUES ('` + userid + `','` + req.body.abfio + `',` + req.body.idregion + `,` + req.body.iddistrict + `,` + req.body.idvillage + `,'` + req.body.nameschool + `','` + req.body.abphone + `','` + req.body.message + `')`;
      break;
  }



  const { rows } = await db.query(query, [])
  console.log('/getelements');

  if (rows.length > 0) {
    let elemname = Object.keys(rows[0])[1]
    rows.sort(function (a, b) {
      return (a[elemname] < b[elemname]) ? -1 : 1;
    });
    const objU = JSON.parse(JSON.stringify(rows));
    return res.json(objU);
  }


});


router.post('/messagetomoin', async function (req, res) {

  if (COOKIE.CHECK_OPT(req, 15)) {
    let COOKid = req.cookies.ORTPORTAL
    let userid = COOKIE.SESSIONS[COOKid].id
    if (req.body.abfio.length > 3 && req.body.abphone.length > 3 && req.body.message.length > 30) {
      query = `INSERT INTO public."Message_to_mon"("NumberSert", ab_fio, abit_phone, message, to_role) VALUES ('` + userid + `','` + req.body.abfio + `','` + req.body.abphone + `','` + req.body.message + `',2)`;
      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query(query,
          (err, result) => {
            release()
            if (err) {
              return console.error('Error executing query', err.stack)
            }
            res.json({ message_status: 1 });
          })
      });
    }
  }
});



router.post('/actionsoomo', async function (req, res) {
  function getPhoneToBase(phone) {
    let getNumber = phone.replace('0', '996');
    return getNumber;
  }
  if (COOKIE.CHECK_OPT(req, 22)) {
    let COOKid = req.cookies.ORTPORTAL
    let userid = COOKIE.SESSIONS[COOKid].id
    query = `UPDATE public."Message_to_soomo" SET  action=${req.body.action}, actiondate= NOW(), action_id_user=${userid} WHERE id_message_soomo = ${req.body.idmes}`;
    const { rows } = await db.query(query, [])
    console.log('/actionsoomo');
    if (req.body.action == 0) {
      shMessage = `Ваша заявка отклонено, просим корректно заполнить форму. https://2021.edu.gov.kg/authmessagetochange`;
      SMS.sendSMS(req.body.idmes, getPhoneToBase(req.body.phone_.toString()), shMessage, 5, 3)
      res.json({ answer: 1 })
    } else {
      res.json({ answer: 1 })
    }
  }
});





router.post('/updateenrole', async function (req, res) {
  if (COOKIE.CHECK_OPT(req, 22)) {
    let COOKid = req.cookies.ORTPORTAL
    let userid = COOKIE.SESSIONS[COOKid].id
    function getPhoneToBase(phone) {
      let getNumber = phone.replace('0', '996');
      return getNumber;
    }
    let query;
    if (req.body.elem == 'phone' && req.body.sert.length == 7 && req.body.phone.length == 10) {
      query = `UPDATE public."Enrollee_ORT" SET telefon_ab = CONCAT('996', SUBSTRING(cast(${req.body.phone} as varchar),1,10)) WHERE "NumberSert" = '${req.body.sert}';`;
      const { rows } = await db.query(query, [])
      console.log('/updateenrole SET telefon_ab');
      let shMessage = `Ваша заявка одобрена. Номер телефона на портале https://2021.edu.gov.kg/auth изменен. Просьба зарегистрироваться`;
      SMS.sendSMS(req.body.sert, getPhoneToBase(req.body.phone.toString()), shMessage, 5, 3)
      res.json({ answer: 1 })
    } else if (req.body.elem == 'school' && req.body.sert.length == 7 && req.body.schoolid > 0) {
      query = `UPDATE public."Enrollee_ORT" SET id_school = ${req.body.schoolid} WHERE "NumberSert" = '${req.body.sert}';`;
      const { rows } = await db.query(query, [])
      console.log('/updateenrole SET id_school');
      let shMessage = `Уважаемый Абитуриент! Ваша заявка одобрена. Просим зарегистрироватья на портал https://2021.edu.gov.kg/auth`;
      SMS.sendSMS(req.body.sert, getPhoneToBase(req.body.dbphone.toString()), shMessage, 5, 3)
      res.json({ answer: 1 })
    } else {
      query = `SELECT 100`;
      const { rows } = await db.query(query, [])
      console.log('/updateenrole SET not data');
      res.json({ answer: 0 })
    }
  }
});






router.all('/serchuniver', async function (req, res) {

  var localenametable = (req.cookies.locale == 'ru') ? 'University' : 'VKG_University';
  if (req.body.searchText.length > 2) {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`SELECT * FROM "` + localenametable + `" WHERE LOWER(university_name) LIKE LOWER('%` + req.body.searchText + `%') AND "` + localenametable + `".id_university>0`,
        (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }

          const universities = result.rows.length > 0 ? JSON.parse(JSON.stringify(result.rows)) : { message: res.__('Не найдено!') };
          return res.json(universities);
        })
    });
  } else {
    return res.status(404).json({ message: res.__('Минимальная длина 3 символа!') });
  };
});




router.all('/protokol_a', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_kvota_protokol"($1, $2, $3, $4)`,
      [req.query.id_admission_plan, req.query.tour, req.query.id_bk, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        OBJA = result.rows;

        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));

              res.render('protocols/protocol_a',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});


router.all('/protokol_a_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_kvota_protokol"($1, $2, $3, $4)`,
      [req.query.id_admission_plan, req.query.tour, req.query.id_bk, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        OBJA = result.rows;

        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));

              res.render('protocols/protocol_a_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});



router.all('/protokol_ranjir_b', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_rekom_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        resultA = result.rows.reduce(function (r, a) {
          r[a.nameplase] = r[a.nameplase] || [];
          r[a.nameplase].push(a);
          return r;
        }, Object.create(null));
        const OBJA = JSON.parse(JSON.stringify(resultA));
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_ranjir_b',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB,
                  tour: req.query.tour
                });
            })
        });
      })
  });
});


router.all('/protokol_ranjir_b_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_rekom_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };
        resultA = result.rows.reduce(function (r, a) {
          r[a.nameplase] = r[a.nameplase] || [];
          r[a.nameplase].push(a);
          return r;
        }, Object.create(null));
        const OBJA = JSON.parse(JSON.stringify(resultA));
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_ranjir_b_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB,
                  tour: req.query.tour
                });
            })
        });
      })
  });
});




router.all('/protokol_confirm_b', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_сonfirm_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        result.rows.sort(function (a, b) {
          return (a.summ > b.summ) ? -1 : 1;
        });

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_confirm_b',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_confirm_b_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_сonfirm_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        result.rows.sort(function (a, b) {
          return (a.summ > b.summ) ? -1 : 1;
        });

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_confirm_b_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});


router.all('/protokol_confirm_k', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_сonfirm_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        result.rows.sort(function (a, b) {
          return (a.summ > b.summ) ? -1 : 1;
        });

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_confirm_k',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_confirm_k_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_сonfirm_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        result.rows.sort(function (a, b) {
          return (a.summ > b.summ) ? -1 : 1;
        });

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_confirm_k_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});





router.all('/protokol_confirm_no_b', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_сonfirm_no_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_confirm_no_b',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_confirm_no_b_kg', async function (req, res) {


  if (Object.keys(req.query).length < 4) { res.redirect('/') }
  else {
    let OBJA = {};
    let OBJB = {};
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`SELECT * from "fn_protokol_сonfirm_no_b"($1, $2, $3)`,
        [req.query.id_admission_plan, req.query.tour, req.query.languages],
        (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

          OBJA = result.rows;
          pool.connect((err, client, release) => {
            if (err) {
              return console.error('Error acquiring client', err.stack)
            }
            client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
              [req.query.id_university, req.query.languages],
              (err, result) => {
                release()
                if (err) {
                  return console.error('Error executing query', err.stack)
                }
                resultU = result.rows.reduce(function (r, a) {
                  r[a.grant_position] = r[a.grant_position] || [];
                  r[a.grant_position].push(a);
                  return r;
                }, Object.create(null));
                const OBJB = JSON.parse(JSON.stringify(resultU));
                res.render('protocols/protocol_confirm_no_b_kg',
                  {
                    layout: false,
                    obja: OBJA,
                    objb: OBJB
                  });
              })
          });
        })
    });
  };
  //endif
});





router.all('/protokol_confirm_no_k', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_сonfirm_no_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_confirm_no_k',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_confirm_no_k_kg', async function (req, res) {


  if (Object.keys(req.query).length < 4) { res.redirect('/') }
  else {
    let OBJA = {};
    let OBJB = {};
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`SELECT * from "fn_protokol_сonfirm_no_b"($1, $2, $3)`,
        [req.query.id_admission_plan, req.query.tour, req.query.languages],
        (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

          OBJA = result.rows;
          pool.connect((err, client, release) => {
            if (err) {
              return console.error('Error acquiring client', err.stack)
            }
            client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
              [req.query.id_university, req.query.languages],
              (err, result) => {
                release()
                if (err) {
                  return console.error('Error executing query', err.stack)
                }
                resultU = result.rows.reduce(function (r, a) {
                  r[a.grant_position] = r[a.grant_position] || [];
                  r[a.grant_position].push(a);
                  return r;
                }, Object.create(null));
                const OBJB = JSON.parse(JSON.stringify(resultU));
                res.render('protocols/protocol_confirm_no_k_kg',
                  {
                    layout: false,
                    obja: OBJA,
                    objb: OBJB
                  });
              })
          });
        })
    });
  };
  //endif
});




router.all('/protokol_vakant_b', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_vakant_b"($1, $2, $3, $4, $5)`,
      [req.query.id_facultys, req.query.learnings, req.query.tour, req.query.id_bk, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_vakant_b',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_vakant_b_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_vakant_b"($1, $2, $3, $4, $5)`,
      [req.query.id_facultys, req.query.learnings, req.query.tour, req.query.id_bk, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_vakant_b_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_vakant_k', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_vakant_b"($1, $2, $3, $4, $5)`,
      [req.query.id_facultys, req.query.learnings, req.query.tour, req.query.id_bk, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_vakant_k',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_vakant_k_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_vakant_b"($1, $2, $3, $4, $5)`,
      [req.query.id_facultys, req.query.learnings, req.query.tour, req.query.id_bk, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        OBJA = result.rows;
        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_vakant_k_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});





router.all('/protokol_svod_b', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_svod_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        resultA = result.rows.reduce(function (r, a) {
          r[a.nameplase] = r[a.nameplase] || [];
          r[a.nameplase].push(a);
          return r;
        }, Object.create(null));
        const OBJA = JSON.parse(JSON.stringify(resultA));

        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_svod_b',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_svod_b_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_svod_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        resultA = result.rows.reduce(function (r, a) {
          r[a.nameplase] = r[a.nameplase] || [];
          r[a.nameplase].push(a);
          return r;
        }, Object.create(null));
        const OBJA = JSON.parse(JSON.stringify(resultA));

        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_svod_b_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_svod_k', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_svod_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        result.rows.sort(function (a, b) {
          return (a.summ > b.summ) ? -1 : 1;
        });


        /*    resultA = result.rows.reduce(function (r, a) {
                       r[a.nameplase] = r[a.nameplase] || [];
                       r[a.nameplase].push(a);
                       return r;
                     }, Object.create(null));
                     const OBJA = JSON.parse(JSON.stringify(resultA));
 */
        const OBJA = result.rows

        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_svod_k',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_svod_k_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_svod_b"($1, $2, $3)`,
      [req.query.id_admission_plan, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        result.rows.sort(function (a, b) {
          return (a.summ > b.summ) ? -1 : 1;
        });


        /*    resultA = result.rows.reduce(function (r, a) {
                       r[a.nameplase] = r[a.nameplase] || [];
                       r[a.nameplase].push(a);
                       return r;
                     }, Object.create(null));
                     const OBJA = JSON.parse(JSON.stringify(resultA));
 */
        const OBJA = result.rows

        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_svod_k_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});





router.all('/protokol_rekom_k', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_rekom_k"($1, $2, $3, $4)`,
      [req.query.id_university, req.query.id_faculty, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };

        result.rows.sort(function (a, b) {
          return (a.specialty > b.specialty) ? -1 : (a.specialty < b.specialty) ? -1 : (a.summ_dop > b.summ_dop) ? -1 : 1;
        });

        resultA = result.rows.reduce(function (r, a) {
          r[a.id_admission_plan] = r[a.id_admission_plan] || [];
          r[a.id_admission_plan].push(a);
          return r;
        }, Object.create(null));
        let OBJA = JSON.parse(JSON.stringify(resultA));


        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_rekom_k',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});




router.all('/protokol_rekom_k_kg', async function (req, res) {
  if (Object.keys(req.query).length < 4) { return res.redirect('/'); };

  let OBJA = {};
  let OBJB = {};
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * from "fn_protokol_rekom_k"($1, $2, $3, $4)`,
      [req.query.id_university, req.query.id_faculty, req.query.tour, req.query.languages],
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }

        if (Object.keys(result.rows).length < 1) { res.render('protocols/protocol_no_data', { layout: false }) };
        result.rows.sort(function (a, b) {
          return (a.specialty > b.specialty) ? -1 : (a.specialty < b.specialty) ? -1 : (a.summ_dop > b.summ_dop) ? -1 : 1;
        });

        resultA = result.rows.reduce(function (r, a) {
          r[a.id_admission_plan] = r[a.id_admission_plan] || [];
          r[a.id_admission_plan].push(a);
          return r;
        }, Object.create(null));
        const OBJA = JSON.parse(JSON.stringify(resultA));

        pool.connect((err, client, release) => {
          if (err) {
            return console.error('Error acquiring client', err.stack)
          }
          client.query(`SELECT * FROM "fn_grant_commission"($1, $2)`,
            [req.query.id_university, req.query.languages],
            (err, result) => {
              release()
              if (err) {
                return console.error('Error executing query', err.stack)
              }
              resultU = result.rows.reduce(function (r, a) {
                r[a.grant_position] = r[a.grant_position] || [];
                r[a.grant_position].push(a);
                return r;
              }, Object.create(null));
              const OBJB = JSON.parse(JSON.stringify(resultU));
              res.render('protocols/protocol_rekom_k_kg',
                {
                  layout: false,
                  obja: OBJA,
                  objb: OBJB
                });
            })
        });
      })
  });
});







router.get('/regcount', async function (req, res, next) {
  console.log('/regcount');
  const { rows } = await db.query(`SELECT * FROM public."OD_enrol_stutus_All"`, [])
  rows.sort(function (a, b) {
    return (a.university_sort > b.university_sort) ? 1 : -1
  });
  var title = res.__('Статистика регистрации абитуриентов. Абитуриент Online 2020');
  res.render('reports/regcount', {
    title: title,
    layout: false,
    obj: rows
  });
});


router.get('/vuzabittelefon', function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 44)) {

    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query('SELECT * FROM public."V_abit_telefon" WHERE id_users_university =  $1',
        [COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id], (err, result) => {

          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }

          result.rows.sort(function (a, b) {
            return (a.tour > b.tour) ? 1 : (a.tour < b.tour) ? -1 : (a.fio > b.fio) ? 1 : -1;
          });
          resultT = result.rows.reduce(function (r, a) {
            r[a.s_faculty] = r[a.s_faculty] || [];
            r[a.s_faculty].push(a);
            return r;
          }, Object.create(null));
          const objT = JSON.parse(JSON.stringify(resultT));

          for (var i = 0; i < Object.keys(objT).length; i++) {
            resultTF = objT[Object.keys(objT)[i]].reduce(function (r, a) {
              r[a.direction] = r[a.direction] || [];
              r[a.direction].push(a);
              return r;
            }, Object.create(null));
            objT[Object.keys(objT)[i]] = JSON.parse(JSON.stringify(resultTF));
          }




          const objTFD = objT;

          let title = res.__('Контакты рекомендованных абитуриентов и абитуриентов льготников');
          if (result.rowCount < 1) { title = res.__('Нет данных'); };

          res.render('additionally/vuz/abit_telefon', { title: title, layout: false, obj: objTFD });

        })
    })

  } else res.redirect('/');
});



router.get('/vuzprofession', function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 33) || COOKIE.CHECK_OPT(req, 44)) {

    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      var locales = (req.cookies.locale == 'ru') ? '1' : '2';

      //   client.query('SELECT * FROM public."fn_profession_select"((SELECT id_university FROM public."Users_university" WHERE id_users_university=$1),$2)',
      client.query('SELECT * FROM public."fn_profession_select"((SELECT id_university FROM public."Users" WHERE id_users=$1),$2)',

        [COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id, locales], (err, result) => {

          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }

          result.rows.sort(function (a, b) {
            return (a.faculty > b.faculty) ? 1 : (a.faculty < b.faculty) ? -1 : (a.specialty > b.specialty) ? 1 : -1;
          });
          resultProf = result.rows.reduce(function (r, a) {
            r[a.faculty] = r[a.faculty] || [];
            r[a.faculty].push(a);
            return r;
          }, Object.create(null));
          const objP = JSON.parse(JSON.stringify(resultProf));

          let title = res.__('Профессии');
          if (result.rowCount < 1) { title = res.__('Нет данных'); };

          res.render('additionally/vuz/vuzprofession', { title: title, layout: false, obj: objP, id: COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id });

        })
    })

  } else res.redirect('/');
});



router.get('/vuzenrollee_telefon', function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 33) || COOKIE.CHECK_OPT(req, 44)) {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query('SELECT * FROM public."fn_enrollee_telefon"((SELECT id_university FROM public."Users" WHERE id_users=$1)) ORDER BY "fac", "spec",  "tur",   "idbk", "fio_enr"',
        [COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id], (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          resultT = result.rows.reduce(function (r, a) {
            r[a.fac] = r[a.fac] || [];
            r[a.fac].push(a);
            return r;
          }, Object.create(null));
          const objT = JSON.parse(JSON.stringify(resultT));

          for (var i = 0; i < Object.keys(objT).length; i++) {
            resultTF = objT[Object.keys(objT)[i]].reduce(function (r, a) {
              r[a.spec] = r[a.spec] || [];
              r[a.spec].push(a);
              return r;
            }, Object.create(null));
            objT[Object.keys(objT)[i]] = JSON.parse(JSON.stringify(resultTF));
          }
          res.render('additionally/vuz/vuzenrollee_telefon', { layout: false, obj: objT });
        })
    })
  } else res.redirect('/');
});




router.get('/vuzenrollee_zoomo', function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 33) || COOKIE.CHECK_OPT(req, 44)) {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query('SELECT * FROM public."fn_enrollee_zoomo"((SELECT id_university FROM public."Users" WHERE id_users=$1), $2) ORDER BY ball',
        [COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id, req.query.bk], (err, result) => {
          release()
          if (err) {
            return console.error('Error executing query', err.stack)
          }
          res.render('additionally/vuz/vuzenrollee_zoomo', { layout: false, obj: result.rows });
        })
    })
  } else res.redirect('/');
});



router.get('/vuzenrollee_zoomob', async function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 22)) {
    const { rows } = await db.query('SELECT * FROM public."fn_enrollee_zoomo"($1, $2)',
      [req.query.id_university, req.query.bk])
    console.log('/vuzenrollee_zoomob');
    res.render('additionally/vuz/vuz_zoome', { layout: false, obj: rows });
  } else res.redirect('/');
});








router.get('/vuzpasswordchange', function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 33)) {
    res.render('additionally/vuz/passwordChange', { layout: false });
  } else res.redirect('/');
});



router.all('/vuzsearchsert', async function (req, res, next) {
  if (COOKIE.CHECK_OPT(req, 33)) {

    let title = res.__('Поиск по номеру сертификата');

    if (Object.keys(req.query).length == 0) { return res.render('additionally/vuz/search_sert', { layout: false, title: title }); };
    if (Object.keys(req.query).length != 1) { return res.redirect('/additionally'); };
    const { rows } = await db.query(`SELECT * FROM public."V_abit_search" WHERE id_users = $1 AND "NumberSert" = '` + req.query.sert + `'`,
      [COOKIE.SESSIONS[req.cookies[COOKIE.COOKIE_NAME]].id])
    console.log('/vuzsearchsert');
    rows.sort(function (a, b) {
      return (a.tour > b.tour) ? 1 : (a.tour < b.tour) ? -1 : (a.fio > b.fio) ? 1 : -1;
    });
    if (rows.length == 0) { title = title + "  " + res.__('Нет данных'); };
    res.render('additionally/vuz/search_sert', { title: title, layout: false, obj: rows });
  } else res.redirect('/');
});



router.get('/takebackdocsdate', function (req, res, next) {
  // if(COOKIE.CHECK_OPT(req, 33)){
  res.render('reports/takebackdocsdate', { layout: false });
  //  } else res.redirect('/');
});


router.get('/opendataA', function (req, res, next) {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT "Region".id_region, "Region".region, COUNT(*) kol_abit  
                          FROM public."Enrollee_ORT"
                          INNER JOIN public."Users_school"
                          ON "Enrollee_ORT".id_school = "Users_school".id_school_users
                          INNER JOIN public."District"
                          ON "Users_school".id_district = "District".id_district
                          INNER JOIN public."Region"
                          ON "District".id_region = "Region".id_region
                          GROUP BY "Region".id_region, "Region".region`,
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        result.rows.sort(function (a, b) {
          return (a.id_region > b.id_region) ? 1 : -1;
        });
        console.log(result.rows);
        res.render('opendata/opendataA', { obj: result.rows });
      })
  })

});

///////////////////////////////////////////////////////////////////

router.all('/add_mon', function (req, res, next) {

  // if (COOKIE.CHECK_OPT(req, 12)) {
  const perPage = 50;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const type = req.query.type ? req.query.type == 'null' ? null : parseInt(req.query.type) : null;

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    let text = "";
    let values = [];


    if (type == null) {

      text = `SELECT count(*) OVER() AS full_count,  id_message, "NumberSert",
   ab_fio,message, abit_phone, action FROM public."Message_to_mon" 
   WHERE to_role = 2 AND action IS NULL LIMIT $1 OFFSET $2`
      values = [perPage, ((page - 1) * perPage)]

    } else {
      text = `SELECT count(*) OVER() AS full_count,  id_message, "NumberSert",
       ab_fio,message, abit_phone, action FROM public."Message_to_mon" 
       WHERE to_role = 2 AND action=$3 LIMIT $1 OFFSET $2`
      values = [perPage, ((page - 1) * perPage), type]
    };

    client.query(text, values, (err, result) => {
      release()
      if (err) {
        // res.json({message:res.__('Error database connect nodejs!')});
        return console.error('Error executing query', err.stack)
      }
      result.rows.sort(function (a, b) {
        return (a.id_message < b.id_message) ? -1 : 1;
      });
      let title = res.__('Жалоба') + "  " + res.__('Нет данных');
      let notEmpty = false;
      let currentPage = 1;
      let itemCount = 1;
      let pageCount = 1;
      let nextPage = 1;
      let messages = 0;



      if (result.rows.length > 0) {
        title = res.__('Жалоба');
        currentPage = page;
        itemCount = result.rows[0].full_count;
        pageCount = Math.ceil(result.rows[0].full_count / perPage);
        nextPage = (result.rows[0].full_count == (page - 1)) ? page : page + 1;
        messages = result.rows;
        notEmpty = true;

      }


      res.render('additionally/mon/add_mon', {
        title: title,
        notEmpty: notEmpty,
        currentPage: currentPage,
        itemCount: itemCount,
        pageCount: pageCount,
        nextPage: nextPage,
        type: type,
        messages: messages
      });
    })
  });

  //  } else res.redirect('/personalcabinet/#mon');
});

router.get('/add_mon', function (req, res, next) {


  if (COOKIE.CHECK_OPT(req, 12)) {

    if (req.query.id == null
    ) {
      res.redirect('/messagetomonfilter');
    }
    else {
      const id = req.query.id;
      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query(`SELECT id_message, "NumberSert",
   ab_fio,message, abit_phone,datecreate FROM public."Message_to_mon" 
   WHERE to_role = 2 AND  "id_message"= '${id}'`, (err, result) => {
          release()

          if (err) {
            res.json({ message: res.__('Ошибка, пустая форма!') });
            return console.error('Error executing query', err.stack)
          }

          res.render('additionally/mon/add_mon', {
            title: result.rows[0].ab_fio,
            number: result.rows[0].NumberSert,
            ab_fio: result.rows[0].ab_fio,
            id_message: result.rows[0].id_message,
            abit_phone: result.rows[0].abit_phone,
            message: result.rows[0].message,
            datecreate: result.rows[0].datecreate
          });



        })
      });

    }
  } else res.render('/personalcabinet/#mon', { title: res.__('Форма входа') });
});
//////////////////////////////////////////////////////////////////////

router.all('/messagetomonfilter', function (req, res, next) {

  // if (COOKIE.CHECK_OPT(req, 12)) {
  const perPage = 50;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const type = req.query.type ? req.query.type == 'null' ? null : parseInt(req.query.type) : null;

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    let text = "";
    let values = [];


    if (type == null) {

      text = `SELECT count(*) OVER() AS full_count,  id_message, "NumberSert",
  ab_fio,message, abit_phone, action FROM public."Message_to_mon" 
  WHERE to_role = 2 AND action IS NULL LIMIT $1 OFFSET $2`
      values = [perPage, ((page - 1) * perPage)]

    } else {
      text = `SELECT count(*) OVER() AS full_count,  id_message, "NumberSert",
      ab_fio,message, abit_phone, action FROM public."Message_to_mon" 
      WHERE to_role = 2 AND action=$3 LIMIT $1 OFFSET $2`
      values = [perPage, ((page - 1) * perPage), type]
    };

    client.query(text, values, (err, result) => {
      release()
      if (err) {
        // res.json({message:res.__('Error database connect nodejs!')});
        return console.error('Error executing query', err.stack)
      }
      result.rows.sort(function (a, b) {
        return (a.id_message < b.id_message) ? -1 : 1;
      });
      let title = res.__('Жалоба') + "  " + res.__('Нет данных');
      let notEmpty = false;
      let currentPage = 1;
      let itemCount = 1;
      let pageCount = 1;
      let nextPage = 1;
      let messages = 0;



      if (result.rows.length > 0) {
        title = res.__('Жалоба');
        currentPage = page;
        itemCount = result.rows[0].full_count;
        pageCount = Math.ceil(result.rows[0].full_count / perPage);
        nextPage = (result.rows[0].full_count == (page - 1)) ? page : page + 1;
        messages = result.rows;
        notEmpty = true;

      }


      res.render('additionally/mon/messagetomon', {
        title: title,
        notEmpty: notEmpty,
        currentPage: currentPage,
        itemCount: itemCount,
        pageCount: pageCount,
        nextPage: nextPage,
        type: type,
        messages: messages
      });
    })
  });

  //  } else res.redirect('/personalcabinet/#mon');
});

router.get('/messagetomonid', function (req, res, next) {


  if (COOKIE.CHECK_OPT(req, 12)) {

    if (req.query.id == null
    ) {
      res.redirect('/messagetomonfilter');
    }
    else {
      const id = req.query.id;
      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query(`SELECT id_message, "NumberSert",
  ab_fio,message, abit_phone,datecreate FROM public."Message_to_mon" 
  WHERE to_role = 2 AND  "id_message"= '${id}'`, (err, result) => {
          release()

          if (err) {
            res.json({ message: res.__('Ошибка, пустая форма!') });
            return console.error('Error executing query', err.stack)
          }

          res.render('additionally/mon/messagetomonid', {
            title: result.rows[0].ab_fio,
            number: result.rows[0].NumberSert,
            ab_fio: result.rows[0].ab_fio,
            id_message: result.rows[0].id_message,
            abit_phone: result.rows[0].abit_phone,
            message: result.rows[0].message,
            datecreate: result.rows[0].datecreate
          });



        })
      });

    }
  } else res.render('/personalcabinet/#mon', { title: res.__('Форма входа') });
});



router.post('/messagetomonidchange', function (req, res, next) {


  if (COOKIE.CHECK_OPT(req, 12)) {

    if (req.body.action == null ||
      req.body.idmes == null
    ) {
      res.redirect('/messagetomonfilter');
    }
    else {
      const action = req.body.action;
      const id = req.body.idmes;
      pool.connect((err, client, release) => {
        if (err) {
          return console.error('Error acquiring client', err.stack)
        }
        client.query(`UPDATE public."Message_to_mon" SET action = ${action}, actiondate=NOW()
    WHERE "id_message"= '${id}' AND to_role=2;`, (err, result) => {
          release()

          if (err) {
            res.json({ message: res.__('Ошибка, пустая форма!') });
            return console.error('Error executing query', err.stack)
          }


          res.json({ message: res.__('ok') });



        })
      });

    }
  } else res.render('/personalcabinet/#mon', { title: res.__('Форма входа') });
});





router.get('/enrolprofchues', async function (req, res, next) {
  console.log('/enrolprofchues');
  const { rows } = await db.query(`SELECT * FROM public."OD_prof_enrol_All"`, [])
  rows.sort(function (a, b) {
    return (a.profession_ru > b.profession_ru) ? 1 : -1;
  });
  res.render('reports/enrolprofchues', {
    layout: false,
    obj: rows
  });
})


router.get('/enrolprofchuesdetal_A', function (req, res, next) {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query(`SELECT * FROM public."OD_prof_detal_A" WHERE id_profession =` + req.query.id_prof,
      (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        res.render('opendata/enrolprofchuesdetal_A', {
          layout: false,
          obj: result.rows
        });
      })
  })
})


router.all('/Ch_Pass', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../views/additionally/vuz', 'passwordChange.hbs'));
});

router.all('/Get_Script_for_Ch_Pass', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../views/additionally/vuz', 'Change_password.js'));
});








///profession_nameplase
router.get('/profession', function (req, res, next) {

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('SELECT * FROM public."fn_profession_nameplase"($1)',
      [1],
      (err, result) => {

        release()
        if (err) {

          return console.error('Error executing query', err.stack)
        }


        res.render('reports/profession',
          //console.log(result.rows),
          {
            layout: false,
            obj: result.rows
          });
        console.log(result.rows)
      })
  })
});



/////profession_ nameplase
router.get('/profession_nameplase', async function (req, res, next) {
  console.log('/profession_nameplase');
  const { rows } = await db.query(`SELECT * FROM "fn_profession_NamePlase"(1) ORDER BY prof ASC, id_ps ASC`, [])
  var title = res.__('Статистика подключения абитуриентов к Абитуриент Online 2020');
  var resA = rows;
  resultA = rows.reduce(function (r, a) {
    r[a.prof] = r[a.prof] || [];
    r[a.prof].push(a);
    return r;
  },
    Object.create(null));
  const OBJA = JSON.parse(JSON.stringify(resultA));
  const { rows: obj } = await db.query('SELECT * FROM public."fn_profession_np"($1) ', [1])
  obj.sort(function (a, b) {
    return (a.id_ps > b.id_ps) ? 1 : -1;
  });
  res.render('reports/profession_nameplase', {
    title: title,
    layout: false,
    obja: resA,
    obj: OBJA,
    objb: obj
  });
});



module.exports = router;
