require('dotenv').config()
const crypto = require('crypto')
const {
  PrivateKey,
  PublicKey,
  Signature,
  CircuitString,
} = require('o1js')

const getSecretValueOfIdentity = async (personalData) => {
  const salt = process.env.SECRET_VALUE_UNIQUE_HUMAN
  const dataArray = [
    personalData.data.name,
    personalData.data.surname,
    // personalData.data.country, // identity is not tied to country, right?
    personalData.data.pno,
    salt,
  ]
  const dataString = JSON.stringify(dataArray)
  return crypto.createHash('sha256').update(dataString).digest('hex')
}

const getSecretValueOracleSignature = (secret) => {
  const privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY)
  const publicKey = privateKey.toPublicKey()

  // encode and sign the data
  const mergedArrayOfFields = [
    ...CircuitString.fromString(secret).values.map((item) => item.toField()),
  ]
  const signature = Signature.create(privateKey, mergedArrayOfFields)
  return [signature, publicKey]
}

module.exports = {
  getSecretValueOfIdentity,
  getSecretValueOracleSignature,
}

