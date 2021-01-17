const {Sequelize, DataTypes} = require('sequelize');
const fs = require('fs');
const UserModel = require('../models/User')
const WorkspaceModel = require('../models/Workspace')
const WorkspaceEntryModel = require('../models/WorkspaceEntry')
const PortModel = require('../models/Port')

const sequelize = new Sequelize('postgres://bilal:hackthenorth2020@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/oily-hare-188.defaultdb', {
    password: 'hackthenorth2020',
    dialectOptions: {
        ssl: {
            ca: fs.readFileSync('./src/certs/cc-ca.crt').toString()
        }
    }
})

try {
    sequelize.authenticate().then(() => console.log('Connection has been established successfully.'));

} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const User = UserModel(sequelize, DataTypes)
const Workspace = WorkspaceModel(sequelize, DataTypes)
const WorkspaceEntry = WorkspaceEntryModel(sequelize, DataTypes)
const Port = PortModel(sequelize, DataTypes)

User.belongsToMany(Workspace, {
    through: 'UserWorkspaces',
})
Workspace.hasMany(User)

WorkspaceEntry.belongsTo(Workspace)
Workspace.hasMany(WorkspaceEntry)
WorkspaceEntry.hasOne(User)

sequelize.sync()
    .then(() => {
        console.log(`Database & tables created!`)
    })
// User.sync({
//     force: true
// }).then(() => {
//     return User.bulkCreate([{
//         username: 'james',
//
//     },
//         {
//             username: 'david'
//         }
//     ])
// }).then(() => {
//     return User.findAll();
// }).then((accounts: any[]) => {
//     accounts.forEach(account => console.log(account.username))
// })

export {
    User,
    Workspace,
    WorkspaceEntry,
    Port
}
