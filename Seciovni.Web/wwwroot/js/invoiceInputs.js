const MONEY_ATTRIB = "data-money";
const REPEATING_ATTRIB = "data-repeating";

function addMoneyEvents(input) {
    input.addEventListener("focus", loadRawMoneyValue);
    input.addEventListener("blur", loadPrettyMoneyValue);
    input.addEventListener("keypress", ensureNumberValue);
}

function removeMoneyEvents(input) {
    input.removeEventListener("focus", loadRawMoneyValue);
    input.removeEventListener("blur", loadPrettyMoneyValue);
    input.removeEventListener("keypress", ensureNumberValue);
    input.removeEventListener('change', updateTotal);
}

function addRepeatEvents(input) {
    input.addEventListener('input', duplicateRow)
    input.addEventListener('blur', deleteRow);
}

function removeRepeatEvents(input){
    input.removeEventListener('input', duplicateRow)
    input.removeEventListener('blur', deleteRow);
}

function loadInvoiceInputs() {
    setupMoneyFields();
    setupRowDuplication();
}

function setupRowDuplication() {
    const rows = document.querySelectorAll("*[" + REPEATING_ATTRIB + "]");

    for (let i = 0; i < rows.length; ++i) {
        const inputs = rows[i].getElementsByTagName('input');

        for (let j = 0; j < inputs.length; ++j) {
            addRepeatEvents(inputs[j]);
        }
    }
}

function setupMoneyFields() {
    var moneyInputs = document.querySelectorAll("*[" + MONEY_ATTRIB + "]");

    for (let i = 0; i < moneyInputs.length; ++i) {
        const input = moneyInputs[i];

        if (input instanceof HTMLInputElement && input.type == "text") {
            const clone = input.cloneNode(true);
            clone.type = "hidden";
            clone.addEventListener('change', updateTotal);

            input.insertAdjacentElement("afterend", clone);
            input.removeAttribute("name");

            addMoneyEvents(input);
        }
    }
}

function duplicateRow(e) {
    const input = e.currentTarget;
    const repeatRow = findRepeatingParent(input);
    const container = repeatRow.parentNode;

    if (!input || !repeatRow || !container) return;

    if (container.lastElementChild == repeatRow && input.value != "") {
        const clone = repeatRow.cloneNode(true);

        const inputs = clone.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; ++i) {
            inputs[i].value = "";

            if (inputs[i].hasAttribute(MONEY_ATTRIB)) {
                addMoneyEvents(inputs[i]);
            }

            addRepeatEvents(inputs[i]);
        }

        container.appendChild(clone);
        repeatRow.removeEventListener('input', duplicateRow);
    }
}

function deleteRow(e) {
    const input = e.currentTarget;
    const repeatRow = findRepeatingParent(input);
    const container = repeatRow.parentNode;

    if (container.lastElementChild != repeatRow && input.value == "") {
        const inputs = repeatRow.getElementsByTagName("input");

        let allEmpty = true;

        for (let i = 0; i < inputs.length; ++i) {
            allEmpty &= inputs[i].value == "";
        }

        if (allEmpty) {
            for (let i = 0; i < inputs.length; ++i) {
                removeRepeatEvents(inputs[i]);
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
    if (prettyValueNode.value == "") {
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
    if (e.keyCode != 46 && (e.keyCode < 48 || e.keyCode > 57)) {
        e.preventDefault();
        return;
    }

    if (e.srcElement.value == "" && e.keyCode == 46);
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
    if (node == null || node.hasAttribute(REPEATING_ATTRIB)) return node;

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

loadInvoiceInputs();
