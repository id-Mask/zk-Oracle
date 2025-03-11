/**
 * In-memory storage manager for session data and verification processes
 */
class StorageManager {
  constructor() {
    this.smartIdSessionStorage = new Map()
    this.proofOwnershipStorage = new Map()
    this.passkeysChallangeStorage = new Map()
    this.maxStorageSize = 5000
    this.clearIntervalMillis = 300000 // 5 minutes
    
    // Start periodic cleanup
    this.startCleanupTimers()
  }

  startCleanupTimers() {
    setInterval(() => this.trimStorage(this.smartIdSessionStorage), this.clearIntervalMillis)
    setInterval(() => this.trimStorage(this.proofOwnershipStorage), this.clearIntervalMillis)
    setInterval(() => this.trimStorage(this.passkeysChallangeStorage), this.clearIntervalMillis)
  }

  trimStorage(storageMap) {
    if (storageMap.size > this.maxStorageSize) {
      const keysToDelete = Array.from(storageMap.keys()).slice(0, storageMap.size - this.maxStorageSize)
      keysToDelete.forEach(key => storageMap.delete(key))
    }
  }

  // SmartID session methods
  // setSmartIdSession(sessionId, hash) {
  //   this.smartIdSessionStorage.set(sessionId, hash)
  // }

  // getSmartIdSession(sessionId) {
  //   return this.smartIdSessionStorage.get(sessionId)
  // }

  // Proof ownership methods
  // setProofOwnership(sessionId, signature) {
  //   this.proofOwnershipStorage.set(sessionId, signature)
  // }

  // getProofOwnership(sessionId) {
  //   return this.proofOwnershipStorage.get(sessionId)
  // }
}

// Create a singleton instance
const storageManager = new StorageManager()

// Middleware to inject storage manager into request
const storageMiddleware = (req, res, next) => {
  req.storageManager = storageManager
  next()
}

module.exports = storageMiddleware