"use strict";

/* Tyler Smith, August 2020. 
    Feel free to use any of these in any project, commercial or personal! 
    Crediting this repository or myself would be very appreciated, but is not required. 
    Do not redistribute this work as your own.*/

/**
 * Tries to retrieve key from local storage. If it doesn't exist, create a key:value pair.
 * @param {string} key - Name of key
 * @param {*} value - Optional. If empty, value will be set as "".
 * @example 
 * // If primaryAmount didn't exist, returns 50. Otherwise, returns the localStorage value of primaryAmount.
 * getLocalStorage("primaryAmount", 50);
 */
function getLocalStorage(key, value) {
  // See if the key exists, and return the value if so
  if (localStorage.getItem(key)) {
    return localStorage.getItem(key);
  } // Otherwise, create an empty key with value if it exists. Otherwise, an empty string.
  else {
      localStorage.setItem(key, value || "");
      return localStorage.getItem(key);
    }
}