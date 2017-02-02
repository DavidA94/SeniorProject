function getContactPreviews(resultsCallback) {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                resultsCallback(JSON.parse(xmlhttp.response));
            }
            else {
                resultsCallback([]);
            }
        }
    };

    xmlhttp.open("GET", "https://localhost:44357/api/User/ContactsPreview", true);
    xmlhttp.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("AuthorizationToken"));
    xmlhttp.send();
}