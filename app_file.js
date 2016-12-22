var express = require('express'); //express제어
var app = express(); //express 객체 가져옴
var bodyParser = require('body-parser'); //body parser가져옴
var fs = require('fs'); //fs 가져옴

app.locals.pretty = true;
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views','./views_file');  //뷰스 경로
app.set('view engine', 'jade'); // 제이드 셋팅

app.get('/topic/new', function(req, res) {
  fs.readdir('data', function(err, files) { //경로에 있는 파일을 읽어서
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }
    res.render('new',{topics:files});
  });
});

app.get(['/topic', '/topic/:id'], function(req, res) {      //목록
  fs.readdir('data', function(err, files) { //경로에 있는 파일을 읽어서
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }
    var id = req.params.id;
    if(id){
    // id값이 있을때
    fs.readFile('data/'+id,'utf-8', function(err, data) {
      if(err){
        console.log(err);
        res.status(500).send('Internal Sever Error');
      }
      res.render('view',{topics:files, title:id, description:data});
      });
    }else{
      //id 없을때
      res.render('view',{topics:files, title:"Welcome", description:"Hello, JS for server"});      //view에 topics로 접근가능하게
    }
  });
});

// app.get('/topic/:id',function(req,res) {
//   var id = req.params.id;
//   fs.readdir('data', function(err, files) {
//     if(err){
//       console.log(err);
//       res.status(500).send('Internal Sever Error');
//     }
//   fs.readFile('data/'+id,'utf-8', function(err, data) {
//     if(err){
//       console.log(err);
//       res.status(500).send('Internal Sever Error');
//     }
//     res.render('view',{topics:files, title:id, description:data});
//     })
//   })
// })

app.post('/topic',function(req, res) {
  var title = req.body.title;
  var description = req.body.description;

  fs.writeFile('data/'+title, description, function(err) {
    if(err){
      res.status(500).send('Internal Sever Error');
    }
    res.redirect('/topic/'+title);    //글 작성후 작성된 파일 보이게.
  } );
});

app.listen(3000, function() {     //3000포트로 연결
  console.log('Conneted, 3000 port!');
});
