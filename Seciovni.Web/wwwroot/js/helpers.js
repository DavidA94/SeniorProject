/**
 * Created by David on 01/31/17.
 */

function makeMoneyInputPretty(input, value){
    
    // Leave blank if set to as such
    if (input.value === "") {
        input.value = "";
        return;
    }

    // If we don't have a number, zero out
    if (isNaN(value)) {
        value = 0;
    }

    // Make the pretty value
    input.value = "$ " + parseFloat(value).toFixed(2);
}

function makeMoneyInputEditable(input, value){
    input.value = value;
}

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