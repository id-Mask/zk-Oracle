// server.js
const express = require('express')
const cors = require('cors')
const expressJSDocSwagger = require('express-jsdoc-swagger')
require('dotenv').config()

// Import configs
const swaggerOptions = require('./config/swagger')
const { connectDB } = require('./config/db')

// Import temp storage middleware
const storageMiddleware = require('./middleware/storage.middleware');

// Import route modules
const helperRoutes = require('./routes/helpers.routes')
const smartIdRoutes = require('./routes/smartId.routes')
const sanctionsRoutes = require('./routes/sanctions.routes')
const uniqueHumanRoutes = require('./routes/uniqueHuman.routes')
const googleWalletRoutes = require('./routes/googleWallet.routes')
const passkeysRoutes = require('./routes/passkeys.routes')
const ipfsRoutes = require('./routes/ipfs.routes')
const ownershipRoutes = require('./routes/ownership.routes')

// Create Express app
const app = express()

// Middleware
app.use(express.json())
app.use(cors({ origin: '*' }))

// Setup Swagger documentation
expressJSDocSwagger(app)(swaggerOptions)

// Register routes
app.use('/', helperRoutes.router)
app.use('/smartId', storageMiddleware, smartIdRoutes.router)
app.use('/sanctions', sanctionsRoutes.router)
app.use('/uniqueHuman', uniqueHumanRoutes.router)
app.use('/googleWallet', googleWalletRoutes.router)
app.use('/passkeys', storageMiddleware, passkeysRoutes.router)
app.use('/ipfs', ipfsRoutes.router)
app.use('/ownership', storageMiddleware, ownershipRoutes.router)

// Start server
const PORT = process.env.PORT || 8080
const startServer = async () => {

  /*
    Centralized DB to enable cross-device passkey usage. While passkey ownership verification itself 
    doesn't require storage — zero-knowledge proofs output the public key in publicOutput — we still 
    need this DB for cross-device support. If a passkey pair is created on one device (e.g., a phone) 
    and later used to generate a proof on another (e.g., a laptop), the public key would be lost 
    without back-end storage, since WebAuthn only exposes public keys during creation 
    (navigator.credentials.create), not during authentication (navigator.credentials.get). 
    This database stores public keys, a necessary trade-off for seamless cross-device login.
  */
  const db = await connectDB()
  app.locals.passkeysCollection = db.collection('passkeys')

  app.listen(PORT, () => console.log(`App's running: http://localhost:${PORT}/`))
}

startServer().catch(console.error)