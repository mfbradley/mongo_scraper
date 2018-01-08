// Grab the articles as a json

$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articleDiv").append(
            "<div class='card text-white bg-info mb-3'><div class='card-header'>" +
            "<h3 class='title' href='" + data[i].link + "'>" +
            data[i].title + "</h3>" +
            "<br />" +
            "<div class='card-body bg-light mb-3'>" +
            "<p class='card-text'>" + data[i].summary +
            "</p>" +
            '<button href="#" class="btn btn-secondary saveArticle" data-id="' + data[i]._id + '">Save Article</button></div></div>'
        );
    }
});

$(document).on("click", "scraperButton", function() {
    alert("Scraped!");

    $.ajax({
        method: "GET",
        url: "/scrape"
    });
});


// click save article button
// grab entire article div and move to savedArticleDiv
// post to savedarticles route
$(document).on("click", "button.saveArticle", function() {
    alert("Article Saved!");
    var id = $(this).attr("data-id");
    console.log(id);

    $.ajax({
            method: "POST",
            url: "/articles/saved/" + id,
            data: {
                saved: true
            }

        })

        // With that done, add the information to the page
        .done(function(data) {
            console.log(data);

        });
});
