const bcrypt = require('bcrypt');

module.exports = {
  isMatchCrypto : async (_pwd, _encrytedPwd) => {
    return await bcrypt.compare(_pwd, _encrytedPwd);
  },
  genHash : async (_pwd) => {
    return await bcrypt.hash(_pwd, Number(process.env.CRYPTO_ROUND || 10));
  }
}