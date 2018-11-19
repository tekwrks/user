const logger = require('./logger')
const mongoose = require('mongoose')

module.exports = (User) => function (req, res, next) {
  const id = (req && req.session && req.session.passport && req.session.passport.user)
    ? req.session.passport.user
    : null

  if(!!id) {
    req.userID = new mongoose.Types.ObjectId(`${id}`)
    User.findById(req.userID, function (err, user) {
      if(err) {
        logger.debug(err)
        req.user = null
      }
      else
        req.user = user

      logger.debug(`got user : ${user.displayName || null}`)

      next()
    })
  }
  else {
    logger.error(`no session found for sessionID : ${req.sessionID}`)
    res.status(401).send('Not logged in')
  }
}

