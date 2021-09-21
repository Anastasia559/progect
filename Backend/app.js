var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var handlebars = require('express-handlebars');
var i18n = require('i18n');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var COOKIES = require('./routes/cookies');

var hbs = handlebars.create({
  extname: '.hbs',
  defaultLayout: 'layout',
  layoutsDir: './views',
  partialsDir: './views/partials',
  helpers: {

    'incremented': function () {
      return arguments[0] + 1;
    },
    'year': function () {
      let d = new Date();
      return d.getFullYear();
    },
    'academicyear': function () {
      let incyear = new Date().getFullYear() + 1;
      return new Date().getFullYear() + '-' + incyear;
    },

    'total_kol_plan': function (obj) {
      var s = 0;
      for (i = 0; i < obj.length; i++) {
        s = s + obj[i].kol_plan;
      }
      return s;
    },

    'total_nameplase_num': function (obj) {
      var total = obj.reduce(function (a, b) { return a + b.nameplase_num; }, 0);
      return total;
    },

    'maxindex': function (obj) {
      var s = 1;
      for (i = 0; i < obj.length; i++) {
        s = s + 1;
      }
      return s;
    },
    'sum_ab': function (a, b) {
      var s = parseInt(a, 10) + parseInt(b, 10);
      return s;
    },
    'percent': function (a, b) {
      var s = (parseInt(b, 10) * 100) / parseInt(a, 10);
      return Math.round(s);
    },
    'totalSum': function (obj, field) {
      var s = 0;
      for (i = 0; i < Object.keys(obj[0]).length; i++) {
        if (Object.keys(obj[0])[i] == field) {
          for (j = 0; j < obj.length; j++) {
            s = s + Number(Object.values(obj[j])[i]);
          }
        }
      }
      return s;
    },
    'totalAVG': function (obj, field) {
      var s = 0;
      for (i = 0; i < Object.keys(obj[0]).length; i++) {
        if (Object.keys(obj[0])[i] == field) {
          for (j = 0; j < obj.length; j++) {
            s = s + Number(Object.values(obj[j])[i]);
          }
        }
      }
      s = s / obj.length
      return s.toFixed(2);
    },

    'totalPercent': function (obj, fieldA, fieldB) {
      var s1 = 0;
      for (i = 0; i < Object.keys(obj[0]).length; i++) {
        if (Object.keys(obj[0])[i] == fieldA) {
          for (j = 0; j < obj.length; j++) {
            s1 = s1 + Number(Object.values(obj[j])[i]);
          }
        }
      }
      var s2 = 0;
      for (i = 0; i < Object.keys(obj[0]).length; i++) {
        if (Object.keys(obj[0])[i] == fieldB) {
          for (j = 0; j < obj.length; j++) {
            s2 = s2 + Number(Object.values(obj[j])[i]);
          }
        }
      }
      var p = (s2 * 100) / s1;

      return Math.round(p);
    }

  }

});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


i18n.configure({
  locales: ['ru', 'kg'],
  cookie: 'locale',
  directory: __dirname + "/locales",
  defaultLocale: 'ru',
  autoReload: true,

});
app.use(i18n.init);

app.use((req, res, next) => {
  res.locals.logged = COOKIES.HAS(req) ? 1 : 0;
  if (req.cookies.locale === undefined) {
    res.cookie('locale', 'kg', { maxAge: 900000000, httpOnly: false });
    req.setLocale('kg');
  }
  next();
});

//app.use(i18n.init);
app.use('/', indexRouter);
app.use('/users', usersRouter);



// http://127.0.0.1:3000/ru
app.get('/ru', function (req, res) {
  res.cookie('locale', 'ru', { maxAge: 900000000, httpOnly: false });
  res.redirect('back');
});
// http://127.0.0.1:3000/kg
app.get('/kg', function (req, res) {
  res.cookie('locale', 'kg', { maxAge: 900000000, httpOnly: false });
  res.redirect('back');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: "error" });
});

module.exports = app;
