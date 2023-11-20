const dbHandler = require('../handlers/dbHandlers');
const miscHandlers = require('../handlers/miscHandlers');
const paginationHandlers = require('../handlers/paginationHandlers');
const cryptHandlers = require('../handlers/cryptHandlers');

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
      Left Join tb_user R on R.f_referral = A.idx
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

  let f_status = miscHandlers.getRequest(req.body.f_status, 0);

  let f_memo = miscHandlers.getRequest(req.body.f_memo, '');

  let param = [f_name, f_memo];

  let rst = {result:0, msg:''};

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

    if (f_status) {
      param.push(f_status);
      status_query = ', f_status = ? '
    } 

    param.push(useridx);    

    let user = await dbHandler.getUserInfo(useridx);
    
    if (!user) {
      rst.result = 301;
      throw new Error('해당 계정을 찾을 수 없습니다.');
    }

    await dbHandler.exeQuery(`
      Update tb_user 
      Set f_name = ?, f_memo = ? ${password_query} ${status_query} 
      Where idx = ?`, param);

    await dbHandler.exeQuery(`
      Update tb_wallet 
      Set f_taddress = ? 
      Where f_useridx =?`, [f_taddress, useridx])

    rst.result = 100;
  } catch (err) {    

    rst.msg = err.message;
    rst.result = rst.result||500;

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

    let rs = await dbHandler.exeQueryConn(conn, `
      Insert Into tb_user 
        (f_email, f_pwd, f_name, f_status, f_memo, f_regAt) 
      Values 
        (?, ?, ?, ?, ?, ?)`, 
      [f_email, f_pwd, f_name, f_status, f_memo, miscHandlers.getNow()]
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