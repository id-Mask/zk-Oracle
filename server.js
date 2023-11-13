const express = require('express')
const expressJSDocSwagger = require('express-jsdoc-swagger')
const {
  getRandomHash,
  initiateSession,
  getData,
  verifyData,
  decodeData,
  getOracleSignature,
  getMockSmartIdData,
  computeVerificationCode,
} = require('./smartIdUtils.js')

const cors = require('cors')
require('dotenv').config()


const options = {
  info: {
    version: 'demo',
    title: 'Id-Mask: zk powered identity',
    description: 'API endpoints for accessing identity and associated data that powers Id-Mask zkApp.',
  },
  baseDir: __dirname,
  swaggerUIPath: '/api-docs',
  exposeSwaggerUI: true,
  exposeApiDocs: true,
  apiDocsPath: '/v3/api-docs',
  notRequiredAsNullable: false,
}

const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }))
expressJSDocSwagger(app)(options)

// In-memory storage of the random hashes for sessions sessionId -> hash
// TODO: use queue to create a limited size storage..?
// TODO: explain why this is needed.
const secretStorage = new Map()
const maxStorageSize = 10
const clearSecretStorage = () => {
  if (secretStorage.size > maxStorageSize) {
    const keysToDelete = Array.from(secretStorage.keys()).slice(0, secretStorage.size - maxStorageSize)
    keysToDelete.forEach(key => secretStorage.delete(key))
  }
}
const clearIntervalMillis = 300000 // 5 minutes
setInterval(clearSecretStorage, clearIntervalMillis)


/**
 * GET /ping
 * @summary Ping the server
 * @tags Helpers
 * @return {object} 200 - success response - application/json
 */
app.get('/ping', (req, res) => {
  res.send({
    'hi': 'hello!',
  })
})


/**
 * GET /getSmartIDMockData
 * @summary Get Smart-ID mock data
 * @tags Helpers
 */
app.get('/getSmartIDMockData', async (req, res) => {
  const data = getMockSmartIdData()
  const now = new Date()
  const currentDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`

  const [signature, publicKey] = getOracleSignature(
    data.subject.givenName,
    data.subject.surname,
    data.subject.countryName,
    data.subject.serialNumber,
    currentDate,
  )

  res.send({
    data: {
      name: data.subject.givenName,
      surname: data.subject.surname,
      country: data.subject.countryName,
      pno: data.subject.serialNumber,
      currentDate: currentDate,
    },
    signature: signature.toJSON(),
    publicKey: publicKey.toBase58(),
  })
})


/**
 * POST /initiateSession
 * @summary Initiate a smart-id session and get session id. Use session id in getData request.
 * @tags Smart-ID oracle
 * @param {object} request.body - a json containing personal ID number (PNO), country (LT, LV, EE), and display text that the users will see on smart ID push notification
 * @example request - payload example EE
 * {
 *   "pno": 123456789,
 *   "country": "EE",
 *   "displayText": "Hi, this is xyz app requesting your data"
 * }
 * @example request - payload example LT
 * {
 *   "pno": 123456789,
 *   "country": "LT",
 *   "displayText": "Hi, this is xyz app requesting your data"
 * }
 */
app.post('/initiateSession', async (req, res) => {
  try {
    const hash = await getRandomHash()
    const data = await initiateSession(req.body.country, req.body.pno, hash, req.body.displayText)
    secretStorage.set(data.sessionID, hash)
    const verificationCode = computeVerificationCode(hash)
    data.verificationCode = verificationCode
    res.send(data)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Error in the smartID flow' });
  }
})


/**
 * POST /getData
 * @summary Get user data (assuming that user aproved it on smart-id app after sending initiateSession)
 * @tags Smart-ID oracle
 * @param {object} request.body - a json containing sessionID
 * @example request - payload example
 * {
 *   "sessionID": "899edab0-1694-4860-9105-dd74ee8c00d7"
 * }
 */
app.post('/getData', async (req, res) => {
  try {
    const data = await getData(req.body.sessionID)
    const hash = secretStorage.get(req.body.sessionID)
    const isValid = verifyData(data, hash)
    if (!isValid) res.status(500).json({ error: 'Sha signature issue' })
    const data_ = decodeData(data)
    const now = new Date()
    const currentDate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`

    const [signature, publicKey] = getOracleSignature(
      data_.subject.givenName,
      data_.subject.surname,
      data_.subject.countryName,
      data_.subject.serialNumber,
      currentDate,
    )

    res.send({
      data: {
        name: data_.subject.givenName,
        surname: data_.subject.surname,
        country: data_.subject.countryName,
        pno: data_.subject.serialNumber,
        currentDate: currentDate,
      },
      signature: signature.toJSON(),
      publicKey: publicKey.toBase58(),
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Error in the smartID flow' });
  }
})


/**
 * POST /getOFACmatches
 * @summary Check user data agains OFAC database
 * @tags OFAC oracle
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *	 "minScore": 95,
 *   "pid": {
 *      "name": "Sergei Vladilenovich",
 *      "dob": "1962-07-26",
 *      "citizenship": "russia",
 *      "gender": "male"
 *    }
 * }
 */
app.post('/getOFACmatches', async (req, res) => {

  // TODO:
  //  request data must be from the smart-id-oracle
  //  check if smart-id data is valid
  //  parse dob, citizenship and gender
  //  output pid signature from the smart-id as part of this oracle data
  //  check if signature matches inside the zkProgram

  // perform OFAC search
  const url = 'https://search.ofac-api.com/v3'
  const body = {
    apiKey: process.env.OFAC_API_KEY,
    source: ['SDN'], // 'UK'
    minScore: req.body.minScore,
    cases: [ req.body.pid ]
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const response_ = await response.json()

  /**
   * The oracle returns:
   *    isMatched [1 or 0] depending on if indicivual is sanctioned or not
   *    score [0 to 100] match accuracy score
   * Additionally it returns full match data, but it is not signed
   * and can be used outside of zkProgram to show sanctions data
  */

  // sort matches by score
  const matchName = Object.keys(response_.matches)[0]
  const matchData = response_.matches[matchName]
  console.log(response_, matchName, matchData)
  const data = {
    data: {
      isMatched: matchData.length > 0 ? 1 : 0,
      score: req.body.minScore,
      pidSignature: null,
    },
    // signature: signature.toJSON(),
    // publicKey: publicKey.toBase58(),
    metaData: response_
  }

  res.send(data)
})


app.listen(8080, () => console.log(`App's running.`))
