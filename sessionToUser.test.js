/* eslint-disable */

jest.mock('./logger')

// user db stub
const UserStub = {
  user: { displayName: "name" },
  findById: function (id, cb) {
    if (this.succeed)
      cb(null, this.user)
    else
      cb("error", null)
  },
  succeed: true,
}

// require module
let m = null
beforeAll(() => {
  m = require('./sessionToUser')(UserStub)
  return m
})

test('sends 401 for no userID found', done => {
  const req = {
    sessionID: "sessionID", // for logger
  }
  const res = {
    status: function (code) {
      if(code === 401)
        done()
      return this
    },
    send: function () {
      return this
    }
  }
  const next = function () {
  }
  m(req, res, next)
})
test('sets user=null for invalid userID', done => {
  const userID = "invalid userID"
  const req = {
    session: {
      passport: { user: userID }
    }
  }
  const res = {}
  const next = function () {
    if (req.user === null)
      done()
  }
  m(req, res, next)
})

test('returns user for valid userID - found in db', done => {
  const userID = "01234567890123456789ABCD" // valid userID
  const req = {
    session: {
      passport: { user: userID }
    }
  }
  const res = {}
  const next = function () {
    expect(req.user).toBe(UserStub.user)
    done()
  }

  UserStub.user = { displayName: "name" }
  UserStub.succeed = true
  m(req, res, next)
})
test('returns user for valid userID - found in db, but null', done => {
  const userID = "01234567890123456789ABCD" // valid userID
  const req = {
    session: {
      passport: { user: userID }
    }
  }
  const res = {}
  const next = function () {
    expect(req.user.displayName).toBe(null)
    done()
  }

  UserStub.user = { displayName: null }
  UserStub.succeed = true
  m(req, res, next)
})
test('returns user for valid userID - not found in db', done => {
  const userID = "01234567890123456789ABCD" // valid userID
  const req = {
    session: {
      passport: { user: userID }
    }
  }
  const res = {}
  const next = function () {
    expect(req.user).toBe(null)
    done()
  }

  UserStub.user = { displayName: "name" }
  UserStub.succeed = false
  m(req, res, next)
})

