import {Sequelize} from "sequelize";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
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
    })
}
