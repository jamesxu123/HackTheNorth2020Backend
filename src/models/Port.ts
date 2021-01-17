import {Sequelize} from "sequelize";

module.exports = (sequelize: Sequelize, DataTypes: any) => {
    return sequelize.define('Port', {
        port: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['port']
            }
        ]
    })
}
