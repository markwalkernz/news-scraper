// click on the `todays listings` button
$("#get-listings").click(function() {
  // Make an ajax call to trigger a scrape to the database
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  // With that done, add the articles to the page
  .done(function() {

    $("#articles").empty();

    // Grab the articles as a json
    $.getJSON("/articles", function(data) {
      // For each one
      for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<div class='panel panel-default listing' data-id='" + data[i]._id + "'><h4>" + data[i].title + "</h4>"
          + "<a href='" + data[i].link + "' target='_blank'>Click here for event details</a>"
          + "<button class = 'save-listing btn btn-default pull-right' data-id='" + data[i]._id + "'>Save Listing</button></div>"
        );
      }
    });
  });
});

// click on the `save listing` button 
$(document).on("click", ".save-listing", function() {

  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log(thisId);

  $(this).text("Saved");
  $(this).attr("disabled", "disabled");

  // Run a GET request to change the article to saved, using what's entered in the inputs
  $.ajax({
    method: "GET",
    url: "/save/" + thisId,
  })
  // With that done
  .done(function(data) {
    console.log(data);
  });
});


