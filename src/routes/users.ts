import e, {NextFunction, Request, Response} from "express";
import {Workspace, WorkspaceEntry} from "../bin/sequelize";
import WorkspaceController from "../controllers/WorkspaceController";
const bcrypt = require('bcrypt');
const {User} = require('../bin/sequelize');

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/login', function (req: Request, res: Response, next: NextFunction) {
    res.send('respond with a resource');
});

/**
 * @api {post} / Create user
 * @apiGroup users
 * @apiSuccess {String} username Username
 * @apiSuccess {String} password Password
 *
 * @apiSuccessExample {json} Success
 * {
      "id": "625033672234608401",
      "username": "jamesxu",
      "password": "$2b$10$w/YOLG6Pcb9RUHsy7bvG4e/Se5FVWjBlZudh4jBgESYVlKvbZSkda",
      "updatedAt": "2021-01-16T16:45:38.654Z",
      "createdAt": "2021-01-16T16:45:38.654Z",
      "WorkspaceId": null,
      "WorkspaceEntryId": null
    }
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const username = req.body.username;
    const doc = await User.findOne({where: {username: username}});
    if (doc == null) {
        let result = await User.create({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10)
        })
        res.send(result)
    } else {
        res.send({
            "error": "Account already exists"
        }).status(401)
    }
})

router.get('/workspaces', async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username;
    const doc = await User.findOne({where: {username: username}});
    const results = await doc.getWorkspaces();
    res.send(results)
})

router.get('/workspaces/:userId/:workspaceId/entry', async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const workspaceId = req.params.workspaceId;
    const entry = await WorkspaceController.getUserEntryForWorkspace(workspaceId, userId)
    if (entry) {
        res.send(entry)
    } else {
        res.sendStatus(500)
    }
})
module.exports = router;
