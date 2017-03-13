/**
 * Created by David on 2017-03-11.
 */

class Print {
    constructor(parent){
        this._dialog = document.getElementById("printDialog");
        this._parent = parent;

        this._boundShow = this._show.bind(this);
        this._boundPrint = this._print.bind(this);

        const printButton = document.getElementById("printButton");
        if(printButton) {
            printButton.addEventListener('click', this._boundShow);
            document.getElementById("printInvoiceButton").addEventListener("click", this._boundPrint);
            document.getElementById("cancelPrint").addEventListener("click", (e) => {
                e.preventDefault();
                this._dialog.close()
            });
        }
    }

    _show(e){
        e.preventDefault();

        sendToApi("Invoice/GetPrintOptions/" + this._parent._invoiceID, "GET", null, (xmlhttp) => {
            if(!xmlhttp){
                alert("Failed to contact the server.");
                return;
            }

            if(xmlhttp.readyState === XMLHttpRequest.OPENED){
                this._showPrintOptions(null);
            }
            else if(xmlhttp.readyState === XMLHttpRequest.DONE){
                if(xmlhttp.status === 200){
                    this._showPrintOptions(JSON.parse(xmlhttp.response.toString()));
                }
                // Because we don't get cookies, this happens for every request
                else if(xmlhttp.status === 401){}
                else{
                    this._showPrintOptions([]);
                }
            }
        });

        this._dialog.showModal();
    }

    _print(e){
        e.preventDefault();

        const checkedBoxes = document.querySelectorAll(".printCheck:checked");
        const checkedNames = [];

        for(const checked of checkedBoxes){
            checkedNames.push(checked.value);
        }

        sendToApi("Invoice/Print/" + this._parent._invoiceID, "POST", JSON.stringify(checkedNames), (xmlhttp) =>{
            if(!xmlhttp){
                alert("Failed to contact the server");
                this._dialog.close();
                return;
            }

            if(xmlhttp.readyState === XMLHttpRequest.OPENED){
                this._showPrintOptions(null);
            }
            else if(xmlhttp.readyState === XMLHttpRequest.DONE){
                if(xmlhttp.status === 200){
                    const response = /** @type {ApiResponse}*/JSON.parse(xmlhttp.response.toString());

                    if(response.successful) {
                        if(response.message.indexOf("Legacy ") === 0){
                            alert(response.message);
                        }
                        else {
                            const a = document.createElement("a");
                            a.href = "data:application/pdf;base64," + response.message;
                            a.download = "Invoice " + this._parent._invoiceID + " - " +
                                    document.getElementById("invoiceCustomer").value + ".pdf";
                            a.className = "noDisplay";

                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                    }
                    else{
                        alert(response.message);
                    }
                }
                // Because we don't get cookies, this happens for every request
                else if(xmlhttp.status === 401){ return; }
                else{
                    alert("Error Printing");
                }

                this._dialog.close();
            }
        });
    }


    _showPrintOptions(options){
        const optBox = document.getElementById("pageOptions");

        while(optBox.firstElementChild){
            optBox.removeChild(optBox.firstElementChild);
        }

        if(options === null){
            const loading = document.createElement("img");
            loading.src = "/images/loading.svg";
            loading.className = "loadingSpinner centerSpinner";
            optBox.appendChild(loading);
            return;
        }

        if(options.length === 0){
            alert("No Forms Available");
            this._dialog.close();
        }

        for(const option of options){
            const checked = option.indexOf("*") === 0;
            const optionID = option.replace(/[ \*]/g, "");
            const optionText = option.replace("*", "");

            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "printCheck";
            input.id = optionID;
            input.value = optionText;
            if(checked) input.checked = true;

            const label = document.createElement("label");
            label.htmlFor = optionID;
            label.className = "printCheckLabel";
            label.innerHTML = optionText;

            const row = document.createElement("div");
            row.className = "row";
            row.appendChild(input);
            row.appendChild(label);

            optBox.appendChild(row);
        }
    }
}

function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}