// OWM Key: 57477b62efa91ed093f455c4b16426d8
// Unsplash Key: JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso

var unsplashAPIKey = "&client_id=JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso";
var WeatherAPIKey = "57477b62efa91ed093f455c4b16426d8";
var searchType = "q"; // Default search type

// Element Templates for DOM manipulation:
var radioWrapperTemplate;

// ANCHOR Initialization Functions
function init(){
    savedLocations = JSON.parse(getLocalStorage("savedLocations"));
    initializeElementTemplates();
    populateLocationButtons();
}

function initializeElementTemplates(){
    radioWrapperTemplate = $(".locationRadioWrapper").clone();
    $(".locationRadioWrapper").remove();
}

function populateLocationButtons(){
    $(locationSelection).empty();
    for(let i = 0; i < savedLocations.length; i++){
        let newButton = radioWrapperTemplate.clone();
        newButton.attr("data-location", savedLocations[i].Name);
        newButton.find("span").text(savedLocations[i].Name);
        $(locationSelection).append(newButton);
    }
}

// ANCHOR Location Management Functions
function addNewLocation(newLocation) {
    // Add new location to saved locations, then set saved locations to localStorage
    savedLocations.push(newLocation);
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    populateLocationButtons();
}

// ANCHOR Queries
function makeUnsplashQuery(query){
    var queryParameters = "&per_page=1&query=" + query;
    var unsplashURL = "https://api.unsplash.com/search/photos?" + queryParameters + unsplashAPIKey;

    $.ajax({
        url: unsplashURL,
        method: "GET"
    }).then(function(response){
        displayBackgroundImage(response.results[0].urls.small);
    });
}

function getCoordsUsingWeatherQuery(query) {
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
        newLocation.Country = response.country;
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
    var URL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely&appid=" + WeatherAPIKey;

    $.ajax({
        url: URL,
        method: "GET"
    }).then(function(response){
        displayCurrentWeatherInfo(response);
    });
}

// ANCHOR Display and UI
function displayBackgroundImage(src){
    // console.log("Setting background image to: ", src);
    $(mainBackgroundImg).attr("src", src);
}

function displayCurrentWeatherInfo(src){
    // let location = src.name;
    // let temperature = src.main.temp;

    console.log(src);

    // $("#weatherLocation").text()
}

// ANCHOR Event Listeners

// When Enter is pressed on the input
newLocationInputEl.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        event.preventDefault();
        getCoordsUsingWeatherQuery(newLocationInputEl.value);
    }
});

// When A Location Tab is pressed or changed
$(document).on("change", ".locationRadioWrapper", function () {
    let location = $(this).attr("data-location");
    $(".locationRadioWrapper").removeClass("checked");
    $(this).addClass("checked");
    makeUnsplashQuery(location);
    // getCoordsUsingWeatherQuery(location);
});

// When A new Location Search Type is clicked
$("#locationSearchType").on("click", "label", function() {
    // Find the respective input of this label
    let targetid = $(this).attr("for");
    let newVal = $("#" + targetid).val();
    searchType = newVal;
})

init();