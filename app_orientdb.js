var app = require('./config/orientdb/express')();

var passport = require('./config/orientdb/passport')(app);

var auth = require('./routes/orientdb/auth')(passport);
app.use('/auth',auth);

var topic = require('./routes/orientdb/topic')();
app.use('/topic',topic);

app.listen(3000, function() {     //3000포트로 연결
  console.log('Conneted, 3000 port!');
});
