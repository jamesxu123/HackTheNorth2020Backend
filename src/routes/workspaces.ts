import {NextFunction, Request, Response} from "express";
import WorkspaceController from "../controllers/WorkspaceController";
import {User, Workspace} from "../bin/sequelize";

var express = require('express');
var router = express.Router();


router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    const doc = await User.findOne({where: {username: req.body.username}});
    let result = await WorkspaceController.createWorkspace(req.body.name, doc)
    res.send(result);
});

router.get('/:id', async function (req: Request, res: Response, next: NextFunction) {
    const doc = await Workspace.findOne({where: {id: req.params.id}});
    res.send(await doc.getWorkspaceEntries())
});

module.exports = router
