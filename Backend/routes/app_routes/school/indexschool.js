const Express = require('express')
const app = Express()

app.use(  require('./userinfo'));
app.use(  require('./reg_children'));

module.exports = app