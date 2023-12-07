
const dbHandler = require('../handlers/dbHandlers');
const miscHandlers = require('../handlers/miscHandlers');

const dashboard = async (req, res) => {

  let sumUserWallet = await dbHandler.getOneRow('select ifNull(sum(f_balance), 0) AS sumbalance from tb_wallet where f_useridx != 1');

  let sumLossIncome = await dbHandler.getOneRow('select f_balance from tb_wallet where f_useridx = 1');

  let sumInfo = await dbHandler.getSummary();

  return res.render('index', 
  {
    sumUserBalance: sumUserWallet['sumbalance'],
    sumLossIncome: sumLossIncome['f_balance'],
    sumInfo
  });
}

module.exports = dashboard;