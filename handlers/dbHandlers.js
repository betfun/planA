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
  insertQuery: (_table, _param) => {
		let keys = Object.keys(_param);
		let sql = `insert into ${_table}(${keys.join(',')})
                   values (`;
    let vals = [];
    for (let i = 0; i < keys.length; i++) {
      if (i !== 0)
        sql += ',';
      sql += '?';
      vals.push(_param[keys[i]]);
    }
    sql += ')';
    return {_q: sql, _param: vals};
  },
  exeInsertConn: async(_conn, _table, _params, _show = false) => {
    if (!_conn) return;
    if (!_params || _params.length == 0) throw new Error('Empty Params');
    let {_q, _param} = _dbHandlers.insertQuery(_table, _params);

    if (_show) {
      sql = await _conn.format(_q, _param);
      console.log(sql);
    }       
    let rs = await _conn.query(_q, _param);    
    return rs;        
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
  exeInsert: async(_table, _params, _show = false) => {
    if (!_params || _params.length == 0) throw new Error('Empty Params');

    let {_q, _param} = _dbHandlers.insertQuery(_table, _params);

    if (_show) {
      sql = await db.format(_q, _param);
      console.log(sql);
    }
    return await db.query(_q, _param);
  },  
  getUserInfoConn: async (_conn, _val, _col = 'idx') => {
    return await _dbHandlers.getOneRowConn(_conn, `
      Select 
        U.*, W.f_taddress, W.f_balance, W.f_token, W.f_tnetwork,
        F.f_email as f_referralemail, F.f_status as f_referralstatus
      From tb_user U       
      Left Join tb_wallet W on U.idx = W.f_useridx 
      Left Join tb_user F on U.f_referral = F.idx
      Where U.${_col} = ? limit 1`, [_val]);
  },
  /**
   * get User Info
   * @param {*} _useridx 
   * @param {*} _col 
   * @returns 
   */
  getUserInfo: async (_val, _col = 'idx') => {    
    return await _dbHandlers.getOneRow(`
      Select 
        U.*, W.f_taddress, W.f_balance, W.f_token, W.f_tnetwork,
        F.f_email as f_referralemail, F.f_status as f_referralstatus
      From tb_user U       
      Left Join tb_wallet W on U.idx = W.f_useridx 
      Left Join tb_user F on U.f_referral = F.idx
      Where U.${_col} = ? limit 1`, [_val]);
  },   
  /**
   * get user sub nodes count
   * @param {*} _useridx 
   * @param {*} _filter 
   * @returns 
   */
  getUserSubNodes: async (_useridx, _filter = '*') => {
    return await _dbHandlers.getRows(`
      select ${_filter} from tb_node where f_node like ?
    `, [`%${_useridx}%`]);
  },
  /**
   * get node info
   * @param {*} _useridx 
   * @param {*} _filter 
   * @returns 
   */
  getNode: async (_useridx, _filter = '*') => {
    return await _dbHandlers.getOneRow(`
      select ${_filter} from tb_node where f_useridx = ?
    `, [_useridx]);
  }, 
  setAddInvtSubNodeCount: async(_conn, _refidx, _nodes) => {

    await _dbHandlers.exeQueryConn(_conn, 'update tb_node set f_invtL = f_invtL + 1 where f_useridx = ? ', [_refidx]);

    let arrNodes = _nodes.split(':');
    for(let i = 1; i < arrNodes.length-1; i++) {
      await _dbHandlers.exeQueryConn(_conn, 'update tb_node set f_subL = f_subL + 1 where f_useridx = ?', [arrNodes[i]]);
    }      
  },
  setReduceInvtSubNodeCount: async(_conn, _refidx, _nodes) => {

    await _dbHandlers.exeQueryConn(_conn, 'update tb_node set f_invtL = f_invtL - 1 where f_useridx = ? and f_invtL > 0 ', [_refidx]);

    let arrNodes = _nodes.split(':');
    for(let i = 1; i < arrNodes.length-1; i++) {
      await _dbHandlers.exeQueryConn(_conn, 'update tb_node set f_subL = f_subL - 1 where f_useridx = ? and f_subL > 0', [arrNodes[i]]);
    }      
  },
  getSetting: async(_key = '', _like = false) => {

    let rsSetting = null;

    if (_key) {
      if (_like)
        rsSetting = await _dbHandlers.getRows(`select * from tb_setting where f_key like ?`, [_key]);
      else 
        rsSetting = await _dbHandlers.getRows(`select * from tb_setting where f_key = ?`, [_key]);
    } else {
      rsSetting = await _dbHandlers.getRows(`select * from tb_setting`);
    }

    if (!rsSetting) return null;
  
    let setting = {};
  
    rsSetting.forEach((e)=>{
      let key = e.f_key;
      setting[key] = Number.isNaN(e.f_value)?e.f_value:Number(e.f_value);
      if (e.f_type == 'json') {
        setting[key] = JSON.parse(e.f_value);
      }
    })

    return setting;
  },
  getSummary: async(_key = '', _like = false) => {

    let rsSummary = null;

    if (_key) {
      if (_like)
        rsSummary = await _dbHandlers.getRows(`select * from tb_summary where f_key like ?`, [_key]);
      else 
        rsSummary = await _dbHandlers.getRows(`select * from tb_summary where f_key = ?`, [_key]);
    } else {
      rsSummary = await _dbHandlers.getRows(`select * from tb_summary`);
    }

    if (!rsSummary) return null;
  
    let summary = {};
  
    rsSummary.forEach((e)=>{
      let key = e.f_key;
      summary[key] = Number.isNaN(e.f_value)?e.f_value:Number(e.f_value);      
    })

    return summary;
  }  
} 
