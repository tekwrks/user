/* eslint-disable */

jest.mock('./logger')

// user db stub
const SessionStub = {
  session: { session: "session" },
  findOne: function (properties, cb) {
    if (this.succeed)
      cb(null, this.session)
    else
      cb("error", null)
  },
  succeed: true,
}

// require module
let m = null
beforeAll(() => {
  m = require('./cookieToSession')(SessionStub)
  return m
})

test('sends 401 for no session cookie found', done => {
  const req = { }
  const res = {
    status: function (code) {
      expect(code).toBe(401)
      done()
      return this
    },
    send: function () {
      return this
    }
  }
  const next = function () { }
  m(req, res, next)
})

test('returns session for valid sessionID - found in db', done => {
  const req = {
    signedCookies: {
      'connect.sid': 'sessionID'
    }
  }
  const res = {}
  const next = function () {
    expect(req.session).toBe(SessionStub.session.session)
    done()
  }

  SessionStub.succeed = true
  m(req, res, next)
})
test('returns session=null for valid sessionID - found in db, no session', done => {
  const req = {
    signedCookies: {
      'connect.sid': 'sessionID'
    }
  }
  const res = {}
  const next = function () {
    expect(req.session).toBe(null)
    done()
  }

  SessionStub.session = { session: null }
  SessionStub.succeed = true
  m(req, res, next)
})
test('returns session=null for invalid sessionID - not found in db', done => {
  const req = {
    signedCookies: {
      'connect.sid': 'sessionID'
    }
  }
  const res = {}
  const next = function () {
    expect(req.session).toBe(null)
    done()
  }

  SessionStub.session = { session: "session" }
  SessionStub.succeed = false
  m(req, res, next)
})

