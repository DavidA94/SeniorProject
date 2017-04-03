/**
 * Created by David on 2017-04-02.
 */

class Search {
    constructor(){
        // Get the search fields so they're there when we need them.
        getSearchFields();

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
}

const s = new Search();