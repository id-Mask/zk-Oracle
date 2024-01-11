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
} = require('./smartId.utils.js')

const {
  verifyOracleData,
  transformData,
  searchOFAC,
  getOFACOracleSignature,
} = require('./sanctions.utils.js')

const {
  getSecretValueOfIdentity,
  getSecretValueOracleSignature,
} = require('./uniqueHuman.utils.js')

const cors = require('cors')
require('dotenv').config()


const options = {
  info: {
    version: 'demo',
    title: 'Id-Mask: zk powered identity',
    description: 'API endpoints for accessing identity and associated data that powers <b><a href="https://idmask.xyz/">id-mask</a></b>',
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
 * @tags Smart-ID oracle
 */
app.get('/getSmartIDMockData', async (req, res) => {
  const data = getMockSmartIdData()
  const now = new Date()
  const currentDate = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()

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
    const currentDate = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()

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
 *   "data": {
 *      "name": "Sergei",
 *      "surname": "Vladilenovich",
 *      "country": "RU",
 *      "pno": "PNORU-36207260000",
 *      "currentDate": 20231114
 *   },
 * 
 *   "signature": {
 *      "r": "24806714253289738333607744171564365993302841908156387358317011371156340489792",
 *      "s": "1943438842762617285560965587782140841558694095580526167609408761354758601867"
 *   },
 *   "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN",
 *   "minScore": 95
 * }
 */
app.post('/getOFACmatches', async (req, res) => {

  /**
   * The oracle returns:
   *    isMatched [1 or 0] depending on if indicivual is sanctioned or not
   *    minScore [0 to 100] minimum match accuracy score set by the user
   * Additionally it returns full match data, but it is not signed
   * and can be used outside of zkProgram to show sanctions data
  */

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
  )

  return res.send({
    data: {
      isMatched: isMatched,
      minScore: req.body.minScore,
      currentDate: currentDate,
    },
    signature: signature.toJSON(),
    publicKey: publicKey.toBase58(),
    metaData: response
  })
})


/**
 * POST /getSecretValueOfIdentity
 * @summary Get a secret unique value to each identity to include as part of the hash 
 * to enhance security and mitigate the risk of tracebility
 * @tags Unique Human Oracle
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *   "data": {
 *      "name": "Jane",
 *      "surname": "Springclean",
 *      "country": "LT",
 *      "pno": "PNOLT-10304195494",
 *      "currentDate": 20231201
 *   },
 * 
 *   "signature": {
 *      "r": "6284773182382681048549668250691358053998798057701156358295686650796914122175",
 *      "s": "14982014700584303280139522296693531266742513419869997382512229379810952134357"
 *   },
 *   "publicKey": "B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN"
 * }
 */
app.post('/getSecretValueOfIdentity', async (req, res) => {
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


/**
 * POST /uploadToIPFS
 * @summary Upload data to IPFS and retrieve CID
 * @tags IPFS helpers
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *   "data": "asdasdasd"
 * }
 */
app.post('/uploadToIPFS', async (req, res) => {
  const response = await fetch(
    'https://api.pinata.cloud/pinning/pinJsonToIPFS', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json', 
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET,
    },
    body: JSON.stringify({ pinataContent: req.body.data })
  })
  const response_ = await response.json()
  return res.send(response_)
})


app.listen(8080, () => console.log(`App's running: http://localhost:8080/`))
