// OWM Key: 57477b62efa91ed093f455c4b16426d8
// Unsplash Key: JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso

var unsplashAPIKey = "&client_id=JHO_3swVG5HRFrh4OfuEWVOCSgvzxb9XnNrPwDD4Uso";
var WeatherAPIKey = "57477b62efa91ed093f455c4b16426d8";
var savedLocations = [];

// Element Templates for DOM manipulation:
var radioWrapperTemplate;

// ANCHOR Initialization Functions
function init(){
    savedLocations = JSON.parse(getLocalStorage("savedLocations", "Austin"));
    initializeElementTemplates();
    populateLocationButtons();
}

function initializeElementTemplates(){
    radioWrapperTemplate = $(".locationRadioWrapper").clone();
    $(".locationRadioWrapper").remove();
}

function populateLocationButtons(){
    for(let i = 0; i < savedLocations.length; i++){
        let newButton = radioWrapperTemplate.clone();
        newButton.attr("data-location", savedLocations[i]);
        newButton.find("span").text(savedLocations[i]);
        $(locationSelection).append(newButton);
    }
}

// ANCHOR Location Management Functions
function addNewLocation() {
    // Add new location to saved locations, then set saved locations to localStorage
    savedLocations.push(newLocationInputEl.value);
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
}

// ANCHOR Queries
function makeUnsplashQuery(query){
    var queryParameters = "&query=" + query;
    var unsplashURL = "https://api.unsplash.com/search/photos?" + queryParameters + unsplashAPIKey;

    $.ajax({
        url: unsplashURL,
        method: "GET"
    }).then(function(response){
        // console.log(response);
        displayBackgroundImage(response.results[0].urls.full);
    });
}

function makeWeatherQuery(query){
    var queryParameters = "";
    var WeatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + query + "&exclude=minutely&appid=" + WeatherAPIKey;
    
    $.ajax({
        url: WeatherURL,
        method: "GET"
    }).then(function(response){
        console.log("Weather Response: ", response);
    });
}

// ANCHOR Display and UI
function displayBackgroundImage(src){
    console.log("Setting background image to: ", src);
    $(mainBackgroundImg).attr("src", src);
}

// ANCHOR Event Listeners
newLocationInputEl.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        event.preventDefault();
        addNewLocation();
    }
});

$(document).on("change", ".locationRadioWrapper", function () {
    let location = $(this).attr("data-location");
    $(".locationRadioWrapper").removeClass("checked");
    $(this).addClass("checked");
    makeUnsplashQuery(location);
    makeWeatherQuery(location);
});

init();