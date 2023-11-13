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
  /**
   * UnionMK USDT Transaction List
   */
  getUnionMkTransList: async () => {
    return await db.query(`SELECT A.type, C.name AS name, B.name AS other_name, A.memo, A.change AS \`change\`, A.regdate AS regdate FROM history A LEFT JOIN user B ON A.user_id = B.id LEFT JOIN user C ON A.other_user_id = C.id WHERE (A.type = 1 OR A.type = 4) AND (B.name = 'UnionMK' OR C.name = 'UnionMK') ORDER BY regdate DESC LIMIT 5`);
  },
  /**
   * User USDT Transaction List
   */
  getUserTransList: async () => {
    return await db.query(`SELECT A.type, C.name AS name, B.name AS other_name, A.memo, A.change AS \`change\`, A.regdate AS regdate FROM history A LEFT JOIN user B ON A.user_id = B.id LEFT JOIN user C ON A.other_user_id = C.id WHERE (A.type = 1 OR A.type = 4) AND (B.name != 'UnionMK' AND C.name != 'UnionMK') ORDER BY regdate DESC LIMIT 5`);
  },
  /**
   * Withdraw List
   */
  getWithdrawList: async () => {
    return await db.query(`SELECT B.name AS name, B.tel AS tel, B.country_code AS country_code, B.account AS account, A.amount AS amount, A.approve, A.regdate AS regdate FROM withdrawal A LEFT JOIN user B ON A.user_id = B.id ORDER BY regdate DESC LIMIT 5`);
  },
  /**
   * NewUserList
   */
  getNewUserList: async () => {
    return await db.query(`SELECT name, account, tel, country_code, regdate FROM user ORDER BY regdate DESC LIMIT 5`);
  },
  /**
   * 
   * @returns 
   */
  getUserPayPoint: async () => {
    const sum = await db.query(`SELECT IFNULL(SUM(balance), 0) AS sum FROM user`);
    return sum[0][0]['sum'];
  }
} 
