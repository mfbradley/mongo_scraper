const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const request = require("request");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const db = require("./models");

const PORT = process.env.PORT || 8080;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongo";

const app = express();

const routes = require("./routes");
app.use(routes);

// Configure middleware
/* global Promise */
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://heroku_w6qvnk2m:r8tjupfb0frbqlh7hg311tm0an@ds141657.mlab.com:41657/heroku_w6qvnk2m");

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    //Grabs all of the articles using .find()
    db.Article.find({}, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});

// A GET route for scraping the TIME website
app.get("/scrape", (req, res) => {
    console.log("scraped");
    
    // First, grab the body of the html with request
    request("http://time.com/", function(error, response, html) {
        
        // Then, load that into cheerio and save it to $ for a shorthand selector
        if (error) {
            throw (error);
        }
        
        var $ = cheerio.load(html);
        
        // grab every article with a home-brief-article tag, and do the following:
        $("article.home-brief-article").each(function(i, element) {

            var result = {};

            // Add the text of the title and summary, and href of every link, and save them as properties of the result object
            result.title = $(element).find("h2").find("a").text();
            result.link = $(element).find("h2").find("a").attr("href");
            result.summary = $(element).find("p").text();
            console.log(result);
            
            // // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function(dbArticle) {
                    // If we were able to successfully scrape and save an Article, send a message to the client
                    console.log("Articles Scraped!");
                })
                .catch(function(err) {
                    // If an error occurred, send it to the client
                    console.log(err);
                    // });
                });
        });
    });

    // display 'Scrape Complete' on page
    res.send("Scrape Complete");
});


// route to get saved articles
app.get("/articles/saved/", function(req, res) {
    
    // used .find() to get articles with a saved: true attribute
    db.Article.find({ "saved": true }, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});

// route to update saved article attributes
app.post("/articles/saved/:id", function(req, res) {
    
    // find and update by id of article that was saved
    // updated "saved" to true
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true }, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            res.json(found);
        }
    });
});


// route to delete articles from 'Saved Articles' page
// find and delete by id of article that was clicked
// updated "saved" attribute to false
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


// add notes to an article
// populate 'notes' attribute in Article.js with Note.js
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
