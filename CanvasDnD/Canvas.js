/**
 * Created by David on 10/04/16.
 */

/**
 * Represents an HTML5 Canvas object
 */
class Canvas extends EventPropagator {

    // region Constructor

    /**
     * Creates a new Canvas
     * @param {string} canvasId - The ID of the HTML _canvas to attach to
     */
    constructor(canvasId) {
        // Initialize the Subscribable class
        super();

        /* Setup what variables we will have */

        /**
         * @private
         * @type {HTMLCanvasElement}
         */
        this._canvas = document.getElementById(canvasId);

        /**
         * @private
         * @type {CanvasRenderingContext2D}
         */
        this._context = this._canvas.getContext("2d");
        this._context.lineWidth = 1;        // Set the context to have a default line width of 1px
        this._context.translate(0.5, 0.5);  // Make pixels not be blurry by putting them exactly on a pixel line

        /**
         * Indicates if the canvas, when dragging should snap to the grid
         * @private
         * @type {boolean}
         */
        this._snap = false;

        /**
         * The size of the grid
         * @private
         * @type {number}
         */
        this._gridSize = 0.025;

        /**
         * Indicates if the grid should be drawn
         * @private
         * @type {boolean}
         */
        this._showGrid = true;

        /**
         * The shapes on the canvas
         * @private
         * @type {FBObject[]}
         */
        this._shapeObjects = [];

        /**
         * The shape that is currently being dragged
         * @private
         * @type {FBObject}
         */
        this._objectToDrag = null;

        /**
         * The shape that is currently active (has the selection around it)
         * @private
         * @type {FBObject}
         */
        this._activeShape = null;

        /**
         * The anchor that is currently being hovered/dragged
         * @private
         * @type {AnchorHandle}
         */
        this._resizeAnchor = null;

        /**
         * The starting X point for a drag
         * @private
         * @type {number}
         */
        this._dragStartX = 0;

        /**
         * The starting Y point for a drag
         * @type {number}
         * @private
         */
        this._dragStartY = 0;

        /**
         * The current scaling (zoom) of the canvas
         * @private
         * @type {number}
         */
        this._scale = 1;

        /**
         * Indicates if the context menu is currently showing
         * @type {boolean}
         * @private
         */
        this._isContextShown = false;

        // Subscribe to the events we need for the canvas
        this._canvas.addEventListener("mousedown", (e) => this._mouseDown(e));
        this._canvas.addEventListener("mouseup", (e) => this._mouseUp(e));
        this._canvas.addEventListener("mousemove", (e) => this._mouseMove(e));
        window.addEventListener("keyup", (e) => this._keyUp(e));

        // Setup and dispatch custom events
        this.__addEvent(EVENT_SHAPE_CHANGE);
        this.__dispatchEvent(EVENT_SHAPE_CHANGE, { 'activeShape': this.activeObject });

        // Request callback when the canvas is drawn (one-time -- must be re-done after each call)
        window.requestAnimationFrame(() => this._draw());
    }

    // endregion

    // region Private Properties

    /**
     * Gets the currently active shape
     * @returns {FBObject}
     * @private
     */
    get activeObject() { return this._activeShape; }

    /**
     * Sets the currently active shape
     * @param {FBObject} value - The new active shape
     * @private
     */
    set activeObject(value) {
        this._activeShape = value;

        // Dispatch the event that it's changed
        this.__dispatchEvent("shapechange", { 'activeShape': this.activeObject });
    }

    // endregion

    // region Public Properties

    /**
     * Gets the current scale of the canvas
     * @returns {number}
     */
    get scale() { return this._scale; }

    /**
     * Sets the scale (zoom) of the canvas
     * @param {number} value - The new zoom value
     */
    set scale(value) { this._scale = value; }


    /**
     * The width of the HTML canvas
     * @returns {number}
     */
    get width() { return parseInt(this._canvas.width); }

    /**
     * The width of the HTML canvas
     * @param {number} value
     */
    set width(value) { this._canvas.width = value; }


    /**
     * The height of the HTML canvas
     * @returns {number}
     */
    get height() { return parseInt(this._canvas.height); }

    /**
     * The height of the HTML canvas
     * @param {number} value
     */
    set height(value) { this._canvas.height = value; }


    /**
     * Gets the grid size
     * @returns {number}
     */
    get gridSize() { return this._gridSize; }

    /**
     * Sets the grid size
     * @param {number} value
     */
    set gridSize(value) { this._gridSize = value;}


    /**
     * Indicates if the elements should be snapped to the grid when moving
     * @returns {boolean}
     */
    get snapToGrid() { return this._snap; }

    /**
     * Sets if the elements should be snapped to the grid when moving
     * @param {boolean} value
     */
    set snapToGrid(value) { this._snap = value; }


    /**
     * Indicates if the grid should be drawn
     * @returns {boolean}
     */
    get showGrid() { return this._showGrid; }

    /**
     * Sets if the grid should be drawn
     * @param {boolean} value
     */
    set showGrid(value) { this._showGrid = value; }

    // endregion

    // region Public Functions

    /**
     * Adds an object to the canvas on top of everything else
     * @param {FBObject} object - The object to add
     * @throws {string} Thrown if object is not an FBObject
     */
    addObject(object){
        // If it's no an FBObject, throw an exception, otherwise add it to the top of the array
        if(!(object instanceof FBObject)){
            throw "Argument shape must be a Shape type";
        }

        this._shapeObjects.unshift(object);
    }

    /**
     * Brings the active shape to the front
     */
    bringActiveToFront(){
        // If we don't have an active shape, do nothing
        if(!this.activeObject) return;

        // Otherwise, remove it, and then add it to the top
        this.removeObject(this.activeObject);
        this.addObject(this.activeObject);
    }

    /**
     * Deletes the currently active shape
     */
    deleteActive(){
        // If we don't have an active shape, do nothing
        if(!this.activeObject) return;

        // Otherwise remove it, and update the active shape
        this.removeObject(this.activeObject);
        this.activeObject = null;
    }

    /**
     * Hides the canvas context menu
     */
    hideContextMenu(){
        // Hide the context menu if it's open
        if(this._isContextShown) {
            document.getElementById(CANVAS_CONTEXT_MENU_ID).removeAttribute("style");
            this._isContextShown = false;
        }
    }

    /**
     * Removes an object from the canvas
     * @param {FBObject} object - The object to remove
     * @throws {string} Thrown if the object is not an FBObject, or if the shape is not found
     */
    removeObject(object){
        // If we don't have the right type, throw an exception
        if(!(object instanceof FBObject)){
            throw "Argument shape must be a Shape type";
        }

        // Try to find the shape -- If we can't find it, throw an exception
        var idx = this._shapeObjects.indexOf(object);
        if(idx < 0){
            throw "shape was not found in _canvas";
        }

        // Otherwise, remove it from the array
        this._shapeObjects.splice(idx, 1);
    }

    /**
     * Sends the active object to the back of the stack
     */
    sendActiveToBack(){
        // If there is no active shape, do nothing
        if(!this.activeObject) return;

        // Otherwise, remove it and re-add it
        this.removeObject(this.activeObject);
        this._appendObject(this.activeObject);
    }

    /**
     * Shows the context menu for the canvas
     * @param e - The mouse event
     */
    showContextMenu(e){
        // If we have an active shape
        if(this.activeObject) {
            // Stop whatever it would normally do
            e.preventDefault();

            // Get a handle to the HTML element
            var context = document.getElementById(CANVAS_CONTEXT_MENU_ID);

            // And bring it into view, where the mouse was clicked
            context.style.left = e.pageX + "px";
            context.style.top = e.pageY + "px";

            this._isContextShown = true;
        }
    }

    /**
     * Resets/clears the canvas so nothing is drawn on it
     */
    reset(){
        this._context.clearRect(0, 0, this.width, this.height);
    }

    // endregion

    // region Private Functions

    /**
     * Adds an object to the canvas below everything else
     * @param {FBObject} object - The object to be added
     * @throws {string} Thrown if object is not an FBObject
     * @private
     */
    _appendObject(object){
        // If object is not the right type, throw an exception
        if(!(object instanceof FBObject)){
            throw "Argument shape must be a Shape type";
        }

        // Otherwise add it to the end of the array
        this._shapeObjects.push(object);
    }

    /**
     * Draws the canvas
     * @private
     */
    _draw(){
        // Erase everything
        this.reset();

        // Draw the page (margin border, and possibly the grid)
        this._drawPage();

        // Set the line width to be that of the scale (1 * this.scale)
        this._context.lineWidth = this.scale;

        // Draw all objects in reverse, that way recently added elements are on top
        for(var idx = this._shapeObjects.length - 1; idx >= 0; --idx){
            // for(var shape of this._shapeObjects){
            this._shapeObjects[idx].draw(this._context, this.scale);
        }

        // Draw the selection, if there is one
        this._drawSelection();

        // Request the callback to happen again
        window.requestAnimationFrame(() => this._draw());
    }

    /**
     * Draws the canvas "page"
     * @private
     */
    _drawPage(){

        // TODO: Move to page properties
        var margin = (.25 * 300) * this.scale;

        // Save the context so anything we do here doesn't affect later drawing
        this._context.save();
        this._context.strokeStyle = "#777";
        this._context.lineWidth = 1;
        this._context.strokeRect(margin, margin, this.width - (2 * margin), this.height - (2 * margin));

        // If the scale is too small, or we don't need to draw the grid, stop here.
        if(this.scale <= .51 || !this.showGrid) {
            this._context.restore();
            return;
        }

        // Setup for drawing the grid
        this._context.beginPath();
        this._context.strokeStyle = "#ddd";
        this._context.lineWidth = .5;
        this._context.moveTo(0, 0);

        // Get the grid size at the right DPI and scaling
        var gridSize = this.scale * this._gridSize * 300;

        // Draw the horizontal lines
        for(var xPos = gridSize; xPos < this.width; xPos += gridSize){
            this._context.moveTo(xPos, 0);
            this._context.lineTo(xPos, this.height);
        }

        // Draw the vertical lines
        for(var yPos = gridSize; yPos < this.height; yPos += gridSize){
            this._context.moveTo(0, yPos);
            this._context.lineTo(this.width, yPos);
        }

        // Stroke all the lines
        this._context.stroke();
        this._context.closePath();

        // Restore what the drawing settings were before
        this._context.restore();
    }

    /**
     * Draws the "marching ants" selection
     * @private
     */
    _drawSelection(){
        // If we have an active shape
        if(this.activeObject){

            // Use the current number of milliseconds to make the "ants" move consistently
            var date = new Date();
            var space = date.getMilliseconds() / (1000 / 14);

            // Shorthand, because we use the context a lot
            var c = this._context;

            // Save the current settings
            c.save();

            // Ants are always 1px
            c.lineWidth = 1;

            // First run draws black ants, second run draws white space between the ants
            for(var i = 0; i < 2; ++i){
                if(i == 0){
                    // 8 black, 6 transparent
                    c.setLineDash([8, 6]);
                    c.lineDashOffset = -space;
                }
                else{
                    // 6 white, 8 transparent
                    c.setLineDash([6, 8]);
                    c.lineDashOffset = -space + 8;
                }

                c.beginPath();

                // Draw with floor/ceil so that there's no blurriness to the line
                c.rect(Math.floor(this.activeObject.visualX * this.scale), Math.floor(this.activeObject.visualY * this.scale),
                    Math.ceil(this.activeObject.visualWidth * this.scale), Math.ceil(this.activeObject.visualHeight * this.scale));

                // Stroke color depends which run we're on
                c.strokeStyle = i == 0 ? "#000" : "#FFF";
                c.stroke();
                c.closePath();
            }

            // Reset to black for the anchors, and xor might help visibility, sometimes
            c.strokeStyle = "#000";
            c.globalCompositeOperation = "xor";
            c.setLineDash([0]);

            // Get all the anchors, and draw them accordingly
            c.beginPath();
            for(var anchor = Anchor.TopLeft; anchor <= Anchor.BottomRight; ++anchor){
                var box = this._getAnchorRect(anchor);
                c.rect(box.Left, box.Top, box.Width, box.Height);
            }
            c.stroke();
            c.closePath();

            // Restore the original settings
            c.restore();
        }
    }

    /**
     * Gets the anchor properties for a given corner
     * @param {Anchor} anchorCorner
     * @returns {AnchorHandle|null}
     * @private
     * @throws {string} Thrown if a bad anchorCorner is given
     */
    _getAnchorRect(anchorCorner){

        // As long as there is an active shape
        if(!this.activeObject){
            return null;
        }

        // Figure out where the sides of the object are
        var top = Math.floor(this.activeObject.visualY * this.scale);
        var right = Math.ceil((this.activeObject.visualX + this.activeObject.visualWidth) * this.scale);
        var bottom = Math.ceil((this.activeObject.visualY + this.activeObject.visualHeight) * this.scale);
        var left = Math.floor(this.activeObject.visualX * this.scale);

        // Constants
        const boxSize = 5;
        const adjustment2 = 2;
        const adjustment3 = 3;

        // Return correctly based on which anchor was given
        // Some spots need adjusted by 3 because math.
        if(anchorCorner === Anchor.TopLeft){
            return new AnchorHandle(left - adjustment2, top - adjustment2, boxSize, boxSize);
        }
        else if(anchorCorner === Anchor.BottomLeft){
            return new AnchorHandle(left - adjustment2, bottom - adjustment3, boxSize, boxSize);
        }
        else if(anchorCorner === Anchor.TopRight){
            return new AnchorHandle(right - adjustment3, top - adjustment2, boxSize, boxSize);
        }
        else if(anchorCorner === Anchor.BottomRight){
            return new AnchorHandle(right - adjustment3, bottom - adjustment3, boxSize, boxSize);
        }
        else{
            throw "anchorCorner must be ANCHOR_LEFT_TOP, ANCHOR_LEFT_BOTTOM, ANCHOR_RIGHT_TOP, or ANCHOR_RIGHT_BOTTOM";
        }
    }

    /**
     * Called when a key is released
     * @param e - The key data
     * @private
     */
    _keyUp(e){
        // If we got the [escape] key, and we're dragging a shape
        if(e.keyCode === ESCAPE_KEY){
            if(this._objectToDrag){
                // Don't do the default
                e.preventDefault();

                // And cancel
                this._objectToDrag.cancelResize();
                this._objectToDrag = null;
                this._resizeAnchor = null;

                this._canvas.style.cursor = "default";
            }

            // Otherwise, if the context menu is open, close it
            else if(this._isContextShown){
                // Don't do the default
                e.preventDefault();

                this.hideContextMenu();
            }
        }
    }

    /**
     * Called when the mouse is pressed down on the canvas
     * @param e - The mouse data
     * @private
     */
    _mouseDown(e){
        // Don't do the default
        e.preventDefault();

        // Figure out where the mouse was pressed down relative to the canvas
        this._dragStartX = (e.pageX - this._canvas.offsetLeft + this._scrollX(this._canvas));
        this._dragStartY = (e.pageY - this._canvas.offsetTop + this._scrollY(this._canvas));

        // If we're on a resize anchor already (set in _mouseMove), then set the shape to drag and leave
        if(this._resizeAnchor){
            this._objectToDrag = this.activeObject;
            return;
        }

        // Otherwise, check if we're over any of the objects, and if so, set it as the active object
        for(var object of this._shapeObjects){
            if(object.isPointInObject(this._dragStartX, this._dragStartY, this.scale)){
                this._objectToDrag = this.activeObject = object;
                return;
            }
        }

        // Otherwise, null out anything that's active
        this._objectToDrag = this.activeObject = null;
    }

    /**
     * Called when the mouse is moved on the canvas
     * @param e - The mouse data
     * @private
     */
    _mouseMove(e){
        // Don't do the default
        e.preventDefault();

        // Figure out where the mouse is at relative to the canvas
        var x, y;
        var mouseX = e.pageX - this._canvas.offsetLeft + this._scrollX(this._canvas);
        var mouseY = e.pageY - this._canvas.offsetTop + this._scrollY(this._canvas);

        // If we have a resize anchor, and an object that can be dragged
        if(this._resizeAnchor && this._objectToDrag){
            // Figure out how far we've moved, and tell the shape to resize
            x = (mouseX - this._dragStartX) / this.scale;
            y = (mouseY - this._dragStartY) / this.scale;

            this._objectToDrag.resize(x, y, this._resizeAnchor, e.shiftKey, e.altKey);

            this._objectToDrag._propagateUp(null, null)
        }
        // Otherwise, if we just have an object to drag
        else if(this._objectToDrag) {
            // Figure out how far we've moved
            x = (mouseX - this._dragStartX) / this.scale;
            y = (mouseY - this._dragStartY) / this.scale;

            // If shift is pressed, then we want to move in a straight or diagonal line
            if(e.shiftKey){

                // Figure out how far X and Y have absolutely moved, so we can figure if if we're dragging
                // diagonally, horizontally, or vertically
                var absX = Math.abs(x);
                var absY = Math.abs(y);

                // Figure out which one is bigger and smaller
                var big = Math.max(absX, absY);
                var small = Math.min(absX, absY);

                // Straight if we've moved < 5, or if they're not within 70% of each other
                if((absX < 5 && absY < 5) || (small / big) < .7){
                    if(absX > absY){
                        y = 0;
                    }
                    else{
                        x = 0;
                    }
                }
                else{
                    // Otherwise, keep them even
                    if(absX > absY){
                        y = absX * (absY == y ? 1 : -1);
                    }
                    else{
                        x = absY * (absX == x ? 1 : -1);
                    }
                }
            }

            // snap to grid, if necessary
            if(this.snapToGrid){
                x = Math.round(x / this.gridSize) * this.gridSize;
                y = Math.round(y / this.gridSize) * this.gridSize;
            }

            // And finally, tell the object to move
            this._objectToDrag.move(x, y);

            // Prevent the cursor changing alter
            return
        }
        // If we just have an active object
        else if(this.activeObject){

            // Try to see if we're within 5px of any of the anchors
            var allowedDist = 5;
            if (this._getAnchorRect(Anchor.TopLeft).isPointInShape(mouseX, mouseY, allowedDist)){
                this._canvas.style.cursor = "nwse-resize";
                this._resizeAnchor = Anchor.TopLeft;

                return;
            }
            else if(this._getAnchorRect(Anchor.BottomRight).isPointInShape(mouseX, mouseY, allowedDist)){
                this._canvas.style.cursor = "nwse-resize";
                this._resizeAnchor = Anchor.BottomRight;

                return;
            }
            else if(this._getAnchorRect(Anchor.TopRight).isPointInShape(mouseX, mouseY, allowedDist)){
                this._canvas.style.cursor = "nesw-resize";
                this._resizeAnchor = Anchor.TopRight;

                return;
            }
            else if(this._getAnchorRect(Anchor.BottomLeft).isPointInShape(mouseX, mouseY, allowedDist)) {
                this._canvas.style.cursor = "nesw-resize";
                this._resizeAnchor = Anchor.BottomLeft;

                return;
            }

            // If we make it to here, we're not around any anchor
            this._resizeAnchor = null;
        }

        // If we make it this far, see if we're hovering over any of the objects
        for(var object of this._shapeObjects){
            if(object.isPointInObject(mouseX, mouseY, this.scale)){
                this._canvas.style.cursor = "pointer";
                return;
            }
        }

        // Default the cursor if we make it this far
        this._canvas.style.cursor = "default";
    }

    /**
     * Called when the mouse is released on the canvas
     * @param e - The mouse data
     * @private
     */
    _mouseUp(e){
        // Stop the default
        e.preventDefault();

        // If we're dragging or resizing, then save the commit state
        if(this._objectToDrag){
            this._objectToDrag.commitResize();
            this._objectToDrag = null;
        }

        // Ensure the context menu is hidden
        this.hideContextMenu();
    }

    /**
     * Gets the amount the canvas has been scrolled on the X axis
     * @param node - The node to get the scroll amount of
     * @returns {number}
     * @private
     */
    _scrollX(node){
        // If we have a parent node, return the scroll amount plus the parents scroll amount (recursive)
        if(node.parentNode){
            return (node.scrollLeft ? this.scrollLeft : 0) + this._scrollX(node.parentNode);
        }

        // Otherwise, return the current element's scroll amount
        return node.scrollLeft ? this.scrollLeft : 0;
    }

    /**
     * Gets the amount the canvas has been scrolled on the Y axis
     * @param node - The node to get the scroll amount of
     * @returns {number}
     * @private
     */
    _scrollY(node){
        // If we have a parent node, return the scroll amount plus the parents scroll amount (recursive)
        if(node.parentNode){
            return (node.scrollTop ? node.scrollTop : 0) + this._scrollY(node.parentNode);
        }

        // Otherwise, return the current element's scroll amount
        return node.scrollTop ? node.scrollTop : 0;
    }

    // endregion

    // region Overwritten Methods

    /**
     * Sends and event down the chain
     * @param {BaseEventType} eventType - The name of the event to propagate
     * @param {EventArgs} eventData - The event data
     * @abstract
     */
    _propagateDown(eventType, eventData){

        // If a mouse event, figure out if the data is over any child
        var childTarget = this._canvas;
        if(eventData instanceof MouseEventArgs){
            // Adjust the mouse data so no further levels need to scale
            var adjustedMouseData = new MouseEventArgs(eventData.x / this.scale, eventData.y / this.scale, eventData.button);

            // Find the child target
            for(var child of this._shapeObjects){
                if(child.isPointInObject(eventData.x, eventData.y, 1)){
                    childTarget = child;
                    break;
                }
            }

            // If we have a move event
            if(eventType.event == MouseEventType.MouseMove){
                // If the last mouse element is not the same as the target, then the target needs a mouseEntered event
                if(this.__lastMouseElement != childTarget){
                    this.__lastMouseElement._propagateDown(MouseEventType.MouseLeave, null);
                    childTarget._propagateDown(MouseEventType.MouseEnter, eventData);

                    this.__lastMouseElement = childTarget;
                }
            }
        }

        // If we have a move event, we may need to send a mouse enter event first
        if(eventType.event === MouseEventType.MouseMove){
            this.__dispatchEvent(MouseEventType.MouseMove, eventData);
        }

        // Send the event to any subscribers of this class
        this.__dispatchEvent(eventType.event, eventData, true);

        switch(eventType){
            case MouseEventType.MouseDown
        }

        this.__dispatchEvent(eventType.event, eventData, false);
    }

    // endregion
}