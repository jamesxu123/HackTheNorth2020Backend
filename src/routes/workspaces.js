"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WorkspaceController_1 = __importDefault(require("../controllers/WorkspaceController"));
const sequelize_1 = require("../bin/sequelize");
const middleware_1 = __importDefault(require("../middleware"));
var express = require('express');
var router = express.Router();
router.post('/', middleware_1.default.requireJWT, async function (req, res, next) {
    const doc = await sequelize_1.User.findOne({ where: { username: req.body.username } });
    let result = await WorkspaceController_1.default.createWorkspace(req.body.name, doc, req.body.packages);
    res.send(result);
});
router.get('/:id', async function (req, res, next) {
    const doc = await sequelize_1.Workspace.findOne({ where: { id: req.params.id } });
    res.send({
        entries: await doc.getWorkspaceEntries(),
        workspace: doc
    });
});
router.patch('/workspaceentry/:id/thumbnail', async (req, res, next) => {
    try {
        const doc = await sequelize_1.WorkspaceEntry.findByPk(req.params.id);
        if (!doc) {
            res.status(404).send({ err: 'not found' });
            return;
        }
        await doc?.update({
            thumbnail: req.body.data
        });
        res.send({ err: false });
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ err: e });
    }
});
router.get('/workspaceentry/:id', async (req, res, next) => {
    try {
        const doc = await sequelize_1.WorkspaceEntry.findByPk(req.params.id);
        if (!doc) {
            res.status(404).send({ err: 'not found' });
            return;
        }
        res.send(doc);
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ err: e });
    }
});
router.post('/add_user/:workspaceId', middleware_1.default.requireJWT, async function (req, res, next) {
    const doc = await sequelize_1.Workspace.findOne({ where: { id: req.params.workspaceId } });
    const user = await sequelize_1.User.findOne({ where: { username: req.body.username } });
    res.send(await WorkspaceController_1.default.addUserToWorkspace(doc, user));
});
module.exports = router;
