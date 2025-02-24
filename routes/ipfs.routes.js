const express = require('express')
const router = express.Router()
require('dotenv').config()

/**
 * POST /ipfs/upload
 * @summary Upload data to IPFS and retrieve CID
 * @tags IPFS helpers
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * {
 *   "data": "asdasdasd"
 * }
 */
router.post('/upload', async (req, res) => {
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

module.exports = {
  router
}