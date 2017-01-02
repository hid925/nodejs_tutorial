module.exports = function(app){
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var db = require('./db')();


  app.use(passport.initialize());
  app.use(passport.session());

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
    }
  ));


  return passport;

}
