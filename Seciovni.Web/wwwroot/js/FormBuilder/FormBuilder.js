/**
 * Created by David on 10/07/16.
 */

/**
 * Represents a FormBuilder object
 */
class FormBuilder{

    // region Constructor

    constructor(){
        getBindingOptions(BindingContext.Repeating);
        getBindingOptions(BindingContext.Single);
        getBindingOptions(BindingContext.Both);


        // Filled in by initializers

        /**
         * @private
         * @type {Canvas}
         */
        this._canvas = [];

        /**
         * @private
         * @type {HTMLDivElement}
         */
        this._zoomAmt = null;

        this._htmlObjDict = null;

        /**
         * Holds the last place the mouse was on the canvas for drop operations
         * @type {MouseEventArgs}
         * @private
         */
        this._lastCanvasMoveLoc = null;

        // Initialize everything
        this._initializeCanvas();
        this._initializeCanvasProperties();
        this._initializeShapes();
        this._initializeZoom();

        this._title = new TextInput(document.getElementById(WYSIWYG_TITLE_ID));

        // Subscribe to the canvas shapeChange event
        this._canvas.subscribe(EVENT_OBJECT_CHANGE, this._canvas_shapechange.bind(this));
        this._canvas.subscribe(EVENT_PROPERTY_CHANGE, this._canvas_propertychange.bind(this));

        let propertyChangedEventHandler = (e) => {
            const box = e.currentTarget;
            let newData = null;

            if (box.nodeName.toLowerCase() === "input") {
                if (box.type.toLowerCase() === "number") {
                    newData = parseFloat(box.value);
                }
                else if (box.type.toLowerCase() === "checkbox") {
                    newData = box.checked;
                }
                else {
                    newData = box.value;
                }
            }
            else if (box.nodeName.toLowerCase() === "select") {
                newData = box.value;
            }

            this._htmlObjDict[e.currentTarget.id].set(newData);
        };
        /**
         * The event handler for when an HTML object has it's value changed
         * @type *
         * @private
         */
        this._propertyChangedEventHandler = propertyChangedEventHandler.bind(this);

        document.getElementById("saveButton").addEventListener('click', () => {
            const json = JSON.stringify(this);

            sendToApi("FormBuilder/Save", "POST", json, (xmlhttp) => {
                if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {
                    const response = /** @type{ApiResponse} */JSON.parse(xmlhttp.response);

                    // If successful, redirect if necessary
                    if(response.successful){
                        const title = location.pathname.split("/").splice(-1)[0];
                        if(title != this._title.value) {
                            location.replace("/FormEditor/Edit/" + this._title.value);
                        }
                    }
                }
            });
        });

        // Check if we need to load
        const pageName = location.pathname.split("/").splice(-1)[0].toLowerCase();
        if(pageName && pageName != "" && pageName != "edit"){
            sendToApi("FormBuilder/Get/" + pageName, "GET", null, (xmlhttp) => {
                if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {

                    if (!xmlhttp.response || xmlhttp.response == "") {
                        return;
                    }

                    // Clear anything that is present
                    for (let i = this._canvas.children.length - 1; i >= WYSIWYG_ANCHOR_COUNT; --i) {
                        this._canvas.removeObject(this._canvas.children[i]);
                    }

                    this.initialize_json(JSON.parse(xmlhttp.response.toString()));
                }
            });
        }
    }

    // endregion

    // region Public Methods

    toJSON(){
        const properties = {};
        properties["title"] = this._title.value;
        properties["canvas"] = this._canvas;

        return properties;
    }

    initialize_json(json){
        this._title.value = json["title"];
        this._canvas.initialize_json(json["canvas"]);
    }

    // endregion

    // region Private Methods

    // region Initializations

    /**
     * Initializes the canvas
     * @private
     */
    _initializeCanvas(){
        // Initialize the canvas object
        this._canvas = new Canvas(WYSIWYG_CANVAS_ID);
        this._canvas.scale = 1;
        this._canvas.orientation = Orientation.Portrait;
        this._canvas.subscribe(EVENT_SCALE_CHANGE, () => this._updateZoomAmt());

        // Initialize the static Mouse class -- Suppress warning because no other way to get to the object
        // noinspection JSAccessibilityCheck
        Mouse.initialize(this._canvas._canvas);
        // noinspection JSAccessibilityCheck
        HtmlTextBox.initialize(this._canvas);

        // Add a couple shapes for testing
        /* Finish comment at EOL for testing
        this._canvas.addObject(new BasicShape(new Ellipse(25, 25, 20)));
        this._canvas.addObject(new BasicShape(new Box(300, 15, 40, 20)));
        this._canvas.addObject(new CheckBox(5, 70, 10));
        this._canvas.addObject(new Table(200, 200, 200, 200));

        const tb = new FBTextBlock(50, 50, 100, 100, "The LORD is my shepherd, I shall not want. He maketh me to...");
        tb.maxWidth = 400;
        this._canvas.addObject(tb);
        /**/
    }

    /**
     * Creates the Canvas properties form
     * @private
     */
    _initializeCanvasProperties(){

        const propForm = document.createElement("form");
        propForm.action = "#";
        propForm.method = "POST";
        propForm.id = WYSIWYG_PROPERTIES_FORM_ID;
        propForm.addEventListener("submit", () => { return false; });
        document.getElementById(WYSIWYG_PROPERTIES_ID).appendChild(propForm);

    }

    /**
     * Creates the shapes that can be dragged onto the canvas
     * @private
     */
    _initializeShapes(){
        const shapes = document.getElementById(WYSIWYG_SHAPES_ID);
        const canvas = document.getElementById(WYSIWYG_CANVAS_ID);

        const shapeImgs = {};
        shapeImgs[WYSIWYG_DRAG_CHECKBOX] = "/images/FormBuilder/checkbox.svg";
        shapeImgs[WYSIWYG_DRAG_TABLE] = "/images/FormBuilder/table.svg";
        shapeImgs[WYSIWYG_DRAG_BOX] = "/images/FormBuilder/box.svg";
        shapeImgs[WYSIWYG_DRAG_ELLIPSE] = "/images/FormBuilder/ellipse.svg";
        shapeImgs[WYSIWYG_DRAG_TEXT] = "/images/FormBuilder/text.svg";
        shapeImgs[WYSIWYG_DRAG_IMAGE] = WYSIWYG_DEFAULT_IMG;

        shapes.addEventListener("dragstart", this._dragstart);
        canvas.addEventListener("dragover", this._canvas_dragover);
        canvas.addEventListener("drop", this._canvas_drop.bind(this));
        this._canvas.subscribe(MouseEventType.MouseMove, this._canvas_mousemove.bind(this));

        for(let shape in shapeImgs){
            const div = document.createElement("div");
            div.className = "draggable";
            div.draggable = true;

            const img = document.createElement("img");
            img.alt = shape;
            img.src = shapeImgs[shape];
            img.draggable = false;

            const span = document.createElement("span");
            span.innerHTML = shape;

            div.appendChild(img);
            div.appendChild(span);

            shapes.appendChild(div);
        }
    }

    /**
     * Setup the ability to zoom
     * @private
     */
    _initializeZoom(){

        // Create the HTML elements
        const zoom = document.getElementById(WYSIWYG_ZOOM_ID);
        const zoomIn = document.createElement("div");
        const zoomOut = document.createElement("div");
        this._zoomAmt = document.createElement("div");
        this._zoomAmt.id = "zoomAmt";

        // Add the listeners and add them to the DOM
        zoomOut.addEventListener("click", () => this._zoomOut());
        zoomOut.id = "zoomOut";
        zoom.appendChild(zoomOut);

        zoom.appendChild(this._zoomAmt);

        zoomIn.addEventListener("click", () => this._zoomIn());
        zoomIn.id = "zoomIn";
        zoom.appendChild(zoomIn);

        // Update the zoom to be whatever the default is
        this._updateZoomAmt();
    }

    // endregion

    // region Zoom Events

    /**
     * Zooms the canvas in
     * @private
     */
    _zoomIn(){
        // Go up by 10%, or to the nearest 10%, depending what the current level is.
        // E.g. 105% => 110%; and 120% => 130%
        if(Math.ceil(this._canvas.scale / .1) * .1 == this._canvas.scale){
            this._canvas.scale += .1;
        }
        else{
            this._canvas.scale = Math.ceil(this._canvas.scale / .1) * .1;
        }

        this._updateZoomAmt();
    }

    /**
     * Zooms the canvas out
     * @private
     */
    _zoomOut(){
        // Go down by 10%, or to the nearest 10%, depending what the current level is.
        // E.g. 105% => 100%; and 120% => 110%
        if(Math.floor(this._canvas.scale / .1) * .1 == this._canvas.scale){
            this._canvas.scale = Math.max(0.1, this._canvas.scale - 0.1);
        }
        else{
            this._canvas.scale = Math.floor(this._canvas.scale / .1) * .1;
        }

        this._updateZoomAmt();
    }

    /**
     * Updates the zoom amount to be a user-friendly amount
     * @private
     */
    _updateZoomAmt(){
        // Set the HTML to have the user friendly amount
        this._zoomAmt.innerHTML = (this._canvas.scale * 100).toFixed(2) + "%";

        // And change the physical size of the canvas so it still is the size of one page
        this._canvas.width = (this._canvas.orientation == Orientation.Portrait ? WYSIWYG_PAGE_WIDTH : WYSIWYG_PAGE_HEIGHT)
            * this._canvas.scale;
        this._canvas.height = (this._canvas.orientation == Orientation.Landscape ? WYSIWYG_PAGE_WIDTH : WYSIWYG_PAGE_HEIGHT) *
                                this._canvas.scale * this._canvas.numPages;
    }

    // endregion

    // region Canvas Events

    /**
     * Fires when the mouse is moved on the canvas
     * @param {MouseEventArgs} e
     * @private
     */
    _canvas_mousemove(e){
        this._lastCanvasMoveLoc = e;
    }

    /**
     * Fires when an object inside the canvas has it's properties changed
     * @param {PropertyChangedEventArgs} e
     * @private
     */
    _canvas_propertychange(e){
        if(e.originalTarget == Keyboard.focusedElement){
            document.getElementById(e.propertyName).value = this._htmlObjDict[e.propertyName].get();
        }
    }

    /**
     * Called when the selected shape changes in the canvas
     * @param {ObjectChangedEventArgs} e
     * @private
     */
    _canvas_shapechange(e){
        let propertyData;
        let bindingData = null;

        if(!e.focusedObject){
            propertyData = this._canvas.getHtmlPropertyData();
            this._htmlObjDict = this._canvas.getHtmlPropertyModelDict();
        }
        else{
            propertyData = e.focusedObject.getHtmlPropertyData();
            bindingData = e.focusedObject.getBindings();
            this._htmlObjDict = e.focusedObject.getHtmlPropertyModelDict();
        }

        // Get the form element
        const propForm = document.getElementById(WYSIWYG_PROPERTIES_FORM_ID);

        // Clear the old stuff
        const nodes = propForm.getElementsByTagName("*");
        for(let i = nodes.length - 1; i >= 0; --i){
            const node = nodes[i];
            node.removeEventListener("change", this._propertyChangedEventHandler);
        }
        while(propForm.firstChild) propForm.removeChild(propForm.firstChild);

        // Put the new stuff
        for(let key of Object.keys(propertyData)){
            const prop = propertyData[key];

            const groupID = prop.Group.replace(/ /g, "");

            let groupBox = document.getElementById(groupID);
            if(!groupBox){
                const newGroup = document.createElement("fieldset");
                newGroup.id = groupID;

                const legend = document.createElement("legend");
                legend.innerHTML = prop.Group;

                newGroup.appendChild(legend);
                propForm.appendChild(newGroup);
                groupBox = document.getElementById(groupID);
            }

            let parentOfElem = groupBox;

            if(prop.SubGroup) {
                const subGroupId = (prop.Group + "_" + prop.SubGroup).replace(/ /g, "");
                let subGroupBox = document.getElementById(subGroupId);
                if(!subGroupBox){
                    const newSubGroup = document.createElement("fieldset");
                    newSubGroup.id = subGroupId;
                    newSubGroup.className = "subgroup";

                    const legend = document.createElement("legend");
                    legend.innerHTML = prop.SubGroup;

                    newSubGroup.appendChild(legend);
                    groupBox.appendChild(newSubGroup);
                    subGroupBox = document.getElementById(subGroupId);
                }

                parentOfElem = subGroupBox;
            }

            const label = document.createElement("label");
            label.innerHTML = prop.Name;
            label.htmlFor = key;
            parentOfElem.appendChild(label);

            let propElement;

            switch(prop.Type){
                case PropertyType.FontFamily: {
                    propElement = document.createElement("select");
                    propElement.id = key;

                    for (let font of Object.keys(FontFamilies)) {
                        const option = document.createElement("option");
                        option.value = FontFamilies[font];
                        option.innerHTML = FontFamilies[font];
                        propElement.appendChild(option);
                    }

                    parentOfElem.appendChild(propElement);

                    break;
                }
                case PropertyType.Location: {
                    propElement = document.createElement("select");
                    propElement.id = key;

                    for (let loc of Object.keys(Location)) {
                        const option = document.createElement("option");
                        option.value = Location[loc];
                        option.innerHTML = loc;
                        propElement.appendChild(option);
                    }

                    parentOfElem.appendChild(propElement);

                    break;
                }
                case PropertyType.Alignment: {
                    propElement = document.createElement("select");
                    propElement.id = key;

                    for (let align of Object.keys(Alignment)) {
                        const option = document.createElement("option");
                        option.value = Alignment[align];
                        option.innerHTML = Alignment[align];
                        propElement.appendChild(option);
                    }

                    parentOfElem.appendChild(propElement);

                    break;
                }
                case PropertyType.Orientation: {
                    propElement = document.createElement("select");
                    propElement.id = key;

                    for (let orientation of Object.keys(Orientation)) {
                        const option = document.createElement("option");
                        option.value = Orientation[orientation];
                        option.innerHTML = orientation;
                        propElement.appendChild(option);
                    }

                    parentOfElem.appendChild(propElement);

                    break;
                }

                case PropertyType.DocumentType: {
                    propElement = document.createElement("select");
                    propElement.id = key;

                    for (let docType of Object.keys(DocumentType)) {
                        const option = document.createElement("option");
                        option.value = DocumentType[docType];
                        option.innerHTML = docType;
                        propElement.appendChild(option);
                    }

                    parentOfElem.appendChild(propElement);

                    break;
                }

                case PropertyType.ABS:
                    propElement = document.createElement("input");
                    propElement.id = key;
                    propElement.type = "number";
                    propElement.min = "0";
                    parentOfElem.appendChild(propElement);
                    break;
                case PropertyType.Checkbox:
                case PropertyType.Color:
                case PropertyType.Number:
                case PropertyType.Text:
                case PropertyType.File:
                    propElement = document.createElement("input");
                    propElement.id = key;
                    propElement.type = prop.Type;
                    parentOfElem.appendChild(propElement);
                    break;
            }

            if(propElement){
                propElement.addEventListener("change", this._propertyChangedEventHandler);
            }
        }

        // Load in the data
        for(let id of Object.keys(this._htmlObjDict)){
            const element = document.getElementById(id);
            const value = this._htmlObjDict[id].get();

            if(element.nodeName.toLowerCase() === "input" && element.type.toLowerCase() === "checkbox"){
                element.checked = value;
            }
            else{
                // Set the value and the placeholder, because some numeric values can
                // have a text representation such as "Auto" for some numbers.
                element.value = value;
                element.placeholder = value;
            }
        }

        if(bindingData && bindingData.length > 0) {
            const groupBox = document.createElement("fieldset");
            const legend = document.createElement("legend");
            legend.innerHTML = "Bindings";

            groupBox.appendChild(legend);
            propForm.appendChild(groupBox);

            const labels = [];
            let labelWidth = 0;

            for (let binding of bindingData) {
                const div = document.createElement("div");
                div.className = "row";

                const label = document.createElement("label");
                label.innerHTML = binding.id;
                label.htmlFor = binding.id.replace(/ /g, "");
                label.className = "cell";
                div.appendChild(label);
                labels.push(label);

                binding.options.htmlObj.className = "cell";
                binding.options.htmlObj.id = binding.id.replace(/ /g, "");
                div.appendChild(binding.options.htmlObj);

                groupBox.appendChild(div);

                labelWidth = Math.max(labelWidth, label.offsetWidth);
            }

            for(const label of labels){
                label.style.width = (labelWidth + 5) + "px";
            }
        }
    }

    // endregion

    // region Drag Events

    _dragstart(e){
        if(e.target.className === "draggable") {
            e.target.scrollIntoView(false);
            e.dataTransfer.setData(WYSIWYG_DRAG_DATA, e.target.getElementsByTagName("span")[0].innerHTML);
            e.dataTransfer.setDragImage(e.target, 0, 0);
        }
    }

    _canvas_dragover(e){
        if(e.dataTransfer.getData(WYSIWYG_DRAG_DATA)){
            e.preventDefault();
        }
    }

    _canvas_drop(e){
        const data = e.dataTransfer.getData(WYSIWYG_DRAG_DATA);

        if(data){
            const x = this._lastCanvasMoveLoc.x;
            const y = this._lastCanvasMoveLoc.y;


            if(data === WYSIWYG_DRAG_CHECKBOX){
                const cb = new CheckBox(x, y, 20);
                cb.caption.text = "Checkbox";
                cb.caption.location = Location.Right;

                this._canvas.addObject(cb);
            }
            else if(data === WYSIWYG_DRAG_BOX){
                const box = new BasicShape(new Box(x, y, 100, 50));
                this._canvas.addObject(box);
            }
            else if(data === WYSIWYG_DRAG_ELLIPSE){
                const ellipse = new BasicShape(new Ellipse(x, y, 50));
                this._canvas.addObject(ellipse);
            }
            else if(data === WYSIWYG_DRAG_TEXT){
                const text = new FBTextBlock(x, y, 0, 0, "Your text here");
                this._canvas.addObject(text);
            }
            else if(data === WYSIWYG_DRAG_TABLE){
                const table = new Table(x, y, 200, 60);
                this._canvas.addObject(table);
            }
            else if(data === WYSIWYG_DRAG_IMAGE){
                const img = new FBImage(x, y, 100, 100);
                this._canvas.addObject(img);
            }
        }
    }

    // endregion

    // endregion
}