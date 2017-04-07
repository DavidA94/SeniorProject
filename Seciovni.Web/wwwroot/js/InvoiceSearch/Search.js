/**
 * Created by David on 2017-04-02.
 */

class Search {
    constructor(){
        // Get the search fields so they're there when we need them.
        getSearchFields();

        this._boundExtraUpdated = this._extraUpdated.bind(this);
        this._boundTermDestroyed = this._termDestroyed.bind(this);

        this._termsList = document.getElementById(SEARCH_TERM_LIST_ID);
        this._terms = [];

        this._showLoading();

        this._waitForSearchFields(0);
    }

    _waitForSearchFields(waitTime){
        setTimeout(() =>{
            if(getSearchFields() === null){
                this._waitForSearchFields(2000);
            }
            else{
                const st = new SearchTerm();
                st.subscribe(EVENT_PROPERTY_CHANGE, this._boundExtraUpdated);
                this._termsList.appendChild(st.htmlObj);
                this._terms.push(st);

                this._closeLoading();
            }
        }, waitTime);
    }

    _showLoading() {

    }

    _closeLoading() {

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
}

const s = new Search();