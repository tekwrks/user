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
require('./session')(database)
  .then(Session => {
    app.use(require('./cookieToSession')(Session))

    // setup users database
    require('./user')(database).then(User => {
      app.use(require('./sessionToUser')(User))

      // get identity
      app.get('/identity',
        function (req, res) {
          if (!req.user) {
            logger.error(`no user found for user id : ${req.userID}`)
            res.status(401).send('Not logged in.')
          }

          const user = req.user
          if (user && user.displayName) {
            res.send({
              displayName: user.displayName,
              profileImageUrl: user.profileImageUrl || null,
            })
          }
        }
      )

      // start server
      app.listen(process.env.PORT)
      logger.info(`listening at localhost:${process.env.PORT}`)
    })
  })

