var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: '434ADSFIOJSKJC@#!ASDFI',
  resave: false,
  saveUninitialized: true,
  store:new FileStore()
}))
app.use(passport.initialize());
app.use(passport.session());


app.get('/count', function(req,res) {
  if(req.session.count){
    req.session.count++;
  } else {
    req.session.count=1;
  }
  res.send('count : ' + req.session.count);
});

app.get('/auth/logout',function (req,res) {
  req.logout();
  req.session.save(function(){
    res.redirect('/welcome')
  })
});

app.get('/welcome',function(req,res) {
  if(req.user && req.user.displayName){
    res.send(`
        <h1>Hello, ${req.user.displayName}</h1>
        <a href="/auth/logout">logout</a>
      `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
      `);
  }
});

var users=[
  {
    username:'egoing',
    password:'LjQjQdd+mx9KecsaPA9lqiX8tckdmltPnrU2K/9EmJqzr+m/nsZNiKa4af2VvttohlZUpzvdKuuAyarXfvsHZm9CTMzZeeTiVJ0XSAPnTkN9uRiLcSq+4AodT3ZVpqH80XzH3RczjAgTMVss+R2Beo7I0Pp4bVGH7rpgXUzaohE=',
    displayName:'Egoing',
    salt:'iU8uDbrRFgMXyCw4sZxU99HO6ujaHOBznpYu4XhPh1seIDcyBmjP5QX/Oxuvd4p9GDgSbd8yCAuOwK/n+OToKw=='
  }
];

app.post('/auth/register',function(req,res){
  hasher({password:req.body.password},function(err, pass, salt, hash){
    var user={
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user);
    req.login(user, function(err){
      req.session.save(function(){
        res.redirect('/welcome');
      });
    });
  });
});

app.get('/auth/register', function(req,res) {
  var output=`
  <h1>Register</h1>
  <form action="/auth/register" method="post">
      <p>
        <input type="text" name="username" placeholder="username">
      </p>
      <p>
        <input type="password" name="password" placeholder="password">
      </p>
      <p>
        <input type="text" name="displayName" placeholder="displayName">
      </p>
      <p>
        <input type="submit">
      </p>
  </form>
  `;
  res.send(output);
});


passport.serializeUser(function(user, done) {
  console.log('serializeUser',user);
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser',id);
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(user.username === id){
      done(null, user);
    }
  }
});

passport.use(new LocalStrategy(
  function(username, password, done){
      var uname = username;
      var pwd = password;

      for(var i=0; i<users.length; i++){
        var user = users[i];
        if(uname === user.username){
          return hasher({password: pwd, salt:user.salt}, function(err, pass, salt, hash){
            if(hash === user.password){
              console.log('LocalStrategy',user);
              done(null, user);
            }else{
              done(null, false);
            }
          });
        }
      }
      done(null,false);
    }
));

app.post('/auth/login',
  passport.authenticate('local',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }
  )
);


app.get('/auth/login',function(req,res){
  var output =`
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placsholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});

app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});
