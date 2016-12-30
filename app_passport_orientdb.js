var express = require('express');
var session = require('express-session');
var OrientoStore = require('connect-oriento')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var OrientDB = require('orientjs');
var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: '1111'
});
var db = server.use('o2');
var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: '434ADSFIOJSKJC@#!ASDFI',
  resave: false,
  saveUninitialized: true,
  store:new OrientoStore({
    server: "host=localhost&port=2424&username=root&password=1111&db=o2"
  })
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
        <!--${req.user.email}<br>-->
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
    authId:'local:egoing',
    username:'egoing',
    password:'LjQjQdd+mx9KecsaPA9lqiX8tckdmltPnrU2K/9EmJqzr+m/nsZNiKa4af2VvttohlZUpzvdKuuAyarXfvsHZm9CTMzZeeTiVJ0XSAPnTkN9uRiLcSq+4AodT3ZVpqH80XzH3RczjAgTMVss+R2Beo7I0Pp4bVGH7rpgXUzaohE=',
    displayName:'Egoing',
    salt:'iU8uDbrRFgMXyCw4sZxU99HO6ujaHOBznpYu4XhPh1seIDcyBmjP5QX/Oxuvd4p9GDgSbd8yCAuOwK/n+OToKw=='
  }
];

app.post('/auth/register',function(req,res){
  hasher({password:req.body.password},function(err, pass, salt, hash){
    var user={
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    var sql = 'INSERT INTO user(authId, username, password, salt, displayName) VALUES(:authId, :username, :password, :salt, :displayName)';
    db.query(sql,{
      params:user
    }).then(function(results){
      res.redirect('/welcome');
    },function(error){
      console.log(error);
      res.status(500);
    });
    // req.login(user, function(err){
    //   req.session.save(function(){
    //     res.redirect('/welcome');
    //   });
    // });
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
  done(null, user.authId);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser',id);
  var sql = "SELECT * FROM user WHERE authId=:authId";
  db.query(sql,{params:{authId:id}}).then(function(results){
    if(results.length === 0){
      done('There is no user');
    } else {
      return done(null, results[0]);
    }
  });
});

passport.use(new LocalStrategy(
  function(username, password, done){
      var uname = username;
      var pwd = password;
      var sql = 'SELECT * FROM user WHERE authId=:authId';
      db.query(sql, {params:{authId:'local:'+uname}}).then(function(results){
//        console.log(results);
        if(results.length === 0){
          return done(null,false);
        }
        var user=results[0];
        return hasher({password: pwd, salt:user.salt}, function(err, pass, salt, hash){
          if(hash === user.password){
            console.log('LocalStrategy',user);
            done(null, user);
          }else{
            done(null, false);
          }
        });
      })
    }
));

passport.use(new FacebookStrategy({
    clientID: '198484513948718',
    clientSecret: '07b4fc5d416565845111266d5e5a9a49',
    callbackURL: "/auth/facebook/callback",
    profileFields:['id','email', 'gender', 'link', 'locale','name',
    'timezone', 'verified', 'displayName']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId='facebook:'+profile.id;
    var sql = 'SELECT FROM user WHERE authId=:authId';
    db.query(sql,
      {params:{authId:authId}}).then(function(results){
        console.log(results, authId);
      if(results.length === 0){
        var newuser={
          'authId':authId,
          'displayName':profile.displayName,
          'email':profile.emails[0].value
        };
        var sql = 'INSERT INTO user (authId, displayName, email) VALUES(:authId, :displayName, :email)'
        db.query(sql, {params:newuser}).then(function(){
          done(null, newuser);
        }, function(error){
          console.log(error);
          done('error');
        })
      }else{
        return done(null,results[0]);
      }
    })

  //  User.findOrCreate(..., function(err, user) {
  //    if (err) { return done(err); }
  //    done(null, user);
  //  });
  }
));

app.post('/auth/login',     //로컬 로그인.
  passport.authenticate(
    'local',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }
  )
);

app.get('/auth/facebook',   //페북 로그인
  passport.authenticate(
    'facebook',{
      scope: 'email'
    }
  )
);

app.get('/auth/facebook/callback',
  passport.authenticate(
    'facebook',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login'
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
  <a href="/auth/facebook">facebook</a>
  `;
  res.send(output);
});

app.listen(3003, function(){
  console.log('Connected 3003 port!!!');
});
