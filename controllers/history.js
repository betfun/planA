const dbHandler = require('../handlers/dbHandlers');
const miscHandlers = require('../handlers/miscHandlers');
const paginationHandlers = require('../handlers/paginationHandlers');


exports.translist = async (req, res) => {

  miscHandlers.trimStringProperties(req.query);

  let query = req.query;

  let s_label = miscHandlers.getRequest(query.s_label, '전체');
  let s_key = miscHandlers.getRequest(query.s_key, 'f_email');
  let s_value = miscHandlers.getRequest(query.s_value);
  let s_group = miscHandlers.getRequest(query.s_group, '');

  let s_keyArray = {    
    'f_email': '이메일',
    'f_name': '이름',
    'f_address': '주소',
  }

  let s_quickArray = {
    'nothing': '선택',
    'latest1m': '최근1개월'
  }

  let s_statusArray = {
    '0': '전체',
    '1': '대기',
    '2': '전송중', 
    '3': '완료', 
    '4': '실패',
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
  let wheres = 'where A.f_type in (1, 2)';

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

    if (s_key == 'f_name') {

      let rsUser = await dbHandler.getUserInfo(s_value, 'f_name');

      if (rsUser) {
        wheres += ` AND (A.f_useridx = ?)`;          
        params = params.concat(rsUser.idx);
      } else {
        if (rsUser) {
          wheres += ` AND (A.f_useridx = ?)`;          
          params = params.concat(0);
        }        
      }

    } else if (s_key == 'f_email') {
      let rsUser = await dbHandler.getUserInfo(s_value, 'f_email');

      if (rsUser) {
        wheres += ` AND (A.f_useridx = ?)`;          
        params = params.concat(rsUser.idx);
      } else {
        if (rsUser) {
          wheres += ` AND (A.f_useridx = ?)`;          
          params = params.concat(0);
        }        
      }
    } 

  }

  let pname = req.originalUrl.split("?").shift();

  let rsAgg = await dbHandler.getOneRow(`SELECT COUNT(*) AS cnt FROM tb_trans_log A ${wheres}`, params);

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
      A.*, U.f_name, U.f_email
    From tb_trans_log A Left Join tb_user U on A.f_useridx = U.idx
    ${wheres} ${orders} LIMIT ?, ?`, params);

  return res.render('history/transactionlist', {    
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

exports.commslist = async (req, res) => {

  miscHandlers.trimStringProperties(req.query);

  let query = req.query;

  let s_label = miscHandlers.getRequest(query.s_label, '전체');
  let s_key = miscHandlers.getRequest(query.s_key, 'f_email');
  let s_value = miscHandlers.getRequest(query.s_value);
  let s_group = miscHandlers.getRequest(query.s_group, '');

  let s_keyArray = {    
    'f_email': '이메일',
    'f_name': '이름',
    'f_address': '주소',
  }

  let s_quickArray = {
    'nothing': '선택',
    'latest1m': '최근1개월'
  }

  let s_typeArray = {
    '0': '선택',
    '1': 'Ace입금',
    '2': '롤업'
  }

  let s_quick = miscHandlers.getRequest(query.s_quick, 'nothing');

  let s_page = miscHandlers.getRequest(query.s_page, 1);
  let s_pagecnt = miscHandlers.getRequest(query.s_pagecnt, 10);

  let s_type = miscHandlers.getRequest(query.s_type, 0);

  let s_sdate = miscHandlers.getRequest(query.s_sdate, '');
  let s_edate = miscHandlers.getRequest(query.s_edate, '');

  s_sdate = miscHandlers.formatDateTime(s_sdate, 'YYYY-MM-DD');
  s_edate = miscHandlers.formatDateTime(s_edate, 'YYYY-MM-DD');

  let s_order = miscHandlers.getRequest(query.s_order, 'A.idx');    
  let s_orderdir = miscHandlers.getRequest(query.s_orderdir, 'desc');

  let params = [];
  let wheres = 'where 1=1';

  if (s_type) {
    params.push(s_type);
    wheres += ' AND A.f_type = ?'
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

    if (s_key == 'f_name') {

      let rsUser = await dbHandler.getUserInfo(s_value, 'f_name');

      if (rsUser) {
        wheres += ` AND (A.f_useridx = ?)`;          
        params = params.concat(rsUser.idx);
      } else {
        if (rsUser) {
          wheres += ` AND (A.f_useridx = ?)`;          
          params = params.concat(0);
        }        
      }

    } else if (s_key == 'f_email') {
      let rsUser = await dbHandler.getUserInfo(s_value, 'f_email');

      if (rsUser) {
        wheres += ` AND (A.f_useridx = ?)`;          
        params = params.concat(rsUser.idx);
      } else {
        if (rsUser) {
          wheres += ` AND (A.f_useridx = ?)`;          
          params = params.concat(0);
        }        
      }
    } 

  }

  let pname = req.originalUrl.split("?").shift();

  let rsAgg = await dbHandler.getOneRow(`SELECT COUNT(*) AS cnt FROM tb_comms_log A ${wheres}`, params);

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
      A.*, U.f_name, U.f_email, R.f_name as f_refname, R.f_email as f_refemail
    From tb_comms_log A 
      Left Join tb_user U on A.f_useridx = U.idx
      Left Join tb_user R on A.f_refidx = R.idx
    ${wheres} ${orders} LIMIT ?, ?`, params);

  return res.render('history/commissionlist', {    
    s_type, s_typeArray,
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