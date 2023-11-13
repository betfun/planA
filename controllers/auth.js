const dbHandler = require('../handlers/dbHandlers');
const miscHandlers = require('../handlers/miscHandlers');
const cryptHandlers = require('../handlers/cryptHandlers');

exports.login = (req, res) => {

  let path = req.query.path;  
  if (!req.session && req.session.logined) {    
    return res.redirect('/');    
  } else {
    return res.render('auth/login', 
      {
        account: req.cookies['account'], 
        saveme: req.cookies['account'] ? 'checked' : '', path
      }
    );
  }
}

exports.logout = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.redirect('/auth/login');
    }
  });
}

exports.procLogin = async (req, res) => {
  //const { account, password, saveme } = req.body;

  const account = miscHandlers.getRequest(req.body.account, '');
  const password = miscHandlers.getRequest(req.body.password, '');

  let rst = {result:0, msg:''};

  try {

    if (!account || !password) {
      throw new Error('input your id or password');
    }

    const rsAdmin = await dbHandler.getOneRow('SELECT * FROM tb_user WHERE f_email = ? limit 1', [account]);
    
    if (!rsAdmin) {      
      throw new Error('No account with this email has been registered.');
    }

    const isMatch = await cryptHandlers.isMatchCrypto(password, rsAdmin.f_pwd);

    if (!isMatch) {
      throw new Error('Invalid credentials.');
    }

    
    let ipAddress = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || '';
    
    if (ipAddress.startsWith('::ffff:')) {ipAddress = ipAddress.substring(7)}    

    let refererSite = req.header("Referrer") || "";
    let userAgent = req.headers["user-agent"] ?
      req.headers["user-agent"] :
      "jest-test";    

    let param = [rsAdmin.idx, ipAddress, userAgent, refererSite];

    await dbHandler.exeQuery('insert into tb_user_log (f_userIdx, f_ip, f_userAgent, f_refererSite) values (?, ?, ?, ?)', param);

    req.session.logined = true;
    req.session.user_id = rsAdmin.idx;
    req.session.username = rsAdmin.f_name;
    req.session.email = rsAdmin.f_email;
    req.session.grade = rsAdmin.f_greade;
    req.session.auth = rsAdmin.f_auth;

    rst.result = 100;
  } catch (err) {    
    rst.msg = err.message;
    rst.result = rst.result||500;
  }

  res.json(rst);    
}