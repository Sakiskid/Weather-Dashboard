// OWM Key: 57477b62efa91ed093f455c4b16426d8
// Unsplash Key: JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso

var unsplashAPIKey = "&client_id=JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso";
var WeatherAPIKey = "57477b62efa91ed093f455c4b16426d8";
var searchType = "q"; // Default search type

// Element Templates for DOM manipulation:
var radioWrapperTemplate;

// ANCHOR Initialization Functions
function init(){
    if(savedLocations) savedLocations = JSON.parse(getLocalStorage("savedLocations"));
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
        newButton.attr("data-storage-key", savedLocations[i].Name);
        newButton.find("span").text(savedLocations[i].Name);
        displayCountryFlagOnLocationTab(newButton, savedLocations[i].Country);
        
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
    var queryParameters = "&per_page=1&query=landscape " + query;
    var unsplashURL = "https://api.unsplash.com/search/photos?" + queryParameters + unsplashAPIKey;
    console.log(unsplashURL);

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
        displayCurrentWeatherInfo(response);
    });
}

// ANCHOR Display and UI
function displayBackgroundImage(src){
    // console.log("Setting background image to: ", src);
    $(mainBackgroundImg).attr("src", src);
}

function displayCurrentWeatherInfo(src) {
    // Need to display:
    // Temp, City Name, Date, Weather Icon, Humidity, Wind Speed, UV Index (with color code)
    console.log(src);

    let main = src.current.weather[0].main;
    let iconID = src.current.weather[0].icon;
    let iconURL = "http://openweathermap.org/img/wn/" + iconID + "@2x.png";
    let temp = src.current.temp;
    let humidity = src.current.humidity;
    let windSpeed = src.current.wind_speed;
    let uvi = src.current.uvi;

    $("#weatherDate").text(); //TODO add date here
    $("#weatherLocation").text(); //TODO add location
    $("#weatherTemperature").text(temp);
    $("#weatherIcon").attr("src", iconURL).attr("alt", main);
    $("#weatherHumidity").text(humidity);
    $("#weatherWindSpeed").text(windSpeed);
    $("#weatherUVI").text(uvi);
}

function displayFiveDayWeatherInfo(src) {
    let temperature = [];
    for(let i = 0; i < 5; i++) { temperature.push(src.daily[i].temp.day); }
}

function displayCountryFlagOnLocationTab(tab, country){
    let flag = "url('https://www.countryflags.io/" + country + "/flat/64.png')"
    $(tab).css("background-image", flag);
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
    // Get Location, then set lat and lon for the coordsQuery.
    let key = $(this).attr("data-storage-key");
    let location;
    for (let i = 0; i < savedLocations.length; i++) { // Look for the respective location object
        if(savedLocations[i].Name === key) { 
            location = savedLocations[i];
        }
    }
    let lat = location.Latitude;
    let lon = location.Longitude;

    // Checked class handling for css styling
    $(".locationRadioWrapper").removeClass("checked");
    $(this).addClass("checked");

    // Queries
    makeUnsplashQuery(location.Name);
    makeWeatherQueryWithCoords(lat, lon);
});

// When A new Location Search Type is clicked
$("#locationSearchType").on("click", "label", function() {
    // Find the respective input of this label
    let targetid = $(this).attr("for");
    let newVal = $("#" + targetid).val();
    searchType = newVal;
})

init();