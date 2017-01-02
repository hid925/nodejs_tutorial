module.exports = function(){

  var express = require('express');
  var session = require('express-session');
  var OrientoStore = require('connect-oriento')(session);
  var bodyParser = require('body-parser');

  var app = express();

  app.set('views', './views/orientdb');
  app.set('view engine', 'jade');
  app.use(bodyParser.urlencoded({extended:false}));
  app.use(session({
    secret: '434ADSFIOJSKJC@#!ASDFI',
    resave: false,
    saveUninitialized: true,
    store:new OrientoStore({
      server: "host=localhost&port=2424&username=root&password=1111&db=o2"
    })
  }));

  return app;
}
