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

        await this.addUserToWorkspace(result, user)

        return {
            err: false,
            data: result
        };
    }

    public static async addUserToWorkspace(workspace: any, user: any) {
        const port = await this.getPort(workspace);

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

        await workspace.addUser(user)
        await user.addWorkspace(workspace)
        await entry.setUser(user)
        await entry.setWorkspace(workspace)
        await workspace.addWorkspaceEntry(entry)
    }

    private static async getPort(workspace: any): Promise<Number> {
        let port = Math.random() * 10_000 + 50_000;

        let entries = await workspace.getWorkspaceEntries();
        let valid = true;
        for (let i in entries) {
            if (entries[i][port] === port) {
                valid = false;
            }
        }
        let iter = 0;
        while (!valid && iter < 100_000) {
            let port = Math.random() * 10_000 + 50_000;
            let valid = true;
            for (let i in entries) {
                if (entries[i][port] === port) {
                    valid = false;
                }
            }
            iter++;
        }

        return Math.round(port);
    }
}
