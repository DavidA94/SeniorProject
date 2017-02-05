/**
 * Created by David on 01/31/17.
 */

/**
 * Ensures we have a valid token in the local storage
 * @return {boolean}
 */
function ensureValidToken(){
    // If we have the token time
    if(localStorage.getItem("AuthorizationTokenTime")){

        // Get it, and make it into a date
        const expires = new Date(localStorage.getItem("AuthorizationTokenTime"));

        // If we haven't expired, we're good
        if(expires - Date.now() > 0){
            return true;
        }
    }

    // If we make it to here, we need to get the token again

    // Create a new AJAX request
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                const response = JSON.parse(xmlhttp.response.toString());

                localStorage.setItem(AUTH_TOKEN, response["token"]);
                localStorage.setItem(AUTH_TOKEN_TIME, response["expires"]);

                return true;
            }
            else {
                return false;
            }
        }
    };

    xmlhttp.open("GET", "/Account/GetAuthToken", false);
    xmlhttp.send()
}

/**
 * Used for the 'keypress' event, and ensures that the input given is a number
 * @param e
 */
function numricInput_keypress(e){
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

function invoice_keydown(e, parentRow) {
    if(e.keyCode >= 37 && e.keyCode <= 40) e.preventDefault();

    // Left
    if (e.keyCode == 37 && e.currentTarget.parentNode.previousElementSibling) {
        let nodeToFocus = e.currentTarget.parentNode.previousElementSibling.firstElementChild;

        while (nodeToFocus && nodeToFocus.disabled) {
            nodeToFocus = nodeToFocus.parentNode.previousElementSibling.firstElementChild;
        }

        if (nodeToFocus) nodeToFocus.focus();
    }
    // Up -- Need to check two up because of header row
    else if (e.keyCode == 38 && parentRow.previousElementSibling.previousElementSibling) {
        parentRow.previousElementSibling
            .getElementsByClassName(e.currentTarget.parentNode.className)[0]
            .firstElementChild
            .focus();
    }
    // Right
    else if (e.keyCode == 39 && e.currentTarget.parentNode.nextElementSibling) {
        let nodeToFocus = e.currentTarget.parentNode.nextElementSibling.firstElementChild;

        while (nodeToFocus && nodeToFocus.disabled) {
            nodeToFocus = nodeToFocus.parentNode.nextElementSibling.firstElementChild;
        }

        if (nodeToFocus) nodeToFocus.focus();
    }
    // Down
    else if (e.keyCode == 40 && parentRow.nextElementSibling) {
        parentRow.nextElementSibling
            .getElementsByClassName(e.currentTarget.parentNode.className)[0]
            .firstElementChild
            .focus();
    }
}