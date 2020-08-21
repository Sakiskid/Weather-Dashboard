"use strict";

// OWM Key: 57477b62efa91ed093f455c4b16426d8
// Unsplash Key: JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso
var unsplashAPIKey = "&client_id=JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso";
var unsplashQueryParams = "";

function addNewLocation() {}

function makeUnsplashQuery(query) {
  var queryParameters = "&query=" + query;
  var unsplashURL = "https://api.unsplash.com/search/photos?" + queryParameters + unsplashAPIKey;
  $.ajax({
    url: unsplashURL,
    method: "GET"
  }).then(function (response) {
    console.log(response);
  });
}

newLocationInputEl.addEventListener('keyup', function (e) {
  if (e.key === 'Enter') {
    event.preventDefault();
    addNewLocation();
  }
});
makeUnsplashQuery("texas");