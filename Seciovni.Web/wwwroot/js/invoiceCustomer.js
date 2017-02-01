let useNewCustomer = false;
let contactsLoaded = false;

function loadInvoice() {
    loadInvoiceCustomerDialog();
    loadInvoiceLienDialog();
}

function loadInvoiceCustomerDialog() {
    document.getElementById("getCustomerButton").addEventListener('click', showCustomerDialog);
    document.getElementById("closeCustomerDialog").addEventListener('click', hideCustomerDialog);
    document.getElementById("showContacts").addEventListener('click', showContacts);
    document.getElementById("showCustom").addEventListener('click', showNewCustomer);
}

function loadInvoiceLienDialog() {
    document.getElementById("getLienButton").addEventListener('click', showLienDialog);
    document.getElementById("closeLienDialog").addEventListener('click', hideLienDialog);
}

function showLienDialog(e) {
    e.preventDefault();
    document.getElementById("invoiceLienHolderData").showModal();
    document.documentElement.addEventListener("keypress", (e) => {
        if (e.keyCode == 13) {
            hideLienDialog(e);
        }
    });
}

function hideLienDialog(e) {
    e.preventDefault();
    document.getElementById("invoiceLienHolderData").close();
    document.getElementById("invoiceLienHolder").value = document.getElementById("LienHolder_Name").value;
}

function showCustomerDialog(e) {
    e.preventDefault();
    if (!contactsLoaded) {
        getContactPreviews(loadContacts);
        contactsLoaded = true;
    }
    document.getElementById("invoiceCustomerData").showModal();

    document.documentElement.addEventListener("keypress", (e) => {
        if (e.keyCode == 13) {
            hideCustomerDialog(e);
        }
    });
}

function hideCustomerDialog(e) {
    e.preventDefault();
    document.getElementById("invoiceCustomerData").close();

    const invCustomer = document.getElementById("invoiceCustomer");

    if (useNewCustomer) {
        const firstName = document.getElementById("Buyer_User_FirstName").value;
        const lastName = document.getElementById("Buyer_User_LastName").value;
        invCustomer.value = firstName + " " + lastName;
    }
    else {
        invCustomer.value = document.getElementById("chosenContact").getElementsByTagName("b")[0].innerText;
    }
}

function loadContacts(contacts) {

    var listNode = document.getElementById("contactsList");

    while (listNode.childElementCount > 1) listNode.removeChild(listNode.lastChild)

    if (contacts.length == 0) {
        showNewCustomer();
        var noContacts = document.createElement("p");
        noContacts.innerHTML = "No Contacts";
        noContacts.className = "row";

        listNode.appendChild(noContacts);
    }

    for (var contact of contacts) {
        var div = document.createElement("div");
        div.className = "contactPreviewItem row";

        var nameNode = document.createElement("p");
        nameNode.innerHTML = "<b>" + contact.user.firstName + " " + contact.user.lastName + "</b>";

        var addressNode = document.createElement("p");
        addressNode.innerHTML = contact.address.streetAddress + " " + contact.address.city + ", " +
                                contact.address.state + " " + contact.address.zipCode;

        var emailNode = document.createElement("p");
        emailNode.innerHTML = contact.user.email;

        div.appendChild(nameNode);
        div.appendChild(addressNode);
        div.appendChild(emailNode);

        listNode.appendChild(div);

        div.addEventListener("click", (e) => {
            e.preventDefault();
            if (document.getElementById("chosenContact") != null) {
                document.getElementById("chosenContact").removeAttribute("id");
            }
            e.currentTarget.id = "chosenContact"
        });
    }
}

function showNewCustomer() {
    useNewCustomer = true;
    document.getElementById("newCustomer").style.display = "block";
    document.getElementById("showContacts").style.display = "block";
    document.getElementById("contactsList").style.display = "none";
    document.getElementById("showCustom").style.display = "none";
}

function showContacts() {
    useNewCustomer = false;
    document.getElementById("newCustomer").style.display = "none";
    document.getElementById("showContacts").style.display = "none";
    document.getElementById("contactsList").style.display = "block";
    document.getElementById("showCustom").style.display = "block";
}

loadInvoice();