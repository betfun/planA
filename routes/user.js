const express = require('express');
const router = express.Router();

const userCtlr = require('../controllers/user');

const { catchErrors } = require('../handlers/errorHandlers');

router.get('/list', catchErrors(userCtlr.userList));

module.exports = router;