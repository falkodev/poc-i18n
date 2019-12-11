const cors = require('cors')
const config = require('config')
const helmet = require('helmet')
const validator = require('express-validator')

module.exports = {
  beforeConstruct(self, options) {
    options.apos.log = require('pino')({ prettyPrint: true })
  },
  port: config.get('express.port'),
  session: {
    secret: config.get('express.session.secret'),
  },
  middleware: [
    cors(),
    validator(),
    helmet({
      frameguard: {
        action: 'sameorigin',
      },
    }),
    (req, res, next) =>  {
      // console.log('res', require('util').inspect(res, { colors: true, depth: 1 }))
      next()
    }
  ],
}
