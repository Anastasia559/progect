const Express = require('express')
const app = Express()

app.use(  require('./userinfo'));
app.use(  require('./vuz'));
app.use(  require('./speciality'));
app.use(  require('./plan'));
app.use(  require('./planspisok'));
app.use(  require('./AdmissionComission'));
app.use(  require('./AdmissionComissionAccess'));
app.use(  require('./GrantComission'));
app.use(  require('./Reg_children'));
app.use(  require('./Atesstat'));
app.use(  require('./RegistrationDiscipline'));
app.use(  require('./Recom'));
app.use(  require('./Recept'));

module.exports = app