const logger = require('./logger')
const mongoose = require('mongoose')

module.exports = (User) => function (req, res, next) {
  const id = (req && req.session && req.session.passport && req.session.passport.user)
    ? req.session.passport.user
    : null

  if (id !== null) {
    const idText = `${id}`
    if (!mongoose.Types.ObjectId.isValid(idText)) {
      logger.error(`invalid userID : ${idText}`)
      req.user = null
      next()
    }
    else {
      req.userID = new mongoose.Types.ObjectId(idText)

      User.findById(req.userID, function (err, user) {
        if (err) {
          logger.debug(err)
          req.user = null
        }
        else {
          logger.debug(`got user : ${user.displayName || null}`)
          req.user = user
        }

        next()
      })
    }
  }
  else {
    logger.error(`no session found for sessionID : ${req.sessionID}`)
    res
      .status(401)
      .send('Not logged in')
  }
}

