const express = require('express');
const router = express.Router();
const authCtlr = require('../controllers/auth');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/login', authCtlr.login);

router.post('/login', catchErrors(authCtlr.procLogin));

router.get('/logout', authCtlr.logout);

module.exports = router;
