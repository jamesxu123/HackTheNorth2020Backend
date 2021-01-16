"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
const { User } = require('../bin/sequelize');
var express = require('express');
var router = express.Router();
/* GET users listing. */
router.post('/login', function (req, res, next) {
    res.send('respond with a resource');
});
router.post('/', async (req, res, next) => {
    const username = req.body.username;
    const doc = await User.findOne({ where: { username: username } });
    if (doc == null) {
        let result = await User.create({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10)
        });
        res.send(result);
    }
    else {
        res.send({
            "error": "Account already exists"
        }).status(401);
    }
});
router.get('/workspaces', async (req, res, next) => {
    const username = req.query.username;
    const doc = await User.findOne({ where: { username: username } });
    const results = await doc.getWorkspaces();
    res.send(results);
});
module.exports = router;
