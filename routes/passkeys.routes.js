const express = require('express')
const router = express.Router()

/**
 * Validate request body for passkeys
 */
const validatePasskeyInput = (body) => {
  const entries = Object.entries(body);
  if (entries.length !== 1) return 'Request body must contain exactly one key-value pair';

  const [key, value] = entries[0];
  if (!key || !value) return 'Invalid key or value';
  if (typeof key !== 'string' || typeof value !== 'string') return 'Key and value must be strings';
  if (value.length > 132) return 'Value cannot exceed 200 characters';

  return null; // No errors
};

/**
 * POST /passkeys/insert
 * @summary save passkeys user id: pk
 * @tags Passkeys
 * @param {object} request.body - a json containing {id: pk}
 * @example request - payload example
 * {
 *   "key": "test-id-123"
 * }
 */
router.post('/insert', async (req, res) => {
  try {
    const error = validatePasskeyInput(req.body);
    if (error) return res.status(400).json({ error });

    const [key, value] = Object.entries(req.body)[0];
    const collection = req.app.locals.passkeysCollection;
    await collection.insertOne({ key, value });
    res.status(201).json({ message: 'Inserted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /passkeys/fetch/:key
 * @summary fetch passkye given id
 * @tags Passkeys
 */
router.get('/fetch/:key', async (req, res) => {
  try {
    const key = req.params.key;
    const collection = req.app.locals.passkeysCollection;
    const result = await collection.findOne({ key });
    if (!result) return res.status(404).json({ error: 'Not found' });
    delete result['_id']; 
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  router
}