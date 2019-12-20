const express = require ('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');



mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;
//check connection

db.once('open',function(){
console.log('Connected to MongoDB');
});

//check for db errors
db.on('error',function(err){
console.log(err);

})
//INIT APP

const app = express();
//Bring in Models
let Article = require('./models/article');

//Load View Engine

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');


// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, 'public')));


//Express session middleware

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,

}));

//express messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function (param,msg,value){
  var namespace = param.split('.')
  , root = namespace.shift()
  , formParam = root;

  while (namespace.length){
    formParam += '['+ namespace.shift() + ']';

  }
  return {
    param : formParam,
    msg   : msg,
    value : value
  };
  }
}));

//Passpord config
require('./config/passport')(passport);
//Password middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
})





//Home Route
app.get('',function(req,res){
 /* let articles = [
  {
    id:1,
    title:'Article One',
    author:'Achref Ferchichi',
    body:'This is article one'

  },
  {
    id:2,
    title:'Article Two',
    author:'Achref Ferchichi',
    body:'This is article Two'

  },
  {
    id:3,
    title:'Article Three',
    author:'Achref Ferchichi',
    body:'This is article Three'

  }
];
*/
Article.find({},function(err,articles){
 if(err){
console.log(err);

}else{
  res.render('index',{
  title:'ARTICLE',
  articles: articles

  });
}

});

});
//Route Files
let articles = require( './routers/articles');
let users = require( './routers/users');
app.use('/articles',articles)
app.use('/users',users)




//Start server
app.listen(3000,function () {

  console.log('server started on port 3000 ....')

})
