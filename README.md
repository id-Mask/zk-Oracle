# Basic structure

project-root/
├── config/
│   └── db.js                   # MongoDB connection setup
│   └── swagger.js              # Swagger configuration
├── routes/
│   ├── smartId.routes.js       # Smart-ID related routes
│   ├── sanctions.routes.js     # OFAC sanctions related routes
│   ├── uniqueHuman.routes.js   # Unique human verification routes
│   ├── googleWallet.routes.js  # Google Wallet related routes
│   ├── passkeys.routes.js      # Passkey-related routes
│   ├── ipfs.routes.js          # IPFS-related routes
│   └── helpers.routes.js       # Utility routes like /ping
├── utils/
│   ├── smartId.utils.js        
│   ├── sanctions.utils.js      
│   ├── uniqueHuman.utils.js    
│   ├── googleWallet.utils.js   
├── middleware/
│   └── storage.middleware.js # Handles in-memory storage
├── server.js                 # Main application file
