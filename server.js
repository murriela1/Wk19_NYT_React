// Server Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongojs = require('mongojs');

var app = express();
var PORT = process.env.PORT || 3000; // Sets an initial port

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));

app.use(express.static(__dirname + '/public'));

// MongoDB Configuration configuration
var databaseUrl = 'nytreact';
var collections = ["articles"];

// use mongojs to hook the database to the db variable 
var db = mongojs(databaseUrl, collections);
db.on('error', function (err) {
  console.log('MongoDB Error: ', err);
});

// Main Route. This route will redirect to rendered React application
app.get('/', function(req, res){
  res.sendFile('./public/index.html');
})

// This is the route to send GET requests to retrieve most recent search data.

app.get('/api/', function(req, res) {

  // Find all the records, sort it in descending order, limit the records to 5
    db.articles.find({}).sort({'date': -1}).limit(5, function(err, doc){

        if(err){
          console.log(err);
        }
        else {
          res.json(doc);
        }
      })
});

app.post('/save', function(req,res) {
    console.log(req.body)
})

// This is the route to send POST requests to save each search.
app.post('/saveArticles', function(req, res) {
  console.log(req.body);
  // Save the articles returned from the nytimes api into the mongo database
  req.body.articles.forEach(function(value,index) {
  // Save the location based on the JSON input. 
  db.articles.insert({"title": value.title, "pub_date": value.pub_date, "url": value.url, "date": Date.now()}, function(err,data){
    if(err) throw err;

    })

  })
  
  // Retrieve all the articles and send it to the client side
  db.articles.find({}).sort({'date': -1}).limit(5, function(err, data){

      if (err) throw err;
      else {
        res.json(data);
      }
  })

});


// Listener
app.listen(PORT, function() {
  console.log("You are now approaching PORT: " + PORT);
});
