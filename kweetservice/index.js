import express, { json } from 'express';
import Sequelize, { INTEGER, STRING } from 'sequelize';
var app = express();
const { Op, DataTypes } = Sequelize;
var PORT = process.env.PORT || 5000;
var DB_NAME = process.env.DB_NAME || 'kweetdb';
var DB_USER = process.env.DB_USER || 'root';
var DB_PASS = process.env.DB_PASS || 'root';
var DB_HOST = process.env.DB_HOST || 'kweetdb';
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

const Kweet = sequalize.define('kweet', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: STRING, allowNull: false },
    userId: { type: INTEGER, allowNull: false },
}, DISABLE_SEQ_DEFAULTS);

function checkExists(id) {
    return Kweet.count({ where: { id: id } })
        .then(count => {
            return count > 0;
        });
};

app.use(json());
app.listen(PORT, function() {
    console.log('Connecting to database...');
    Kweet.sync({ alter: true });
    console.log('KweetService listening on port', PORT);
});

app.get('/kweet/:id', (req, res, next) => {
    if (checkExists(req.params.id)) {
        Kweet.findOne({ where: { id: req.params.id } })
            .then(kweet => {
                res.json(kweet);
            });
    } else {
        res.status(404).send('Kweet not found');
    }
});

app.get('/kweets', (req, res, next) => {
    Kweet.findAll()
        .then(kweets => {
            res.json(kweets);
        });
});

app.get('/kweet/byuserid/:userid', (req, res, next) => {
    Kweet.findAll({ where: { userId: req.params.userid } })
        .then(kweets => {
            res.json(kweets);
        });
});

app.post('/kweet', (req, res, next) => {
    if (checkExists(req.body.KweetId)) {
        res.status(400).send('Kweet already exists');
    } else {
        Kweet.create(req.body)
            .then(kweet => {
                res.json(kweet);
            });
    }
});

app.put('/kweet/:id', (req, res, next) => {
    if (checkExists(req.params.id)) {
        Kweet.update(req.body, { where: { id: req.params.id } })
            .then(kweet => {
                res.json(kweet);
            });
    } else {
        res.status(404).send('Kweet not found');
    }
});

app.delete('/Kweet/:id', (req, res, next) => {
    if (checkExists(req.params.id)) {
        Kweet.destroy({ where: { id: req.params.id } })
            .then(kweet => {
                res.json(kweet);
            });
    } else {
        res.status(404).send('Kweet not found');
    }
});