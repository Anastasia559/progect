const Express = require('express')
const app = Express()

app.use(  require('./UserInfo'));
app.use(  require('./SertInfo'));
app.use(  require('./AbitInfo'));
app.use(  require('./VuzSpisok'));
app.use(  require('./Registration'));
app.use(  require('./TourGrafic'));
app.use(  require('./WatchReg'));

module.exports = app