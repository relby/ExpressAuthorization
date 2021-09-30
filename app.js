// Includes
const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const path = require('path');
const cookie_parser = require('cookie-parser');

// Constants
const host = '127.0.0.1';
const port = 3000;
const saltRounds = 10;
const tokenKey = '987fgu4hfd98s';

// mongoDB connection
mongoose.connect('mongodb://localhost:27017/test');

// Schemas and Models
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    id: Schema.ObjectId,
    login: {
        type: String,
        unique: true,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 200,
    },
});

const User = mongoose.model('User', UserSchema);

// Functions


// Middleware
app.use(express.json());
app.use(express.urlencoded());
app.use(cookie_parser());

// Routes
app.get('/', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, 'index.html'));
})

app.get('/user', (req, res) => {
    jwt.verify(req.cookies.auth, tokenKey, (err, payload) => {
        if (err) return res.status(401).send("You're not authorized");
        res.status(200).send(`You're authorized as ${payload.user.login}`);
    })
})

app.post('/login', (req, res) => {
    const { body } = req;
    const { login } = body;
    const { password } = body;
    if (login.length < 3 || password.length < 3) {
        return res.status(401).json({
            message: 'Login and pasword must be at least 3 character long'
        })
    }
    User.find({login: login}, (err, users) => {
        const user = users[0];
        if (err || !user) {
            return res.status(401).json({
                message: 'Incorrect login'
            })
        }
        const hash = user.password;
        bcrypt.compare(password, hash, (err, result) => {
            if (result) {
                jwt.sign({user}, tokenKey, {expiresIn: '1h'}, (err, token) => {
                    if (err) return console.error('Error with token');;
                    res.cookie('auth', token, {maxAge: 3600000, httpOnly: true});
                    res.redirect('/user');
                })
            } else {
                res.status(401).json({
                    message: 'Incorrect password'
                })
            }
        })
    })
})
app.post('/register', (req, res) => {
    const { body } = req;
    const { login, password, confirm_password } = body;
    if (login.length < 3 || password.length < 3) {
        return res.status(401).json({
            message: 'Login and pasword must be at least 3 character long'
        })
    }
    if (password !== confirm_password) {
        return res.status(401).json({
            message: `Password doesn't match`
        })
    }
    const hash = bcrypt.hashSync(password, saltRounds);
    const user = new User({
        login: login,
        password: hash,
    })
    user.save( (err, data) => {
        if (err) return res.status(503).json({
            message: 'That login already exists'
        });
        jwt.sign({user}, tokenKey, {expiresIn: '1h'}, (err, token) => {
            if (err) return console.error('Error with token');
            res.cookie('auth', token, {maxAge: 3600000, httpOnly: true});
            res.redirect('/user');
        })
    })
})



// Starting server
app.listen(port, host, () => {
    console.log(`Server is up: http://${host}:${port}`);
})