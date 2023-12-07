const express = require('express');
const router = express.Router();

const managementCtlr = require('../controllers/management');

const { catchErrors } = require('../handlers/errorHandlers');

router.get('/feeSetting', catchErrors(managementCtlr.feeSetting));

router.post('/setRollupFees', catchErrors(managementCtlr.setRollupFees));

router.post('/setSettingEachParam', catchErrors(managementCtlr.setSettingEachParam));

router.post('/setSettingParam', catchErrors(managementCtlr.setSettingParam));

module.exports = router;