"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("../bin/sequelize");
const axios_1 = __importDefault(require("axios"));
const generator = require('generate-password');
const randomip = require('random-ip');
const { Workspace, WorkspaceEntry } = require('../bin/sequelize');
class WorkspaceController {
    static async createWorkspace(name, user, packages) {
        let doc = await Workspace.findOne({ where: { name: name } });
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
            vmId: parseInt(ip.replace(/\D/g, ''))
        });
        await axios_1.default.post(`${this.baseUrl}/setup/`, {
            workspaceId: result.id,
            name: name,
            vmId: parseInt(ip.replace(/\D/g, '')),
            ip: ip
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        setTimeout(async () => {
            await this.addUserToWorkspace(result, user);
            await axios_1.default.post(`${this.baseUrl}/init/`, {
                packages: packages,
                ip: ip
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
        }, 30000);
        return {
            err: false,
            data: result
        };
    }
    static async getIP() {
        let ip = randomip('172.16.0.0', 24);
        let doc = Workspace.findOne({ where: { ip: ip } });
        while (!doc) {
            ip = randomip('172.16.0.0', 24);
            doc = Workspace.findOne({ where: { ip: ip } });
        }
        return ip;
    }
    static async addUserToWorkspace(workspace, user) {
        const port = await this.getPort();
        const password = generator.generate({
            length: 8,
            uppercase: true,
            lowercase: true,
            numbers: true,
        });
        let entry = await WorkspaceEntry.create({
            port: port,
            password: password
        });
        await sequelize_1.Port.create({ port: port });
        await workspace.addUser(user);
        await user.addWorkspace(workspace);
        await entry.setUser(user);
        await entry.setWorkspace(workspace);
        await workspace.addWorkspaceEntry(entry);
        await axios_1.default.post(`${this.baseUrl}/addUser/`, {
            ip: workspace.ip,
            user: user.username,
            port: port,
            password: password
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return entry;
    }
    static async getPort() {
        let port = Math.random() * 10000 + 50000;
        let count = await sequelize_1.Port.count({ where: { port: port } });
        let iter = 0;
        while (count > 0 && iter < 100000) {
            let port = Math.random() * 10000 + 50000;
            count = await sequelize_1.Port.count({ where: { port: port } });
            iter++;
        }
        return Math.round(port);
    }
    static async getUserEntryForWorkspace(workspaceId, userId) {
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
    static async getVncUrl(username, workspaceId) {
        const user = await sequelize_1.User.findOne({ where: { username: username } });
        const entry = await this.getUserEntryForWorkspace(workspaceId, user.id);
        return `${this.vncUrl}?port=${entry.port}&host=${this.vncHostUrl}&password=123abc&autoconnect=true&resize=remote`;
    }
}
exports.default = WorkspaceController;
WorkspaceController.baseUrl = 'http://ceres.host.412294.xyz:5000';
WorkspaceController.vncUrl = 'http://172.29.58.62:5000/vnc';
WorkspaceController.vncHostUrl = 'ceres.host.412294.xyz';
