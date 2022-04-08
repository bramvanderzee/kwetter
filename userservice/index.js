var express = require('express');
var Sequelize = require('sequelize');
var app = express();
const { Op, DataTypes } = Sequelize;
var PORT = process.env.PORT || 5000;
var DB_NAME = process.env.DB_NAME || 'userdb';
var DB_USER = process.env.DB_USER || 'root';
var DB_PASS = process.env.DB_PASS || 'root';
var DB_HOST = process.env.DB_HOST || 'userdb';
var DB_PORT = process.env.DB_PORT || '3305';

const DISABLE_SEQ_DEFAULTS = {
    timestamps: true,
    freezeTableName: true,
}

const sequalize = new Sequelize({
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
});

const User = sequalize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
}, DISABLE_SEQ_DEFAULTS);

app.use(express.json());
app.listen(PORT, function() {
    console.log('Connecting to database...');
    User.sync({ alter: true });
    console.log('UserService listening on port', PORT);
});

app.get('/user/:id', (req, res, next) => {
    User.findAll({ where: { id: req.params.id } })
        .then(users => {
            if (users.length > 0) {
                res.send(JSON.stringify(users[0]));
            } else {
                res.send('User not found', 404);
            }
        });
});

app.post('/user', (req, res, next) => {
    User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        .then(user => {
            res.send(JSON.stringify(user));
        });
});