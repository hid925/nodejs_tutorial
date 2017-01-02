module.exports = function(passport){
  var route = require('express').Router();
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var db = require('../../config/orientdb/db')();

  route.post('/login',     //로컬 로그인.
    passport.authenticate(
      'local',
      {
        successRedirect: '/topic',
        failureRedirect: '/auth/login',
        failureFlash: false
      }
    )
  );

  route.get('/facebook',   //페북 로그인
    passport.authenticate(
      'facebook',{
        scope: 'email'
      }
    )
  );

  route.get('/facebook/callback',
    passport.authenticate(
      'facebook',
      {
        successRedirect: '/topic',
        failureRedirect: '/auth/login'
      }
    )
  );

  var users=[
    {
      authId:'local:egoing',
      username:'egoing',
      password:'LjQjQdd+mx9KecsaPA9lqiX8tckdmltPnrU2K/9EmJqzr+m/nsZNiKa4af2VvttohlZUpzvdKuuAyarXfvsHZm9CTMzZeeTiVJ0XSAPnTkN9uRiLcSq+4AodT3ZVpqH80XzH3RczjAgTMVss+R2Beo7I0Pp4bVGH7rpgXUzaohE=',
      displayName:'Egoing',
      salt:'iU8uDbrRFgMXyCw4sZxU99HO6ujaHOBznpYu4XhPh1seIDcyBmjP5QX/Oxuvd4p9GDgSbd8yCAuOwK/n+OToKw=='
    }
  ];

  route.post('/register',function(req,res){
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
        res.redirect('/topic');
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

  route.get('/register', function(req,res) {
    var sql = 'SELECT FROM topic';
    db.query(sql).then(function(topics){
      res.render('auth/register', {topics:topics});
    });
  });


  route.get('/login',function(req,res){
    var sql = 'SELECT FROM topic';
    db.query(sql).then(function(topics){
      res.render('auth/login', {topics:topics});
    });
  });

  route.get('/logout',function (req,res) {
    req.logout();
    req.session.save(function(){
      res.redirect('/topic')
    })
  });


  return route;

}
