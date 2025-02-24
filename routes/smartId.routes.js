const express = require('express')
const router = express.Router()
const {
  getRandomHash,
  initiateSession,
  getData,
  verifyData,
  decodeData,
  getOracleSignature,
  getMockSmartIdData,
  computeVerificationCode,
} = require('../utils/smartId.utils.js')

/**
 * GET /smartId/getMockData
 * @summary Get Smart-ID mock data
 * @tags Smart-ID oracle
 */
router.get('/getMockData', async (req, res) => {
  const data = getMockSmartIdData()
  const now = new Date()
  const currentDate = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const isMockData = 1

  const [signature, publicKey] = getOracleSignature(
    data.subject.givenName,
    data.subject.surname,
    data.subject.countryName,
    data.subject.serialNumber,
    currentDate,
    isMockData
  )

  res.send({
    data: {
      name: data.subject.givenName,
      surname: data.subject.surname,
      country: data.subject.countryName,
      pno: data.subject.serialNumber,
      currentDate: currentDate,
      isMockData: isMockData,
    },
    signature: signature.toJSON(),
    publicKey: publicKey.toBase58(),
  })
})

/**
 * POST /smartId/initiateSession
 * @summary Initiate a smart-id session and get session id. Use session id in getData request.
 * @tags Smart-ID oracle
 * @param {object} request.body - a json containing personal ID number (PNO), country (LT, LV, EE), and display text that the users will see on smart ID push notification
 * @example request - payload example EE
 * {
 *   "pno": 123456789,
 *   "country": "EE",
 *   "displayText": "Hi, this is xyz app requesting your data"
 * }
 */
router.post('/initiateSession', async (req, res) => {
  try {
    const hash = await getRandomHash()
    const data = await initiateSession(req.body.country, req.body.pno, hash, req.body.displayText)
    req.storageManager.setSmartIdSession(data.sessionID, hash)
    const verificationCode = computeVerificationCode(hash)
    data.verificationCode = verificationCode
    res.send(data)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Error in the smartID flow' });
  }
})

/**
 * POST /smartId/getData
 * @summary Get user data (assuming that user aproved it on smart-id app after sending initiateSession)
 * @tags Smart-ID oracle
 * @param {object} request.body - a json containing sessionID
 * @example request - payload example
 * {
 *   "sessionID": "899edab0-1694-4860-9105-dd74ee8c00d7"
 * }
 */
router.post('/getData', async (req, res) => {
  try {
    const data = await getData(req.body.sessionID)
    const hash = req.storageManager.getSmartIdSession(req.body.sessionID)
    const isValid = verifyData(data, hash)
    if (!isValid) res.status(500).json({ error: 'Sha signature issue' })
    const data_ = await decodeData(data)
    const now = new Date()
    const currentDate = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
    const isMockData = 0

    const [signature, publicKey] = getOracleSignature(
      data_.subject.givenName,
      data_.subject.surname,
      data_.subject.countryName,
      data_.subject.serialNumber,
      currentDate,
      isMockData
    )

    res.send({
      data: {
        name: data_.subject.givenName,
        surname: data_.subject.surname,
        country: data_.subject.countryName,
        pno: data_.subject.serialNumber,
        currentDate: currentDate,
        isMockData: isMockData,
      },
      signature: signature.toJSON(),
      publicKey: publicKey.toBase58(),
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Error in the smartID flow' });
  }
})

module.exports = {
  router
}