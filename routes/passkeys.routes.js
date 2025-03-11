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


/*
  Below are the endpoints for creating a challange, storing it to
  faciliate communication, storing whole assertion object from webauthn
  and providing an endpoint to fetch it for the proof consumer
*/


/**
 * POST /passkeys/createChallangeSession
 * @summary Create a session, mapping challange to signature
 * @tags Passkeys
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * { }
 */
router.post('/createChallangeSession', async (req, res) => {
  const generateRandomChallange = () => {
    return Math.random().toString(36).slice(2, 10);
  }
  const challange = generateRandomChallange()
  // req.storageManager.setProofOwnership(sessionId, null)
  req.storageManager.passkeysChallangeStorage.set(challange, null)
  return res.send({challange: challange})
})

/**
 * POST /passkeys/postAssertion
 * @summary Post the assertion object to the challenge
 * @tags Passkeys
 * @param {object} request.body - a JSON containing data
 * @example request - payload example
 * {
 *   "challange": "1234567",
 *   "assertion": {
 *     "clientExtensionResults": {
 *       "authenticatorData": "...",
 *       "signature": "...",
 *       "userHandle": "...",
 *       "clientDataJSON": "..."
 *     },
 *     "rawId": "aUa_HtPHxr_JwcdWHSAweQ",
 *     "response": "aUa_HtPHxr_JwcdWHSAweQ",
 *     "authenticatorAttachment": "aUa_HtPHxr_JwcdWHSAweQ",
 *     "id": "aUa_HtPHxr_JwcdWHSAweQ",
 *     "type": "public-key"
 *   }
 * }
 */
router.post('/postAssertion', async (req, res) => {
  const challange = parseInt(req.body.challange)
  req.storageManager.passkeysChallangeStorage.set(challange, req.body.assertion)
  return res.send({challange: req.body.challange})
})

/**
 * GET /passkeys/getAssertion
 * @summary Get the assertion of the challenge
 * @tags Passkeys
 * @param {string} request.query.challenge - The challenge ID
 * @example request - example with query param
 * /passkeys/getAssertion?challenge=1234567
*/
router.get('/getAssertion', async (req, res) => {
  const challenge = parseInt(req.query.challenge);
  res.send(req.storageManager.passkeysChallangeStorage.get(challenge) || {});
})

module.exports = {
  router
}