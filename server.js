var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var request = require("request");
var mongoose = require("mongoose");

// var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 8080;

var app = express();


// Configure middleware
/* global Promise */
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localHost/test");

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({}, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("http://time.com/", function(response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        $("article.home-brief-article").each(function(i, element) {

            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(element).find("h2").find("a").text();
            result.link = $(element).find("h2").find("a").attr("href");
            result.summary = $(element).find("p").text();

            // // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function(dbArticle) {
                    // If we were able to successfully scrape and save an Article, send a message to the client
                    res.send("Scrape Complete");
                })
                .catch(function(err) {
                    // If an error occurred, send it to the client
                    res.json(err);
                    // });
                });
        });
    });
});




// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
