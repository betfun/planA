const express = require('express');
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');

const adminController = require('../controllers')

router.get('/', catchErrors(adminController.dashboard));

module.exports = router;