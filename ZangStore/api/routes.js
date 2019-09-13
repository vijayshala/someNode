import cors from 'cors'

export default (app) => {
  app.use('/api/users', require('./routes/user'))
  app.use('/api/taskhandle', require('./routes/taskhandle'))
  app.use('/api/rates', require('./routes/rate'))
  app.use('/api/webhook/billing/:gateway', require("body-parser").raw({type: "*/*"}), require('../server/billing/webhook'));
  //app.use('/api', (req, res, next) => { res.json({ error: false, message: 'OK' }) })
}