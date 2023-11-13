
module.exports = (session) => {
  let sqlsession = require('express-mysql-session')(session);
  let options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    clearExpired : true ,
    checkExpirationInterval: 180000,
    expiration: 6000000,
    schema: {
      tableName: 'tb_sessions_manager',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    }    
  }
  return new sqlsession(options);
}