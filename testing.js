const {
  getRandomHash,
  initiateSession,
  getData,
  verifyData,
  decodeData,
  getOracleSignature,
  getMockSmartIdData,
} = require('./smartId.utils.js');


// Call start
(async() => {
  const hash = await getRandomHash()

  const lastTwoBytes = hash.raw.slice(-2);
  const intValue = lastTwoBytes.readUInt16BE(0);
  const result = intValue % 10000;

  console.log(result)
})();
