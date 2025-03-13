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
  Below are the endpoints for creating a challenge, storing it to
  faciliate communication, storing whole assertion object from webauthn
  and providing an endpoint to fetch it for the proof consumer
*/


/**
 * POST /passkeys/createChallengeSession
 * @summary Create a session, mapping challenge to signature
 * @tags Passkeys
 * @param {object} request.body - a json containing data
 * @example request - payload example
 * { }
 */
router.post('/createChallengeSession', async (req, res) => {
  const generateRandomChallenge = () => {
    return Math.random().toString(36).slice(2, 10);
  }
  const challenge = generateRandomChallenge()
  req.storageManager.passkeysChallengeStorage.set(challenge, null)
  return res.send({challenge: challenge})
})

/**
 * POST /passkeys/postAssertion
 * @summary Post the assertion object to the challenge
 * @tags Passkeys
 * @param {object} request.body - a JSON containing data
 * @example request - payload example
 * {
 *   "challenge": "1234567",
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
  const challenge = req.body.challenge
  req.storageManager.passkeysChallengeStorage.set(challenge, req.body.assertion)
  return res.send({ success: true, challenge })
})

/**
 * GET /passkeys/getAssertion
 * @summary Get the assertion of the challenge
 * @tags Passkeys
 * @param {string} request.query.request - The challenge ID
 * @example request - example with query param
 * /passkeys/getAssertion?request=1234567
*/
router.get('/getAssertion', async (req, res) => {
  const challenge = req.query.request
  res.send(req.storageManager.passkeysChallengeStorage.get(challenge) || {})
})

module.exports = {
  router
}