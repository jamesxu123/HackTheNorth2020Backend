import sequelize from "sequelize";

const generator = require('generate-password')

const {Workspace, WorkspaceEntry} = require('../bin/sequelize')

export interface ICreateWorkspace {
    err: boolean,
    data?: sequelize.Model
}

export default abstract class WorkspaceController {
    public static async createWorkspace(name: String, user: any): Promise<ICreateWorkspace> {
        let doc = await Workspace.findOne({where: {name: name}});
        if (doc) {
            return {
                err: true
            };
        }

        let result = await Workspace.create({
            name: name,
        })

        const port = 6969;

        const password = generator.generate({
            length: 8,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true
        })

        let entry = await WorkspaceEntry.create({
            port: port,
            password: password
        })

        await result.addUser(user)
        await user.addWorkspace(result)
        await entry.setUser(user)
        await entry.setWorkspace(result)
        await result.addWorkspaceEntry(entry)

        return {
            err: false,
            data: result
        };
    }
}
