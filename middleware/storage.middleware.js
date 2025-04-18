/**
 * In-memory storage manager for session data and verification processes
 */
class StorageManager {
  constructor() {
    this.smartIdSessionStorage = new Map()
    this.proofOwnershipStorage = new Map()
    this.passkeysChallengeStorage = new Map()
    this.maxStorageSize = 5000
    this.clearIntervalMillis = 300000 // 5 minutes
    
    // Start periodic cleanup
    this.startCleanupTimers()
  }

  startCleanupTimers() {
    setInterval(() => this.trimStorage(this.smartIdSessionStorage), this.clearIntervalMillis)
    setInterval(() => this.trimStorage(this.proofOwnershipStorage), this.clearIntervalMillis)
    setInterval(() => this.trimStorage(this.passkeysChallengeStorage), this.clearIntervalMillis)
  }

  trimStorage(storageMap) {
    if (storageMap.size > this.maxStorageSize) {
      const keysToDelete = Array.from(storageMap.keys()).slice(0, storageMap.size - this.maxStorageSize)
      keysToDelete.forEach(key => storageMap.delete(key))
    }
  }
}

// Create a singleton instance
const storageManager = new StorageManager()

// Middleware to inject storage manager into request
const storageMiddleware = (req, res, next) => {
  req.storageManager = storageManager
  next()
}

module.exports = storageMiddleware