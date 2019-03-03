// setup logger
const logger = require('./logger')

// app requires
const database = require('./db')
const express = require('express')
const app = express()

app.use(require('helmet')())
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('cookie-parser')(process.env.COOKIE_SECRET))

// setup session database
require('./session')(database).then(Session => {
  // setup users database
  require('./user')(database).then(User => {
    // middleware functions
    const cookieToSession = require('./cookieToSession')(Session)
    const sessionToUser = require('./sessionToUser')(User)

    // get identity
    app.get('/identity', function (req, res) {
      cookieToSession(req, res, function () {
        sessionToUser(req, res, function () {
          const user = req.user
          if (user && user.displayName) {
            res.send({
              displayName: user.displayName,
              profileImageUrl: user.profileImageUrl || null,
            })
          }
          else {
            logger.error(`no user found or no displayName : ${req.userID}`)
            res.status(401).send('Not logged in.')
          }
        })
      })
    })

    // readiness probe
    app.get('/ready', function (req, res) {
      res
        .status(200)
        .send('ok')
    })
    // start server
    app.listen(process.env.PORT)
    logger.info(`listening at localhost:${process.env.PORT}`)
  })
})

