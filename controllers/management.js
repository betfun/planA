const dbHandler = require('../handlers/dbHandlers');
const miscHandlers = require('../handlers/miscHandlers');

exports.feeSetting = async (req, res) => {

  let setting = await dbHandler.getSetting();

  if (!setting) {
    return res.redirect('/logout');
  }

  return res.render('management/feeSetting', { 
    s_label : '수수료관련',
    setting
  });

}

exports.setRollupFees = async (req, res) => {

  miscHandlers.trimStringProperties(req.body);

  let {flevel, frollupfee} = req.body;

  let rst = {result:0, msg:''};

  try {
  
    if (!flevel || flevel.length == 0) throw new Error('잘못된 레벨입니다.');
    if (flevel.length != frollupfee.length) throw new Error('잘못된 레벨, 커미션 페어 입니다.');

    let setting = await dbHandler.getSetting();

    if (setting['trans.level'] != flevel.length) throw new Error('레벨 설정이 잘못되어 있습니다.');

    let sumrollupfee = frollupfee.reduce((_a, _b) => (Number(_a) + Number(_b)), 0);

    if (sumrollupfee != setting['trans.fee']) throw new Error(`롤업 커미션 합(${sumrollupfee})이 기준(${setting['trans.fee']})과 다릅니다.`);
        
    let trans = {};
    trans['rollupfee'] = {};

    flevel.forEach((e, i) => {      
      trans['rollupfee'][e] = Number(frollupfee[i]);
    });

    await dbHandler.exeQuery(`update tb_setting set f_value = ? where f_key = ?`, [JSON.stringify(trans['rollupfee']), 'trans.rollupfee']);

    rst.result = 100;
  } catch(err) {    
    rst.msg = err.message;
    rst.result = rst.result || 500;
  }

  res.json(rst);

}

exports.setSettingEachParam = async (req, res) => {
  miscHandlers.trimStringProperties(req.body);

  let key = miscHandlers.getRequest(req.body.key, '');
  let val = miscHandlers.getRequest(req.body.val, '');

  let rst = {result:0, msg:''};

  try {

    if (!key) throw new Error(`${key} 설정값이 없습니다.`);
    let setting = await dbHandler.getSetting(key);

    if (!setting) throw new Error(`${key} 설정값이 없습니다.`);

    await dbHandler.exeQuery(`update tb_setting set f_value = ? where f_key = ?`, [val, key]);

    rst.result = 100;
  } catch(err) {    
    rst.msg = err.message;
    rst.result = rst.result || 500;
  }    

  res.json(rst);
}

exports.setSettingParam = async (req, res) => {
  miscHandlers.trimStringProperties(req.body);

  let trans = {};
  trans['minUSDT'] = miscHandlers.getRequest(req.body['trans.minUSDT'], 0);

  let rst = {result:0, msg:''};

  try {

    for(let e of Object.keys(trans)) {
      await dbHandler.exeQuery(`update tb_setting set f_value = ? where f_key = ?`, [trans[e], `trans.${e}`]);
    }

    rst.result = 100;
  } catch(err) {    
    rst.msg = err.message;
    rst.result = rst.result || 500;
  }    

  res.json(rst);
}