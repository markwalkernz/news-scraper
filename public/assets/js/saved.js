

// Grab the saved articles as a json
$.getJSON("/savedArticles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#savedArticles").append("<div class='panel panel-default article' data-id='" + data[i]._id + "'>"
      + "<div class='row'><div class='col-md-8'>"
      + "<h4>" + data[i].title + "</h4>"
      + "<p>" + data[i].details + "</p>"
      + "<a href='" + data[i].link + "' target='_blank'>Click here for event details</a>"
      + "</div><div class='col-md-4'>"
      + "<button class = 'add-note btn btn-primary pull-right' data-toggle='modal' data-target='#notesmodal' data-id='" + data[i]._id + "'>Notes</button>"
      + "<button class = 'unsave btn btn-primary pull-right' data-id='" + data[i]._id + "'>Remove</button>"
      + "</div></div></div>"
    );
  };
});

// Click on `add note` button
$(document).on("click", ".add-note", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the button
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h4>" + data.title + "</h4>");
      // An input to enter a new title
      $("#notes").append("<input class='form-control' id='titleinput' name='title' placeholder='Title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea class='form-control' id='bodyinput' name='body' placeholder='Enter notes here'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<br><button class='btn btn-primary' data-id='" + data._id + "' id='savenote' data-dismiss='modal'>Save and Close</button>");
      // TODO: A button to delete a note
      //$("#notes").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

// click the unsave button for an article
$(document).on("click", ".unsave", function() {
  // Grab the id associated with the article from the button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the article to saved
  $.ajax({
    method: "POST",
    url: "/save",
    data: {
      id: thisId,
      saved: false
    }
  })
  // With that done
  .done(function(data) {
    console.log(data);
  });

  // remove the article and any notes that might be open from the page
  var articleSelector = ".article[data-id='" + thisId + "']";
  $(articleSelector).remove();
  $("#notes").empty();
});

// click the deletenote button
// TODO: deletenote route not working so deletenote button has been commented out above
$(document).on("click", "#deletenote", function() {
  // Grab the id associated with the article from the button
  var thisId = $(this).attr("data-id");

  // Run a GET request to delete the note
  $.ajax({
    method: "GET",
    url: "/deletenote/" + thisId,
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});