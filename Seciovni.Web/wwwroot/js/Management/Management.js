/**
 * Created by David on 2017-05-06.
 */

class Management {
    constructor(){
        this._tableBody = document.getElementById("employeeTable").getElementsByTagName('tbody')[0];
    }

    initialize(){
        showFullScreenLoading();

        this._waitForPermissions(0);
    }


    _loadUsers(){
        showFullScreenLoading();

        while(this._tableBody.firstChild) this._tableBody.firstChild.remove();

        const reloadUsers = () => this._loadUsers();

        sendToApi("Settings/Users/", "GET", null, (xmlhttp) => {
            if(!xmlhttp) return;
            if(xmlhttp.readyState === XMLHttpRequest.DONE){
                if(xmlhttp.status === 200){

                    const response = /** {Array} */JSON.parse(xmlhttp.response.toString());

                    // The first item will be the current user. And they can't change themselves.
                    let isFirst = true;

                    for(const item of response){
                        const row = makeHtmlElem({ tag: "tr" });
                        const employee = new Employee(row, !isFirst, !isFirst);
                        employee.initialize_json(item);
                        employee.subscribe(EVENT_DATA_SAVED, reloadUsers);
                        this._tableBody.appendChild(row);

                        isFirst = false;
                    }

                    const initialRow = makeHtmlElem({ tag: "tr" });
                    const newEmployee = new Employee(initialRow, true, false);
                    newEmployee.subscribe(EVENT_DATA_SAVED, reloadUsers);
                    this._tableBody.appendChild(initialRow);

                    hideFullScreenLoading();
                }
            }
        });
    }
    
    _waitForPermissions(waitTime){
        setTimeout(() => {
            const headers = getPermissions();
            if(headers === null){
                this._waitForPermissions(200);
            }
            else{
                const headerTr = document.getElementById("headers");

                for(const header of headers){
                    headerTr.appendChild(makeHtmlElem({
                        tag: "th",
                        class: "tiltedHeader",
                        children:
                        [
                            {
                                tag: "div",
                                text: header[PERMISSION_NAME],
                                title: header[PERMISSION_DESC],
                            }
                        ]
                    }));
                }

                headerTr.appendChild(document.createElement("th"));
                headerTr.appendChild(document.createElement("th"));

                this._loadUsers();
                hideFullScreenLoading();
            }
        }, waitTime);
    }

}

let m = new Management();
m.initialize();