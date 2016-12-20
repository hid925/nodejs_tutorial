var OrientDB = require('orientjs');

var server = OrientDB({
  host: 'localhost',
  port: 2424,
  username: 'root',
  password: '1111'
});

var db = server.use('o2');
// var rec = db.record.get('#21:0')
//    .then(
//       function(record){
//          console.log('Loaded Record:', record);
//        }
//    );

//create

// var sql = 'SELECT FROM topic';
// db.query(sql).then(function(results) {
//   console.log(results);
// });

// var sql = 'SELECT FROM topic WHERE @rid=:rid';
// var param = {
//   params:{
//     rid:'#21:0'
//   }
// }
// db.query(sql,param).then(function(results) {
//   console.log(results);
// });

//insert
// var sql ="INSERT INTO topic(title, discription) VALUES(:title, :desc)";
// db.query(sql, {
//   params:{
//     title: "Express",
//     desc: "Express is framework for web"
//   }
// }).then(function(results) {
//   console.log(results);
// })

//update
// var sql = "UPDATE topic SET title=:title WHERE @rid=:rid";
// db.query(sql,{params:{title:'Expressjs', rid:'#22:1'}}).then(function(results){
//   console.log(results);
// })

//delete
var sql = "DELETE FROM topic WHERE @rid=:rid";
db.query(sql,{params:{rid:'#22:1'}}).then(function(results) {
  console.log(results);
});
