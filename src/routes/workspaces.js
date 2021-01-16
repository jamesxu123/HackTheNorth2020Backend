"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WorkspaceController_1 = __importDefault(require("../controllers/WorkspaceController"));
const sequelize_1 = require("../bin/sequelize");
var express = require('express');
var router = express.Router();
router.post('/', async function (req, res, next) {
    const doc = await sequelize_1.User.findOne({ where: { username: req.body.username } });
    let result = await WorkspaceController_1.default.createWorkspace(req.body.name, doc);
    res.send(result);
});
router.get('/:id', async function (req, res, next) {
    const doc = await sequelize_1.Workspace.findOne({ where: { id: req.params.id } });
    res.send(await doc.getWorkspaceEntries());
});
module.exports = router;
