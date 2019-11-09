var express = require('express');
var bodyParser = require('body-parser');

global.fsx = require('fs-extra');
global.config = fsx.readJsonSync('./config/config.json');
global.app = express();
global.server = require('http').createServer(app);
global.mongoose = require('mongoose');
global._ = require('lodash');
global.bcrypt = require('bcryptjs');
global.moment = require('moment');
global.async = require('async');
global.jwt = require('jsonwebtoken');

global.transporterEmail =  require("nodemailer").createTransport({
    service: config.mail.service,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass
    }
});

let _stringConnect = 'mongodb://' 
    + config.database.username + ':' 
    + config.database.password + '@' 
    + config.database.ip + ':' 
    + config.database.port + '/' 
    + config.database.name;

mongoose.connect(_stringConnect, {useCreateIndex : true, useNewUrlParser : true, connectTimeoutMS : 4000, useFindAndModify : false, useUnifiedTopology : true}, function (error) {
    if(error){
        console.log('connect database fail: ' + _stringConnect);
        return;
    } 
    console.log('connected: ' + _stringConnect);
    buildApp();
});


function buildApp() {
    app.use(require("express-fileupload")());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);


    app.use(session({
        secret: 'vcar_secret',
        name: "session_vcar",
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        resave: false,
        saveUninitialized: true
    }));

    app.use(require('./library/auth-access.js'));
    require('./library/setup.js');

    app.use(function (req, res, next) {
        res.send(_output(404))
    })

    server.listen(config.app.port);//fix listen port heroku
    console.log('Open PORT: ', config.app.port); 
}
