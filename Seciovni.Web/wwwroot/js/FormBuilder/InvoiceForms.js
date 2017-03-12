/**
 * Created by David on 2017-03-11.
 */

class InvoiceForms {
    constructor() {
        /**
         * The list of form names
         * @type {HTMLTableRowElement[]}
         * @private
         */
        this._formNames = [];

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
        this._tableParent = document.getElementById(WYSIWYG_FORMS_TABLE_ID);

        for(const th of this._tableParent.getElementsByTagName("th"))
        {
            th.addEventListener('click', this._boundSort);
        }

        sendToApi("FormBuilder/GetForms", "GET", null, (xmlhttp) => {
            if(xmlhttp === null) {
                alert("Failed to contact server");
                return;
            }

            if(xmlhttp.readyState == XMLHttpRequest.DONE){
                if(xmlhttp.status === 200){
                    for(const formName of JSON.parse(xmlhttp.response.toString())){
                        const tr = /** @type HTMLTableRowElement */document.createElement("tr");
                        const td = document.createElement("td");
                        td.innerHTML = formName;
                        td.title = location.hostname + "/FormEditor/Edit/" + formName.replace(/ /g, "");

                        tr.onclick = () => {
                            location.assign("/FormEditor/Edit/" + formName.replace(/ /g, ""));
                        };

                        tr.appendChild(td);
                        this._tableParent.appendChild(tr);

                        this._formNames.push(tr);
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
            this._formNames.sort((l, r) => l.firstElementChild.innerHTML < r.firstElementChild.innerHTML);
            element.className = "desc";
            // So it will sort asc next time.
            this._currentSort = "";
        }
        else{
            this._formNames.sort((l, r) => l.firstElementChild.innerHTML > r.firstElementChild.innerHTML);
            element.className = "";
        }

        if(!sortDesc && document.getElementById("sorted")) document.getElementById("sorted").removeAttribute("id");
        element.setAttribute("id", "sorted");

        // Keep the header row
        while(this._tableParent.childNodes.length > 2){
            this._tableParent.removeChild(this._tableParent.lastElementChild);
        }

        for(const row of this._formNames){
            this._tableParent.appendChild(row);
        }
    }
}

const forms = new InvoiceForms();
forms.initialize();