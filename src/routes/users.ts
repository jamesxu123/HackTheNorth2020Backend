import e, {NextFunction, Request, Response} from "express";
import {Workspace, WorkspaceEntry} from "../bin/sequelize";
import WorkspaceController from "../controllers/WorkspaceController";
import Middleware from "../middleware";

const bcrypt = require('bcrypt');
const {User} = require('../bin/sequelize');
const jwt = require('jsonwebtoken')

var express = require('express');
var router = express.Router();

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
        const token = jwt.sign(result.toJSON(), 'hackthenorth2020')
        res.send({token: token})
    } else {
        res.send({
            "error": "Account already exists"
        }).status(401)
    }
})

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.sendStatus(400)
        return;
    }

    const doc = await User.findOne({where: {username: username}});

    if (!doc) {
        res.sendStatus(401)
        return;
    }

    const hash = doc.password;

    const result = await bcrypt.compare(password, hash);

    console.log(result)

    if (result) {
        const token = jwt.sign(doc.toJSON(), 'hackthenorth2020')
        console.log(token)
        res.send({token: token})
    } else {
        res.send('ERROR').status(401)
    }
})

router.get('/workspaces', Middleware.requireJWT, async (req: Request, res: Response, next: NextFunction) => {
    const username = req.query.username;
    const doc = await User.findOne({where: {username: username}});
    const results = await doc.getWorkspaces();
    res.send(results)
})

router.get('/workspaces/:userId/:workspaceId/entry', Middleware.requireJWT, async (req: Request, res: Response, next: NextFunction) => {
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
