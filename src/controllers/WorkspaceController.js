"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generator = require('generate-password');
const { Workspace, WorkspaceEntry } = require('../bin/sequelize');
class WorkspaceController {
    static async createWorkspace(name, user) {
        let doc = await Workspace.findOne({ where: { name: name } });
        if (doc) {
            return {
                err: true
            };
        }
        let result = await Workspace.create({
            name: name,
        });
        await this.addUserToWorkspace(result, user);
        return {
            err: false,
            data: result
        };
    }
    static async addUserToWorkspace(workspace, user) {
        const port = await this.getPort(workspace);
        const password = generator.generate({
            length: 8,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true
        });
        let entry = await WorkspaceEntry.create({
            port: port,
            password: password
        });
        await workspace.addUser(user);
        await user.addWorkspace(workspace);
        await entry.setUser(user);
        await entry.setWorkspace(workspace);
        await workspace.addWorkspaceEntry(entry);
    }
    static async getPort(workspace) {
        let port = Math.random() * 10000 + 50000;
        let entries = await workspace.getWorkspaceEntries();
        let valid = true;
        for (let i in entries) {
            if (entries[i][port] === port) {
                valid = false;
            }
        }
        let iter = 0;
        while (!valid && iter < 100000) {
            let port = Math.random() * 10000 + 50000;
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
exports.default = WorkspaceController;
