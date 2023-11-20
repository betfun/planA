const express = require('express');
const router = express.Router();

const multer  = require('multer');
const upload = multer({ dest: process.env.UPLOAD_PATH });

const { catchErrors } = require('../handlers/errorHandlers');

const userCtlr = require('../controllers/user');

/**
 * User Info 
 */
router.post('/user/getUserInfo', catchErrors(userCtlr.getUserInfo));
router.post('/user/setUserInfo', upload.none(), catchErrors(userCtlr.setUserInfo));
router.post('/user/addUserInfo', upload.none(), catchErrors(userCtlr.addUserInfo));

module.exports = router;
