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
}

// ANCHOR Location Management Functions
function addNewLocation(newLocation) {
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

    let location = currentLocation.Name + ", " + currentLocation.Country;
    $("#weatherLocation span").text(location); //TODO add location

    let date = src.current.dt;
    $("#weatherDate span").text(getTimestampFromUnixTime(date)); //TODO add date here

    let iconID = src.current.weather[0].icon;
    let iconURL = "http://openweathermap.org/img/wn/" + iconID + "@4x.png";
    $("#weatherIcon").attr("src", iconURL).attr("alt", main);

    let temp = Math.floor(src.current.temp);
    $("#weatherTemperature span").text(temp + "°");

    let humidity = src.current.humidity;
    $("#weatherHumidity span").text(humidity);

    let windSpeed = src.current.wind_speed;
    $("#weatherWindSpeed span").text(windSpeed);

    let uvi = src.current.uvi;
    $("#weatherUVI span").text(uvi);
}

function getTimestampFromUnixTime(time) {
    let dateObject = new Date(time * 1000); // Convert to milliseconds
    let dateFormat = dateObject.toLocaleString("en-US", {weekday: "long", month: "long", day: "numeric", year: "numeric"});
    
    return dateFormat;
}

function displayFiveDayWeatherInfo(src) {
    let temperature = [];
    for(let i = 0; i < 5; i++) { temperature.push(src.daily[i].temp.day); }
}

function displayCountryFlagOnLocationTab(tab, country){
    let flag = "url('https://www.countryflags.io/" + country + "/flat/64.png')"
    $(tab).css("background-image", flag);
}

function toggleDayView(){
    $("#main__grid-daily").toggleClass("main-active");
    $("#main__grid-weekly").toggleClass("main-active");
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