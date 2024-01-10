const dbHandler = require('../handlers/dbHandlers');
const miscHandlers = require('../handlers/miscHandlers');
const paginationHandlers = require('../handlers/paginationHandlers');
const cryptHandlers = require('../handlers/cryptHandlers');
const excelHandler = require('../handlers/excelHandlers');

exports.userList = async (req, res) => {

  miscHandlers.trimStringProperties(req.query);

  let query = req.query;

  let s_label = miscHandlers.getRequest(query.s_label, '전체');
  let s_key = miscHandlers.getRequest(query.s_key, 'all');
  let s_value = miscHandlers.getRequest(query.s_value);
  let s_group = miscHandlers.getRequest(query.s_group, '');

  let s_keyArray = {
    'all': '모두',
    'f_name': '이름',
    'f_email': '이메일',
  }

  let s_quickArray = {
    'nothing': '선택',
    'latest1m': '최근1개월'
  }

  let s_statusArray = {
    '0': '전체',
    '1': '미등록',
    '2': '정상', 
    '3': '비활성', 
    '9': '삭제',
  }

  let s_quick = miscHandlers.getRequest(query.s_quick, 'nothing');

  let s_page = miscHandlers.getRequest(query.s_page, 1);
  let s_pagecnt = miscHandlers.getRequest(query.s_pagecnt, 10);

  let s_status = miscHandlers.getRequest(query.s_status, 0);

  let s_sdate = miscHandlers.getRequest(query.s_sdate, '');
  let s_edate = miscHandlers.getRequest(query.s_edate, '');

  s_sdate = miscHandlers.formatDateTime(s_sdate, 'YYYY-MM-DD');
  s_edate = miscHandlers.formatDateTime(s_edate, 'YYYY-MM-DD');

  let s_order = miscHandlers.getRequest(query.s_order, 'A.idx');    
  let s_orderdir = miscHandlers.getRequest(query.s_orderdir, 'desc');

  let params = [];
  let wheres = 'where 1=1';

  if (s_status) {
    params.push(s_status);
    wheres += ' AND A.f_status = ?'
  }

  if (s_quick == 'latest1m') {
    s_sdate = moment().add(-1, 'M').format('YYYY-MM-DD');
    s_edate = moment().format('YYYY-MM-DD');
  }

  if (s_sdate && s_edate) {      
    wheres += ' AND DATE(A.f_regAt) BETWEEN ? AND ?';
    params = params.concat([s_sdate, s_edate]);
  } else if (s_sdate) {
    wheres += ' AND A.f_regAt >= ? ';
    params = params.concat([s_sdate]);      
  } else if (s_edate) {
    wheres += ' AND A.f_regAt <= ? ';
    params = params.concat([s_edate]);      
  }

  if (s_value) {      

    if (s_key == 'all') {
      wheres += ` AND (A.f_name LIKE ? OR A.f_email LIKE ?)`;        
      params = params.concat([`%${s_value}%`, `%${s_value}%`]);
    } else if (s_key == 'f_name') {
      wheres += ` AND (A.f_name LIKE ?)`;        
      params = params.concat([`%${s_value}%`]);
    } else if (s_key == 'f_email') {
      wheres += ` AND (A.f_email LIKE ?)`;        
      params = params.concat([`%${s_value}%`]);      
    } 

  }

  let pname = req.originalUrl.split("?").shift();

  let rsAgg = await dbHandler.getOneRow(`SELECT COUNT(*) AS cnt FROM tb_user A ${wheres}`, params);

  //pagination 
  let pagination = new paginationHandlers({
    base_url: pname,
    page_rows: s_pagecnt,
    page: s_page, 
    total_rows: rsAgg['cnt'],
    display_prev10next10: true,
    classname: 'pagination-sm justify-content-end',      
  });
  let pagescript = pagination.build();
  
  orders = ` ORDER BY ${s_order} ${s_orderdir} `;    
    
  params = params.concat([pagination.startnum, pagination.page_rows]);

  let list = await dbHandler.getRows(`
    Select 
      A.*, W.f_balance, f_token, R.f_email as f_referralemail
    From tb_user A 
      Left Join tb_wallet W on A.idx = W.f_useridx 
      Left Join tb_user R on A.f_referral = R.idx
    ${wheres} ${orders} LIMIT ?, ?`, params);

  return res.render('user/list', { 
    s_label,
    s_status, s_statusArray,
    s_key, s_value, s_keyArray,
    s_page, s_pagecnt,
    s_sdate, s_edate,      
    s_quick, s_quickArray,
    s_order, s_orderdir,    
    totalcnt: rsAgg['cnt'],
    list: list,
    pagination: pagescript,
    pagesnum: pagination.startnum+1,
    pageenum: pagination.startnum + pagination.page_rows,
    s_pageArray: pagination.aRowLength,    
  });  
}

exports.getUserInfo = async (req, res) => {

  let useridx = miscHandlers.getRequest(req.body.useridx, 0);

  let rst = {result:0, msg:'', data:null};

  try {

    if (!useridx) {      
      throw new Error('잘못된 요청입니다.')
    }

    let rsUser = await dbHandler.getUserInfo(useridx);

    if (!rsUser) {      
      throw new Error('회원정보를 찾을 수 없습니다.')
    }

    rst.data = rsUser;
    rst.result = 100;

  } catch (err) {    

    rst.msg = err.message;
    rst.result = rst.result||500;

  } 

  return res.json(rst);
};

exports.setUserInfo = async (req, res) => {
  
  miscHandlers.trimStringProperties(req.body);

  let useridx = miscHandlers.getRequest(req.body.useridx, 0);
  let f_email = miscHandlers.getRequest(req.body.f_email);
  let f_name = miscHandlers.getRequest(req.body.f_name);
  let f_token = miscHandlers.getRequest(req.body.f_token);
  let f_tnetwork = miscHandlers.getRequest(req.body.f_tnetwork);
  let f_taddress = miscHandlers.getRequest(req.body.f_taddress);
  let password = miscHandlers.getRequest(req.body.password);
  let f_referralemail = miscHandlers.getRequest(req.body.f_referralemail);

  let f_status = miscHandlers.getRequest(req.body.f_status, 0);

  let f_memo = miscHandlers.getRequest(req.body.f_memo, '');

  let param = [f_name, f_memo];

  let rst = {result:0, msg:''};

  let conn = null;

  try {

    if (!useridx) throw new Error('잘못된 요청입니다.');
    if (!f_email) throw new Error('이메일을 입력해주세요');

    let password_query = '';    
    let status_query = '';

    if (password) {
      let crypto = await cryptHandlers.genHash(password);      
      param.push(crypto);
      password_query = ', f_pwd = ? '
    }

    conn = await dbHandler.getConnection();

    let user = await dbHandler.getUserInfo(useridx);
    
    if (!user) {
      rst.result = 301;
      throw new Error('해당 계정을 찾을 수 없습니다.');
    }

    user.f_referralemail = user.f_referralemail ?? '';

    await dbHandler.beginTransaction(conn);

    if (f_referralemail != user.f_referralemail) {      

      let rsSubNodes = await dbHandler.getUserSubNodes(user.idx, 'count(*) as cnt');
        
      if (rsSubNodes['cnt'] > 0) throw new Error('하위 노드가 존재하는 계정은 추천인 변경이 불가능 합니다.');      
      
      if (f_referralemail) {

        if (f_referralemail == user.f_email) throw new Error('회원 본인은 추천인은 될수 없습니다.');

        let rsNode = await dbHandler.getNode(user.idx);

        if (rsNode ) {
          if (rsNode['f_level'] == 0) throw new Error('최상위 노드는 추천인 등록이 불가능합니다.');
        }

        let rsRef = await dbHandler.getUserInfo(f_referralemail, 'f_email');

        if (!rsRef) throw new Error(`변경할 추천인(${f_referralemail})을 찾을 수 없습니다.`);

        let rsParentNodes = await dbHandler.getNode(rsRef.idx);

        if (!rsParentNodes) throw new Error('추천인이 아직 계보도에 등록되어 있지않습니다.');

        param.push(rsRef.idx);
        status_query += ', f_referral = ? ';

        let f_node = rsParentNodes['f_node'];

        if (user.f_referralemail) {        
          await dbHandler.exeQueryConn(conn, `update tb_node set f_useridx = ?, f_level = ?, f_node = ?, f_pIdx = ?, f_invtIdx = ? where f_useridx = ?`, 
            [user.idx, rsParentNodes['f_level']+1, `:${user.idx}${f_node}`, rsRef.idx, rsRef.idx, user.idx]);

          let rsOldParentNodes = await dbHandler.getNode(user.f_referral);      
                    
          if (rsOldParentNodes) await dbHandler.setReduceInvtSubNodeCount(conn, user.f_referral, rsOldParentNodes['f_node']);
        } else {
          await dbHandler.exeQueryConn(conn, `insert into tb_node (f_useridx, f_level, f_node, f_pIdx, f_invtIdx) values (?, ?, ?, ?, ?)`, 
            [user.idx, rsParentNodes['f_level']+1, `:${user.idx}${f_node}`, rsRef.idx, rsRef.idx]);

            param.push('2');
            status_query += ', f_status = ? '    
        }

        await dbHandler.setAddInvtSubNodeCount(conn, rsRef.idx, f_node);

      } else if (!f_referralemail && user.f_referralemail) {

        status_query += ', f_referral = NULL ';
        
        await dbHandler.exeQueryConn(conn, 'delete from tb_node where f_useridx = ?', [user.idx]);

        param.push('1');
        status_query += ', f_status = ? '

        let rsOldParentNodes = await dbHandler.getNode(user.f_referral);      
                    
        if (rsOldParentNodes) await dbHandler.setReduceInvtSubNodeCount(conn, user.f_referral, rsOldParentNodes['f_node']);
      }
      
    } else if (f_status) {

      if (user.f_referralemail && f_status == 1) throw new Error('계보도에 등록된 계정은 미등록 상태로 변경이 불가능 합니다.');

      if (!user.f_referralemail && f_status != 1) throw new Error('계보도에 미등록된 계정은 미등록 상태에서 변경이 불가능 합니다.');

      param.push(f_status);
      status_query += ', f_status = ? '
      
    } 
    
    param.push(useridx);    

    await dbHandler.exeQueryConn(conn, `
      Update tb_user 
      Set f_name = ?, f_memo = ? ${password_query} ${status_query} 
      Where idx = ?`, param);

    await dbHandler.exeQueryConn(conn, `
      Update tb_wallet 
      Set f_taddress = ? 
      Where f_useridx =?`, [f_taddress, useridx])

    rst.result = 100;

    await dbHandler.commit(conn);

  } catch (err) {
    rst.msg = err.message;
    rst.result = rst.result||500;

    await dbHandler.rollback(conn);

  } finally {
    dbHandler.releaseConnection(conn);
  }

  res.json(rst);
}

exports.addUserInfo = async (req, res) => {

  miscHandlers.trimStringProperties(req.body);

  let f_email = miscHandlers.getRequest(req.body.f_email);
  let f_name = miscHandlers.getRequest(req.body.f_name);
  let f_token = 'USDT';
  let f_tnetwork = 'TRC20';
  let f_taddress = miscHandlers.getRequest(req.body.f_taddress);
  let password = miscHandlers.getRequest(req.body.password);

  let f_status = miscHandlers.getRequest(req.body.f_status, 0);

  let f_memo = miscHandlers.getRequest(req.body.f_memo, '');
 
  let rst = {result:0, msg:''};
  let conn = null;

  try {

    if (!f_email) throw new Error('이메일을 입력해주세요.');
    if (!password) throw new Error('비밀번호를 입력해주세요.');

    let f_pwd = await cryptHandlers.genHash(password);      

    let user = await dbHandler.getUserInfo(f_email, 'f_email');
    
    if (user) {
      rst.result = 301;
      throw new Error('이메일이 사용중입니다.');
    }

    conn = await dbHandler.getConnection();

    await dbHandler.beginTransaction(conn);

    let rs = await dbHandler.exeQueryConn(conn, `
      Insert Into tb_user 
        (f_email, f_pwd, f_name, f_status, f_memo) 
      Values 
        (?, ?, ?, ?, ?, ?)`, 
      [f_email, f_pwd, f_name, f_status, f_memo]
    );

    let useridx = rs[0].insertId;

    await dbHandler.exeQueryConn(conn, `
      Insert Into tb_wallet 
        (f_useridx, f_taddress, f_token, f_tnetwork)
      Values
        (?, ?, ?, ?)`, 
      [useridx, f_taddress, f_token, f_tnetwork]
    );

    await dbHandler.commit(conn);

    rst.result = 100;

  } catch (err) {    

    await dbHandler.rollback(conn);

    rst.msg = err.message;
    rst.result = rst.result||500;
  } finally {
    dbHandler.releaseConnection(conn);
  }

  res.json(rst);
}

exports.addUserExcel = async (req, res) => {
  miscHandlers.trimStringProperties(req.query);

  return res.render('user/addUserExcel');
}

exports.importNewAccountExcel = async (req, res) => {

  const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file
  const { name } = req.body;   

  let rst = {result: 0, data: null, filepath: null}

  try {

    let data = excelHandler.parseCSV_AccountList(path);
    
    if (!data) throw new Error('읽을 수 없는 형식입니다.');
    
    for(let el of data) {
    
      let rst = await dbHandler.getOneRow(`select * from tb_user where f_email = ? limit 1`, [el.referral]);
      
      el.chkref = rst?1:0;
      el.chkref_status = rst?rst.f_status:0;
      el.referralIdx = rst?rst.idx:0;

      rst = await dbHandler.getOneRow(`select count(*) as cnt from tb_user where f_email = ?`, [el.account]);

      el.chkaccount = rst.cnt;

    }
    
    rst.data = data;
    rst.filepath = path;

    rst.result = 100;
  } catch (err) {
    rst.result = rst.result || 500;
    rst.msg = err.message;      
  }  
    
  res.json(rst);
}

exports.processNewAccountExcel = async (req, res) => {

  let rst = {result: 0, data: null, msg:''}

  let rstAccount = miscHandlers.getRequest(req.body.rstExcel, []);
  
  let conn = null;

  try {
    
    if (!rstAccount || rstAccount.length == 0) throw new Error('등록할 신규 계정정보가 없습니다.');

    conn = await dbHandler.getConnection();

    await dbHandler.beginTransaction(conn);
    
    for(let e of rstAccount) {

      let pwd = '$2b$10$040000';
      let f_status = e.referralIdx?2:1;
      let f_referral = e.referralIdx??0;

      let params = {
        f_email: e.account, 
        f_pwd: pwd, 
        f_name: e.name, 
        f_status: f_status
      }

      if (f_referral) params['f_referral'] = e.referralIdx;
      if (e.regat) params['f_regAt'] = e.regat;

      let rs = await dbHandler.exeInsertConn(conn, 'tb_user', params);

      let useridx = rs[0].insertId;

      params = {
        f_useridx: useridx,
      }

      await dbHandler.exeInsertConn(conn, 'tb_wallet', params);

      let rsParentNodes = await dbHandler.getNode(e.referralIdx);

      if (!rsParentNodes) throw new Error('알수없는 추천인이 있습니다.');

      let f_node = rsParentNodes['f_node'];

      params = {
        f_useridx: useridx, 
        f_level: rsParentNodes['f_level']+1, 
        f_node: `:${useridx}${f_node}`, 
        f_pIdx: e.referralIdx, 
        f_invtIdx: e.referralIdx
      }

      await dbHandler.exeInsertConn(conn, 'tb_node', params);
        
      await dbHandler.setAddInvtSubNodeCount(conn, e.referralIdx, f_node);
    }

    await dbHandler.commit(conn);    
    rst.result = 100;    
  } catch (err) {
    console.log(err);
    await dbHandler.rollback(conn);
    rst.result = rst.result || 500;
    rst.msg = err.message;    
  } finally {
    dbHandler.releaseConnection(conn); 
  }


  res.json(rst);
}


exports.regCommission = async (req, res) => {
  miscHandlers.trimStringProperties(req.query);

  return res.render('user/regCommission');
}

exports.importCommissionExcel = async (req, res) => {

  const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file
  const { name } = req.body;   

  let rst = {result: 0, data: null, filepath: null}

  try {

    let data = excelHandler.parseCSV_CommissionList(path);
    
    if (!data) throw new Error('읽을 수 없는 형식입니다.');
    
    for(let el of data) {
    
      let rsUser = await dbHandler.getUserInfo(el.account, 'f_email');
     
      if (rsUser) {
        el.name = rsUser.f_name;
        el.chkaccount = 1;      
        el.referral = rsUser.f_referralemail;
        el.f_referral = rsUser.f_referral;
        el.chkref = rsUser.f_referral?1:0;
        el.chkref_status = rsUser.f_referral;

      } else {
        el.name = '';
        el.chkaccount = 0;
        el.referral = '';
        el.f_referral = '';
        el.chkref = 0;
        el.chkref_status = 1;
      }

    }
    
    rst.data = data;
    rst.filepath = path;

    rst.result = 100;
  } catch (err) {
    rst.result = rst.result || 500;
    rst.msg = err.message;      
  }  
    
  res.json(rst);
}

exports.processCommissionExcel = async (req, res) => {

  let rst = {result: 0, data: null, msg:''}

  let rstComms = miscHandlers.getRequest(req.body.rstExcel, []);
  
  let conn = null;

  try {
    
    if (!rstComms || rstComms.length == 0) throw new Error('등록할 커미션내역이 없습니다.');

    conn = await dbHandler.getConnection();

    await dbHandler.beginTransaction(conn);
    
    for(let e of rstComms) {

      let rsUser = await dbHandler.getUserInfoConn(conn, e.account, 'f_email');

      if (!rsUser) throw new Error(`${e.account} 알수없는 회원입니다`);

      let rsTransSetting = await dbHandler.getSetting('trans%', true);

      let rollupFee = rsTransSetting['trans.rollupfee'];
      let sumfee = rsTransSetting['trans.fee'];
      let feeLength = rsTransSetting['trans.level'];

      /** Ace 커미션 등록 */
      let params = {
        f_type: 1,
        f_useridx: rsUser.idx,
        f_amount: e.amount,
        f_feerate: sumfee,
      }

      if (e['regat']) params['f_regAt'] = miscHandlers.getUtcTime(e['regat']);

      let rsIns = await dbHandler.exeInsertConn(conn, 'tb_comms_log', params);

      let pidx = rsIns[0].insertId;

      let rsNode = await dbHandler.getNode(rsUser.f_referral);

      if (!rsNode) throw new Error(`${e.account} 추천인 정보가 없습니다`);

      let nodes = rsNode['f_node'].split(':').filter((e)=>!!e);

      if (nodes.length == 0) throw new Error(`${e.account} 잘못된 계보정보입니다`);
      
      let usedfee = 0;

      for(let i = 0; i < nodes.length && i < feeLength; i++) {
        let lv = i+1;
        let fee = rollupFee[lv]??0;
        let amount = miscHandlers.getRoundNumber(fee / sumfee, 2);

        usedfee += fee;

        if (nodes.length != feeLength && i+1 == nodes.length) {
          fee = fee + (sumfee - usedfee);
          amount = miscHandlers.getRoundNumber(fee / sumfee, 2);
        }

        params = {
          f_type : 2,
          f_useridx: rsUser.idx,
          f_amount: e.amount * amount,
          f_feerate: fee,
          f_refidx: nodes[i],
          f_pidx: pidx
        }

        if (e['regat']) params['f_regAt'] = miscHandlers.getUtcTime(e['regat']);

        await dbHandler.exeInsertConn(conn, 'tb_comms_log', params);
      }

    }

    await dbHandler.commit(conn);    
    rst.result = 100;    
  } catch (err) {
    console.log(err);
    await dbHandler.rollback(conn);
    rst.result = rst.result || 500;
    rst.msg = err.message;    
  } finally {
    dbHandler.releaseConnection(conn); 
  }


  res.json(rst);
}
