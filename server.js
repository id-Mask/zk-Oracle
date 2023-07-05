const express = require('express')
const expressJSDocSwagger = require('express-jsdoc-swagger')
const { getSmartIdData } = require('./index.js')
const authHash = require('./authhash.js')
const { PrivateKey, Encoding, Signature } = require('snarkyjs')
const cors = require('cors')
require('dotenv').config()


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
}

const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }))
expressJSDocSwagger(app)(options)

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
 * GET /get_mock_data
 * @summary Fetch mock data
 * @tags Helpers
 */
app.get('/get_mock_data', async (req, res) => {
  const data = {
  "version": 2,
  "subject": {
    "countryName": "LT",
    "commonName": "DOE,JANE",
    "surname": "DOE",
    "givenName": "JANE",
    "serialNumber": "PNOLT-42011130011"
  },
  "issuer": {
    "countryName": "EE",
    "organizationName": "AS Sertifitseerimiskeskus",
    "organizationIdentifier": "NTREE-10747013",
    "commonName": "TEST of EID-SK 2016"
  },
  "serial": "541005EB1F930B<...>C33FA13B",
  "notBefore": "2023-06-13T14:49:40.000Z",
  "notAfter": "2023-08-12T14:49:40.000Z",
  "subjectHash": "00ffd8f00129",
  "signatureAlgorithm": "sha256WithRSAEncryption",
  "fingerPrint": "BA:10:B3:6A:2D:89<...>:FC:09:00:10:30:1A:0B:0E:8D",
  "publicKey": {
    "algorithm": "sha256WithRSAEncryption"
  },
  "altNames": [],
  "extensions": {
    "basicConstraints": "CA:FALSE",
    "keyUsage": "Digital Signature, Key Encipherment, Data Encipherment",
    "certificatePolicies": "Policy: 1.3.6.1.4.1.00000.3.17.2\n  CPS: https://skidsolutions.eu/en/repository/CPS/\nPolicy: 0.4.0.2042.1.2",
    "subjectKeyIdentifier": "20:48:7D:AA:7D:A3:AF<...>:75:30:2C:4F:50:FD:DC:CC:28:30",
    "authorityKeyIdentifier": "AE:B0:EA:E1:36:F8:15:<...>:0B:77:55:FE:3A:1D:02:BF:12:B5",
    "extendedKeyUsage": "TLS Web Client Authentication",
    "authorityInformationAccess": "OCSP - URI:http://aia.demo.sk.ee/eid2016\nCA Issuers - URI:http://sk.ee/upload/files/TEST_of_EID-SK_2016.der.crt",
    "subjectAlternativeName": "DirName:/CN=PNOLT-42011130011-MZMC-Q",
    "subjectDirectoryAttributes": "\u0004!0\u42011130011\u0018\u000f42011130011Z"
    }
  }

  res.send(data)
})


/**
 * POST /get_data
 * @summary Initiate a smart-id session and fetch data if user confirms the request
 * @tags Helpers
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

  try {
    const data = await getSmartIdData(country, pno)
    res.send(data)
  } catch (err) {
    res.status(500).json({ error: 'Error in the smartID flow' })
  }

})



/**
 * POST /get_data_via_oracle
 * @summary Initiate a smart-id session, fetch data if user confirms the request and return data together with a signature
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
app.post('/get_data_via_oracle', async (req, res) => {

  const pno = req.body.pno
  const country = req.body.country
  let data // declaring because of the try / catch block

  try {
    data = await getSmartIdData(country, pno)
  } catch (err) {
    res.status(500).json({ error: 'Error in the smartID flow' })
    return
  }

  const privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY)
  const publicKey = privateKey.toPublicKey()

  // get the data we want to send as a response
  const name = data.subject.givenName
  const surname = data.subject.surname
  const country_ = data.subject.countryName
  const pno_ = data.subject.serialNumber

  // encode and sign the data
  const merged_array_of_fields = [
    ...Encoding.stringToFields(name),
    ...Encoding.stringToFields(surname),
    ...Encoding.stringToFields(country_),
    ...Encoding.stringToFields(pno_)
  ]
  const signature = Signature.create(privateKey, merged_array_of_fields)

  // create the response
  const response = {
    data: {
      name: name,
      surname: surname,
      country: country_,
      pno: pno_,
    },
    signature: signature,
    publicKey: publicKey,
  }

  res.send(response)
})


app.listen(8080, () => console.log(`Example app listening.`))
