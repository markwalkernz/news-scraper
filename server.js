var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var port = process.env.PORT || 3000;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";

console.log("Using database " + MONGODB_URI);

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Setup for Handlebars.
// var exphbs = require("express-handlebars");

// app.engine("handlebars", exphbs({ 
//   defaultLayout: "main"
// }));

// //app.engine('handlebars', hbs.engine);
// app.set("view engine", "handlebars");

// Routes

// scrape the news website
app.get("/scrape", function(req, res) {
  // get the body of the html with request
  axios.get("https://www.chicagoreader.com/chicago/EventSearch?id=landing&narrowByDate=Today&eventSection=807941").then(function(response) {
    // load the response into cheerio
    var $ = cheerio.load(response.data);
 
    // for each listing
    $(".item").each(function(i, element) {
      // Save an empty result object
      var result = {};
      var listingTitle = "";

      // Find the title of the listing
      listingTitle = $(this)
        .children("a")
        .children("h3")
        .text();

      // tidy up the title and add it to the result object
      listingTitle = listingTitle.replace("Image\n      \n      \n    \n        \n        \n          ","{");
      listingTitle = listingTitle.replace("\n           \n\n","}");

      var startPosition = listingTitle.indexOf("{") + 1;
      var endPosition = listingTitle.indexOf("}");

      result.title = listingTitle.slice(startPosition,endPosition);

      // Find the href of the listing and add it to the result object
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
    });
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article
  .find({})
  .then(function(dbArticles) {
    // If any articles are found, send them to the client
    res.json(dbArticles);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});

// Route for getting saved Articles from the db
app.get("/savedArticles", function(req, res) {
  db.Article
  .find({})
  .then(function(dbArticles) {
    // If any articles are found, send them to the client
    res.json(dbArticles);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article
  .findOne({ _id: req.params.id})
  // run the populate method with "note",
  .populate("note")
  // then respond with the article with the note included
  .then(function(dbArticle) {
    // If an article is found, send it to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note
  .create(req.body)
  .then(function(dbNote) {
    // find the article in the db and add the note id
    // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
  })
  .then(function(dbArticle) {
    // send the article back to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});

// Route for saving an article
app.get("/save/:id", function(req, res) {
  db.Article
  .findOneAndUpdate({ _id: req.params.id }, { saved: true }, { new: true })
  .then(function(dbArticle) {
    // send the article back to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});


// Start the server
app.listen(port, function() {
  console.log("App running on port " + port + "!");
});
