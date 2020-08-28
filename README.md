![Minimalistic Weather Dashboard](https://i.gyazo.com/7d5f057c156aa76c483d72467ba85e6f.gif)

---

# Minimalistic Weather Dashboard

### [Click Here To Start](https://sakiskid.github.io/Weather-Dashboard/)

#### **8/27/2020** 

## Description:

Track weather in cities around the world with a daily and 5 day forecast.

## Features

- Three search types
- Sleek UI
- Daily and 5 Day Forecast
- Animated tabs and views

##### Noteworthy:
- Cute flags of the respective country
- Custom Images (Courtesy of Unsplash API)
- UV Index is measured from standard 0 - 11. Being summer, most UVI are higher (global warming is real)

## Execution:
- Created templates using an initializeElementTemplates() function, clone(), and remove(). This keeps my templates in JS, but removes them from the HTML until they are needed!
- Used sass mixin for pseudoelements. Pseudoelements have like 4 different styles that need to be changed for them to even appear.

### Things I learned

- More experience with css and css grid in lieu of Bootstrap
- Ended up putting addNewLocation() call into the getCoordsUsingWeatherQuery() function. I had to wait until ajax was done loading before calling the new location, otherwise it would return undefined. Really weird issue that took me a long time to figure out
- Formatting and layout of stylesheet. Used more comments, and came up with a neat way to organize my CSS selectors.
- Single line if statements dont need squigly brackets
- It was better to animate `top` instead of `height` for the locationRadioWrappers, because I wanted them to come up like tabs.