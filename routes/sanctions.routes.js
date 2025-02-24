const express = require('express')
const router = express.Router()
const {
  verifyOracleData,
  transformData,
  searchOFAC,
  getOFACOracleSignature,
} = require('../utils/sanctions.utils.js')

/**
 * POST /sanctions/getOFACmatches
 * @summary Check user data agains OFAC database
 * @tags OFAC oracle
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *   "data": {
 *      "name": "Sergei",
 *      "surname": "Vladilenovich",
 *      "country": "RU",
 *      "pno": "PNORU-36207260000",
 *      "currentDate": 20231114,
 *      "isMockData": 1
 *   },
 *   "signature": {
 *      "r": "21290753532106182423194377417275279141650711750732222164202106855904340459721",
 *      "s": "18301928060529044325585824816335856321327850718134008017926413858656375588343"
 *   },
 *   "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN",
 *   "minScore": 95
 * }
 */
router.post('/getOFACmatches', async (req, res) => {
  // could verify other fields as well, but for now lets verify
  // minScore only because it's an additional key to existing smartID resp
  if (!req.body.minScore) {
    return res.send({ error: 'missing minScore' })
  }

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

  // transform data received from smartID to data that fits OFAC search
  // and send the search request
  let response
  try {
    const transformedData = transformData(req.body.data)
    response = await searchOFAC(req.body.minScore, transformedData)
  } catch (error) {
    return res.send({ error: error.toString() })
  }

  // check if matched OFAC records
  const matchName = Object.keys(response.matches)[0]
  const matchData = response.matches[matchName]
  const isMatched = matchData.length > 0 ? true : false

  // get signature
  const now = new Date()
  const currentDate = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const [signature, publicKey] = getOFACOracleSignature(
    isMatched,
    req.body.minScore,
    currentDate,
    req.body.data.isMockData,
  )

  return res.send({
    data: {
      isMatched: isMatched,
      minScore: req.body.minScore,
      currentDate: currentDate,
      isMockData: req.body.data.isMockData
    },
    signature: signature.toJSON(),
    publicKey: publicKey.toBase58(),
    metaData: response
  })
})

module.exports = {
  router
}