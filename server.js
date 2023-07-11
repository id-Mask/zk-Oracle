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
    title: 'zkSmart-ID: Personal Identification Data and ZK Smart Contracts Join Forces 🤜🤛',
    description: 'Bridge valid and authentic real-world personal identification data to your smart contracts',
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


const get_oracle_signature = (name, surname, country, pno) => {

  const privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY)
  const publicKey = privateKey.toPublicKey()

  // encode and sign the data
  const merged_array_of_fields = [
    ...Encoding.stringToFields(name),
    ...Encoding.stringToFields(surname),
    ...Encoding.stringToFields(country),
    ...Encoding.stringToFields(pno)
  ]
  const signature = Signature.create(privateKey, merged_array_of_fields)

  return [signature, publicKey]
}


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
 * @summary Fetch randomized mock data
 * @tags Helpers
 */
app.get('/get_mock_data', async (req, res) => {

  // add some randomness
  const names = ['Jane', 'Douglas', 'Abraham', 'Spruce', 'Hilary', 'Lance']
  const sunames = ['Doe', 'Lyphe', 'Pigeon', 'Springclean', 'Ouse', 'Nettlewater']
  const countryNames = ['LT', 'LV', 'EE']

  const randomName = names[Math.floor(Math.random()*names.length)]
  const randomSurname = sunames[Math.floor(Math.random()*sunames.length)]
  const randonCountryName = countryNames[Math.floor(Math.random()*countryNames.length)]
  const randomYear = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString()
  const randomFiveDigitNumber = Math.floor(Math.random() * 90000) + 10000

  const data = {
    subject: {
      countryName: randonCountryName,
      commonName: randomSurname + ',' + randomName,
      surname: randomSurname,
      givenName: randomName,
      serialNumber: 'PNOLT-4' + randomYear + '111' + randomFiveDigitNumber.toString()
    }
  }

  // get the data we want to send as a response
  const name = data.subject.givenName
  const surname = data.subject.surname
  const country_ = data.subject.countryName
  const pno_ = data.subject.serialNumber

  const [signature, publicKey] = get_oracle_signature(name, surname, country_, pno_)

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


/**
 * POST /get_data
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
app.post('/get_data', async (req, res) => {

  const pno = req.body.pno
  const country = req.body.country
  let data // declaring because of the try / catch block

  try {
    data = await getSmartIdData(country, pno)
  } catch (err) {
    res.status(500).json({ error: 'Error in the smartID flow' })
    return
  }

  // get the data we want to send as a response
  const name = data.subject.givenName
  const surname = data.subject.surname
  const country_ = data.subject.countryName
  const pno_ = data.subject.serialNumber

  // encode and sign the data
  const [signature, publicKey] = get_oracle_signature(name, surname, country_, pno_)

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
