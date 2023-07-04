const express = require('express')
const expressJSDocSwagger = require('express-jsdoc-swagger')
const { initiateSession, getData, verifyData, decodeData } = require('./index.js')
const authHash = require('./authhash.js')

const options = {
  info: {
    version: 'demo',
    title: 'Personal Data and ZK Smart Contracts Join Forces 🫶',
    description: 'Bridge personal data to the zk powered smart contracts on Mina Protocol',
  },
  baseDir: __dirname,
  swaggerUIPath: '/api-docs',
  exposeSwaggerUI: true,
  exposeApiDocs: true,
  apiDocsPath: '/v3/api-docs',
  notRequiredAsNullable: false,
  swaggerUiOptions: {},
  multiple: true,
}

const app = express()

app.use(express.json())
expressJSDocSwagger(app)(options)

/**
 * GET /
 * @summary Ping the server
 * @tags Helpers
 * @return {object} 200 - success response - application/json
 */
app.get('/', (req, res) => {
  res.send({
    'hi': 'hello!',
  })
})


/**
 * POST /get_mock_data
 * @summary Fetch mock data
 * @tags Helpers
 * @param {object} request.body - a json containing personal ID number (PNO) and country (LT, LV, EE)
 * @example request - payload example LT
 * {
 *   "pno": 32010110101,
 *   "country": "LT"
 * }
 */
app.post('/get_mock_data', async (req, res) => {
  const data = {
    'countryName': 'LT',
    'commonName': 'SURNAME,NAME',
    'surname': 'SURNAME',
    'givenName': 'NAME',
    'serialNumber': 'PNOLT-32010110101',
    'dateOfBirth': '2020-10-11'
  }
  res.send(data)
})


/**
 * POST /get_data
 * @summary Initiate a smart-id session and fetch data if user confirms the request
 * @tags Oracle
 * @param {object} request.body - a json containing personal ID number (PNO) and country (LT, LV, EE)
 * @example request - payload example LT
 * {
 *   "pno": 123456789,
 *   "country": "LT"
 * }
 * @example request - payload example LV
 * {
 *   "pno": 123456789,
 *   "country": "LV"
 * }
 * @example request - payload example EE
 * {
 *   "pno": 123456789,
 *   "country": "EE"
 * }
 */
app.post('/get_data', async (req, res) => {

  const pno = req.body.pno
  const country = req.body.country
  const hash = await authHash.generateRandomHash()

  const session = await initiateSession(country, pno, hash)

  // at this point we wait for the user to confirm the data request
  // get the smart-id data
  const data = await getData(session.sessionID)

  // now lets validate the data as per the docs
  const isValid = verifyData(data, hash)
  console.log('data valid?', isValid)

  // decode the data
  const data_ = decodeData(data)

  res.send(data_)
})


app.listen(3000, () => console.log(`Example app listening.`))
