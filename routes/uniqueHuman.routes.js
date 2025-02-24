const express = require('express')
const router = express.Router()
const {
  getSecretValueOfIdentity,
  getSecretValueOracleSignature,
} = require('../utils/uniqueHuman.utils.js')
const { verifyOracleData } = require('../utils/sanctions.utils.js')

/**
 * POST /uniqueHuman/getSecretValue
 * @summary Get a secret unique value to each identity to include as part of the hash 
 * to enhance security and mitigate the risk of tracebility
 * @tags Unique Human Oracle
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *   "data": {
 *      "name": "Hilary",
 *      "surname": "Nettlewater",
 *      "country": "LV",
 *      "pno": "PNOLV-19003011076",
 *      "currentDate": 20250224,
 *      "isMockData": 1
 *   },
 * 
 *   "signature": {
 *      "r": "15743313586032793846024882167570333432987381522150644513347384088623631004377",
 *      "s": "19420099345949219252167604094537041591298654010493385744337850794073145044269"
 *   },
 *   "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN"
 * }
 */
router.post('/getSecretValue', async (req, res) => {
  // verify if provided data is valid, i.e. data is from the smartID oracle
  // and is properly signed and not tampered with
  try {
    const isDataValid = verifyOracleData(req.body)
    if (!isDataValid) {
      return res.send({ error: 'verify signature: invalid data' })
    }
  } catch (error) {
    return res.send({ error: error.toString() })
  }

  // get secret and sign it
  const secret = await getSecretValueOfIdentity(req.body)
  const [signature, publicKey] = getSecretValueOracleSignature(secret)

  return res.send({
    data: {
      secret: secret,
    },
    signature: signature.toJSON(),
    publicKey: publicKey.toBase58(),
  })
})

module.exports = {
  router
}