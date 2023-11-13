
exports.isAuthorized = (req, res, next) => {  
  if (!req.session || !req.session.logined) {
    if (req.xhr) {
      return res.json({
        result:102, 
        msg:'This service requires authentication.',
        rUrl: `/auth/login`
      });
    } else {      
      return res.redirect(`/auth/login?path=${req.originalUrl}`);      
    }
  }

  next();
}

exports.getLoggedInfo = async (req, res, next) => {

  res.locals.username = req.session.username;

  next();
}
