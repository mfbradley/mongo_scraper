const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");


const PORT = process.env.PORT || 8080;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongo";

const app = express();

const routes = require("./routes");


// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"))
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect Handlebars to our Express app
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(routes);

mongoose.Promise = Promise;
mongoose.connect("mongodb://heroku_w6qvnk2m:r8tjupfb0frbqlh7hg311tm0an@ds141657.mlab.com:41657/heroku_w6qvnk2m", { useNewUrlParser: true });

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
