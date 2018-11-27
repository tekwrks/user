const logger = require('./logger')
const mongoose = require('mongoose')

const uri = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`

module.exports = (database) => new Promise(function (resolve, reject) {
  // schema
  let sessionSchema = mongoose.Schema({
    '_id': String,
    session: {
      // cookie: {
      //   originalMaxAge: Number,
      //   expires: Date,
      //   secure: Boolean,
      //   httpOnly: Boolean,
      //   domain: String,
      //   path: String,
      //   sameSite: Mixed,
      // },
      passport: {
        user: mongoose.Schema.Types.ObjectId,
      },
    },
    // expires: Date,
  })

  mongoose.model('Session', sessionSchema)
  logger.debug('session schema created')

  // get connection
  database(uri, process.env.DATABASE_NAME)
    .then(conn => {
      logger.info(`got connection to ${process.env.DATABASE_NAME}`)
      resolve(
        conn.model('Session')
      )
    })
    .catch(err => {
      logger.error(err)
      process.exit(0)
    })
})

