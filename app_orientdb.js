var express = require('express'); //express제어
var app = express(); //express 객체 가져옴
var bodyParser = require('body-parser'); //body parser가져옴
var fs = require('fs'); //fs 가져옴

var OrientDB = require('orientjs');

var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: '1111'
});
var db = server.use('o2');

app.locals.pretty = true;
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views','./views_orientdb');  //뷰스 경로
app.set('view engine', 'jade'); // 제이드 셋팅

app.get('/topic/add', function(req, res) {
  var sql = 'SELECT FROM topic';
  db.query(sql).then(function(topics){
    if(topics.length === 0){
      console.log('No record');
      res.status(500).send('Internal Sever Error');
    }
    res.render('add',{topics:topics});
  });
});

app.post('/topic/add',function(req, res) {
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

app.get(['/topic', '/topic/:id'], function(req, res) {      //목록
  var sql = 'SELECT FROM topic';
  db.query(sql).then(function(topics){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT FROM topic WHERE @rid=:rid';
      db.query(sql,{params:{rid:id}}).then(function(topic){
      //  console.log(topic[0]);
        res.render('view',{topics:topics, topic:topic[0]});  //{속성(디비):값()}
          });
    }else{
      res.render('view',{topics:topics});  //{속성(디비):값()}
    }
  });
});


app.listen(3000, function() {     //3000포트로 연결
  console.log('Conneted, 3000 port!');
});
