const express = require('express')
const router = express.Router()
const { GoogleWallet } = require('../utils/googleWallet.utils.js')

/**
 * POST /googleWallet/createPass
 * @summary Save proof as google wallet pass
 * @tags Google wallet
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *   "identifier": "lkajsdlkja1231sd",
 *   "data": {
 *     "ipfs": {
 *       "IpfsHash": "QmbJWAESqCsf4RFCqEY7jecCashj8usXiyDNfKtZCwwzGb",
 *       "PinSize": 10,
 *       "Timestamp": "2024-01-14T14:36:27.762Z",
 *       "isDuplicate": true
 *     },
 *     "secretKey": "rz?08e5@_q&*IVp)#c72",
 *     "proof": "proofOfAge"
 *   }
 * }
 */
router.post('/createPass', async (req, res) => {
  const googleWallet = new GoogleWallet()
  await googleWallet.createPassClass() // check if exist, create if not
  const token = await googleWallet.createPassObject(
    req.body.identifier,
    req.body.data,
  )
  return res.send({token: token})
})

module.exports = {
  router
}