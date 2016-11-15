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
         * The shape that is currently being dragged
         * @private
         * @type {FBObject}
         */
        this._objectToDrag = null;

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

        /**
         * @type {object<function, function>}
         * @private
         */
        this._boundMethods = {};

        this.anchors = {};
        this.anchors[Anchor.TopLeft] = new Box(0,0,0,0);
        this.anchors[Anchor.TopRight] = new Box(0,0,0,0);
        this.anchors[Anchor.BottomLeft] = new Box(0,0,0,0);
        this.anchors[Anchor.BottomRight] = new Box(0,0,0,0);
        for(let anchor = Anchor.TopLeft; anchor <= Anchor.BottomRight; ++anchor){
            this.anchors[anchor].appearance.foreground = "transparent";
            this.anchors[anchor].appearance.background = "transparent";
            this.anchors[anchor].appearance.strokeColor = "black";
            this.anchors[anchor].appearance.strokeThickness = 1;
            // Add directly so we don't have the normal subscriptions
            this.__addChild(this.anchors[anchor]);

            this.anchors[anchor].subscribe(MouseEventType.MouseDown, this._getBoundFunc(this._anchor_MouseDown));
            this.anchors[anchor].subscribe(MouseEventType.MouseEnter, this._getBoundFunc(this._anchor_MouseEnter));
            this.anchors[anchor].subscribe(MouseEventType.MouseLeave, this._getBoundFunc(this._anchor_MouseLeave));
            this.anchors[anchor].subscribe(MouseEventType.MouseMove, this._getBoundFunc(this._anchor_MouseMove));
            this.anchors[anchor].subscribe(MouseEventType.MouseUp, this._getBoundFunc(this._anchor_MouseUp));
        }

        // Subscribe to the events we need for the canvas
        this._canvas.addEventListener("dblclick", this._getBoundFunc(this._canvasDblClick));
        this._canvas.addEventListener("mousedown", this._getBoundFunc(this._canvasMouseDown));
        this._canvas.addEventListener("mouseup", this._getBoundFunc(this._canvasMouseUp));
        this._canvas.addEventListener("mousemove", this._getBoundFunc(this._canvasMouseMove));
        this._canvas.addEventListener("keydown", this._getBoundFunc(this._canvasKeyDown));
        window.addEventListener("keyup", (e) => this._keyUp(e));

        // Subscribe for when the events get called on our custom propagator
        this.subscribe(MouseEventType.MouseDown, this._getBoundFunc(this._mouseDown));
        this.subscribe(MouseEventType.MouseMove, this._getBoundFunc(this._mouseMove));
        this.subscribe(MouseEventType.MouseUp, this._getBoundFunc(this._mouseUp));

        // Setup and dispatch custom events
        this.__addEvent(EVENT_OBJECT_CHANGE);
        this.__addEvent(EVENT_PROPERTY_CHANGE);
        // this.__dispatchEvent(EVENT_OBJECT_CHANGE, { 'activeShape': Keyboard.focusedElement });

        // Request callback when the canvas is drawn (one-time -- must be re-done after each call)
        window.requestAnimationFrame(() => this._draw());
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
        if(!(object instanceof FBObject) && !(object instanceof Shape)){
            throw "Argument shape must be a Shape type";
        }

        this.children.splice(FIRST_IDX_AFTER_ANCHORS, 0, object);

        object.subscribe(MouseEventType.MouseDown, this._getBoundFunc(this._shapeMouseDown));
        object.subscribe(MouseEventType.MouseDown, this._getBoundFunc(this._shapeMouseDownCapture), true);
        object.subscribe(MouseEventType.MouseEnter, this._getBoundFunc(this._shapeMouseEnter));
        object.subscribe(MouseEventType.MouseLeave, this._getBoundFunc(this._shapeMouseLeave));
        object.subscribe(MouseEventType.MouseMove, this._getBoundFunc(this._shapeMouseMove));
        object.subscribe(MouseEventType.MouseUp, this._getBoundFunc(this._shapeMouseUp));
        object.subscribe(EVENT_PROPERTY_CHANGE, this._getBoundFunc(this._shapePropertyChanged));
    }

    /**
     * Brings the active shape to the front
     */
    bringActiveToFront(){
        // If we don't have an active shape, do nothing
        if(!Keyboard.focusedElement) return;

        // Get the index, and if it's not in the children, do nothing
        const idx = this.children.indexOf(Keyboard.focusedElement);
        if(idx < 0) return;

        // Move to 4, which is past all the anchors
        this.children.move(idx, FIRST_IDX_AFTER_ANCHORS);
    }

    /**
     * Deletes the currently active shape
     */
    deleteActive(){
        // If we don't have an active shape, do nothing
        if(!Keyboard.focusedElement) return;

        // Otherwise remove it, and update the active shape
        this.removeObject(Keyboard.focusedElement);
        Keyboard.focusedElement = null;
        this.__dispatchEvent(EVENT_OBJECT_CHANGE, new ObjectChangedEventArgs(this, null));
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

        // Remove the child
        this.__removeChild(object);

        // Unsubscribe from everything
        object.unsubscribe(MouseEventType.MouseDown, this._getBoundFunc(this._shapeMouseDown));
        object.unsubscribe(MouseEventType.MouseEnter, this._getBoundFunc(this._shapeMouseEnter));
        object.unsubscribe(MouseEventType.MouseLeave, this._getBoundFunc(this._shapeMouseLeave));
        object.unsubscribe(MouseEventType.MouseMove, this._getBoundFunc(this._shapeMouseMove));
        object.unsubscribe(MouseEventType.MouseUp, this._getBoundFunc(this._shapeMouseUp));
        // object.unsubscribe(EVENT_BEGIN_CAPTION_RESIZE, this._getBoundFunc(this._shapeBeginCapResize));
        // object.unsubscribe(EVENT_END_CAPTION_RESIZE, this._getBoundFunc(this._shapeEndCapResize));
    }

    /**
     * Sends the active object to the back of the stack
     */
    sendActiveToBack(){
        // If there is no active shape, do nothing
        if(!Keyboard.focusedElement) return;

        // Get the index, and if it's not in the children, do nothing
        const idx = this.children.indexOf(Keyboard.focusedElement);
        if(idx < 0) return;

        // Move to the end
        this.children.move(idx, this.children.length);
    }

    /**
     * Shows the context menu for the canvas
     * @param e - The mouse event
     */
    showContextMenu(e){
        // If we have an active shape
        if(Keyboard.focusedElement) {
            // Stop whatever it would normally do
            e.preventDefault();

            // Get a handle to the HTML element
            const context = document.getElementById(CANVAS_CONTEXT_MENU_ID);

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

    toString() { return "Canvas"; }

    // endregion

    // region Private Functions

    /**
     * Draws the canvas
     * @private
     */
    _draw(){
        // Erase everything
        this.reset();

        // Draw the page (margin border, and possibly the grid)
        this._drawPage();

        this._context.save();
        this._context.scale(this.scale, this.scale);

        // Draw all objects in reverse, that way recently added elements are on top
        for(let idx = this.children.length - 1; idx >= FIRST_IDX_AFTER_ANCHORS; --idx){
            this.children[idx].draw(this._context);
        }

        // Restore so there's no zooming on the selection
        this._context.restore();

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
        const margin = (.25 * 300) * this.scale;

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
        const gridSize = this.scale * this._gridSize * 300;

        // Draw the horizontal lines
        for(let xPos = gridSize; xPos < this.width; xPos += gridSize){
            this._context.moveTo(xPos, 0);
            this._context.lineTo(xPos, this.height);
        }

        // Draw the vertical lines
        for(let yPos = gridSize; yPos < this.height; yPos += gridSize){
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
        if(Keyboard.focusedElement){

            // Use the current number of milliseconds to make the "ants" move consistently
            const date = new Date();
            let space = date.getMilliseconds() / (1000 / 14);

            // Shorthand, because we use the context a lot
            const c = this._context;

            // Save the current settings
            c.save();

            // Ants are always 1px
            c.lineWidth = 1;

            // First run draws black ants, second run draws white space between the ants
            for(let i = 0; i < 2; ++i){
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
                c.rect(Math.floor(Keyboard.focusedElement.visualX * this.scale), Math.floor(Keyboard.focusedElement.visualY * this.scale),
                    Math.ceil(Keyboard.focusedElement.visualWidth * this.scale), Math.ceil(Keyboard.focusedElement.visualHeight * this.scale));

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
            for(let anchor = Anchor.TopLeft; anchor <= Anchor.BottomRight; ++anchor){
                this._adjustAnchorRect(anchor);
                c.save();
                this.anchors[anchor].draw(this._context);
                c.restore();
            }

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
    _adjustAnchorRect(anchorCorner){

        // As long as there is an active shape
        if(!Keyboard.focusedElement){
            return null;
        }

        const active = Keyboard.focusedElement;

        // Figure out where the sides of the object are
        // Scale has to be kept, since these are drawn the same size regardless
        const top = this.scale * (active.visualY);
        const right = this.scale * (active.visualX + active.visualWidth);
        const bottom = this.scale * (active.visualY + active.visualHeight);
        const left = this.scale * (active.visualX);

        // Constants
        const boxSize = 5;
        const adjustment2 = 2;
        const adjustment3 = 3;

        const box = this.anchors[anchorCorner];
        box.layout.width = box.layout.height = boxSize;

        // Return correctly based on which anchor was given
        // Some spots need adjusted by 3 because math.
        if(anchorCorner === Anchor.TopLeft){
            box.layout.x = left - adjustment2;
            box.layout.y = top - adjustment2;
        }
        else if(anchorCorner === Anchor.BottomLeft){
            box.layout.x = left - adjustment2;
            box.layout.y = bottom - adjustment3;
        }
        else if(anchorCorner === Anchor.TopRight){
            box.layout.x = right - adjustment3;
            box.layout.y = top - adjustment2;
        }
        else if(anchorCorner === Anchor.BottomRight){
            box.layout.x = right - adjustment3;
            box.layout.y = bottom - adjustment3;
        }
    }

    /**
     * Gets a method which has `this` bound to it so it can be used for events
     * Creates the bound method if it does not exist.
     * @param {function} func - The original function that needed `this` bound to it
     * @returns {function}
     * @private
     */
    _getBoundFunc(func){
        if(!this._boundMethods[func]) this._boundMethods[func] = func.bind(this);

        return this._boundMethods[func];
    }

    /**
     * Called when a key is pressed
     * @param e
     * @private
     */
    _canvasKeyDown(e){
        e.preventDefault();

        this._propagate(new KeyboardEvent(KeyboardEventType.KeyDown), new KeyboardEventArgs(this, e.keyCode));
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

                Mouse.setCursor(Cursor.Default);
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
     * Called when the mouse is double clicked on the canvas
     * @param e - The mouse data
     * @private
     */
    _canvasDblClick(e){
        // Don't do the default
        e.preventDefault();
        this._canvas.focus();

        // Figure out where the mouse was pressed down relative to the canvas, when not scaled
        const virtualX = (e.clientX - this._canvas.offsetLeft + this._scrollX(this._canvas)) / this.scale;
        const virtualY = (e.clientY - this._canvas.offsetTop + this._scrollY(this._canvas)) / this.scale;

        this._propagate(new MouseEvent(MouseEventType.DblClick),
            new MouseEventArgs(this, virtualX, virtualY, e.button, e.altKey, e.ctrlKey, e.shiftKey));
    }

    /**
     * Called when the mouse is pressed down on the canvas
     * @param e - The mouse data
     * @private
     */
    _canvasMouseDown(e){
        // Don't do the default
        e.preventDefault();
        this._canvas.focus();

        // Figure out where the mouse was pressed down relative to the canvas, when not scaled
        const virtualX = (e.clientX - this._canvas.offsetLeft + this._scrollX(this._canvas)) / this.scale;
        const virtualY = (e.clientY - this._canvas.offsetTop + this._scrollY(this._canvas)) / this.scale;

        // Set this every time the mouse is clicked -- needed for proper dragging
        this._dragStartX = virtualX;
        this._dragStartY = virtualY;

        this._propagate(new MouseEvent(MouseEventType.MouseDown),
            new MouseEventArgs(this, virtualX, virtualY, e.button, e.altKey, e.ctrlKey, e.shiftKey));
    }

    /**
     * Called when the mouse is moved on the canvas
     * @param e - The mouse data
     * @private
     */
    _canvasMouseMove(e){
        // Don't do the default
        e.preventDefault();

        // Figure out where the mouse is at relative to the canvas
        // Figure out where the mouse was pressed down relative to the canvas, when not scaled
        const virtualX = (e.clientX - this._canvas.offsetLeft + this._scrollX(this._canvas)) / this.scale;
        const virtualY = (e.clientY - this._canvas.offsetTop + this._scrollY(this._canvas)) / this.scale;

        this._propagate(new MouseEvent(MouseEventType.MouseMove),
            new MouseEventArgs(this, virtualX, virtualY, e.button, e.altKey, e.ctrlKey, e.shiftKey));
    }

    /**
     * Called when the mouse is released on the canvas
     * @param e - The mouse data
     * @private
     */
    _canvasMouseUp(e){
        // Stop the default
        e.preventDefault();

        // Figure out where the mouse was pressed down relative to the canvas, when not scaled
        const virtualX = (e.clientX - this._canvas.offsetLeft + this._scrollX(this._canvas)) / this.scale;
        const virtualY = (e.clientY - this._canvas.offsetTop + this._scrollY(this._canvas)) / this.scale;

        this._propagate(new MouseEvent(MouseEventType.MouseUp),
            new MouseEventArgs(this, virtualX, virtualY, e.button, e.altKey, e.ctrlKey, e.shiftKey));
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
            return (node.scrollLeft ? node.scrollLeft : 0) + this._scrollX(node.parentNode);
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

    // region Event Handlers

    _mouseDown(e){
        // If we're on a resize anchor already (set in _mouseMove), then set the shape to drag and capture the mouse
        if(this._resizeAnchor){
            this._objectToDrag = Keyboard.focusedElement;
            this.setCapture();
        }
        // Otherwise, ensure nothing is focused, since we must have clicked somewhere on the canvas' "whitespace"
        else{
            Keyboard.focusedElement = this._objectToDrag = null;
            this.__dispatchEvent(EVENT_OBJECT_CHANGE, new ObjectChangedEventArgs(this, null));
        }
    }

    _mouseMove(e){

        // Figure out how far we've moved
        const x = e.x - this._dragStartX;
        const y = e.y - this._dragStartY;

        // If we have a resize anchor, and an object that can be dragged, then we must be resizing
        if(this._resizeAnchor && this._objectToDrag){
            this._objectToDrag.resize(x, y, this._resizeAnchor, e.shiftKey, e.altKey);
        }
    }

    _mouseUp(e){
        // Ensure the context menu is hidden
        this.hideContextMenu();

        // Ensure we don't keep resizing
        this._objectToDrag = null;

        this.releaseCapture();
    }

    // region Shape Events

    _shapeMouseDownCapture(e){
        // Focus the element
        Keyboard.focusedElement = e.sender;
        this.__dispatchEvent(EVENT_OBJECT_CHANGE, new ObjectChangedEventArgs(this, e.sender));
    }

    _shapeMouseDown(e){

        // Set as the object to drag
        this._objectToDrag = e.sender;

        e.handled = true;
        e.sender.setCapture();
    }

    _shapeMouseEnter(e){
        Mouse.setCursor(Cursor.Pointer);
    }

    _shapeMouseLeave(e){
        // If we're still dragging, them call the move event to keep things caught up
        if(this._objectToDrag && this._objectToDrag == e.sender){
            this._shapeMouseMove(e);
        }
        // Otherwise, we actually left
        else{
            Mouse.setCursor(Cursor.Default);
        }
    }

    _shapeMouseMove(e){
        if(this._objectToDrag && this._objectToDrag == e.sender) {
            // Figure out how far we've moved
            let x = e.x - this._dragStartX;
            let y = e.y - this._dragStartY;

            // If shift is pressed, then we want to move in a straight or diagonal line
            if (e.shiftKey) {

                // Figure out how far X and Y have absolutely moved, so we can figure if if we're dragging
                // diagonally, horizontally, or vertically
                const absX = Math.abs(x);
                const absY = Math.abs(y);

                // Figure out which one is bigger and smaller
                const big = Math.max(absX, absY);
                const small = Math.min(absX, absY);

                // Straight if we've moved < 5, or if they're not within 70% of each other
                if ((absX < 5 && absY < 5) || (small / big) < .7) {
                    if (absX > absY) {
                        y = 0;
                    }
                    else {
                        x = 0;
                    }
                }
                else {
                    // Otherwise, keep them even
                    if (absX > absY) {
                        y = absX * (absY == y ? 1 : -1);
                    }
                    else {
                        x = absY * (absX == x ? 1 : -1);
                    }
                }
            }

            // snap to grid, if necessary
            if (this.snapToGrid) {
                x = Math.round(x / this.gridSize) * this.gridSize;
                y = Math.round(y / this.gridSize) * this.gridSize;
            }

            // And finally, tell the object to move
            this._objectToDrag.move(x, y);
        }
    }

    _shapeMouseUp(e){
        if(this._objectToDrag){
            this._objectToDrag.commitResize();
            this._objectToDrag = null;
        }
    }

    // endregion

    // region Anchor Events

    _anchor_MouseDown(e){
        this._resizeAnchor = e.sender;
        e.sender.setCapture();
        e.handled = true;
    }


    _anchor_MouseEnter(e){
        if(e.sender === this.anchors[Anchor.TopLeft]) Mouse.setCursor(Cursor.TopLeft);
        else if(e.sender === this.anchors[Anchor.TopRight]) Mouse.setCursor(Cursor.TopRight);
        else if(e.sender === this.anchors[Anchor.BottomLeft]) Mouse.setCursor(Cursor.BottomLeft);
        else if(e.sender === this.anchors[Anchor.BottomRight]) Mouse.setCursor(Cursor.BottomRight);
    }

    _anchor_MouseLeave(e){
        Mouse.setCursor(Cursor.Default);
    }


    _anchor_MouseMove(e){
        if(this._resizeAnchor == e.sender){
            const x = e.x - this._dragStartX;
            const y = e.y - this._dragStartY;

            let anchor;
            if(e.sender === this.anchors[Anchor.TopLeft]) anchor = Anchor.TopLeft;
            else if(e.sender === this.anchors[Anchor.TopRight]) anchor = Anchor.TopRight;
            else if(e.sender === this.anchors[Anchor.BottomLeft]) anchor = Anchor.BottomLeft;
            else if(e.sender === this.anchors[Anchor.BottomRight]) anchor = Anchor.BottomRight;

            Keyboard.focusedElement.resize(x, y, anchor, e.shiftKey, e.altKey);
        }
    }

    _anchor_MouseUp(e){
        Keyboard.focusedElement.commitResize();
        this._resizeAnchor = null;
    }

    // endregion

    /**
     * Fires when an object has a property changed
     * @param {PropertyChangedEventArgs} propChangeEventArgs
     * @private
     */
    _shapePropertyChanged(propChangeEventArgs){
        // Just pass it up
        this.__dispatchEvent(EVENT_PROPERTY_CHANGE, propChangeEventArgs);
    }

    // endregion
}