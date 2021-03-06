// OWM Key: 57477b62efa91ed093f455c4b16426d8
// Unsplash Key: JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso

var unsplashAPIKey = "&client_id=JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso";
var WeatherAPIKey = "57477b62efa91ed093f455c4b16426d8";
var searchType = "q"; // Default search type

// Element Templates for DOM manipulation:
var radioWrapperTemplate;

// ANCHOR Initialization Functions
function init(){
    if (getLocalStorage("savedLocations") !== "") savedLocations = JSON.parse(getLocalStorage("savedLocations"));
    if (getLocalStorage("savedLocations") == "") {
        $("main").css("visibility", "hidden");
    }
    initializeElementTemplates();
    populateLocationButtons();
    loadDefaultLocation();
}

function initializeElementTemplates(){
    radioWrapperTemplate = $(".locationRadioWrapper").clone();
    $(".locationRadioWrapper").remove();
}

function populateLocationButtons(){
    $(locationSelection).empty();
    for(let i = 0; i < savedLocations.length; i++){
        let newButton = radioWrapperTemplate.clone();
        newButton.attr("data-name", savedLocations[i].Name);
        newButton.attr("id", "location-" + savedLocations[i].Name);
        newButton.find("span").text(savedLocations[i].Name);
        displayCountryFlagOnLocationTab(newButton, savedLocations[i].Country);
        
        $(locationSelection).append(newButton);
    }
}

function loadDefaultLocation() {
    if(localStorage.getItem("defaultLocation")) {
        changeCurrentLocation(localStorage.getItem("defaultLocation"));
    }
    else if (getLocalStorage("savedLocations") !== "") {
        changeCurrentLocation(savedLocations[0].Name);
    }
}

// ANCHOR Location Management Functions
function addNewLocation(newLocation) {
    $("main").css("visibility", "visible");
    // Add new location to saved locations, then set saved locations to localStorage
    savedLocations.push(newLocation);
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    populateLocationButtons();
}

function changeCurrentLocation (newLocationName) {
    // Get Location, then set lat and lon for the coordsQuery.
    for (let i = 0; i < savedLocations.length; i++) { // Look for the respective location object
        if(savedLocations[i].Name === newLocationName) { 
            currentLocation = savedLocations[i];
        }
    }
    let lat = currentLocation.Latitude;
    let lon = currentLocation.Longitude;

    // Checked class handling for css styling
    $(".locationRadioWrapper").removeClass("checked");
    $("#location-"+ currentLocation.Name).addClass("checked");

    // Queries
    makeUnsplashQuery(currentLocation.Name);
    makeWeatherQueryWithCoords(lat, lon);
}

function setDefaultLocation(newLocation) {
    console.log(newLocation);
    localStorage.setItem("defaultLocation", $(newLocation).parent().attr("data-name"));
}

// ANCHOR Queries
function makeUnsplashQuery(query){
    var queryParameters = "&per_page=1&query=landscape " + query;
    var unsplashURL = "https://api.unsplash.com/search/photos?" + queryParameters + unsplashAPIKey;

    $.ajax({
        url: unsplashURL,
        method: "GET"
    }).then(function(response){
        displayBackgroundImage(response.results[0].urls.small);
    });
}

function createNewLocationUsingWeatherQuery(query) {
    // This function is used when making the initial query on a new location, and is used mainly to get the coords.
    // Luckily, OWM allows 60 request per minute.
    var WeatherURL = "https://api.openweathermap.org/data/2.5/weather?" + searchType + "=" + query + "&appid=" + WeatherAPIKey;
    
    // Create new location to return
    let newLocation = { ...locationObjectTemplate };

    $.ajax({
        url: WeatherURL,
        method: "GET"
    }).then(function(response){
        console.log("getCoordsUsingWeatherQuery response: ",response);
        newLocation.Name = response.name;
        newLocation.Country = response.sys.country;
        newLocation.CityID = response.id;
        newLocation.Latitude = response.coord.lat;
        newLocation.Longitude = response.coord.lon;
        addNewLocation(newLocation);
        changeCurrentLocation(newLocation.Name);
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
    }).then(function(response){
        currentResponse = response;
        displayBasedOnCurrentWeatherView();
    });
}

// ANCHOR Display and UI
function displayBasedOnCurrentWeatherView() {
    if($("#main__grid-daily").hasClass("main-active")) {
        displayCurrentWeatherInfo(currentResponse);
    } 
    else if ($("#main__grid-weekly").hasClass("main-active")) {
        displayFiveDayWeatherInfo(currentResponse);
    }
}

function displayBackgroundImage(src){
    // console.log("Setting background image to: ", src);
    $(mainBackgroundImg).attr("src", src);
}

function displayCurrentWeatherInfo() {
    // Need to display:
    // Temp, City Name, Date, Weather Icon, Humidity, Wind Speed, UV Index (with color code)
    let src = currentResponse;

    let main = src.current.weather[0].main;

    let location = currentLocation.Name + ", " + currentLocation.Country;
    $("#weatherLocation span").text(location); //TODO add location

    let date = src.current.dt;
    $("#weatherDate span").text(getTimestampFromUnixTime(date)); //TODO add date here

    let iconID = src.current.weather[0].icon;
    let iconURL = "http://openweathermap.org/img/wn/" + iconID + "@4x.png";
    $("#weatherIcon").attr("src", iconURL).attr("alt", main);

    let temp = Math.floor(src.current.temp);
    $("#weatherTemperature span").text(temp + "°F");

    let humidity = src.current.humidity;
    $("#weatherHumidity span").text(humidity);

    let windSpeed = src.current.wind_speed;
    $("#weatherWindSpeed span").text(windSpeed);

    let uvi = src.current.uvi;
    updateUVIndexDisplay();
    $("#weatherUVI span").text(uvi);
}

function displayFiveDayWeatherInfo() {
    let daysToDisplay = 5;
    let src = currentResponse;

    // Populate and Display Variables
    let temperatureEls = document.getElementsByClassName("weekly-temp");
    let dateEls = document.getElementsByClassName("weekly-date");
    let dayEls = document.getElementsByClassName("weekly-weekday");
    let iconEls = document.getElementsByClassName("weekly-icon");
    let humidityEls = document.getElementsByClassName("weekly-humidity");
    for (let i = 0; i < daysToDisplay; i++) {
        $(temperatureEls[i]).text(Math.floor(src.daily[i].temp.day) + "°F");
        $(dateEls[i]).text(getTimestampFromUnixTime(src.daily[i].dt, "date"));
        $(dayEls[i]).text(getTimestampFromUnixTime(src.daily[i].dt, "weekday"));
        $(humidityEls[i]).text(src.daily[i].humidity);
        let iconURL = "http://openweathermap.org/img/wn/" + src.daily[i].weather[0].icon + "@4x.png";
        $(iconEls[i]).attr("src", iconURL).attr("alt", src.daily[i].weather[0].description);
    }
}

function updateUVIndexDisplay() {
    $("#uvslider").val(Math.floor(currentResponse.current.uvi));
}

/**
 * @param {number} time - Time in milliseconds since unix
 * @param {string} [format] - Options: "date", "weekday", "full". Default is "full".
 */
function getTimestampFromUnixTime(time, format) {
    let dateObject = new Date(time* 1000); // Convert to milliseconds, and determine which day it is
    let dateFormat;
    if(!format) { format = "full"; } // Set default to full.
    switch (format) {
        case "date":
            dateFormat = dateObject.toLocaleString("en-US", {month: "numeric", day: "numeric", year: "numeric"});
            break;
        case "weekday":
            dateFormat = dateObject.toLocaleString("en-US", {weekday: "long"});
            break;
        case "full":
            dateFormat = dateObject.toLocaleString(
                "en-US", {weekday: "long", month: "long", day: "numeric", year: "numeric"});
            break;
        default:
            console.log("Error! getTimestampFromUnixTime didn't recognize format: ", format);
    }
    return dateFormat;
}

function displayCountryFlagOnLocationTab(tab, country){
    let flag = "url('https://www.countryflags.io/" + country + "/flat/64.png')"
    $(tab).css("background-image", flag);
}

function toggleDayView(){
    $("#main__grid-daily").toggleClass("main-active");
    $("#main__grid-weekly").toggleClass("main-active");
    displayBasedOnCurrentWeatherView();
}

// ANCHOR Event Listeners

// When Enter is pressed on the input
newLocationInputEl.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        event.preventDefault();
        createNewLocationUsingWeatherQuery(newLocationInputEl.value);
        newLocationInputEl.value = "";
    }
});

// When A Location Tab is pressed or changed
$(document).on("change", ".locationRadioWrapper", function () {
    changeCurrentLocation($(this).attr("data-name"));
});

// When A new Location Search Type is clicked
$("#locationSearchType").on("click", "label", function() {
    // Find the respective input of this label
    let targetid = $(this).attr("for");
    let newVal = $("#" + targetid).val();
    searchType = newVal;
})

init();