import {NextFunction, Request, Response} from "express";

const jwt = require('jsonwebtoken')

export default abstract class Middleware {
    public static async requireJWT(req: Request, res: Response, next: NextFunction) {
        if (!req.headers['x-access-token']) {
            res.sendStatus(401)
            return;
        }

        const result = await jwt.verify(req.headers['x-access-token'], 'hackthenorth2020')

        if (!result) {
            res.sendStatus(401)
            return;
        }

        next()
    }
}
