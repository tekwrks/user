const logger = require('./logger')

module.exports = (Session) => function (req, res, next) {
  const signedCookies = (req && req.signedCookies)
    ? req.signedCookies
    : null

  if (!!signedCookies && signedCookies['connect.sid']) {
    const sid = `${signedCookies['connect.sid']}`
    req.sessionID = sid
    Session.findOne({ '_id': sid }, function (err, session) {
      if (err) {
        logger.erro(err)
        req.session = null
      }
      else {
        req.session = session.session || null
      }

      logger.debug(`got session : ${sid || null}`)

      next()
    })
  }
  else {
    logger.error(`no session cookie found : ${req}`)
    res.status(401).send('Not logged in.')
  }
}

