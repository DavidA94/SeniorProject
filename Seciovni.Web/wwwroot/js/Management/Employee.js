/**
 * Created by David on 2017-05-06.
 */

class EmployeeFields {
    static get name() { return "name"; }
    static get email() { return "email"; }
    static get job() { return "job"; }
}

class Employee extends Subscribable{
    /**
     * Creates a new Employee object
     * @param {HTMLTableRowElement} tableRow
     * @param {boolean} showSave - Indicates if the save button should be shown
     * @param {boolean} showDelete - Indicates if the delete button should be shown
     */
    constructor(tableRow, showSave, showDelete){
        super();

        this.__addEvent(EVENT_DATA_SAVED);

        this._name = null;
        this._originalEmail = null;
        this._email = null;
        this._job = null;
        this._permissions = {};

        this._boundSave = this._save.bind(this);
        this._boundDelete = this._delete.bind(this);

        const name = makeHtmlElem({
            tag: "td",
            children:
            [
                {
                    tag: "input",
                    type: "text"
                }
            ]
        });
        this._name = new TextInput(name.firstElementChild);

        const email = makeHtmlElem({
            tag: "td",
            children:
            [
                {
                    tag: "input",
                    type: "text",
                    class: "wide",
                }
            ]
        });
        this._email = new TextInput(email.firstElementChild);

        const job = makeHtmlElem({
            tag: "td",
            children:
            [
                {
                    tag: "select",
                    children:
                    [
                        { tag: "option", text: "Admin", value: JobType.Admin },
                        { tag: "option", text: "Assistant", value: JobType.Assistant },
                        { tag: "option", text: "Manager", value: JobType.Manager },
                        { tag: "option", text: "Sales", value: JobType.Sales }
                    ]
                }
            ]
        });
        this._job = new TextInput(job.firstElementChild);

        for(const td of [name, email, job]){
            tableRow.appendChild(td);
        }

        for(const permission of getPermissions()){
            const td = makeHtmlElem({
                tag: "td",
                class: PERMISSION_CHECK_CLASS,
                children:
                [
                    {
                        tag: "input",
                        type: "checkbox",
                        value: permission[PERMISSION_ID],
                    }
                ]
            });

            this._permissions[permission[PERMISSION_ID]] = td.firstElementChild;

            tableRow.appendChild(td);
        }

        if(showSave) {

            const save = makeHtmlElem({
                tag: "td",
                children: [
                    {
                        tag: "button",
                        text: "Save"
                    }
                ]
            });

            save.firstElementChild.addEventListener('click', this._boundSave);
            tableRow.appendChild(save);

            if(showDelete){
                const del = makeHtmlElem({
                    tag: "td",
                    children: [
                        {
                            tag: "button",
                            text: "Delete"
                        }
                    ]
                });

                del.firstElementChild.addEventListener('click', this._boundDelete);
                tableRow.appendChild(del);
            }
            else{
                tableRow.appendChild(document.createElement("td"));
            }
        }
        else{
            tableRow.appendChild(document.createElement("td"));
        }

    }

    initialize_json(json){
        this._name.value = json.firstName + " " + json.lastName;
        this._email.value = json.email;
        this._originalEmail = json.email;
        this._job.value = json.job;

        if(json.job === JobType.Admin || json.permissions[0] === "Admin"){
            for(const permission of Object.keys(this._permissions)){
                this._permissions[permission].checked = true;
            }

            return;
        }

        for(const permission of json.permissions){
            this._permissions[permission].checked = true;
        }
    }

    toJSON(){
        const spaceLoc = this._name.value.lastIndexOf(" ");
        const firstName = this._name.value.slice(0, spaceLoc);
        const lastName = this._name.value.slice(spaceLoc + 1);

        const properties = {};
        properties.firstName = firstName;
        properties.lastName = lastName;
        properties.email = this._email.value;
        properties.originalEmail = this._originalEmail;
        properties.job = this._job.value;
        properties.permissions = [];

        for(const key of Object.keys(this._permissions)){
            if(this._permissions[key].checked){
                properties.permissions.push(this._permissions[key].value);
            }
        }

        return properties;
    }

    _save(){
        if(this._name.value.indexOf(" ") < 0){
            alert("You must provide a first and last name");
            return;
        }

        showFullScreenLoading();
        sendToApi("Settings/Save", "POST", JSON.stringify(this), (xmlhttp) => {
            if(xmlhttp.readyState === XMLHttpRequest.DONE){
                if(xmlhttp.status === 200){
                    const response = /** {ApiResponse} */JSON.parse(xmlhttp.response.toString());

                    if(response.successful){
                        alert(response.message);
                        this.__dispatchEvent(EVENT_DATA_SAVED, new DataSavedEventArgs(this));
                    }
                    else{
                        if(response.errors.length > 0){
                            let msg = "The following areas have problems:\n";
                            for(const area of response.errors){
                                msg += (area.element + " - " + area.message + "\n");
                            }

                            alert(msg);
                        }
                        else{
                            alert(response.message);
                        }
                    }
                }

                hideFullScreenLoading();
            }
        });
    }

    _delete(){
        const spaceLoc = this._name.value.lastIndexOf(" ");
        const firstName = this._name.value.slice(0, spaceLoc);
        const lastName = this._name.value.slice(spaceLoc + 1);

        const userIsSure = confirm("Are you sure you want to delete " + firstName + " " + lastName + "?");
        if(userIsSure){
            sendToApi("Settings/Delete/" + this._email.value, "DELETE", null, (xmlhttp) => {
                if(xmlhttp.readyState === XMLHttpRequest.DONE) {
                    if (xmlhttp.status === 200) {
                        const response = /** {ApiResponse} */JSON.parse(xmlhttp.response.toString());

                        if (response.successful) {
                            this.__dispatchEvent(EVENT_DATA_SAVED, new DataSavedEventArgs(this));
                        }

                        alert(response.message);
                    }
                }
            });
        }
    }
}