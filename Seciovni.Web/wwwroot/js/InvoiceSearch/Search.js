/**
 * Created by David on 2017-04-02.
 */

class Search {
    constructor(){
        // Get the search fields so they're there when we need them.
        getSearchFields();

        this._boundExtraUpdated = this._extraUpdated.bind(this);
        this._boundTermDestroyed = this._termDestroyed.bind(this);
        this._boundSearch = this._search.bind(this);
        this._boundExpand = this._expand.bind(this);

        document.getElementById("searchButton").addEventListener('click', this._boundSearch);

        this._termsList = document.getElementById(SEARCH_TERM_LIST_ID);

        /**
         * The list of terms in the search
         * @type {SearchTerm[]}
         * @private
         */
        this._terms = [];

        showFullScreenLoading();

        this._waitForSearchFields(0);
    }

    _search() {
        let url = null;

        for(const term of this._terms){
            const urlTerm = term.toURL();

            if(url && urlTerm) url += "~~" + Search.encodeToURL(urlTerm);
            else if(urlTerm) url = Search.encodeToURL(urlTerm);
        }

        window.location.hash = url ? url : "";

        if(!url){
            alert("Please enter a search term");
            return;
        }

        sendToApi("Search/Search", "GET", JSON.stringify(this._terms), (xmlhttp) => {
            if(xmlhttp.readyState === XMLHttpRequest.OPENED){
                showFullScreenLoading();
            }
            if(xmlhttp.readyState === XMLHttpRequest.DONE){
                if(xmlhttp.status === 200) {
                    if (xmlhttp.response === null) {
                        alert("Permission Denied");
                    }
                    else {
                        const responses = /** @type{SearchResult[]} */JSON.parse(xmlhttp.response.toString());

                        const results = document.getElementById("results");
                        for(let elem of results.querySelectorAll("." + SEARCH_EXPANDER_CLASS)){
                            elem.removeEventListener('click', this._boundExpand);
                        }
                        while(results.firstElementChild) results.firstElementChild.remove();

                        if (responses.length === 0){
                            results.appendChild(makeHtmlElem(
                                {
                                    tag: "i",
                                    text: "No Results"
                                }
                            ));

                            hideFullScreenLoading();
                            return;
                        }

                        const stagingArea = document.createElement("div");
                        stagingArea.style.position = "absolute";
                        stagingArea.style.left = "-9999px";
                        document.body.appendChild(stagingArea);

                        // Start with the core things
                        const headerTitles = {
                            tag: "div",
                            id: SEARCH_HEADER_ID,
                            children: [
                                makeDivData("", SEARCH_EXPANDER_CLASS),
                                makeDivData("Invoice Date", SEARCH_COLUMN_TITLE_CLASS),
                                makeDivData("Invoice Number", SEARCH_COLUMN_TITLE_CLASS),
                                makeDivData("Buyer's Name", SEARCH_COLUMN_TITLE_CLASS),
                                makeDivData("Sales Person", SEARCH_COLUMN_TITLE_CLASS),
                            ]
                        };

                        // Add the other fields
                        if(responses[0].otherFields) {
                            for (const key of Object.keys(responses[0].otherFields)) {
                                const header = getSearchFields().find((f) => f.value === key).display;

                                headerTitles.children.push(makeDivData(header, "other " + SEARCH_COLUMN_TITLE_CLASS));
                            }
                        }

                        results.appendChild(makeHtmlElem(headerTitles));

                        const columnWidths = [];
                        for(const header of results.querySelectorAll("." + SEARCH_COLUMN_TITLE_CLASS)){
                            columnWidths.push([header]);
                        }

                        for (const result of responses) {

                            const hasExpander = result.fees.length > 0 || result.payments.length > 0 || result.vehicles.length > 0;

                            // Start with the core things
                            const headerData = [
                                {
                                    tag: "div",
                                    class: SEARCH_PREVIEW_CLASS,
                                    children: [
                                        {
                                            tag: "div",
                                            class: (hasExpander ? SEARCH_EXPANDER_SHOW_CLASS : SEARCH_EXPANDER_CLASS)
                                        },
                                        {
                                            tag: "div",
                                            class: SEARCH_PREVIEW_DATA_CLASS,
                                            children: [
                                                makeSpanData("Invoice Date", SEARCH_DATA_DESCRIPTION_CLASS),
                                                makeSpanData((new Date(result.createdDate)).getPrettyUTCDate())
                                            ]
                                        },
                                        {
                                            tag: "div",
                                            class: SEARCH_PREVIEW_DATA_CLASS,
                                            children: [
                                                makeSpanData("Invoice Number", SEARCH_DATA_DESCRIPTION_CLASS),
                                                makeSpanData(("0000" + result.invoiceNumber).substr(-4)) // 4 digits
                                            ]
                                        },
                                        {
                                            tag: "div",
                                            children: [
                                                {
                                                    tag: "a",
                                                    class: SEARCH_VIEW_LINK_CLASS + " inner",
                                                    href: "/Invoice/View/" + result.invoiceNumber,
                                                    target: "_blank",
                                                    text: "View"
                                                }
                                            ]
                                        },
                                        {
                                            tag: "div",
                                            class: SEARCH_PREVIEW_DATA_CLASS,
                                            children: [
                                                makeSpanData("Buyer's Name", SEARCH_DATA_DESCRIPTION_CLASS),
                                                makeSpanData(result.buyerName)
                                            ]
                                        },
                                        {
                                            tag: "div",
                                            class: SEARCH_PREVIEW_DATA_CLASS,
                                            children: [
                                                makeSpanData("Sales Person", SEARCH_DATA_DESCRIPTION_CLASS),
                                                makeSpanData(result.salesPerson)
                                            ]
                                        }
                                    ]
                                }
                            ];

                            // Add the other fields
                            for (const key of Object.keys(result.otherFields)) {
                                const header = getSearchFields().find((f) => f.value === key).display;

                                let formatter = (value) => value;

                                // If we need to format the values
                                if(["TaxAmount", "DocFee", "DownPayment", "Total", "Due"].indexOf(key) >= 0)
                                {
                                    formatter = (value) => makeNumberPretty(parseFloat(value), "$ ", 2);
                                }

                                headerData[0].children.push({
                                    tag: "div",
                                    class: SEARCH_PREVIEW_DATA_CLASS,
                                    children: [
                                        makeSpanData(header, "other " + SEARCH_DATA_DESCRIPTION_CLASS),
                                        makeSpanData(formatter(result.otherFields[key]))
                                    ]
                                });
                            }

                            headerData[0].children.push({
                                tag: "div",
                                children: [
                                    {
                                        tag: "a",
                                        class: SEARCH_VIEW_LINK_CLASS + " outer",
                                        href: "/Invoice/View/" + result.invoiceNumber,
                                        target: "_blank",
                                        text: "View"
                                    }
                                ]
                            });

                            // Add the table stuff. Add the header and column labels if there are any
                            const fees = [];
                            for (const fee of result.fees) {
                                fees.push({
                                    tag: "div",
                                    class: SEARCH_RESULT_ROW_DATA_CLASS,
                                    children: [
                                        makeDivData(fee.description, SEARCH_MISC_FEE_DESC_CLASS),
                                        makeDivData(makeNumberPretty(fee.price, "$ ", 2), SEARCH_MISC_FEE_PRICE_CLASS)
                                    ]
                                })
                            }
                            if (fees.length > 0) {
                                fees.unshift(
                                    {
                                        tag: "h2",
                                        text: "Miscellaneous Fees",
                                        class: SEARCH_INNER_HEADER_CLASS
                                    },
                                    {
                                        tag: "div",
                                        class: SEARCH_RESULT_ROW_DATA_CLASS,
                                        children: [
                                            makeDivData("Description", SEARCH_MISC_FEE_DESC_CLASS),
                                            makeDivData("Price", SEARCH_MISC_FEE_PRICE_CLASS)
                                        ]
                                    }
                                );
                            }

                            const payments = [];
                            for (const payment of result.payments) {
                                payments.push({
                                    tag: "div",
                                    class: SEARCH_RESULT_ROW_DATA_CLASS,
                                    children: [
                                        makeDivData((new Date(payment.date)).getPrettyUTCDate(), SEARCH_PAYMENT_DATE_CLASS),
                                        makeDivData(payment.description, SEARCH_PAYMENT_DESC_CLASS),
                                        makeDivData(makeNumberPretty(payment.amount, "$ ", 2), SEARCH_PAYMENT_AMOUNT_CLASS)
                                    ]
                                });
                            }
                            if (payments.length > 0) {
                                payments.unshift(
                                    {
                                        tag: "h2",
                                        text: "Payments",
                                        class: SEARCH_INNER_HEADER_CLASS
                                    },
                                    {
                                        tag: "div",
                                        class: SEARCH_RESULT_ROW_DATA_CLASS,
                                        children: [
                                            makeDivData("Date", SEARCH_PAYMENT_DATE_CLASS),
                                            makeDivData("Description", SEARCH_PAYMENT_DESC_CLASS),
                                            makeDivData("Price", SEARCH_PAYMENT_AMOUNT_CLASS)
                                        ]
                                    }
                                );
                            }

                            const vehicles = [];
                            for (const vehicle of result.vehicles) {
                                vehicles.push({
                                    tag: "div",
                                    class: SEARCH_RESULT_ROW_DATA_CLASS,
                                    children: [
                                        makeDivData(vehicle.stockNum, SEARCH_VEHICLE_STOCK_CLASS),
                                        makeDivData(vehicle.vin, SEARCH_VEHICLE_VIN_CLASS),
                                        makeDivData(vehicle.year, SEARCH_VEHICLE_YEAR_CLASS),
                                        makeDivData(vehicle.make, SEARCH_VEHICLE_MAKE_CLASS),
                                        makeDivData(vehicle.model, SEARCH_VEHICLE_MODEL_CLASS),
                                        makeDivData(makeNumberPretty(vehicle.miles, "", 0), SEARCH_VEHICLE_MILES_CLASS),
                                        makeDivData(vehicle.location, SEARCH_VEHICLE_LOCATION_CLASS),
                                        makeDivData(makeNumberPretty(vehicle.price, "$ ", 2), SEARCH_VEHICLE_PRICE_CLASS)
                                    ]
                                });
                            }
                            if (vehicles.length > 0) {
                                vehicles.unshift(
                                    {
                                        tag: "h2",
                                        text: "Vehicles",
                                        class: SEARCH_INNER_HEADER_CLASS
                                    },
                                    {
                                        tag: "div",
                                        class: SEARCH_RESULT_ROW_DATA_CLASS,
                                        children: [
                                            makeDivData("Stock #", SEARCH_VEHICLE_STOCK_CLASS),
                                            makeDivData("VIN", SEARCH_VEHICLE_VIN_CLASS),
                                            makeDivData("Year", SEARCH_VEHICLE_YEAR_CLASS),
                                            makeDivData("Make", SEARCH_VEHICLE_MAKE_CLASS),
                                            makeDivData("Model", SEARCH_VEHICLE_MODEL_CLASS),
                                            makeDivData("Miles", SEARCH_VEHICLE_MILES_CLASS),
                                            makeDivData("Location", SEARCH_VEHICLE_LOCATION_CLASS),
                                            makeDivData("Price", SEARCH_VEHICLE_PRICE_CLASS)
                                        ]
                                    }
                                );
                            }


                            // Put all the sub-stuff in another DIV
                            const extraData = {
                                tag: "div",
                                class: SEARCH_EXTRA_DATA_CLASS,
                                children: fees.concat(payments, vehicles)
                            };
                            headerData.push(extraData);

                            // Create the containing element
                            const resultDiv = makeHtmlElem({
                                tag: "div",
                                class: SEARCH_RESULT_CLASS,
                                children: headerData
                            });

                            // Size everything
                            stagingArea.appendChild(resultDiv);

                            // Go through each class, find the largest one, and give that size to the rest
                            const columnClasses = [
                                SEARCH_MISC_FEE_DESC_CLASS,
                                SEARCH_MISC_FEE_PRICE_CLASS,
                                SEARCH_PAYMENT_DATE_CLASS,
                                SEARCH_PAYMENT_DESC_CLASS,
                                SEARCH_PAYMENT_AMOUNT_CLASS,
                                SEARCH_VEHICLE_STOCK_CLASS,
                                SEARCH_VEHICLE_VIN_CLASS,
                                SEARCH_VEHICLE_YEAR_CLASS,
                                SEARCH_VEHICLE_MAKE_CLASS,
                                SEARCH_VEHICLE_MODEL_CLASS,
                                SEARCH_VEHICLE_MILES_CLASS,
                                SEARCH_VEHICLE_LOCATION_CLASS,
                                SEARCH_VEHICLE_PRICE_CLASS
                            ];

                            for(const className of columnClasses){
                                const elems = stagingArea.querySelectorAll("." + className);
                                if(elems.length === 0) continue;
                                let width = 0;
                                for(const elem of elems) width = Math.max(width, Math.ceil(elem.getBoundingClientRect().width));
                                for(const elem of elems) elem.style.width = width + "px";
                            }

                            const previewColumnData = stagingArea.querySelectorAll("." + SEARCH_PREVIEW_DATA_CLASS);
                            for(let i = 0; i < previewColumnData.length; ++i){
                                columnWidths[i].push(previewColumnData[i]);
                            }

                            results.appendChild(resultDiv);
                        }

                        stagingArea.remove();

                        for(const column of columnWidths){
                            let width = 0;
                            for(const elem of column)width = Math.max(width, Math.ceil(elem.getBoundingClientRect().width));
                            for(const elem of column) elem.style.width = width + "px";
                        }

                        for(const elem of results.querySelectorAll("." + SEARCH_EXPANDER_CLASS + ".show")){
                            elem.addEventListener('click', this._boundExpand);
                        }
                    }
                    hideFullScreenLoading();
                }
                else if(xmlhttp.status === 401 || xmlhttp.status === 204) {} // Always happen for some reason
                else{
                    alert("An error occured while loading the search results (" + xmlhttp.status + ")");
                    hideFullScreenLoading();
                }
            }
        });
    }

    /**
     * Tries to get the search fields, and if it can't calls itself in a setTimeout to try again in the specified time
     * @param {number} waitTime - The number of ms to wait before seeing if the fields have arrived yet
     * @private
     */
    _waitForSearchFields(waitTime){
        setTimeout(() =>{
            if(getSearchFields() === null){
                this._waitForSearchFields(2000);
            }
            else {
                if (window.location.hash !== "") {
                    this._loadFromURL();
                }
                const st = new SearchTerm();
                st.subscribe(EVENT_PROPERTY_CHANGE, this._boundExtraUpdated);
                this._termsList.appendChild(st.htmlObj);
                this._terms.push(st);

                hideFullScreenLoading();
            }
        }, waitTime);
    }

    /**
     * Fires when the last row is updated, and adds a new row
     * @param {PropertyChangedEventArgs} e
     * @private
     */
    _extraUpdated(e){
        // Unsubscribe and resubscribe as needed
        const oldExtra = e.originalTarget;
        oldExtra.unsubscribe(EVENT_PROPERTY_CHANGE, this._boundExtraUpdated);
        oldExtra.subscribe(EVENT_OBJECT_DESTROYED, this._boundTermDestroyed);

        const newTerm = new SearchTerm();
        newTerm.subscribe(EVENT_PROPERTY_CHANGE, this._boundExtraUpdated);
        this._termsList.appendChild(newTerm.htmlObj);
        this._terms.push(newTerm);
    }

    /**
     * Fires when a search term is destroyed
     * @param {ObjectDestroyedEventArgs} e - The event data
     * @private
     */
    _termDestroyed(e){
        this._terms.splice(this._terms.indexOf(e.originalTarget), 1);
    }

    /**
     * Initializes from the URL search
     * @private
     */
    _loadFromURL(){
        const terms = Search._decodeFromURL(window.location.hash.replace("#", "")).split("~~");

        for(const term of terms){
            const st = SearchTerm.fromURL(term);
            st.subscribe(EVENT_OBJECT_DESTROYED, this._boundTermDestroyed);
            this._termsList.appendChild(st.htmlObj);
            this._terms.push(st);
        }

        // Delay so the boxes are fully set up.
        setTimeout(() => this._search(), 250);
    }

    _expand(e) {
        const expanded = document.getElementById(SEARCH_OPENED_RESULT_ID);

        if(expanded) expanded.removeAttribute("id");

        if(e.target.parentNode.parentNode !== expanded){
            e.target.parentNode.parentNode.id = SEARCH_OPENED_RESULT_ID;
        }
    }

    /**
     * Gets the value ready to be used in the URL
     * @param {string} value - The value to be made into URL friendly
     * @return {string}
     * @private
     */
    static encodeToURL(value){
        return encodeURI(value.replace(/~/g, "\\~"));
    }

    /**
     * Gets the value ready to be used when coming from a URL
     * @param {string} value - The value to be decoded
     * @return {string}
     * @private
     */
    static _decodeFromURL(value){
        return decodeURI(value).replace(/\\~/g, "~");
    }
}

const s = new Search();