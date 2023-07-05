// together with opensancions, we can prove the individual is not sanctioned
// https://api.opensanctions.org/#tag/Matching/operation/search_search__dataset__get

// prove unique human
// prove you're an adult
// prove you're not on a sancions list

const crypto = require('crypto')
const x509 = require('@ghaiklor/x509')
const authHash = require('./authhash.js')


const getSmartIdData = async (country, pno) => {

  // 1. initiateSession
  // 2. getData
  // 3. verifyData
  // 4. decodeData

  const initiateSession = async (country, pno, hash) => {
    const data = {
      'relyingPartyUUID': '00000000-0000-0000-0000-000000000000',
      'relyingPartyName': 'DEMO',
      'certificateLevel': 'QUALIFIED',
      'hash': hash.digest,
      'hashType': 'SHA512',
      'allowedInteractionsOrder': [
        {
          'type': 'displayTextAndPIN',
          'displayText60': 'Hello, this is ZK demo! 🫶'
        }
      ]
    }

    const baseURL = 'https://sid.demo.sk.ee/smart-id-rp/v2/'
    const response = await fetch(baseURL + 'authentication/etsi/' + 'PNO' + country + '-' + pno, {
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
    const baseURL = 'https://sid.demo.sk.ee/smart-id-rp/v2/'
    const response = await fetch(baseURL + 'session/' + session + '?timeoutMs=10000', {
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
    const subject = x509.getSubject(cert)

    return parsedCert
  }

  // putting all the pieces defined above together
  const hash = await authHash.generateRandomHash()
  const session = await initiateSession(country, pno, hash)
  const data = await getData(session.sessionID)
  const isValid = verifyData(data, hash)
  console.log('data valid?', isValid)
  const data_ = decodeData(data)
  return data_
}


module.exports = {
  getSmartIdData,
}
