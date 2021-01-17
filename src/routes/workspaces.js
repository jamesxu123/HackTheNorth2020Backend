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
    if (result.err) {
        res.status(400).send(result);
        return;
    }
    res.send(result);
});
router.get('/:id', async function (req, res, next) {
    const doc = await sequelize_1.Workspace.findOne({ where: { id: req.params.id } });
    res.send({
        entries: await doc.getWorkspaceEntries(),
        workspace: doc
    });
});
router.get('/:id/users', async function (req, res, next) {
    const doc = await sequelize_1.Workspace.findOne({ where: { id: req.params.id } });
    res.send(await doc.getUsers());
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
        res.status(500).send({ err: e.toString() });
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
        res.status(500).send({ err: e.toString() });
    }
});
router.delete('/:id', async function (req, res, next) {
    try {
        const doc = await sequelize_1.Workspace.findByPk(req.params.id);
        if (!doc) {
            res.sendStatus(400);
            return;
        }
        const entries = await doc.getWorkspaceEntries();
        for (let i in entries) {
            await entries[i].destroy();
        }
        await doc?.destroy();
        res.sendStatus(200);
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ err: e.toString() });
    }
});
/**
 * body = {userId: ...}
 */
router.post('/remove_user/:workspaceId', async (req, res, next) => {
    try {
        const user = await sequelize_1.User.findByPk(req.body.userId);
        const workspace = await sequelize_1.Workspace.findByPk(req.params.workspaceId);
        const entries = await workspace.getWorkspaceEntries();
        let found = false;
        for (let i in entries) {
            const entry_user = await entries[i].getUser();
            console.log(entry_user.id);
            if (entry_user.id == req.body.userId) {
                await entries[i].destroy();
                found = true;
            }
        }
        await workspace.removeUser(user);
        await user.removeWorkspace(workspace);
        res.sendStatus(200);
    }
    catch (e) {
        console.log(e.toString());
        res.status(500).send({ err: e.toString() });
    }
});
router.post('/add_user/:workspaceId', middleware_1.default.requireJWT, async function (req, res, next) {
    const doc = await sequelize_1.Workspace.findOne({ where: { id: req.params.workspaceId } });
    const user = await sequelize_1.User.findOne({ where: { username: req.body.username } });
    res.send(await WorkspaceController_1.default.addUserToWorkspace(doc, user));
});
module.exports = router;
