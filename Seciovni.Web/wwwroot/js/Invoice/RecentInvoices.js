class RecentInvoices {
    constructor(){
        /**
         * The invoices we get from the server
         * @type {Array<InvoicePreview>}
         * @private
         */
        this._invoices = [];

        /**
         * @private
         * @type {HTMLTableElement}
         */
        this._tableParent = null;

        this._boundSort = this._sort.bind(this);

        /**
         * What we're currently sorted by
         * @type {string|null}
         * @private
         */
        this._currentSort = null;
    }

    initialize(){
        this._tableParent = document.getElementById(INVOICE_RECENT_INVOICES_TABLE_ID);

        for(const th of this._tableParent.getElementsByTagName("th"))
        {
            th.addEventListener('click', this._boundSort);
        }

        sendToApi("Invoice/GetRecent", "GET", null, (xmlhttp) => {
            if(xmlhttp === null) {
                alert("Failed to contact server");
                return;
            }

            if(xmlhttp.readyState === XMLHttpRequest.DONE){
                if(xmlhttp.status === 200){
                    for(const invoice_json of JSON.parse(xmlhttp.response.toString())){
                        const ip = new InvoicePreview();
                        ip.initialize_json(invoice_json);
                        this._invoices.push(ip);
                        this._tableParent.appendChild(ip.parentElement.htmlObj);

                        ip.parentElement.htmlObj.title = location.hostname + "/Invoice/View/" + ip.invoiceNum;

                        ip.parentElement.addEvent('click', () => {
                            location.assign("/Invoice/View/" + ip.invoiceNum);
                        })
                    }
                }
            }
        });
    }

    _sort(e){
        e.preventDefault();

        const element = e.currentTarget;
        const sortDesc = element.getAttribute(ATTRIBUTE_COLUMN) === this._currentSort;

        this._currentSort = element.getAttribute(ATTRIBUTE_COLUMN);

        if(sortDesc){
            this._invoices.sort((l, r) => l[this._currentSort] < r[this._currentSort]);
            element.className = "desc";
            // So it will sort asc next time.
            this._currentSort = "";
        }
        else{
            this._invoices.sort((l, r) => l[this._currentSort] > r[this._currentSort]);
            element.className = "";
        }

        if(!sortDesc && document.getElementById("sorted")) document.getElementById("sorted").removeAttribute("id");
        element.setAttribute("id", "sorted");

        // Keep the header row
        while(this._tableParent.childNodes.length > 2){
            this._tableParent.removeChild(this._tableParent.lastElementChild);
        }

        for(const row of this._invoices){
            this._tableParent.appendChild(row.parentElement.htmlObj);
        }
    }
}

const ri = new RecentInvoices();
ri.initialize();