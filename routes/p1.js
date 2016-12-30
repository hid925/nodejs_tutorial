module.exports = function(app){
  var express = require('express');
  var route = express.Router();
  route.get('/r1', function(req, res){
    res.send('hello /p1/r1');
  });
  route.get('/r2', function(req, res){
    res.send('hello /p1/r2');
  });
  //다른 작업가능
  return route;
};

//위 소스랑 같음.
// var express = require('express');
// var route = express.Router();
// route.get('/r1', function(req, res){
//   res.send('hello /p1/r1');
// });
// route.get('/r2', function(req, res){
//   res.send('hello /p1/r2');
// });
// module.exports = function(app){
//   return route;
// };
