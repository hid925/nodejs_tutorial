module.exports = function() {
  var route = require('express').Router();
  var db = require('../../config/orientdb/db')();

  route.get('/add', function(req, res) {
    var sql = 'SELECT FROM topic';
    db.query(sql).then(function(topics){
      res.render('topic/add',{topics:topics});
    });
  });

  route.post('/add',function(req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var sql = 'INSERT INTO topic (title, description, author) VALUES(:title, :desc, :author)';
    db.query(sql, {
      params:{
        title:title,
        desc:description,
        author:author
      }
    }).then (function(results){
      res.redirect('/topic/'+ encodeURIComponent((results[0]['@rid'])));
    });
  });

  route.get('/:id/edit', function(req, res) {
    var sql = 'SELECT FROM topic';
    var id = req.params.id;
    db.query(sql).then(function(topics){
      var sql = 'SELECT FROM topic  WHERE @rid=:rid';
      db.query(sql,{params:{rid:id}}).then(function(topic){
      //  console.log(topic[0]);
        res.render('topic/edit',{topics:topics, topic:topic[0]});  //{속성(디비):값()}
      });
    });
  });

  route.post('/:id/edit', function(req, res) {
    var sql = 'UPDATE topic SET title=:t, description=:d, author=:a WHERE @rid=:rid';
    var id = req.params.id;
    var title = req.body.title;
    var desc =req.body.description;
    var author = req.body.author;
    db.query(sql,{
      params:{
        t:title,
        d:desc,
        a:author,
        rid:id
      }
    }).then(function(topics){
      //  console.log(topic[0]);
      res.redirect('/topic/'+encodeURIComponent(id));
    });
  });


  route.get('/:id/delete', function(req, res) {
    var sql = 'SELECT FROM topic';
    var id = req.params.id;
    db.query(sql).then(function(topics){
      var sql = 'SELECT FROM topic  WHERE @rid=:rid';
      db.query(sql,{params:{rid:id}}).then(function(topic){
      //  console.log(topic[0]);
        res.render('topic/delete',{topics:topics, topic:topic[0]});  //{속성(디비):값()}
      });
    });
  });
  route.post('/:id/delete',function(req, res) {
    var sql = 'DELETE FROM topic WHERE @rid=:rid';
    var id = req.params.id;
    db.query(sql, {
      params:{
        rid:id
      }
    }).then (function(topics){
      res.redirect('/topic/');
    });
  });


  route.get(['', '/:id'], function(req, res) {      //목록
    var sql = 'SELECT FROM topic';
    db.query(sql).then(function(topics){
      var id = req.params.id;
      if(id){
        var sql = 'SELECT FROM topic WHERE @rid=:rid';
        db.query(sql,{params:{rid:id}}).then(function(topic){
        //  console.log(topic[0]);
          res.render('topic/view',{topics:topics, topic:topic[0],user:req.user});  //{속성(디비):값()}
            });
      }else{
        res.render('topic/view',{topics:topics, user:req.user});  //{속성(디비):값()}
      }
    });
  });

  return route;
}
