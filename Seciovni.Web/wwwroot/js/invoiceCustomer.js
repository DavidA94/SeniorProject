function loadInvoiceCustomerDialog() {
    document.getElementById("getCustomerButton").addEventListener('click', showCustomerDialog);
}

function showCustomerDialog(e) {
    e.preventDefault();
    document.getElementById("invoiceCustomerData").showModal();
}

loadInvoiceCustomerDialog();