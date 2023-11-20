const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  connectTimeout: 1000,
  dateStrings: 'date',
  maxIdle: 10,
  idleTimeout: 6000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

module.exports = _dbHandlers = {

  isStartTransaction: false,

  poolEnd: async() => {
    return await db.end();
  },
  /**
   * get db connection
   * @returns db connection
   */
  getConnection: async() => {
    return await db.getConnection();
  },
  /**
   * release connection
   * @param {Object} _conn 
   */
  releaseConnection: (_conn) => {
    if (_conn) {
      _conn.release();
    }
  },
  beginTransaction: async (_conn) => {
    if (!_conn) return;
    await _conn.beginTransaction();
    _dbHandlers.isStartTransaction = true;
  },
  commit: async (_conn) => {
    if (!_conn || !_dbHandlers.isStartTransaction) return;
    await _conn.commit();
    _dbHandlers.isStartTransaction = false;
  },
  rollback: async (_conn) => {
    if (!_conn || !_dbHandlers.isStartTransaction) return;
    await _conn.rollback();
    _dbHandlers.isStartTransaction = false;
  },
  /**
   * get single row on connection
   * @param {Object} _conn 
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show 
   * @returns 
   */
  getOneRowConn: async(_conn, _q, _param, _show = false) => {
    if (!_conn) return;
    if (_show) {
      sql = await _conn.format(_q, _param);
      console.log(sql);
    }    
    let [rs] = await _conn.query(_q, _param);
    if (rs) return rs[0];    
  },
  /**
   * Execute Query on connection
   * @param {Object} _conn 
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show 
   * @returns 
   */
   exeQueryConn: async(_conn, _q, _param, _show = false) => {
    if (_show) {
      sql = await _conn.format(_q, _param);
      console.log(sql);
    }
    let rs = await _conn.query(_q, _param);
    return rs;
  },  
  /**
   * Multi Rows on connection
   * @param {Object} _conn 
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show
   * @returns 
   */
   getRowsConn: async(_conn, _q, _param, _show = false) => {
    if (!_conn) return;
    if (_show) {
      sql = await _conn.format(_q, _param);
      console.log(sql);
    }
    let [rs] = await _conn.query(_q, _param);
    return rs;
  },
  /**
   * et single row
   * @param {String} _q 
   * @param {String} _param 
   * @returns 
   */  
  getOneRow: async(_q, _param, _show = false) => {
    if (_show) {
      sql = await db.format(_q, _param);
      console.log(sql);
    }    
    let [rs] = await db.query(_q, _param);
    if (rs) return rs[0];
  },
  /**
   * Multi Rows
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show
   * @returns 
   */
  getRows: async(_q, _param, _show = false) => {
    if (_show) {
      sql = await db.format(_q, _param);
      console.log(sql);
    }
    let [rs] = await db.query(_q, _param);
    return rs;
  },
  /**
   * Execute Query
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show 
   * @returns 
   */
  exeQuery: async(_q, _param, _show = false) => {
    if (_show) {
      sql = await db.format(_q, _param);
      console.log(sql);
    }
    let rs = await db.query(_q, _param);
    return rs;
  },
  getUserInfo: async (_useridx, _col = 'idx') => {    
    return await _dbHandlers.getOneRow(`
      Select 
        U.*, W.f_taddress, W.f_balance, W.f_token, W.f_tnetwork,
        F.f_email as f_referralemail
      From tb_user U       
      Left Join tb_wallet W on U.idx = W.f_useridx 
      Left Join tb_user F on U.idx = F.f_referral
      Where U.${_col} = ? limit 1`, [_useridx]);
  }
} 
