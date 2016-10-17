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

        /**
         * @private
         * Default page mode is portrait
         */
        this.pageMode = PAGE_MODE_P;

        // Initialize everything
        this._initializeCanvas();
        this._initializeCanvasContextMenu();
        this._initializeZoom();

        // Add an event handler so the context menu will be closed whenever the mouse is clicked anywhere
        document.getElementsByTagName("html")[0].addEventListener("click", () => this._canvas.hideContextMenu());

        // Subscribe to the canvas shapeChange event
        this._canvas.subscribe(EVENT_SHAPE_CHANGE, this._canvas_shapechange);
    }

    // endregion

    // region Private Methods

    /**
     * Initializes the canvas
     * @private
     */
    _initializeCanvas(){
        // Get the canvas HTML element, and setup it's width and height
        var _canvas = document.getElementById(CANVAS_ID);
        _canvas.width = this.pageMode == PAGE_MODE_P ? PAGE_WIDTH : PAGE_HEIGHT;
        _canvas.height = this.pageMode == PAGE_MODE_L ? PAGE_WIDTH : PAGE_HEIGHT;

        // Listen for the desire to open the context menu (right click / keyboard press)
        _canvas.addEventListener("contextmenu", (e) => this._canvas.showContextMenu(e));

        // Initialize the canvas object
        this._canvas = new Canvas(CANVAS_ID);
        this._canvas.scale = 1;

        // Add a couple shapes for testing
        this._canvas.addObject(new Ellipse(25, 25, 20));
        this._canvas.addObject(new BasicShape(new Box(50, 200, 40, 20)));
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

        var btf = document.createElement("li");
        btf.innerHTML = "Bring to Front";
        btf.addEventListener("mouseup", () => {this._canvas.bringActiveToFront(); this._canvas.hideContextMenu(); });
        this._canvasContextMenu.appendChild(btf);

        var stb = document.createElement("li");
        stb.innerHTML = "Send to Back";
        stb.addEventListener("mouseup", () => {this._canvas.sendActiveToBack(); this._canvas.hideContextMenu(); });
        this._canvasContextMenu.appendChild(stb);

        var del = document.createElement("li");
        del.innerHTML = "Delete";
        del.addEventListener("mouseup", () => {this._canvas.deleteActive(); this._canvas.hideContextMenu(); });
        this._canvasContextMenu.appendChild(del);
    }

    /**
     * Setup the ability to zoom
     * @private
     */
    _initializeZoom(){

        // Create the HTML elements
        var zoom = document.getElementById(ZOOM_ID);
        var zoomIn = document.createElement("div");
        var zoomOut = document.createElement("div");
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
     * @param {*} e
     * @private
     */
    _canvas_shapechange(e){
        var propBox = document.getElementById(PROPERTIES);
        while(propBox.firstChild) propBox.removeChild(propBox.firstChild);

        // Gets back the property categories
    }

    // endregion
}