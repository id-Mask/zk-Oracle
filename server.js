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
app.use('/passkeys', passkeysRoutes.router)
app.use('/ipfs', ipfsRoutes.router)
app.use('/ownership', storageMiddleware, ownershipRoutes.router)

// Start server
const PORT = process.env.PORT || 8080
const startServer = async () => {

  // db connection and collection
  const db = await connectDB()
  app.locals.db = db
  app.locals.passkeysCollection = db.collection('passkeys')

  app.listen(PORT, () => console.log(`App's running: http://localhost:${PORT}/`))
}

startServer().catch(console.error)