const crypto = require('crypto')
const x509 = require('@ghaiklor/x509')
const { PrivateKey, Signature, CircuitString, Field } = require('o1js')
require('dotenv').config()

/*

Smart-ID Data Fetching Utility
This file contains utility functions for fetching Smart-ID data.
These utility functions are used to define API endpoints in `index.js`.

To fetch Smart-ID data, follow these steps:
  1. Generate Random Hash: it will be passed to the Smart-ID backend.
  This hash is used to sign the data.

  2. Request Session ID: Pass the generated hash, along with the country and
  personal identification number (pno) to the Smart-ID backend. The user will
  be prompted to allow or deny this request on their smartphone.

  3. Retrieve Data with Session ID: Use the obtained session ID to fetch the
  desired data from the Smart-ID backend.

  4. Verify Data Signature: Verify the data by checking if the signature
  matches the previously generated random hash. This ensures data integrity
  and authenticity.

  5. Parse and Decode Data: The retrieved data is typically in certificate
  format. Parse and decode this data to make it readable and usable for your
  application.

  6. Sign Data with O1JS-Compatible Signature and return. This allows the data
  to be used inside the zkProgram/smart-contract.

*/

const getRandomHash = async () => {
  const hashType = 'sha512'
  const buf = await crypto.randomBytes(64)
  return {
    raw: buf,
    digest: crypto.createHash(hashType).update(buf).digest('base64')
  }
}

// https://github.com/SK-EID/smart-id-documentation#23132-computing-the-verification-code
const computeVerificationCode = (hash) => {
  const hashedHash = crypto.createHash('sha256').update(Buffer.from(hash.digest, 'base64')).digest()
  const intValue = hashedHash.readUIntBE(hashedHash.length - 2, 2)
  const code = intValue % 10000
  return code
}

const getConfig = async () => {
  /*
    Set DEMO or PROD configuration
    Fetch config  from env.CONFIG_URL
    This is for the sole reason to be able to quickly 
    switch from prod to demo versions and vice versa
  */
  const demoConfig = {
    relyingPartyUUID: '00000000-0000-0000-0000-000000000000',
    relyingPartyName: 'DEMO',
    baseUrl: 'https://sid.demo.sk.ee/smart-id-rp/v2/',
  }

  const prodConfig ={
    relyingPartyUUID: process.env.SMART_ID_UUI_PROD,
    relyingPartyName: 'id-mask',
    baseUrl: 'https://rp-api.smart-id.com/v2/',
  }

  let config
  try {
    const configUrl = process.env.CONFIG_URL
    const response = await fetch(configUrl)
    config = await response.json()
  } catch {
    return demoConfig
  }
  return config?.prod ? prodConfig : demoConfig

}


const initiateSession = async (country, pno, hash, displayText) => {
  const config = await getConfig()
  const data = {
    'relyingPartyUUID': config.relyingPartyUUID,
    'relyingPartyName': config.relyingPartyName,
    'certificateLevel': 'QUALIFIED',
    'hash': hash.digest,
    'hashType': 'SHA512',
    'allowedInteractionsOrder': [
      {
        'type': 'displayTextAndPIN',
        'displayText60': displayText
      }
    ]
  }

  const url = config.baseUrl + 'authentication/etsi/' + 'PNO' + country + '-' + pno
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const response_ = await response.json()
  return response_
}

const getData = async (session) => {
  const config = await getConfig()
  const baseURL = config.baseUrl
  const url = baseURL + 'session/' + session + '?timeoutMs=30000'
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const response_ = await response.json()
  return response_
}

const verifyData = (response_, hash) => {
  const verifier = crypto.createVerify(response_.signature.algorithm)
  verifier.update(hash.raw)
  const CERT_BEGIN = '-----BEGIN CERTIFICATE-----\n'
  const CERT_END = '\n-----END CERTIFICATE-----'
  const cert = CERT_BEGIN + response_.cert.value + CERT_END;
  if (!verifier.verify(cert, response_.signature.value, 'base64')) {
    console.log('Invalid signature (verify failed)')
    return false
  } else {
    return true
  }
}

const decodeData = (response_) => {
  const CERT_BEGIN = '-----BEGIN CERTIFICATE-----\n'
  const CERT_END = '\n-----END CERTIFICATE-----'
  const BODY_VALUE = response_.cert.value

  const cert = CERT_BEGIN + BODY_VALUE + CERT_END
  const parsedCert = x509.parseCert(cert)

  return parsedCert
}


const getOracleSignature = (name, surname, country, pno, currentDate) => {

  const privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY)
  const publicKey = privateKey.toPublicKey()

  // encode and sign the data
  const mergedArrayOfFields = [
    ...CircuitString.fromString(name).toFields(),
    ...CircuitString.fromString(surname).toFields(),
    ...CircuitString.fromString(country).toFields(),
    ...CircuitString.fromString(pno).toFields(),
    Field(currentDate),
  ]
  const signature = Signature.create(privateKey, mergedArrayOfFields)

  return [signature, publicKey]
}

const getMockSmartIdData = () => {

  function getRandomItemFromArray(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  const names = ['Jane', 'Douglas', 'Abraham', 'Spruce', 'Hilary', 'Lance']
  const sunames = ['Doe', 'Lyphe', 'Pigeon', 'Springclean', 'Ouse', 'Nettlewater']
  const countres = ['LT', 'LV', 'EE']
  const sexAndCenturies = [1, 2, 3, 4, 5, 6]
  const years = Array.from({ length: 99 }, (_, index) => (index + 1).toString().padStart(2, '0'))
  const months = Array.from({ length: 12 }, (_, index) => (index + 1).toString().padStart(2, '0'))
  const days = Array.from({ length: 30 }, (_, index) => (index + 1).toString().padStart(2, '0'))

  const name = getRandomItemFromArray(names)
  const surname = getRandomItemFromArray(sunames)
  const country = getRandomItemFromArray(countres)
  const sexAndCentury = getRandomItemFromArray(sexAndCenturies)
  const year = getRandomItemFromArray(years)
  const month = getRandomItemFromArray(months)
  const day = getRandomItemFromArray(days)
  const fourDigitNumber = Math.floor(Math.random() * 9000) + 1000

  return {
    subject: {
      countryName: country,
      commonName: surname + ',' + name,
      surname: surname,
      givenName: name,
      serialNumber: `PNO${country}-${sexAndCentury}${year}${month}${day}${fourDigitNumber}`
    }
  }
}

module.exports = {
  getRandomHash,
  computeVerificationCode,
  initiateSession,
  getData,
  verifyData,
  decodeData,
  getOracleSignature,
  getMockSmartIdData
}
