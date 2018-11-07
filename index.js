// setup logger
const logger = require('./logger.js');
logger.info('starting up');

// app requires
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const app = express();
const session = require('express-session');

app.use(helmet());

app.use(require('body-parser').urlencoded(
  {
    extended: true
  }
));

// setup session store
require('./sessstore')(session)
  .then(store => {
    // use the store
    app.use(session(
      {
        secret: process.env.COOKIE_SECRET,
        store: store,
        resave: true,
        saveUninitialized: true,
        cookie: {
          // secure: true,
          maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        }
      }
    ));

    // setup users database
    require('./user')().then(User => {
      // setup passport user session
      passport.serializeUser(
        function(user, cb) {
          logger.debug(`serializing: ${user.displayName}`);
          cb(null, user._id);
        });

      passport.deserializeUser(
        function(id, cb) {
          logger.debug(`deserializing: ${id}`);
          User.findById(id, cb);
        });

      app.use(passport.initialize());
      app.use(passport.session());
      logger.info('passport setup');

      // get identity
      app.get('/identity',
        function({ user }, res) {
          if (user && user.displayName) {
            res.send(
              {
                displayName:      user.displayName,
                profileImageUrl:  user.profileImageUrl,
              }
            );
          }
          else {
            res
              .status(401)
              .send('Not logged in.');
          }
        }
      );

      // start server
      app.listen(process.env.PORT);
      logger.info(`listening at localhost:${process.env.PORT}`);
    });
  });
