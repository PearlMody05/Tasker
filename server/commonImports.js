const express = require('express');
const {body,validationResult} = require('express-validator');
const User = require('../models/User');
module.exports = {
    express,
    router: express.Router(),
    body,
    validationResult,
    User
};