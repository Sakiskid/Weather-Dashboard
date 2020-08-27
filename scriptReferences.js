/* This is a script I'm using to store all of my variables and references.
I'm not sure if this is bad practice, but it's something I 
wanted to try with this project so I can have one single
place to change all of my variables. */

// --------------------------------- //

// ANCHOR References

var newLocationInputEl = document.getElementById("newLocationInput");
var mainBackgroundImg = document.getElementById("mainBackgroundImg");
var locationSelection = document.getElementById("locationSelection"); // The buttons for selecting location

var currentLocation;
var currentResponse;

// Local Storage Location Object

var savedLocations = [];
var locationObjectTemplate = {
    Name: "N/A",
    Country: "N/A",
    Latitude: "0",
    Longitude: "0",
    CityID: "0"
}

// ANCHOR Variables (ints and such)

var gameTime = 500;



