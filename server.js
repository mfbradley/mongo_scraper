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
mongoose.connect("mongodb://localHost/mongo");

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
    console.log("scraped");
    // First, we grab the body of the html with request
    request("http://time.com/", function(error, response, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        if (error) {
            throw (error);
        }
        var $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        $("article.home-brief-article").each(function(i, element) {

            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(element).find("h2").find("a").text();
            result.link = $(element).find("h2").find("a").attr("href");
            result.summary = $(element).find("p").text();
            console.log(result);
            // // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function(dbArticle) {
                    // If we were able to successfully scrape and save an Article, send a message to the client

                })
                .catch(function(err) {
                    // If an error occurred, send it to the client
                    console.log(err);
                    // });
                });
        });
    });

    res.send("Scrape Complete");
});

app.get("/articles/saved/", function(req, res) {
    db.Article.find({ "saved": true }, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});

app.post("/articles/saved/:id", function(req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true }, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});


app.put("/articles/deleted/:id", function(req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false }, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});


app.get("/articles/:id", function(req, res) {
    db.Article.find({ "_id": req.params.id })
        .populate("notes").then(function(dataReturned) {
            res.json(dataReturned);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Note.create(req.body)
        .then(function(noteCreated) {
            return db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { notes: noteCreated._id } });
        });

    res.send("Done!");
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
