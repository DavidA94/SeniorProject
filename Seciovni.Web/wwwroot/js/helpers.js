/**
 * Created by David on 01/31/17.
 */

/**
 * @callback ValidTokenCallback
 * @param {boolean} gotValidResponse
 * @param {string|null} token
 */

/**
 * @callback xmlHttpCallback
 * @param {XMLHttpRequest|null} xmlhttp
 */

/**
 * Ensures we have a valid token in the local storage
 * @param {ValidTokenCallback} callback - The method to call once the token has been retrieved
 */
function ensureValidToken(callback){
    // If we have the token time
    if(localStorage.getItem("AuthorizationTokenTime") && !ensureValidToken.got401){

        // Get it, and make it into a date
        const expires = new Date(localStorage.getItem("AuthorizationTokenTime"));

        // If we haven't expired, we're good
        if(expires - Date.now() > 0){
            callback(true, localStorage.getItem("AuthorizationToken"));
            return;
        }
    }

    // If we make it to here, we need to get the token again

    // Create a new AJAX request
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            if (xmlhttp.status === 200) {
                const response = JSON.parse(xmlhttp.response.toString());

                localStorage.setItem(AUTH_TOKEN, response["token"]);
                localStorage.setItem(AUTH_TOKEN_TIME, response["expires"]);

                ensureValidToken.got401 = false;

                callback(true, response["token"]);
            }
            else {
                callback(false, null);
            }
        }
    };

    xmlhttp.open("GET", "/Account/GetAuthToken", true);
    xmlhttp.send()
}

/**
 * Used for the 'keypress' event, and ensures that the input given is a number
 * @param e
 */
function numericInput_keypress(e){
    // 46 = '.'; 48 = '0'; 57 = '9'

    // If it's not a ".", or [0-9], then no-go
    if (e.keyCode !== 46 && (e.keyCode < 48 || e.keyCode > 57)) {
        e.preventDefault();
        return;
    }

    // If we're currently empty, and they put a ".", then that's okay
    if (e.srcElement.value === "" && e.keyCode === 46){}
    else {
        // Remember the old value
        const oldValue = e.srcElement.value;

        // The very next thing should be to see if the new value is a number.
        // If it isn't, then restore the old value
        setTimeout(() => {
            if (isNaN(e.srcElement.value)) {
                e.srcElement.value = oldValue;
            }
        }, 0);
    }
}

/**
 * Handles the keydown event for invoice inputs
 * @param e - The original keydown event
 * @param {HTMLDivElement} parentRow - The parent row for the element that had the key pressed
 * @param {MiscCharge|Payment|Vehicle} object - The object that owns the field that was modified
 */
function invoice_keydown(e, parentRow, object) {

    if(e.altKey) {
        if (e.keyCode >= 37 && e.keyCode <= 40) e.preventDefault();

        // Left
        if (e.keyCode === 37 && e.currentTarget.parentNode.previousElementSibling) {
            let nodeToFocus = e.currentTarget.parentNode.previousElementSibling.firstElementChild;

            while (nodeToFocus && nodeToFocus.disabled) {
                nodeToFocus = nodeToFocus.parentNode.previousElementSibling.firstElementChild;
            }

            if (nodeToFocus) nodeToFocus.focus();
        }
        // Up -- Need to check two up because of header row
        else if (e.keyCode === 38 && parentRow.previousElementSibling.previousElementSibling) {
            parentRow.previousElementSibling
                .getElementsByClassName(e.currentTarget.parentNode.className)[0]
                .firstElementChild
                .focus();
        }
        // Right
        else if (e.keyCode === 39 && e.currentTarget.parentNode.nextElementSibling) {
            let nodeToFocus = e.currentTarget.parentNode.nextElementSibling.firstElementChild;

            while (nodeToFocus && nodeToFocus.disabled) {
                nodeToFocus = nodeToFocus.parentNode.nextElementSibling.firstElementChild;
            }

            if (nodeToFocus) nodeToFocus.focus();
        }
        // Down
        else if (e.keyCode === 40 && parentRow.nextElementSibling) {
            parentRow.nextElementSibling
                .getElementsByClassName(e.currentTarget.parentNode.className)[0]
                .firstElementChild
                .focus();
        }

        // Delete -- Ensure not the last row
        else if(e.keyCode === 46 && parentRow.nextElementSibling){
            object.destroy();
        }
    }
}

/**
 * Posts a call to the API
 * @param {string} url - The relative URL to the API (after /api/)
 * @param {string} method - The type of method to use when sending to the server
 * @param {JSON} data - The JSON data to send to the server -- null for GET request
 * @param {xmlHttpCallback} callback - The callback when the ready state changes
 */
function sendToApi(url, method, data, callback){
    ensureValidToken((gotValidResponse, token) => {

        if(gotValidResponse) {
            // Create a new AJAX request
            const xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = (e) => {
                callback(e.currentTarget);
            };

            let openString = "https://localhost:44357/api/" + url;
            if(method.toUpperCase() === "GET" && data){
                openString += "?" + data.toString();
            }

            xmlhttp.open(method, openString, true);
            xmlhttp.setRequestHeader("Authorization", "Bearer " + token);
            if(method.toUpperCase() !== "GET" && data) {
                xmlhttp.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                xmlhttp.send(data.toString());
            }
            else {
                xmlhttp.send();
            }
        }
        else {
            callback(null);
        }
    });
}

/**
 * Makes a number be pretty, such as "$ 0.00"
 * @param {number} value - The value to parse
 * @param {string} prefix - The prefix for the value
 * @param {number} fixedPlaces - The number of decimal places
 * @return {string}
 */
function prettifyNumber(value, prefix, fixedPlaces){
    // Fix the decimal points
    let tempVal = value.toFixed(fixedPlaces);

    // Add commas
    tempVal = tempVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Add the prefix
    tempVal = prefix + tempVal;

    return tempVal;
}

/**
 * Converts a pixel measure to points
 * @param {string} data - The original pixel data
 * @return {string}
 */
function pxToPt(data){
    return (parseFloat(data) * (1)).toFixed(3);
}

/**
 * Converts a point measurement to pixels
 * @param {string} data - The original pixel data
 * @return {number}
 */
function ptToPx(data){
    return parseFloat(data);
}

/**
 * Gets the binding options for the current context
 * @param {BindingContext} bindingContext - The binding context
 * @return {{category: string display: string, value: string}[]}
 */
function getBindingOptions(bindingContext){
   if(!getBindingOptions[bindingContext]){
        let response = null;

        sendToApi("FormBuilder/BindingOptions/" + bindingContext, "GET", null, (xmlhttp) => {
            // No-op
            if(!xmlhttp) return;
            if(xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    response = xmlhttp.response;
                }

                getBindingOptions[bindingContext] = JSON.parse(response);
            }
        });
    }

    return getBindingOptions[bindingContext];
}

/**
 * Gets the search fields
 * @return {{category: string display: string, type: SearchFieldType, value: string}[]}
 */
function getSearchFields(){
    const KEY = "fields";
    if(getSearchFields[KEY] === undefined){
        getSearchFields[KEY] = null;
        let response = null;

        sendToApi("Search/SearchFields/", "GET", null, (xmlhttp) => {
            // No-op
            if(!xmlhttp) return;
            if(xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    response = xmlhttp.response;
                }

                getSearchFields[KEY] = JSON.parse(response);
            }
        });
    }

    return getSearchFields[KEY];
}

/**
 * Gets the available permissions, in an array with [permission, friendly name, description]
 * @return {string[]}
 */
function getPermissions(){
    const KEY = "permissions";
    if(getPermissions[KEY] === undefined){
        getPermissions[KEY] = null;
        let response = null;

        sendToApi("Settings/Privileges/", "GET", null, (xmlhttp) => {
            // No-op
            if(!xmlhttp) return;
            if(xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.status === 200) {
                    response = xmlhttp.response;
                }

                getPermissions[KEY] = JSON.parse(response);
            }
        });
    }

    return getPermissions[KEY];
}

/**
 * Makes a number pretty
 * @param {number} number - The number to prettify
 * @param {string} prefix - The prefix for the number
 * @param {number} fixedPlaces - How many decimal places to have
 * @return {string}
 */
function makeNumberPretty(number, prefix, fixedPlaces) {
    /**
     * @type {number|string}
     */
    let pretty = number;

    // If zero, and the prefix is null, then make it be displayed as "-"
    if(pretty === 0 && prefix === null){
        return "-";
    }

    // Fix the decimal points, if necessary
    if(fixedPlaces > 0){
        pretty = pretty.toFixed(fixedPlaces);
    }

    pretty = pretty.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Add the prefix if there is one
    if(prefix) pretty = prefix + pretty;

    return pretty;
}

/**
 * Shows a full screen loader
 */
function showFullScreenLoading(){
    hideFullScreenLoading();

    const element = document.createElement("div");
    element.id = "fullScreenLoading";
    document.body.appendChild(element);
}

/**
 * Hides a full screen loader
 */
function hideFullScreenLoading(){
    const element = document.getElementById("fullScreenLoading");
    if(element){
        element.remove();
    }
}

/**
 * Shows the given DIV as a modal dialog
 * @param div - The DIV that is the dialog
 * @param hideCallback - The method to call if outside the dialog is clicked
 */
function showModalDialog(div, hideCallback){
    div.style.visibility = "hidden";
    div.style.display = "block";

    positionModalDialog(div);
    div.style.visibility = "visible";

    const background = makeHtmlElem({tag:"div", id: DIALOG_BACKGROUND});
    if(hideCallback) background.addEventListener('click', hideCallback);
    document.body.appendChild(background)
}

/**
 * Hides a dialog that was shown with showModalDialog
 * @param div - The DIV that is the dialog
 * @param hideCallback - The method that was passed to showModalDialog
 */
function hideModalDialog(div, hideCallback){
    div.style.display = "none";

    const background = document.getElementById(DIALOG_BACKGROUND);
    if(hideCallback) background.removeEventListener('click', hideCallback);
    background.remove();
}

/**
 * Positions the given dialog vertically
 * @param div - The DIV that is the dialog
 */
function positionModalDialog(div){
    const size = div.getBoundingClientRect();
    div.style.top = ((window.innerHeight - size.height) / 2) + "px";
}