import sequelize from "sequelize";
import e from "express";
import {Port} from "../bin/sequelize";

const generator = require('generate-password')
const randomip = require('random-ip')

const {Workspace, WorkspaceEntry} = require('../bin/sequelize')

export interface ICreateWorkspace {
    err: boolean,
    errString?: String,
    data?: sequelize.Model
}

export default abstract class WorkspaceController {
    public static async createWorkspace(name: String, user: any, packages: String[]): Promise<ICreateWorkspace> {
        let doc = await Workspace.findOne({where: {name: name}});
        if (doc) {
            return {
                err: true,
                errString: "Already exists"
            };
        }
        const ip = await this.getIP();
        let result = await Workspace.create({
            name: name,
            ip: ip,
            packages: packages,
            vmId: parseInt(ip.replace(/\D/g,''))
        })

        await this.addUserToWorkspace(result, user)

        return {
            err: false,
            data: result
        };
    }

    private static async getIP() {
        let ip = randomip('172.16.0.0', 24)
        let doc = Workspace.findOne({where: {ip: ip}})

        while (!doc) {
            ip = randomip('172.16.0.0', 24)
            doc = Workspace.findOne({where: {ip: ip}})
        }

        return ip;
    }

    public static async addUserToWorkspace(workspace: any, user: any) {
        const port = await this.getPort();

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

        await Port.create({port: port})

        await workspace.addUser(user)
        await user.addWorkspace(workspace)
        await entry.setUser(user)
        await entry.setWorkspace(workspace)
        await workspace.addWorkspaceEntry(entry)

        return entry;
    }

    private static async getPort(): Promise<Number> {
        let port = Math.random() * 10_000 + 50_000;

        let count = await Port.count({where: {port: port}})

        let iter = 0;
        while (count > 0 && iter < 100_000) {
            let port = Math.random() * 10_000 + 50_000;
            count = await Port.count({where: {port: port}})
            iter++;
        }

        return Math.round(port);
    }

    public static async getUserEntryForWorkspace(workspaceId: String, userId: String) {
        const workspace = await Workspace.findByPk(workspaceId);
        const entries = await workspace.getWorkspaceEntries();

        for (let i in entries) {
            const doc = await entries[i].getUser();
            if (doc.id == userId) {
                return entries[i];
            }
        }

        return null;
    }
}
