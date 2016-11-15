/**
 * Created by David on 10/07/16.
 */

/**
 * @callback StringValueConverter
 * @param {string} - The value to be converted
 * @returns {*}
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

        // Initialize everything
        this._initializeCanvas();
        this._initializeCanvasContextMenu();
        this._initializeCanvasProperties();
        this._initializeZoom();

        // Add an event handler so the context menu will be closed whenever the mouse is clicked anywhere
        document.getElementsByTagName("html")[0].addEventListener("click", () => this._canvas.hideContextMenu());

        // Subscribe to the canvas shapeChange event
        this._canvas.subscribe(EVENT_OBJECT_CHANGE, this._canvas_shapechange.bind(this));
        this._canvas.subscribe(EVENT_PROPERTY_CHANGE, this._canvas_propertychange.bind(this));
    }

    // endregion

    // region Private Methods

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

        // Add a couple shapes for testing
        this._canvas.addObject(new BasicShape(new Ellipse(25, 25, 20)));
        this._canvas.addObject(new BasicShape(new Box(300, 15, 40, 20)));
        this._canvas.addObject(new TextBlock(250, 200, 100, 100, "The LORD is my shepherd, I shall not want. He maketh me to..."));
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
    }

    /**
     * Creates the Canvas properties form
     * @private
     */
    _initializeCanvasProperties(){

        const props = FormBuilder._getHtmlPropertyTypes();

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
        propertyChangedEventHandler = propertyChangedEventHandler.bind(this);

        const propForm = document.createElement("form");
        propForm.action = "#";
        propForm.method = "POST";
        propForm.id = PROPERTIES_FORM;
        propForm.addEventListener("submit", () => { return false; });
        document.getElementById(PROPERTIES).appendChild(propForm);

        for(let key of Object.keys(props)){
            const prop = props[key];

            let groupBox = document.getElementById(prop.Group);
            if(!groupBox){
                const newGroup = document.createElement("div");
                newGroup.id = prop.Group.replace(/ /g, "");
                propForm.appendChild(newGroup);
                groupBox = document.getElementById(prop.Group);
            }

            let parentOfElem = groupBox;

            if(prop.SubGroup) {
                const subGroupId = (prop.Group + "_" + prop.SubGroup).replace(/ /g, "");
                let subGroupBox = document.getElementById(subGroupId);
                if(!subGroupBox){
                    const newSubGroup = document.createElement("div");
                    newSubGroup.id = subGroupId;
                    newSubGroup.className = "subgroup";
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
                    propElement = document.createElement("input");
                    propElement.id = key;
                    propElement.type = prop.Type;
                    parentOfElem.appendChild(propElement);
                    break;
            }

            if(propElement){
                propElement.addEventListener("change", propertyChangedEventHandler);
            }
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

        // Add the listeners and add them to the DOM
        zoomIn.addEventListener("click", () => this._zoomIn());
        zoomIn.innerHTML = "+";
        zoom.appendChild(zoomIn);

        zoomOut.addEventListener("click", () => this._zoomOut());
        zoomOut.innerHTML = "-";
        zoom.appendChild(zoomOut);

        zoom.appendChild(this._zoomAmt);

        // Update the zoom to be whatever the default is
        this._updateZoomAmt();
    }

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

    /**
     * Called when the selected shape changes in the canvas
     * @param {ObjectChangedEventArgs} e
     * @private
     */
    _canvas_shapechange(e){
        // var propBox = document.getElementById(PROPERTIES);

        if(!e.focusedObject){
            this._htmlObjDict = null;
            document.getElementById(PROPERTIES_FORM).reset();
            document.getElementById(PROPERTIES_FORM).style.display = "none";
        }
        else{
            this._htmlObjDict = this._getHtmlObjectDict(e.focusedObject);
            document.getElementById(PROPERTIES_FORM).style.display = "block";
            for(let id of Object.keys(this._htmlObjDict)){
                const element = document.getElementById(id);
                const value = this._htmlObjDict[id].get();

                if(element.nodeName.toLowerCase() === "input" && element.type.toLowerCase() === "checkbox"){
                    element.checked = value;
                }
                else{
                    element.value = value;
                }
            }
        }
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
     * Gets all the HTML elements that need created
     * @returns {{}}
     * @private
     */
    static _getHtmlPropertyTypes(){
        const retVal = {};


        retVal.layout_x = FormBuilder._makePropertyType("Layout", "X", PropertyType.Number, "Size and Position");
        retVal.layout_y = FormBuilder._makePropertyType("Layout", "Y", PropertyType.Number, "Size and Position");
        retVal.layout_width = FormBuilder._makePropertyType("Layout", "Width", PropertyType.ABS, "Size and Position");
        retVal.layout_height = FormBuilder._makePropertyType("Layout", "Height", PropertyType.ABS, "Size and Position");

        retVal.margin_top = FormBuilder._makePropertyType("Layout", "Top", PropertyType.ABS, "Margin");
        retVal.margin_right = FormBuilder._makePropertyType("Layout", "Right", PropertyType.ABS, "Margin");
        retVal.margin_bottom = FormBuilder._makePropertyType("Layout", "Bottom", PropertyType.ABS, "Margin");
        retVal.margin_left = FormBuilder._makePropertyType("Layout", "Left", PropertyType.ABS, "Margin");

        retVal.padding_top = FormBuilder._makePropertyType("Layout", "Top", PropertyType.ABS, "Padding");
        retVal.padding_right = FormBuilder._makePropertyType("Layout", "Right", PropertyType.ABS, "Padding");
        retVal.padding_bottom = FormBuilder._makePropertyType("Layout", "Bottom", PropertyType.ABS, "Padding");
        retVal.padding_left = FormBuilder._makePropertyType("Layout", "Left", PropertyType.ABS, "Padding");

        retVal.appearance_back = FormBuilder._makePropertyType("Appearance", "Background", PropertyType.Color);
        retVal.appearance_fore = FormBuilder._makePropertyType("Appearance", "Foreground", PropertyType.Color);
        retVal.appearance_strokeColor = FormBuilder._makePropertyType("Appearance", "Stroke Color", PropertyType.Color);
        retVal.appearance_strokeThickness = FormBuilder._makePropertyType("Appearance", "Stroke Thickness", PropertyType.ABS);

        retVal.border_top = FormBuilder._makePropertyType("Border", "Top", PropertyType.ABS);
        retVal.border_right = FormBuilder._makePropertyType("Border", "Right", PropertyType.ABS);
        retVal.border_bottom = FormBuilder._makePropertyType("Border", "Bottom", PropertyType.ABS);
        retVal.border_left = FormBuilder._makePropertyType("Border", "Left", PropertyType.ABS);
        retVal.border_color = FormBuilder._makePropertyType("Border", "Color", PropertyType.Color);

        retVal.caption_text = FormBuilder._makePropertyType("Text", "Text", PropertyType.Text, "Caption");
        retVal.caption_reserve = FormBuilder._makePropertyType("Text", "Reserve", PropertyType.ABS, "Caption");
        retVal.caption_location = FormBuilder._makePropertyType("Text", "Location", PropertyType.Location, "Caption");
        retVal.caption_font_family = FormBuilder._makePropertyType("Text", "Font Family", PropertyType.FontFamily, "Caption");
        retVal.caption_font_size = FormBuilder._makePropertyType("Text", "Font Size", PropertyType.ABS, "Caption");
        retVal.caption_font_color = FormBuilder._makePropertyType("Text", "Font Color", PropertyType.Color, "Caption");
        retVal.caption_font_color = FormBuilder._makePropertyType("Text", "Alignment", PropertyType.Alignment, "Caption");
        retVal.caption_font_bold = FormBuilder._makePropertyType("Text", "Bold", PropertyType.Checkbox, "Caption");
        retVal.caption_font_italic = FormBuilder._makePropertyType("Text", "Italic", PropertyType.Checkbox, "Caption");

        return retVal;
    }

    /**
     *
     * @param {string} group - The group this object belongs is
     * @param {string} name - The name to be put in the label
     * @param {PropertyType} type - The type of content this property is
     * @param {string|null} subGroup - The subgroup, if any for this property
     * @returns {{Group: string, SubGroup: string|null, Name: string, Type: PropertyType}}
     * @private
     */
    static _makePropertyType(group, name, type, subGroup = null){
        return {Group: group, SubGroup: subGroup, Name: name, Type: type};
    }

    /**
     *
     * @param {FBObject} fbObject
     * @returns {object<string, {get: (function()), set: (function({string}): boolean)}>}
     * @private
     */
    _getHtmlObjectDict(fbObject){
        if(fbObject == null) return null;

        const retVal = {};
        retVal.layout_x = this._makeHtmlObjectElement(fbObject, "visualX");
        retVal.layout_y = this._makeHtmlObjectElement(fbObject, "visualY");
        retVal.layout_width = this._makeHtmlObjectElement(fbObject, "visualWidth");
        retVal.layout_height = this._makeHtmlObjectElement(fbObject, "visualHeight");
        retVal.margin_top = this._makeHtmlObjectElement(fbObject.layout.margin, "top");
        retVal.margin_right = this._makeHtmlObjectElement(fbObject.layout.margin, "right");
        retVal.margin_bottom = this._makeHtmlObjectElement(fbObject.layout.margin, "bottom");
        retVal.margin_left = this._makeHtmlObjectElement(fbObject.layout.margin, "left");
        retVal.padding_top = this._makeHtmlObjectElement(fbObject.layout.padding, "top");
        retVal.padding_right = this._makeHtmlObjectElement(fbObject.layout.padding, "right");
        retVal.padding_bottom = this._makeHtmlObjectElement(fbObject.layout.padding, "bottom");
        retVal.padding_left = this._makeHtmlObjectElement(fbObject.layout.padding, "left");
        retVal.appearance_back = this._makeHtmlObjectElement(fbObject.appearance, "background");
        retVal.appearance_fore = this._makeHtmlObjectElement(fbObject.appearance, "foreground");
        retVal.appearance_strokeColor = this._makeHtmlObjectElement(fbObject.appearance, "strokeColor");
        retVal.appearance_strokeThickness = this._makeHtmlObjectElement(fbObject.appearance, "strokeThickness");
        retVal.border_top = this._makeHtmlObjectElement(fbObject.border, "top");
        retVal.border_right = this._makeHtmlObjectElement(fbObject.border, "right");
        retVal.border_bottom = this._makeHtmlObjectElement(fbObject.border, "bottom");
        retVal.border_left = this._makeHtmlObjectElement(fbObject.border, "left");
        retVal.border_color = this._makeHtmlObjectElement(fbObject.border, "color");
        retVal.caption_text = this._makeHtmlObjectElement(fbObject.caption, "text");
        retVal.caption_reserve = this._makeHtmlObjectElement(fbObject, "captionReserve");
        retVal.caption_location = this._makeHtmlObjectElement(fbObject.caption, "location", parseInt);
        retVal.caption_font_family = this._makeHtmlObjectElement(fbObject.caption.font, "fontFamily");
        retVal.caption_font_size = this._makeHtmlObjectElement(fbObject.caption.font, "size");
        retVal.caption_font_bold = this._makeHtmlObjectElement(fbObject.caption.font, "bold");
        retVal.caption_font_italic = this._makeHtmlObjectElement(fbObject.caption.font, "italic");
        retVal.caption_font_color = this._makeHtmlObjectElement(fbObject.caption.font, "color");
        retVal.caption_font_color = this._makeHtmlObjectElement(fbObject.caption.font, "alignment");

        return retVal;
    }

    /**
     *
     * @param {*} object - The object to target
     * @param {string} property - The property on the object to get the get/set for
     * @param {StringValueConverter} setConverter - A method which converts a string to the correct type
     * @returns {{get: (function()), set: (function({string}): boolean)}}
     * @private
     */
    _makeHtmlObjectElement(object, property, setConverter = (value) => { return value; }){
        return {
            get: () => Reflect.get(object, property),
            set: (value) => Reflect.set(object, property, setConverter(value)),
        };
    }

    // endregion
}