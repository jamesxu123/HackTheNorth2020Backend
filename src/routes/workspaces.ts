import {NextFunction, Request, Response} from "express";
import WorkspaceController from "../controllers/WorkspaceController";
import {User, Workspace, WorkspaceEntry} from "../bin/sequelize";

var express = require('express');
var router = express.Router();


router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    const doc = await User.findOne({where: {username: req.body.username}});
    let result = await WorkspaceController.createWorkspace(req.body.name, doc, req.body.packages)
    res.send(result);
});

router.get('/:id', async function (req: Request, res: Response, next: NextFunction) {
    const doc = await Workspace.findOne({where: {id: req.params.id}});
    res.send({
        entries: await doc.getWorkspaceEntries(),
        workspace: doc
    })
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
        res.status(500).send({err: e})
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
        res.status(500).send({err: e})
    }

})
router.post('/add_user/:workspaceId', async function (req: Request, res: Response, next: NextFunction) {
    const doc = await Workspace.findOne({where: {id: req.params.workspaceId}});
    const user = await User.findOne({where: {username: req.body.username}});

    res.send(await WorkspaceController.addUserToWorkspace(doc, user))
});

module.exports = router
