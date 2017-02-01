const MONEY_ATTRIB = "data-money";
const REPEATING_ATTRIB = "data-repeating";
const VIN_ATTRIB = "data-vin";
const ZERO_ATTRIB = "data-zero";
const ERROR_ATTRIB = "data-error";

function addRepeatEvents(inputs) {
    for (let i = 0; i < inputs.length; ++i) {
        inputs[i].addEventListener('input', duplicateRow)
        inputs[i].addEventListener('blur', deleteRow);
    }
}

function removeRepeatEvents(inputs) {
    for (let i = 0; i < inputs.length; ++i) {
        inputs[i].removeEventListener('input', duplicateRow)
        inputs[i].removeEventListener('blur', deleteRow);
    }
}

function addMoneyEvents(inputs) {
    for (let i = 0; i < inputs.length; ++i) {
        if (inputs[i].hasAttribute(MONEY_ATTRIB)) {
            inputs[i].addEventListener("focus", loadRawMoneyValue);
            inputs[i].addEventListener("blur", loadPrettyMoneyValue);
            inputs[i].addEventListener("keypress", ensureNumberValue);
            // Only for hidden helper
            // inputs[i].addEventListener('change', updateTotal);
        }
    }
}

function removeMoneyEvents(inputs) {
    for (let i = 0; i < inputs.length; ++i) {
        if (inputs[i].hasAttribute(MONEY_ATTRIB)) {
            inputs[i].removeEventListener("focus", loadRawMoneyValue);
            inputs[i].removeEventListener("blur", loadPrettyMoneyValue);
            inputs[i].removeEventListener("keypress", ensureNumberValue);
            inputs[i].removeEventListener('change', updateTotal);
        }
    }
}

function addVinEvents(inputs) {
    for (let i = 0; i < inputs.length; ++i) {
        if (inputs[i].hasAttribute(VIN_ATTRIB)) {
            inputs[i].addEventListener('blur', vinUpdated);
        }
    }
}

function removeVinEvents(input) {
    for (let i = 0; i < inputs.length; ++i) {
        if (inputs[i].hasAttribute(VIN_ATTRIB)) {
            inputs[i].removeEventListener('blur', vinUpdated);
        }
    }
}



function loadInvoiceInputs() {

    setupMoneyFields();
    setupRowDuplication();
    setupVINFields();
    clearZeroFields();
}


function setupRowDuplication() {
    const rows = document.querySelectorAll("*[" + REPEATING_ATTRIB + "]");

    for (let i = 0; i < rows.length; ++i) {
        addRepeatEvents(rows[i].getElementsByTagName('input'));
    }
}

function setupMoneyFields() {
    var moneyInputs = document.querySelectorAll("*[" + MONEY_ATTRIB + "]");
    var inputsToAddEvents = [];


    for (let i = 0; i < moneyInputs.length; ++i) {
        const input = moneyInputs[i];

        if (input instanceof HTMLInputElement && input.type === "text") {
            const clone = input.cloneNode(true);
            clone.type = "hidden";
            clone.addEventListener('change', updateTotal);
            clone.removeAttribute(MONEY_ATTRIB);

            input.insertAdjacentElement("afterend", clone);
            input.removeAttribute("name");

            inputsToAddEvents.push(input);
        }
    }

    addMoneyEvents(inputsToAddEvents);
}

function setupVINFields() {
    const inputs = document.querySelectorAll("*[" + VIN_ATTRIB + "]");
    addVinEvents(inputs);
}

function clearZeroFields() {
    const inputs = document.querySelectorAll("*[" + ZERO_ATTRIB + "]");

    for (let i = 0; i < inputs.length; ++i) {
        if (inputs[i].value === "0") inputs[i].value = "";
    }
}




function duplicateRow(e) {
    const input = e.currentTarget;
    const repeatRow = findRepeatingParent(input);
    const container = repeatRow.parentNode;

    if (!input || !repeatRow || !container) return;

    if (container.lastElementChild === repeatRow && input.value !== "") {
        const clone = repeatRow.cloneNode(true);

        const inputs = clone.getElementsByTagName('input');

        for (let i = 0; i < inputs.length; ++i) inputs[i].value = "";

        addMoneyEvents(inputs);
        addRepeatEvents(inputs);
        addVinEvents(inputs);

        container.appendChild(clone);
    }
}

function deleteRow(e) {
    const input = e.currentTarget;
    const repeatRow = findRepeatingParent(input);
    const container = repeatRow.parentNode;

    if (container.lastElementChild !== repeatRow && input.value === "") {
        const inputs = repeatRow.getElementsByTagName("input");

        let allEmpty = true;

        for (let i = 0; i < inputs.length; ++i) {
            allEmpty &= inputs[i].value === "";
        }

        if (allEmpty) {
            removeRepeatEvents(inputs);

            for (let i = 0; i < inputs.length; ++i) {

                removeMoneyEvents(inputs[i]);
            }

            repeatRow.nextElementSibling.getElementsByTagName("input")[0].focus();
            container.removeChild(repeatRow);
        }
    }
}

function loadRawMoneyValue(e) {
    const prettyValueNode = e.currentTarget;
    const realValueNode = e.currentTarget.nextElementSibling;

    prettyValueNode.value = realValueNode.value;
}

function loadPrettyMoneyValue(e) {
    // Get the nodes
    const prettyValueNode = e.currentTarget;
    const realValueNode = e.currentTarget.nextElementSibling;

    // Get the values
    const oldValue = parseFloat(0 + realValueNode.value);
    let newValue = parseFloat(prettyValueNode.value);

    // Update the realValue
    realValueNode.value = prettyValueNode.value;

    // If it's empty, stop here
    if (prettyValueNode.value === "") {
        updateTotal(realValueNode);
        return;
    }

    // If we don't have a number, zero out
    if (isNaN(newValue)) {
        newValue = 0;
        realValueNode.value = "0";
    }

    // Make the pretty value
    prettyValueNode.value = "$ " + newValue.toFixed(2);
    updateTotal(realValueNode);
}

function ensureNumberValue(e) {
    // 46 = '.'; 48 = '0'; 57 = '9'
    if (e.keyCode !== 46 && (e.keyCode < 48 || e.keyCode > 57)) {
        e.preventDefault();
        return;
    }

    if (e.srcElement.value === "" && e.keyCode === 46);
    else {
        oldValue = e.srcElement.value;
        setTimeout(() => {
            if (isNaN(e.srcElement.value)) {
                e.srcElement.value = oldValue;
            }
        }, 0);
    }
}

function findRepeatingParent(node) {
    if (node === null || node.hasAttribute(REPEATING_ATTRIB)) return node;

    return findRepeatingParent(node.parentNode);
}

function updateTotal(input) {
    if (!updateTotal.total) {
        updateTotal.total = 0;
    }

    let oldValue = input.oldValue;
    let newValue = parseFloat("0" + input.value);

    if (!oldValue) oldValue = 0;

    input.oldValue = newValue;

    const deltaValue = newValue - oldValue;

    updateTotal.total += deltaValue;

    document.getElementById("invoiceTotalDue").innerHTML = "$ " + updateTotal.total.toFixed(2);
}

function vinUpdated(e) {

    var vinField = e.currentTarget;
    var parent = vinField.parentNode.parentNode;

    var yearField = parent.getElementsByClassName("year")[0].getElementsByTagName('input')[0];
    var makeField = parent.getElementsByClassName("make")[0].getElementsByTagName('input')[0];

    if (vinField.value == "") {
        yearField.value = makeField.value = "";
    }

    if (validateVIN(vinField.value)) {
        e.currentTarget.removeAttribute(ERROR_ATTRIB);
        setYear(yearField, vinField.value);
        setMake(makeField, vinField.value);
    }
    else {
        yearField.value = "INVALID";
        makeField.value = "INVALID";

        vinField.setAttribute(ERROR_ATTRIB, "");
    }
}

function setYear(yearField, vin) {
    var year = vin[9];

    if (isNaN(year)) {
        year = year.toUpperCase().charCodeAt(0);
        if (year == 84) {
            year = 1996; //If T then 1996
        }
        else if (year >= 86 && year < 90) {
            year = year - 86 + 1997; //If V (86) then subtract that and add 1997 (Value of V) for proper year
        }
        else if (year >= 65 && year < 73) {
            year = year - 65 + 2010 // If A (65) then subtract that and add 2010 (Value of A) for proper year
        }
        else if (year >= 74 && year < 79) {
            year = year - 74 + 2018 // If J (74) then subtract that and add 2018 (Value of J) for proper year
        }
        else if (year == 80) {
            year = 2023 // If P (80) then 2023
        }
        else if (year >= 82 && year < 84) {
            year = year - 82 + 2024 // If R (82) then subtract that and add 2023 (Value of R) for proper year
        }
    }
    // Must be a number, since the above passed
    else {
        year = 2000 + parseInt(year);
    }

    yearField.value = year;
}

function setMake(makeField, vin) {

    var make = vin.substr(1, 2).toUpperCase();

    switch (make) {
        case "AK":
        case "FU": // Freightliner
            makeField.value = "Freightliner";
            break;
        case "HS": // International
            makeField.value = "International";
            break;
        case "XK":
        case "WK": // Kenworth
            makeField.value = "Kenworth";
            break;
        case "XP": // Peterbilt
            makeField.value = "Peterbilt";
            break;
        case "V1":
        case "V2":
        case "V3":
        case "V4":
        case "VJ":
        case "VK": // Volvo
            makeField.value = "Volvo";
            break;
        case "GR": // Great Dane
            makeField.value = "Great Dane";
            break;
        case "L0": // Lufkin
            makeField.value = "Lufkin";
            break;
        case "UY":
            makeField.value = "Utility";
            break;
        case "JJ": // Wabash
            makeField.value = "Wabash";
            break;
        case "1V": // Ottawa
            makeField.value = "Ottawa";
            break;
        case "LM": // Capacity
            makeField.value = "Capacity";
            break;
        case "P9":
            makeField.value = "Pratt";
            break;
        default:
            makeField.value = "INVALID";
    }

}


function validateVIN(vin) {
    // Check check digit
    // Visit http://en.wikipedia.org/wiki/Vehicle_Identification_Number#Check_digit_calculation for more info
    var alphaNum = {
        "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8, "I": 9,
        "J": 1, "K": 2, "L": 3, "M": 4, "N": 5, "O": 6, "P": 7, "Q": 8, "R": 9,
        "S": 2, "T": 3, "U": 4, "V": 5, "W": 6, "X": 7, "Y": 8, "Z": 9,
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9
    };
    var posWeight = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    var vinProduct = 0;

    for (var i = parseInt(0) ; i < 17; i++) {
        vinProduct += parseInt(alphaNum[vin[i]]) * parseInt(posWeight[i]);
    }

    var valid = vinProduct % 11;
    if (valid == 10) { valid = "X"; }

    console.log("Check Digit: " + valid);

    if (vin.length < 17 || vin[8] != valid) {
        return false;
    }
    return true;

}


loadInvoiceInputs();
