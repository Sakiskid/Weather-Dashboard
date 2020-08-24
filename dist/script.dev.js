"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// OWM Key: 57477b62efa91ed093f455c4b16426d8
// Unsplash Key: JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso
var unsplashAPIKey = "&client_id=JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso";
var WeatherAPIKey = "57477b62efa91ed093f455c4b16426d8";
var searchType = "q"; // Default search type
// Element Templates for DOM manipulation:

var radioWrapperTemplate; // ANCHOR Initialization Functions

function init() {
  if (savedLocations) savedLocations = JSON.parse(getLocalStorage("savedLocations"));
  initializeElementTemplates();
  populateLocationButtons();
  loadDefaultLocation();
}

function initializeElementTemplates() {
  radioWrapperTemplate = $(".locationRadioWrapper").clone();
  $(".locationRadioWrapper").remove();
}

function populateLocationButtons() {
  $(locationSelection).empty();

  for (var i = 0; i < savedLocations.length; i++) {
    var newButton = radioWrapperTemplate.clone();
    newButton.attr("data-name", savedLocations[i].Name);
    newButton.attr("id", "location-" + savedLocations[i].Name);
    newButton.find("span").text(savedLocations[i].Name);
    displayCountryFlagOnLocationTab(newButton, savedLocations[i].Country);
    $(locationSelection).append(newButton);
  }
}

function loadDefaultLocation() {
  if (localStorage.getItem("defaultLocation")) {
    changeCurrentLocation(localStorage.getItem("defaultLocation"));
  }
} // ANCHOR Location Management Functions


function addNewLocation(newLocation) {
  // Add new location to saved locations, then set saved locations to localStorage
  savedLocations.push(newLocation);
  localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  populateLocationButtons();
}

function changeCurrentLocation(newLocationName) {
  // Get Location, then set lat and lon for the coordsQuery.
  var location;

  for (var i = 0; i < savedLocations.length; i++) {
    // Look for the respective location object
    if (savedLocations[i].Name === newLocationName) {
      location = savedLocations[i];
    }
  }

  var lat = location.Latitude;
  var lon = location.Longitude; // Checked class handling for css styling

  $(".locationRadioWrapper").removeClass("checked");
  $("#location-" + location.Name).addClass("checked"); // Queries

  makeUnsplashQuery(location.Name);
  makeWeatherQueryWithCoords(lat, lon);
}

function setDefaultLocation(newLocation) {
  console.log(newLocation);
  localStorage.setItem("defaultLocation", $(newLocation).parent().attr("data-name"));
} // ANCHOR Queries


function makeUnsplashQuery(query) {
  var queryParameters = "&per_page=1&query=landscape " + query;
  var unsplashURL = "https://api.unsplash.com/search/photos?" + queryParameters + unsplashAPIKey;
  $.ajax({
    url: unsplashURL,
    method: "GET"
  }).then(function (response) {
    displayBackgroundImage(response.results[0].urls.small);
  });
}

function createNewLocationUsingWeatherQuery(query) {
  // This function is used when making the initial query on a new location, and is used mainly to get the coords.
  // Luckily, OWM allows 60 request per minute.
  var WeatherURL = "https://api.openweathermap.org/data/2.5/weather?" + searchType + "=" + query + "&appid=" + WeatherAPIKey; // Create new location to return

  var newLocation = _objectSpread({}, locationObjectTemplate);

  $.ajax({
    url: WeatherURL,
    method: "GET"
  }).then(function (response) {
    console.log("getCoordsUsingWeatherQuery response: ", response);
    newLocation.Name = response.name;
    newLocation.Country = response.sys.country;
    newLocation.CityID = response.id;
    newLocation.Latitude = response.coord.lat;
    newLocation.Longitude = response.coord.lon;
    addNewLocation(newLocation);
  }).fail(function () {
    console.log("getCoordsUsingWeatherQuery FAILED!");
  });
}

function makeWeatherQueryWithCoords(lat, lon) {
  // Using the coords on a more in depth 
  var URL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely&units=imperial&appid=" + WeatherAPIKey;
  $.ajax({
    url: URL,
    method: "GET"
  }).then(function (response) {
    displayCurrentWeatherInfo(response);
  });
} // ANCHOR Display and UI


function displayBackgroundImage(src) {
  // console.log("Setting background image to: ", src);
  $(mainBackgroundImg).attr("src", src);
}

function displayCurrentWeatherInfo(src) {
  // Need to display:
  // Temp, City Name, Date, Weather Icon, Humidity, Wind Speed, UV Index (with color code)
  console.log(src);
  var main = src.current.weather[0].main;
  var iconID = src.current.weather[0].icon;
  var iconURL = "http://openweathermap.org/img/wn/" + iconID + "@4x.png";
  var temp = Math.floor(src.current.temp);
  var humidity = src.current.humidity;
  var windSpeed = src.current.wind_speed;
  var uvi = src.current.uvi;
  $("#weatherDate span").text(); //TODO add date here

  $("#weatherLocation span").text(); //TODO add location

  $("#weatherTemperature span").text(temp + "°");
  $("#weatherIcon").attr("src", iconURL).attr("alt", main);
  $("#weatherHumidity span").text(humidity);
  $("#weatherWindSpeed span").text(windSpeed);
  $("#weatherUVI span").text(uvi);
}

function displayFiveDayWeatherInfo(src) {
  var temperature = [];

  for (var i = 0; i < 5; i++) {
    temperature.push(src.daily[i].temp.day);
  }
}

function displayCountryFlagOnLocationTab(tab, country) {
  var flag = "url('https://www.countryflags.io/" + country + "/flat/64.png')";
  $(tab).css("background-image", flag);
} // ANCHOR Event Listeners
// When Enter is pressed on the input


newLocationInputEl.addEventListener('keyup', function (e) {
  if (e.key === 'Enter') {
    event.preventDefault();
    createNewLocationUsingWeatherQuery(newLocationInputEl.value);
    newLocationInputEl.value = "";
  }
}); // When A Location Tab is pressed or changed

$(document).on("change", ".locationRadioWrapper", function () {
  changeCurrentLocation($(this).attr("data-name"));
}); // When A new Location Search Type is clicked

$("#locationSearchType").on("click", "label", function () {
  // Find the respective input of this label
  var targetid = $(this).attr("for");
  var newVal = $("#" + targetid).val();
  searchType = newVal;
});
init();