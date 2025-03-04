const express = require('express')
const router = express.Router()

/**
 * POST /ownership/createSession
 * @summary Create a session, mapping sessionId to signature
 * @tags Proof ownership verification
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * { }
 */
router.post('/createSession', async (req, res) => {
  const generateRandomId = () => {
    return Math.floor(1000000 + Math.random() * 9000000)
  }
  const sessionId = generateRandomId()
  // req.storageManager.setProofOwnership(sessionId, null)
  req.storageManager.proofOwnershipStorage.set(sessionId, null)
  return res.send({sessionId: sessionId})
})

/**
 * POST /ownership/verify
 * @summary Post the signature to the sessionID
 * @tags Proof ownership verification
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *   "sessionId": "1234567",
 *   "signature": {
 *     "r": "129844322551...1694297335141",
 *     "s": "329351521415...4983498427774"
 *   }
 * }
 */
router.post('/verify', async (req, res) => {
  const sessionId = parseInt(req.body.sessionId)
  req.storageManager.proofOwnershipStorage.set(sessionId, req.body.signature)
  return res.send({sessionId: req.body.sessionId})
})

/**
 * POST /ownership/getSignature
 * @summary Get the signature from sessionID
 * @tags Proof ownership verification
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *   "sessionId": "1234567"
 * }
 */
router.post('/getSignature', async (req, res) => {
  const sessionId = parseInt(req.body.sessionId)
  return res.send(req.storageManager.proofOwnershipStorage.get(sessionId) || {})
})

module.exports = {
  router
}