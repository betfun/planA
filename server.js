require('dotenv').config();

const app = require('./app');

app.set('host', process.env.HOST || '127.0.0.1');
app.set('port', process.env.PORT || '8002');

const debug = require('debug')(process.env.PKG_NAME+':server');
const http = require('http');
const https = require('https');

const serverHttp = http.createServer(app);

/*
const privateKey = fs.readFileSync(env.KEYFILE_PATH + '/aplan_biz.key', 'utf8');
const certificate = fs.readFileSync(env.KEYFILE_PATH + '/aplan_biz__crt.pem', 'utf8');
const ca = fs.readFileSync(env.KEYFILE_PATH + '/aplan_biz__ca.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};
const serverHttps = https.createServer(credentials, app);
*/

serverHttp.listen(app.get('port'), app.get('host'));

serverHttp.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  
  var bind = 'Port ' + app.get('port');

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }  
});

serverHttp.on('listening', () => {
  let addr = serverHttp.address();  
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : `${addr.address} port ${addr.port}` ;
  debug('Listening on ' + bind);    
});
