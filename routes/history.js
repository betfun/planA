const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');

const historyCtlr = require('../controllers/history');

const multer = require('multer');
const upload = multer({dest: process.env.UPLOAD_PATH+'/temp'});

router.get('/translist', catchErrors(historyCtlr.translist));

router.get('/commslist', catchErrors(historyCtlr.commslist));

module.exports = router;