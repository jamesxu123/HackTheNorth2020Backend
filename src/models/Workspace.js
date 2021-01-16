"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Workspace', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        packages: {
            type: DataTypes.JSONB
        }
    });
};
