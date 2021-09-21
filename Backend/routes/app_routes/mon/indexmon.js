const Express = require('express')
const app = Express()


app.use(  require('./monspisokspuz'));
app.use(  require('./monadminspuz'));
app.use(  require('./monadminschool'));
app.use(  require('./monchangetour'));
app.use(  require('./monserthist'));

module.exports = app