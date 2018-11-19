const logger = require('./logger')
const mongoose = require('mongoose')
const database = require('./db')

const uri = `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_ADDRESS}/${process.env.DATABASE_NAME}`;

module.exports = () => new Promise(function (resolve, reject) {
  //schema
  let userSchema = mongoose.Schema({
    '_id': mongoose.Schema.Types.ObjectId,
    displayName: String,
    profileImageUrl: String,
    joinedDate: Date,
  });

  mongoose.model('User', userSchema);
  logger.debug('user schema created');

  //get connection
  database(uri, process.env.DATABASE_NAME)
    .then(conn => {
      logger.info(`got connection to ${process.env.DATABASE_NAME}`);
      resolve(
        conn.model('User')
      );
    })
    .catch(err => {
      logger.error(err);
      process.exit(0);
    });
});
