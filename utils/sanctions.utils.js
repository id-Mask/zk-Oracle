const {
  PrivateKey,
  PublicKey,
  Signature,
  CircuitString,
  Field,
  Bool
} = require('o1js')
require('dotenv').config()

const verifyOracleData = (data) => {
  const PUBLIC_KEY = 'B62qmXFNvz2sfYZDuHaY5htPGkx1u2E2Hn3rWuDWkE11mxRmpijYzWN'
  const signature = Signature.fromJSON(data.signature)
  const validSignature = signature.verify(PublicKey.fromBase58(PUBLIC_KEY), [
    ...CircuitString.fromString(data.data.name).values.map((item) => item.toField()),
    ...CircuitString.fromString(data.data.surname).values.map((item) => item.toField()),
    ...CircuitString.fromString(data.data.country).values.map((item) => item.toField()),
    ...CircuitString.fromString(data.data.pno).values.map((item) => item.toField()),
    Field(data.data.currentDate),
    Field(data.data.isMockData),
  ])
  return validSignature.toBoolean()
}


const transformData = (data) => {
  /**
  * Transforms input data from one structure to another.
  *
  * This function takes an input data structure representing personal information
  * and transforms it into a new structure conforming to a different data schema.
  *
  * Input Structure:
  * {
  *   name: string,
  *   surname: string,
  *   country: string,
  *   pno: string,
  *   currentDate: number
  * }
  *
  * Output Structure:
  * {
  *   name: string, // Full name combining the 'name' and 'surname' from the input
  *   dob: string,  // Date of birth extracted from the 'pno'
  *   citizenship: string, // Citizenship mapped from the 'country'
  *   gender: string  // Gender extracted from the 'pno'
  * }
  */

  // Helper to map chars to indices
  // Personal Number: PNOLT-36203292548
  // Index:           01234567890123456

  function mapPNOToDOB(pno) {
    const startIdx = pno.indexOf('-') + 1
    const pnoDigits = pno.substring(startIdx)
    const century = Math.floor(Number(pnoDigits.charAt(0)) / 2) + 18
    const yy = pnoDigits.substr(1, 2)
    const mm = pnoDigits.substr(3, 2)
    const dd = pnoDigits.substr(5, 2)
    return `${century}${yy}-${mm}-${dd}`
  }

  function mapPNOToCitizenship(pno) {
    const mapping = {
      EE: 'Estonia',
      LV: 'Latvia',
      LT: 'Lithuania',
    }
    const countryCode = pno.slice(3, 5)
    return mapping[countryCode]
  }

  function getGenderFromPersonalNumber(pno) {
    const firstDigit = Number(pno.charAt(6))
    return firstDigit % 2 === 1 ? 'male' : 'female'
  }

  return {
    name: data.name + ' ' + data.surname,
    dob: mapPNOToDOB(data.pno),
    citizenship: mapPNOToCitizenship(data.pno),
    gender: getGenderFromPersonalNumber(data.pno)
  }
}


const searchOFAC = async (minScore, cases) => {
  const url = 'https://search.ofac-api.com/v3'
  const body = {
    apiKey: process.env.OFAC_API_KEY,
    source: ['SDN'], // 'UK'
    minScore: minScore,
    cases: [ cases ]
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const response_ = await response.json()
  return response_
}

const getOFACOracleSignature = (isMatched, minScore, currentDate, isMockData) => {
  const privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY)
  const publicKey = privateKey.toPublicKey()

  // encode and sign the data
  const mergedArrayOfFields = [
    Bool(isMatched).toField(),
    Field(minScore),
    Field(currentDate),
    Field(isMockData),
  ]
  const signature = Signature.create(privateKey, mergedArrayOfFields)

  return [signature, publicKey]
}

module.exports = {
  verifyOracleData,
  transformData,
  searchOFAC,
  getOFACOracleSignature,
}
