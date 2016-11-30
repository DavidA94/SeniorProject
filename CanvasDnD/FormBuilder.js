/**
 * Created by David on 10/07/16.
 */

/**
 * Represents a FormBuilder object
 */
class FormBuilder{

    // region Constructor

    constructor(){
        // Filled in by initializers

        /**
         * @private
         * @type {Canvas}
         */
        this._canvas = null;

        /**
         * @private
         * @type {HTMLDivElement}
         */
        this._canvasContextMenu = null;

        /**
         * @private
         * @type {HTMLDivElement}
         */
        this._zoomAmt = null;

        this._htmlObjDict = null;

        /**
         * @private
         * Default page mode is portrait
         */
        this.pageMode = PAGE_MODE_P;

        /**
         * Holds the last place the mouse was on the canvas for drop operations
         * @type {MouseEventArgs}
         * @private
         */
        this._lastCanvasMoveLoc = null;

        // Initialize everything
        this._initializeCanvas();
        this._initializeCanvasContextMenu();
        this._initializeCanvasProperties();
        this._initializeShapes();
        this._initializeZoom();

        // Add an event handler so the context menu will be closed whenever the mouse is clicked anywhere
        document.getElementsByTagName("html")[0].addEventListener("click", () => this._canvas.hideContextMenu());

        // Subscribe to the canvas shapeChange event
        this._canvas.subscribe(EVENT_OBJECT_CHANGE, this._canvas_shapechange.bind(this));
        this._canvas.subscribe(EVENT_PROPERTY_CHANGE, this._canvas_propertychange.bind(this));

        let propertyChangedEventHandler = (e) => {
            if (Keyboard.focusedElement) {
                const box = e.originalTarget;
                let newData = null;

                if (box.nodeName.toLowerCase() === "input") {
                    if (box.type.toLowerCase() === "number") {
                        newData = parseInt(box.value);
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

                this._htmlObjDict[e.originalTarget.id].set(newData);
            }
        };
        /**
         * The event handler for when an HTML object has it's value changed
         * @type *
         * @private
         */
        this._propertyChangedEventHandler = propertyChangedEventHandler.bind(this);
    }

    // endregion

    // region Private Methods

    // region Initializations

    /**
     * Initializes the canvas
     * @private
     */
    _initializeCanvas(){
        // Get the canvas HTML element, and setup it's width and height
        const _canvas = document.getElementById(CANVAS_ID);
        _canvas.width = this.pageMode == PAGE_MODE_P ? PAGE_WIDTH : PAGE_HEIGHT;
        _canvas.height = this.pageMode == PAGE_MODE_L ? PAGE_WIDTH : PAGE_HEIGHT;

        // Listen for the desire to open the context menu (right click / keyboard press)
        _canvas.addEventListener("contextmenu", (e) => this._canvas.showContextMenu(e));

        // Initialize the canvas object
        this._canvas = new Canvas(CANVAS_ID);
        this._canvas.scale = 1;

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
     * Initializes the context menu
     * @private
     */
    _initializeCanvasContextMenu(){
        // Get a handle to the HTML DIV
        this._canvasContextMenu = document.getElementById(CANVAS_CONTEXT_MENU_ID);

        // Add the elements and add event listeners to item:
        // - Bring to Front
        // - Send to Back
        // - Delete

        const btf = document.createElement("li");
        btf.innerHTML = "Bring to Front";
        btf.addEventListener("mouseup", () => {this._canvas.bringActiveToFront(); this._canvas.hideContextMenu(); });
        this._canvasContextMenu.appendChild(btf);

        const stb = document.createElement("li");
        stb.innerHTML = "Send to Back";
        stb.addEventListener("mouseup", () => {this._canvas.sendActiveToBack(); this._canvas.hideContextMenu(); });
        this._canvasContextMenu.appendChild(stb);

        const del = document.createElement("li");
        del.innerHTML = "Delete";
        del.addEventListener("mouseup", () => {this._canvas.deleteActive(); this._canvas.hideContextMenu(); });
        this._canvasContextMenu.appendChild(del);

        const sep = document.createElement("li");
        sep.id = CANVAS_CONTEXT_SEPARATOR;
        sep.style.display = "none";
        this._canvasContextMenu.appendChild(sep);
    }

    /**
     * Creates the Canvas properties form
     * @private
     */
    _initializeCanvasProperties(){

        const propForm = document.createElement("form");
        propForm.action = "#";
        propForm.method = "POST";
        propForm.id = PROPERTIES_FORM;
        propForm.addEventListener("submit", () => { return false; });
        document.getElementById(PROPERTIES).appendChild(propForm);

    }

    /**
     * Creates the shapes that can be dragged onto the canvas
     * @private
     */
    _initializeShapes(){
        const shapes = document.getElementById(SHAPES_ID);
        const canvas = document.getElementById(CANVAS_ID);

        const shapeImgs = {};
        shapeImgs[DRAG_CHECKBOX] = "Images/checkbox.svg";
        shapeImgs[DRAG_TABLE] = "Images/table.svg";
        shapeImgs[DRAG_BOX] = "Images/box.svg";
        shapeImgs[DRAG_ELLIPSE] = "Images/ellipse.svg";
        shapeImgs[DRAG_TEXT] = "Images/text.svg";
        shapeImgs[DRAG_IMAGE] = DEFAULT_IMG;

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
        const zoom = document.getElementById(ZOOM_ID);
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
        this._canvas.width = (this.pageMode == PAGE_MODE_P ? PAGE_WIDTH : PAGE_HEIGHT) * this._canvas.scale;
        this._canvas.height = (this.pageMode == PAGE_MODE_L ? PAGE_WIDTH : PAGE_HEIGHT) * this._canvas.scale;
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
        if(!e.focusedObject){
            this._htmlObjDict = null;
            document.getElementById(PROPERTIES_FORM).reset();
            document.getElementById(PROPERTIES_FORM).style.display = "none";
        }
        else{
            const propForm = document.getElementById(PROPERTIES_FORM);

            // Clear the old stuff

            const nodes = propForm.getElementsByTagName("*");
            for(let i = nodes.length - 1; i >= 0; --i){
                const node = nodes[i];
                node.removeEventListener("change", this._propertyChangedEventHandler);
                node.parentNode.removeChild(node);
            }

            // Put the new stuff

            const propData = e.focusedObject.getHtmlPropertyData();

            for(let key of Object.keys(propData)){
                const prop = propData[key];

                let groupBox = document.getElementById(prop.Group);
                if(!groupBox){
                    const newGroup = document.createElement("fieldset");
                    newGroup.id = prop.Group.replace(/ /g, "");

                    const legend = document.createElement("legend");
                    legend.innerHTML = prop.Group;

                    newGroup.appendChild(legend);
                    propForm.appendChild(newGroup);
                    groupBox = document.getElementById(prop.Group);
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

            this._htmlObjDict = e.focusedObject.getHtmlPropertyModelDict();
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

            document.getElementById(PROPERTIES_FORM).style.display = "block";
        }
    }

    // endregion

    // region Drag Events

    _dragstart(e){
        if(e.target.className === "draggable") {
            e.dataTransfer.setData(DRAG_DATA, e.originalTarget.getElementsByTagName("span")[0].innerHTML);
            e.dataTransfer.setDragImage(e.target, 0, 0);
        }
    }

    _canvas_dragover(e){
        if(e.dataTransfer.getData(DRAG_DATA)){
            e.preventDefault();
        }
    }

    _canvas_drop(e){
        const data = e.dataTransfer.getData(DRAG_DATA);

        x = e;

        if(data){
            const x = this._lastCanvasMoveLoc.x;
            const y = this._lastCanvasMoveLoc.y;


            if(data === DRAG_CHECKBOX){
                const cb = new CheckBox(x, y, 20);
                cb.caption.text = "Checkbox";
                cb.caption.location = Location.Right;

                this._canvas.addObject(cb);
            }
            else if(data === DRAG_BOX){
                const box = new BasicShape(new Box(x, y, 100, 50));
                this._canvas.addObject(box);
            }
            else if(data === DRAG_ELLIPSE){
                const ellipse = new BasicShape(new Ellipse(x, y, 50));
                this._canvas.addObject(ellipse);
            }
            else if(data === DRAG_TEXT){
                const text = new FBTextBlock(x, y, 0, 0, "Your text here");
                this._canvas.addObject(text);
            }
            else if(data === DRAG_TABLE){
                const table = new Table(x, y, 200, 60);
                this._canvas.addObject(table);
            }
            else if(data === DRAG_IMAGE){
                const img = new FBImage(x, y, 100, 100);
                this._canvas.addObject(img);
            }
        }
    }

    // endregion

    // endregion
}