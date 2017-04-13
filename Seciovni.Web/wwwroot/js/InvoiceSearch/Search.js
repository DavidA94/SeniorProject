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

        sendToApi("Search/Search", "POST", JSON.stringify(this._terms), (xmlhttp) => {
            if(xmlhttp.readyState === XMLHttpRequest.DONE){
                if(xmlhttp.status === 200){
                    if(xmlhttp.response === null) {
                        alert("Permission Denied");
                    }
                    else{
                        const response = /** @type{SearchResult} */JSON.parse(xmlhttp.response.toString());

                    }
                }
                else if(xmlhttp.status === 401) {} // Because we always get a 401
                else{
                    alert("An unknown error occurred: " + xmlhttp.status);
                }
            }
        });
    }

    /**
     * Trys to get the search fields, and if it can't calls itself in a setTimeout to try again in the specified time
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
     * Fires when a search term is destoryed
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
            this._termsList.appendChild(st.htmlObj);
            this._terms.push(st);
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