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

function checkExists(id) {
    return User.count({ where: { id: id } })
        .then(count => {
            return count > 0;
        });
};

app.use(express.json());
app.listen(PORT, function() {
    console.log('Connecting to database...');
    User.sync({ alter: true });
    console.log('UserService listening on port', PORT);
});

app.get('/user/:id', (req, res, next) => {
    if (checkExists(req.params.id)) {
        User.findOne({ where: { id: req.params.id } })
            .then(user => {
                res.json(user);
            });
    } else {
        res.status(404).send('User not found');
    }
});

app.post('/user', (req, res, next) => {
    if (checkExists(req.body.id)) {
        res.status(409).send('User already exists');
    } else {
        User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            })
            .then(user => {
                res.send(JSON.stringify(user));
            });
    }
});

app.put('/user/:id', (req, res, next) => {
    if (checkExists(req.params.id)) {
        User.update({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }, { where: { id: req.params.id } })
            .then(user => {
                res.send(JSON.stringify(user));
            });
    } else {
        res.status(404).send('User not found');
    }
});

app.delete('/user/:id', (req, res, next) => {
    if (checkExists(req.params.id)) {
        User.destroy({ where: { id: req.params.id } })
            .then(user => {
                res.send(JSON.stringify(user));
            });
    } else {
        res.status(404).send('User not found');
    }
});