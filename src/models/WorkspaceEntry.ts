import {Sequelize} from "sequelize";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define('WorkspaceEntry', {
        port: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        thumbnail: {
            type: DataTypes.STRING.BINARY
        }
    })
}
