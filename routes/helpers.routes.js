const express = require('express')
const router = express.Router()

/**
 * GET /api/health
 * @summary Check server health
 * @description A simple health check endpoint.
 * @tags Health
 * @return {object} 200 - success response
 */
router.get('/api/health', (req, res) => {
  res.json({ status: 'OK' })
})


module.exports = {
  router
}