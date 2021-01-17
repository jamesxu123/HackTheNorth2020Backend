import {NextFunction, Request, Response} from "express";
import WorkspaceController from "../controllers/WorkspaceController";
import {User, Workspace, WorkspaceEntry} from "../bin/sequelize";
import Middleware from "../middleware";

var express = require('express');
var router = express.Router();


router.post('/', Middleware.requireJWT, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const doc = await User.findOne({where: {username: req.body.username}});
        let result = await WorkspaceController.createWorkspace(req.body.name, doc, req.body.packages)
        if (result.err) {
            res.status(400).send(result);
            return;
        }
        res.send(result);
    } catch (e) {
        console.log(e)
        res.status(500).send({err: e.toString()})
    }
});

router.get('/:id', async function (req: Request, res: Response, next: NextFunction) {
    const doc = await Workspace.findOne({where: {id: req.params.id}});
    res.send({
        entries: await doc.getWorkspaceEntries(),
        workspace: doc
    })
});

router.get('/:id/users', async function (req: Request, res: Response, next: NextFunction) {
    const doc = await Workspace.findOne({where: {id: req.params.id}});
    res.send(await doc.getUsers())
});

router.patch('/workspaceentry/:id/thumbnail', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await WorkspaceEntry.findByPk(req.params.id);
        if (!doc) {
            res.status(404).send({err: 'not found'})
            return;
        }
        await doc?.update({
            thumbnail: req.body.data
        })
        res.send({err: false})
    } catch (e) {
        console.log(e)
        res.status(500).send({err: e.toString()})
    }

})

router.get('/workspaceentry/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await WorkspaceEntry.findByPk(req.params.id);
        if (!doc) {
            res.status(404).send({err: 'not found'})
            return;
        }
        res.send(doc)
    } catch (e) {
        console.log(e)
        res.status(500).send({err: e.toString()})
    }

})

router.delete('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const doc = await Workspace.findByPk(req.params.id);
        if (!doc) {
            res.sendStatus(400);
            return;
        }
        const entries = await doc.getWorkspaceEntries();
        for (let i in entries) {
            await entries[i].destroy();
        }
        await doc?.destroy();
        res.sendStatus(200)
    } catch (e) {
        console.log(e)
        res.status(500).send({err: e.toString()})
    }
});
/**
 * body = {userId: ...}
 */
router.post('/remove_user/:workspaceId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findByPk(req.body.userId);
        const workspace = await Workspace.findByPk(req.params.workspaceId)

        const entries = await workspace.getWorkspaceEntries();
        let found = false;
        for (let i in entries) {
            const entry_user = await entries[i].getUser();
            console.log(entry_user.id)
            if (entry_user.id == req.body.userId) {
                await entries[i].destroy();
                found = true;
            }
        }

        await workspace.removeUser(user);
        await user.removeWorkspace(workspace);
        res.sendStatus(200)
    } catch (e) {
        console.log(e.toString())
        res.status(500).send({err: e.toString()})
    }
})

router.post('/add_user/:workspaceId', Middleware.requireJWT, async function (req: Request, res: Response, next: NextFunction) {
    try {
        const doc = await Workspace.findOne({where: {id: req.params.workspaceId}});
        const user = await User.findOne({where: {username: req.body.username}});
        const result = await WorkspaceController.addUserToWorkspace(doc, user)
        res.send(result)
    } catch (e) {
        console.log(e.toString())
        res.status(500).send({err: e.toString()})
    }
});

module.exports = router
