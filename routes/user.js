const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');

const userCtlr = require('../controllers/user');

const multer = require('multer');
const upload = multer({dest: process.env.UPLOAD_PATH+'/temp'});

router.get('/list', catchErrors(userCtlr.userList));

router.get('/addUserExcel', catchErrors(userCtlr.addUserExcel));

router.post('/importNewAccountExcel', upload.single('csv'), catchErrors(userCtlr.importNewAccountExcel));

router.post('/processNewAccountExcel', catchErrors(userCtlr.processNewAccountExcel));

router.get('/regCommission', catchErrors(userCtlr.regCommission));

router.post('/importCommissionExcel', upload.single('csv'), catchErrors(userCtlr.importCommissionExcel));

router.post('/processCommissionExcel', catchErrors(userCtlr.processCommissionExcel));

module.exports = router;