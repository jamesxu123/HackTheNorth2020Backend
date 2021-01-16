import {Sequelize} from "sequelize";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
}
