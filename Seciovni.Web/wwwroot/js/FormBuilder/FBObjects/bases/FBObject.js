/**
 * Created by David on 09/26/16.
 */

/**
 * @typedef {{width:number, height: number, textLines: string[]}} TextProperties
 */

/**
 * @callback StringValueConverter
 * @param {string} - The value to be converted
 * @returns {*}
 */

/**
 * @callback ValueToStringConverter
 * @param {*} - The value to be converted
 * @returns {string}
 */

/**
 * Represents a form-builder object
 */
class FBObject extends EventPropagator {

    // region Constructor

    /**
     * Initializes the class
     * @param {number} x - The initial X position of the object
     * @param {number} y - The initial Y position of the object
     * @param {number} width - The initial width of the object
     * @param {number} height - The initial height of the object
     * @protected
     */
    __init(x, y, width, height){

        // Initialize the layout properties with what was passed in
        this.layout.x = x;
        this.layout.y = y;
        this.layout.width = width;
        this.layout.height = height;

        /**
         * Holds a copy of layout properties so that things can be reverted if a move or resize is cancelled
         * @type {Layout}
         * @private
         */
        this._backupLayout = this.layout.clone();

        this.layout.subscribe(EVENT_PROPERTY_CHANGE, (propNameEventArgs) => {
            this.__dispatchEvent(EVENT_PROPERTY_CHANGE,
                new PropertyChangedEventArgs("layout_" + propNameEventArgs.propertyName, this));
        });
        this.caption.subscribe(EVENT_PROPERTY_CHANGE, (propNameEventArgs) => {
            this.__dispatchEvent(EVENT_PROPERTY_CHANGE,
                new PropertyChangedEventArgs("caption_" + propNameEventArgs.propertyName, this));
        });
    }

    /**
     * Creates a new FBObject
     * @param {number} x - The initial X position of the object
     * @param {number} y - The initial Y position of the object
     * @param {number} width - The initial width of the object
     * @param {number} height - The initial height of the object
     */
    constructor(x, y, width, height){
        super();

        /**
         * Holds the appearance properties for the object
         * @type {Appearance}
         * @private
         */
        this._appearance = new Appearance();

        /**
         * Holds the border properties for the object
         * @type {Border}
         * @private
         */
        this._border = new Border();

        /**
         * Holds the caption properties for the object
         * @type {Caption}
         * @private
         */
        this._caption = new Caption();

        /**
         * Holds the original caption reserve for resizing
         * @type {number}
         * @private
         */
        this._backupCaptionReserve = this._caption.reserve;

        /**
         * Holds the backup layout
         * @type {Layout}
         * @private
         */
        this._backupLayout = null;

        /**
         * Holds the layout properties for the object
         * @type {Layout}
         * @private
         */
        this._layout = new Layout();

        /**
         * @type {object<function, function>}
         * @private
         */
        this._boundMethods = {};

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

        // Put the box on the top

        /**
         * The resizer object for the caption
         * @type {Box}
         * @private
         */
        this._captionResizer = new Box(0, 0, 0, 0);
        this._captionResizer.appearance.background = "#bbb";
        this.children.unshift(this._captionResizer);

        this._captionResizer.subscribe(MouseEventType.MouseDown, this.__getBoundFunc(this._captionResize_MouseDown));
        this._captionResizer.subscribe(MouseEventType.MouseEnter, this.__getBoundFunc(this._captionResize_MouseEnter));
        this._captionResizer.subscribe(MouseEventType.MouseLeave, this.__getBoundFunc(this._captionResize_MouseLeave));
        this._captionResizer.subscribe(MouseEventType.MouseMove, this.__getBoundFunc(this._captionResize_MouseMove));
        this._captionResizer.subscribe(MouseEventType.MouseUp, this.__getBoundFunc(this._captionResize_MouseUp));

        // Only call init if we were given good data
        if(x) {
            this.__init(x, y, width, height);
        }
    }

    // endregion

    // region Public Properties

    /**
     * Gets the appearance properties of the object
     * @returns {Appearance}
     */
    get appearance() { return this._appearance; }

    /**
     * Gets the border properties of the object
     * @returns {Border}
     */
    get border() { return this._border; }

    /**
     * Gets the caption properties of the object
     * @returns {Caption}
     */
    get caption() { return this._caption; }

    /**
     * The caption's reserve
     * @return {number}
     */
    get captionReserve() { return this.caption.reserve; }

    /**
     * The caption's reserve
     * @param {number} value
     */
    set captionReserve(value) {

        // Zero is special, and means auto
        if(value === 0){
            this.caption.reserve = 0;
            return;
        }

        // This just makes the move method think the caption is being resized via the mouse
        // which makes all the logic be able to stay in one place

        let downX = 1, downY = 1;
        if(this.caption.reserve === 0){
            const val = this.caption.location & WYSIWYG_CAPTION_TOP_BOTTOM ? this.caption.height : this.caption.width;
            downX = downY = val + 1 + WYSIWYG_CAPTION_PADDING;
        }

        const diff = value - this.captionReserve;

        const downEvent = new MouseEventArgs(this, downX, downY, MouseButton.Left, false, false, false);
        downEvent.sender = this._captionResizer;
        let moveEvent;

        if(this.caption.location & WYSIWYG_CAPTION_TOP_BOTTOM){
            moveEvent = new MouseEventArgs(this, 0, diff + 1, MouseButton.Left, false, false, false);
        }
        else if(this.caption.location & WYSIWYG_CAPTION_LEFT_RIGHT){
            moveEvent = new MouseEventArgs(this, diff + 1, 0, MouseButton.Left, false, false, false);
        }

        this._captionResize_MouseDown(downEvent);
        this._captionResize_MouseMove(moveEvent);
        this._captionResize_MouseUp(null);
        this.releaseCapture();
    }

    /**
     * The layout properties of the object
     * @returns {Layout}
     */
    get layout() { return this._layout; }

    /**
     * Gets the margin properties of the object
     * @returns {TRBL}
     */
    get margin() { return this.layout.margin; }

    /**
     * Gets the padding properties of the object
     * @returns {TRBL}
     */
    get padding() { return this.layout.padding; }

    /**
     * The minimum height this object can be
     * @return {number}
     */
    get minHeight() { return 0; }

    /**
     * The minimum width this object can be
     * @return {number}
     */
    get minWidth() { return 0; }

    /**
     * Gets the x position of the base object
     * @returns {number}
     */
    get x() { return this.layout.x; }

    /**
     * Gets the y position of the base object
     * @returns {number}
     */
    get y() { return this.layout.y; }

    /**
     * Gets the width of the base object
     * @returns {number}
     */
    get width() { return this.layout.width; }

    /**
     * Gets the height of the base object
     * @returns {number}
     */
    get height() { return this.layout.height; }


    /**
     * Gets the x position of the entire object, including the border, margin, and caption
     * @returns {number}
     */
    get visualX() {
        const x = this.x;
        const border = this.border.left;
        const margin = this.layout.margin.left;
        let caption = 0;

        if(this.caption.location == Location.Left) {
            caption = (this.caption.reserve === 0 ? this.caption.width : this.caption.reserve) + WYSIWYG_CAPTION_PADDING;
        }

        return x - border - caption - margin;
    }

    /**
     * @param {number} value
     */
    set visualX(value){
        // Just shift the current x value by the difference between old and new visualX
        this.layout.x = this.layout.x + (value - this.visualX);
    }


    /**
     * Gets the y position of the entire object, including the border, margin, and caption
     * @returns {number}
     */
    get visualY() {
        const y = this.y;
        const border = this.border.top;
        const margin = this.layout.margin.top;
        let caption = 0;

        if(this.caption.location == Location.Top) {
            caption = (this.caption.reserve === 0 ? this.caption.height : this.caption.reserve) + WYSIWYG_CAPTION_PADDING;
        }

        return y - border - caption - margin;
    }

    /**
     * @param {number} value
     */
    set visualY(value){
        // Just shift the current y value by the difference between old and new visualY
        this.layout.y = this.layout.y + (value - this.visualY);
    }


    /**
     * Gets the width of the entire object, including the border, margin, and caption
     * @returns {*}
     */
    get visualWidth() {
        const width = this.width;
        const border = this._border.left + this._border.right;
        const margin = this._layout.margin.left + this._layout.margin.right;
        let caption = 0;

        if(this.caption.location == Location.Left || this.caption.location == Location.Right) {
            caption = (this.caption.reserve === 0 ? this.caption.width : this.caption.reserve) + WYSIWYG_CAPTION_PADDING;
        }

        return width + border + caption + margin;
    }

    /**
     * @param {number} value
     */
    set visualWidth(value){
        // Just shift the current width value by the difference between old and new visualWidth
        this.layout.width = Math.max(this.layout.width + (value - this.visualWidth), 0);
    }


    /**
     * Gets the height of the entire object, including the border, margin, and caption
     * @returns {*}
     */
    get visualHeight() {
        const height = this.height;
        const border = this._border.top + this._border.bottom;
        const margin = this._layout.margin.top + this._layout.margin.bottom;
        let caption = 0;

        if(this.caption.location & WYSIWYG_CAPTION_TOP_BOTTOM) {
            caption = (this.caption.reserve === 0 ? this.caption.height : this.caption.reserve) + WYSIWYG_CAPTION_PADDING;
        }

        return height + border + caption + margin;
    }

    /**
     * @param {number} value
     */
    set visualHeight(value){
        // Just shift the current height value by the difference between old and new visualHeight
        this.layout.height = Math.max(this.layout.height + (value - this.visualHeight), 0);
    }

    // endregion

    // region Public Methods

    /**
     * Cancels the current resize or move operation
     */
    cancelResize(){
        this.layout.copyIn(this._backupLayout.clone());
        this._caption.reserve = this._backupCaptionReserve;
    }

    /**
     * Commits or saves the current resize or move operation
     */
    commitResize(){
        this._backupLayout = this.layout.clone();
        this._backupCaptionReserve = this.caption.reserve;
    }

    /**
     * Draws the object
     * @param {CanvasRenderingContext2D} context
     */
    draw(context){
        // Save the context, an draw the main shape
        context.save();
        this._doDraw(context);
        context.restore();

        // Save the context, and draw the border
        context.save();
        this._drawBorder(context);
        context.restore();

        // If there is a caption to draw, save the context and draw it
        if(this.caption.text && this.caption.text !== "") {
            context.save();
             this.caption.draw(context, this.layout, this.border);
            //this._drawCaption(context);
            context.restore();

            const capLoc = this.caption.location;

            // Don't draw a resizer if it's in the middle
            if(capLoc & WYSIWYG_CAPTION_CENTER){
                this._captionResizer.layout.width = this._captionResizer.layout.height = 0;
                return;
            }

            if(capLoc & WYSIWYG_CAPTION_TOP_BOTTOM){
                this._captionResizer.layout.width = this.width;
                this._captionResizer.layout.height = WYSIWYG_CAPTION_PADDING * 0.2;
                this._captionResizer.layout.x = this.x;
                this._captionResizer.margin.top = this._captionResizer.margin.bottom = WYSIWYG_CAPTION_PADDING * 0.4;
            }
            else if(capLoc & WYSIWYG_CAPTION_LEFT_RIGHT){
                this._captionResizer.layout.width = WYSIWYG_CAPTION_PADDING * 0.2;
                this._captionResizer.layout.height = this.height;
                this._captionResizer.layout.y = this.y;
                this._captionResizer.margin.left = this._captionResizer.margin.right = WYSIWYG_CAPTION_PADDING * 0.4;
            }

            if (capLoc === Location.Top) {
                const resizerHeight = this._captionResizer.height + this._captionResizer.margin.top + this._captionResizer.margin.bottom;
                this._captionResizer.layout.y = this.y - this.border.top - resizerHeight;
            }
            else if (capLoc === Location.Right) {
                this._captionResizer.layout.x = this.x + this.width + this.border.right;

            }
            else if(capLoc === Location.Bottom){
                this._captionResizer.layout.y = this.y + this.height + this.border.bottom;
            }
            else if(capLoc === Location.Left){
                const resizerWidth = this._captionResizer.width + this._captionResizer.margin.left + this._captionResizer.margin.right;
                this._captionResizer.layout.x = this.x - this.border.left - resizerWidth;
            }

            context.save();
            this._captionResizer.draw(context);
            context.restore();
        }
    }

    /**
     * Gets any custom menu options for the context menu
     * @returns {{text: string, callback: EventHandler}[]}
     */
    getCustomContextOptions(){
        return null;
    }

    /**
     * Indicates if the given coordinates are in the object
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {boolean}
     */
    isPointInObject(x, y){
        x = x - this.visualX;
        y = y - this.visualY;

        return x >= 0 && x <= this.visualWidth &&
            y >= 0 && y <= this.visualHeight;
    }

    /**
     * Moves the object
     * @param {number} relativeX - The relative X distance to move the object
     * @param {number} relativeY - The relative Y distance to move the object
     */
    move(relativeX, relativeY){
        this.layout.x = this._backupLayout._x + relativeX;
        this.layout.y = this._backupLayout._y + relativeY;
    }

    /**
     * Resizes the object
     * @param {number} resizeX - The amount to resize the object on the X axis
     * @param {number} resizeY - The amount to resize the object on the Y axis
     * @param {Anchor} anchor - The anchor being dragged
     * @param {boolean} preserveRatio - Indicates if the ratio of the shape should be preserved
     * @param {boolean} keepCenter - Indicates if the shape should resize on both side, therefore keep its center
     */
    resize(resizeX, resizeY, anchor, preserveRatio = false, keepCenter = false) {

        // If we didn't get a valid anchor, throw out
        if (anchor < Anchor.TopLeft || anchor > Anchor.BottomRight) {
            throw "anchor must be ANCHOR_LEFT_TOP, ANCHOR_LEFT_BOTTOM, ANCHOR_RIGHT_TOP, or ANCHOR_RIGHT_BOTTOM";
        }

        // Hold the new values to be set
        let newX, newY, newW, newH;

        // If we're going to preserve the ratio, we have to do some math
        if (preserveRatio) {
            /* Basically, we figure out where the X/Y value should be (the smaller one gets adjusted)
            ** and then "put" the value where it would be if the user was extremely skilled at moving
            ** their mouse perfect to keep the ratio.
            */

            let adjAmt = 0;

            // If X is bigger
            if (Math.abs(resizeX) > Math.abs(resizeY)) {
                adjAmt = 1 + (resizeX / this._backupLayout.width);
                resizeY = -1 * (this._backupLayout.height - (this._backupLayout.height * adjAmt));
            }
            // Else Y is bigger
            else {
                adjAmt = 1 + (resizeY / this._backupLayout.height);
                resizeX = -1 * (this._backupLayout.width - (this._backupLayout.width * adjAmt));
            }
        }

        // The adjustment scale needs to be twice as much if we're keeping the center
        const adjScale = keepCenter ? 2 : 1;

        // If we're on the left side
        if (anchor === Anchor.TopLeft || anchor === Anchor.BottomLeft) {
            newX = this._backupLayout.x + resizeX;
            newW = this._backupLayout.width - (resizeX * adjScale);
        }
        // Otherwise, it must be the right
        else {
            newX = this._backupLayout.x - (keepCenter ? resizeX : 0);
            newW = this._backupLayout.width + (resizeX * adjScale);
        }


        // If we're on the top
        if (anchor === Anchor.TopLeft || anchor === Anchor.TopRight) {
            newY = this._backupLayout.y + resizeY;
            newH = this._backupLayout.height - (resizeY * adjScale);
        }
        // Otherwise, it must be the bottom
        else {
            newY = this._backupLayout.y - (keepCenter ? resizeY : 0);
            newH = this._backupLayout.height + (resizeY * adjScale);
        }

        // If we have a minimum width, and it has been exceeded, then make it the minimum
        if (this.minWidth && newW < this.minWidth) {
            // Readjust the X axis with the width, if necessary (Prevents it from sliding when the minimum is hit)
            if(newX !== this._backupLayout.x && !keepCenter) newX -= (this.minWidth - newW);
            else if (keepCenter) newX -= (0.5 *  (this.minWidth - newW));
            newW = this.minWidth;
        }
        // Otherwise, if we have a minimum visual, make it no smaller than zero
        else if (newW < 0 && this.__getMinVisualWidth() > 0) {
            // Ditto like above
            if(newX !== this._backupLayout.x && !keepCenter) newX -= Math.abs(newW);
            else if (keepCenter) newX -= (0.5 *  Math.abs(newW));
            newW = 0;
        }

        // DITTO for height
        if (this.minHeight && newH < this.minHeight) {
            if(newY !== this._backupLayout.y && !keepCenter) newY -= (this.minHeight - newH);
            else if (keepCenter) newY -= (0.5 *  (this.minHeight - newH));
            newH = this.minHeight;
        }
        else if (newH < 0 && this.__getMinVisualHeight() > 0) {
            if(newY !== this._backupLayout.y && !keepCenter) newY -= Math.abs(newH);
            else if (keepCenter) newY -= (0.5 *  Math.abs(newH));
            newH = 0;
        }

        if (newW < 0) {
            newX += newW;
            newW = Math.abs(newW);
        }
        if (newH < 0) {
            newY += newH;
            newH = Math.abs(newH);
        }

        this.layout.x = newX;
        this.layout.y = newY;
        this.layout.width = newW;
        this.layout.height = newH;
    }

    toString() { return "FBObject"; }

    // endregion

    // region Object Properties

    // region HTML

    /**
     * Gets all the HTML elements that need created
     * @returns {{}}
     */
    getHtmlPropertyData(){
        const retVal = {};

        retVal.layout_x = this.__makePropertyData("Layout", "X", PropertyType.Number, "Size and Position");
        retVal.layout_y = this.__makePropertyData("Layout", "Y", PropertyType.Number, "Size and Position");
        retVal.layout_width = this.__makePropertyData("Layout", "Width", PropertyType.ABS, "Size and Position");
        retVal.layout_height = this.__makePropertyData("Layout", "Height", PropertyType.ABS, "Size and Position");

        retVal.margin_top = this.__makePropertyData("Layout", "Top", PropertyType.ABS, "Margin");
        retVal.margin_right = this.__makePropertyData("Layout", "Right", PropertyType.ABS, "Margin");
        retVal.margin_bottom = this.__makePropertyData("Layout", "Bottom", PropertyType.ABS, "Margin");
        retVal.margin_left = this.__makePropertyData("Layout", "Left", PropertyType.ABS, "Margin");

        retVal.padding_top = this.__makePropertyData("Layout", "Top", PropertyType.ABS, "Padding");
        retVal.padding_right = this.__makePropertyData("Layout", "Right", PropertyType.ABS, "Padding");
        retVal.padding_bottom = this.__makePropertyData("Layout", "Bottom", PropertyType.ABS, "Padding");
        retVal.padding_left = this.__makePropertyData("Layout", "Left", PropertyType.ABS, "Padding");

        retVal.appearance_back = this.__makePropertyData("Appearance", "Background", PropertyType.Color);
        retVal.appearance_fore = this.__makePropertyData("Appearance", "Foreground", PropertyType.Color);
        retVal.appearance_strokeColor = this.__makePropertyData("Appearance", "Stroke Color", PropertyType.Color);
        retVal.appearance_strokeThickness = this.__makePropertyData("Appearance", "Stroke Thickness", PropertyType.ABS);

        retVal.border_top = this.__makePropertyData("Border", "Top", PropertyType.ABS);
        retVal.border_right = this.__makePropertyData("Border", "Right", PropertyType.ABS);
        retVal.border_bottom = this.__makePropertyData("Border", "Bottom", PropertyType.ABS);
        retVal.border_left = this.__makePropertyData("Border", "Left", PropertyType.ABS);
        retVal.border_color = this.__makePropertyData("Border", "Color", PropertyType.Color);

        retVal.caption_text = this.__makePropertyData("Text", "Text", PropertyType.Text, "Caption");
        retVal.caption_reserve = this.__makePropertyData("Text", "Reserve", PropertyType.ABS, "Caption");
        retVal.caption_location = this.__makePropertyData("Text", "Location", PropertyType.Location, "Caption");
        retVal.caption_font_family = this.__makePropertyData("Text", "Font Family", PropertyType.FontFamily, "Caption");
        retVal.caption_font_size = this.__makePropertyData("Text", "Font Size", PropertyType.ABS, "Caption");
        retVal.caption_font_color = this.__makePropertyData("Text", "Font Color", PropertyType.Color, "Caption");
        retVal.caption_font_color = this.__makePropertyData("Text", "Alignment", PropertyType.Alignment, "Caption");
        retVal.caption_font_bold = this.__makePropertyData("Text", "Bold", PropertyType.Checkbox, "Caption");
        retVal.caption_font_italic = this.__makePropertyData("Text", "Italic", PropertyType.Checkbox, "Caption");

        return retVal;
    }

    /**
     *
     * @param {string} group - The group this object belongs is
     * @param {string} name - The name to be put in the label
     * @param {PropertyType} type - The type of content this property is
     * @param {string|null} subGroup - The subgroup, if any for this property
     * @returns {{Group: string, SubGroup: string|null, Name: string, Type: PropertyType}}
     * @protected
     */
    __makePropertyData(group, name, type, subGroup = null){
        return {Group: group, SubGroup: subGroup, Name: name, Type: type};
    }

    // endregion

    // region Model

    /**
     *
     * @returns {object<string, {get: (function()), set: (function({string}): boolean)}>}
     */
    getHtmlPropertyModelDict(){

        const retVal = {};
        retVal.layout_x = this.__makeHtmlPropertyModel(this, "visualX", parseInt, parseInt);
        retVal.layout_y = this.__makeHtmlPropertyModel(this, "visualY", parseInt, parseInt);
        retVal.layout_width = this.__makeHtmlPropertyModel(this, "visualWidth", parseInt, parseInt);
        retVal.layout_height = this.__makeHtmlPropertyModel(this, "visualHeight", parseInt, parseInt);
        retVal.margin_top = this.__makeHtmlPropertyModel(this.layout.margin, "top");
        retVal.margin_right = this.__makeHtmlPropertyModel(this.layout.margin, "right");
        retVal.margin_bottom = this.__makeHtmlPropertyModel(this.layout.margin, "bottom");
        retVal.margin_left = this.__makeHtmlPropertyModel(this.layout.margin, "left");
        retVal.padding_top = this.__makeHtmlPropertyModel(this.layout.padding, "top");
        retVal.padding_right = this.__makeHtmlPropertyModel(this.layout.padding, "right");
        retVal.padding_bottom = this.__makeHtmlPropertyModel(this.layout.padding, "bottom");
        retVal.padding_left = this.__makeHtmlPropertyModel(this.layout.padding, "left");
        retVal.appearance_back = this.__makeHtmlPropertyModel(this.appearance, "background");
        retVal.appearance_fore = this.__makeHtmlPropertyModel(this.appearance, "foreground");
        retVal.appearance_strokeColor = this.__makeHtmlPropertyModel(this.appearance, "strokeColor");
        retVal.appearance_strokeThickness = this.__makeHtmlPropertyModel(this.appearance, "strokeThickness", parseInt, Math.floor);
        retVal.border_top = this.__makeHtmlPropertyModel(this.border, "top");
        retVal.border_right = this.__makeHtmlPropertyModel(this.border, "right");
        retVal.border_bottom = this.__makeHtmlPropertyModel(this.border, "bottom");
        retVal.border_left = this.__makeHtmlPropertyModel(this.border, "left");
        retVal.border_color = this.__makeHtmlPropertyModel(this.border, "color");
        retVal.caption_text = this.__makeHtmlPropertyModel(this.caption, "text");
        retVal.caption_reserve = this.__makeHtmlPropertyModel(this, "captionReserve", parseInt,
            (value) => { if(value > 0) return value.toString(); else return "Auto"; });
        retVal.caption_location = this.__makeHtmlPropertyModel(this.caption, "location", parseInt);
        retVal.caption_font_family = this.__makeHtmlPropertyModel(this.caption.font, "family");
        retVal.caption_font_size = this.__makeHtmlPropertyModel(this.caption.font, "size");
        retVal.caption_font_bold = this.__makeHtmlPropertyModel(this.caption.font, "bold");
        retVal.caption_font_italic = this.__makeHtmlPropertyModel(this.caption.font, "italic");
        retVal.caption_font_color = this.__makeHtmlPropertyModel(this.caption.font, "color");
        retVal.caption_font_color = this.__makeHtmlPropertyModel(this.caption.font, "alignment");

        return retVal;
    }

    /**
     *
     * @param {*} object - The object to target
     * @param {string} property - The property on the object to get the get/set for
     * @param {StringValueConverter} setConverter - A method which converts a string to the correct type
     * @param {ValueToStringConverter} getConverter - A method which converts a string to the correct type
     * @returns {{get: (function()), set: (function({string}): boolean)}}
     * @protected
     */
    __makeHtmlPropertyModel(object, property,
                            setConverter = (value) => { return value; },
                            getConverter = (value) => { return value; }){
        return {
            get: () => getConverter(Reflect.get(object, property)),
            set: (value) => Reflect.set(object, property, setConverter(value)),
        };
    }

    // endregion

    // endregion

    // region Private Methods

    /**
     * Gets a method which has `this` bound to it so it can be used for events
     * Creates the bound method if it does not exist.
     * @param {function} func - The original function that needed `this` bound to it
     * @returns {function}
     * @protected
     */
    __getBoundFunc(func){
        if(!this._boundMethods[func]) this._boundMethods[func] = func.bind(this);

        return this._boundMethods[func];
    }

    /**
     * Gets the minimum visual height this object can be
     * @returns {number}
     * @protected
     */
    __getMinVisualHeight(){
        // Get the parts that contribute to the height
        let minHeight = this.minHeight + this.border.top + this.border.bottom + this.layout.margin.top + this.layout.margin.bottom;

        // If the caption is at the top or bottom, add it in
        if(this.caption.location === Location.Top || this.caption.location === Location.Bottom){
            minHeight += this.caption.reserve === 0 ? this.caption.width : this.caption.reserve;
        }

        return minHeight;
    }

    /**
     * Gets the minimum visual width this object can be
     * @returns {number}
     * @protected
     */
    __getMinVisualWidth(){
        // Get everything that contributes to the width
        let minWidth = this.minWidth + this.border.left + this.border.right + this.layout.margin.left + this.layout.margin.right;

        // If the caption is on the left or right, add that in
        if(this.caption.location === Location.Left || this.caption.location === Location.Right){
            minWidth += this.caption.reserve === 0 ? this.caption.width : this.caption.reserve;
        }

        return minWidth;
    }

    /**
     * Draws the border on this object
     * @param {CanvasRenderingContext2D} context - The context to draw with
     * @private
     */
    _drawBorder(context){
        // Store the needed properties in local variables for easy access
        const topThickness = this.border.top;
        const rightThickness = this.border.right;
        const bottomThickness = this.border.bottom;
        const leftThickness = this.border.left;
        const x = this.layout._x;
        const y = this.layout._y;
        const height = this.layout.height;
        const width = this.layout.width;

        // Set the context's fill style, so the border is the right color
        context.fillStyle = this.border.color;


        /**
        ** The following four if statements work with the following logic:
        ** If the border has a size, figure out the size it should be
        ** The size includes the size of neighboring border. Such that,
        ** if there is a top and right border, the top's width will be
        ** extended so that it goes all the way to the right of the right
        ** border, and the right's height and y position will be adjusted
        ** so that the right border will go to the top of the top border.
        ** This is a little redundant, But it keeps all the logic the same.
        ** Might change it someday.
        ** Then a rectangle is drawn to represent the border
        */

        if(topThickness > 0){
            const bY = (y - topThickness);
            const bX = (x - leftThickness);
            const bW = (width + leftThickness + rightThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, bW, topThickness);
            context.fill();
            context.closePath();
        }

        if(rightThickness > 0){
            const bX = (x + width);
            const bY = (y - topThickness);
            const bH = (height + topThickness + bottomThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, rightThickness, bH);
            context.fill();
            context.closePath();
        }

        if(bottomThickness > 0){
            const bY = (y + height);
            const bX = (x - leftThickness);
            const bW = (width + leftThickness + rightThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, bW, bottomThickness);
            context.fill();
            context.closePath();
        }

        if(leftThickness > 0){
            const bX = (x - leftThickness);
            const bY = (y - topThickness);
            const bH = (height + topThickness + bottomThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, leftThickness, bH);
            context.fill();
            context.closePath();
        }
    }

    // endregion

    // region Event Handlers

    _captionResize_MouseDown(e){
        // this.__dispatchEvent(EVENT_BEGIN_CAPTION_RESIZE, null);
        this._dragStartX = e.x;
        this._dragStartY = e.y;

        if(this.caption.reserve === 0){
            if(this.caption.location & WYSIWYG_CAPTION_TOP_BOTTOM) {
                this._backupCaptionReserve = this.caption.height + WYSIWYG_CAPTION_PADDING;
            }
            else if(this.caption.location & WYSIWYG_CAPTION_LEFT_RIGHT){
                this._backupCaptionReserve = this.caption.width + WYSIWYG_CAPTION_PADDING;
            }
        }
        else {
            this._backupCaptionReserve = this.caption.reserve;
        }

        e.sender.setCapture();
        e.handled = true;
    }

    _captionResize_MouseEnter(e){
        e.handled = true;

        if(this.caption.location & WYSIWYG_CAPTION_TOP_BOTTOM){
            Mouse.setCursor(Cursor.RowResize);
        }
        else if(this.caption.location & WYSIWYG_CAPTION_LEFT_RIGHT){
            Mouse.setCursor(Cursor.ColumnResize);
        }


    }

    _captionResize_MouseLeave(e){
        Mouse.setCursor(Cursor.Default);
    }

    _captionResize_MouseMove(e){

        if(this._dragStartX > 0 && this._dragStartY > 0) {

            e.handled = true;

            const capLoc = this._caption.location;
            let moveDist = 0;

            let upperBound = 0;
            let lowerBound = WYSIWYG_CAPTION_PADDING;

            if(capLoc & WYSIWYG_CAPTION_LEFT_RIGHT){
                moveDist = e.x - this._dragStartX;
                lowerBound = Math.max(WYSIWYG_CAPTION_PADDING, this.minWidth);
            }
            else if(capLoc & WYSIWYG_CAPTION_TOP_BOTTOM) {
                moveDist = e.y - this._dragStartY;
                lowerBound = Math.max(WYSIWYG_CAPTION_PADDING, this.minHeight);
            }

            // +1 on the below ones to prevent it from going into auto-mode

            if(capLoc === Location.Top){
                upperBound = this._backupLayout.height + this._backupCaptionReserve - WYSIWYG_CAPTION_PADDING;

                const newHeight = Math.clip(this._backupLayout.height - moveDist, lowerBound, upperBound);
                const newY = this._backupLayout.y + (this._backupLayout.height - newHeight);

                this.layout.height = newHeight;
                this.layout.y = newY;
                this.caption.reserve = upperBound - this.layout.height + 1;
            }
            else if(capLoc == Location.Right){
                upperBound = this._backupLayout.width + this._backupCaptionReserve - WYSIWYG_CAPTION_PADDING;

                this.layout.width = Math.clip(this._backupLayout.width + moveDist, lowerBound, upperBound);
                this.caption.reserve = upperBound - this.layout.width + 1;
            }
            else if(capLoc == Location.Bottom){
                upperBound = this._backupLayout.height + this._backupCaptionReserve - WYSIWYG_CAPTION_PADDING;

                this.layout.height = Math.clip(this._backupLayout.height + moveDist, lowerBound, upperBound);
                this.caption.reserve = upperBound - this.layout.height + 1;
            }
            else if(capLoc === Location.Left){
                upperBound = this._backupLayout.width + this._backupCaptionReserve - WYSIWYG_CAPTION_PADDING;

                const newWidth = Math.clip(this._backupLayout.width - moveDist, lowerBound, upperBound);
                const newX = this._backupLayout.x + (this._backupLayout.width - newWidth);

                this.layout.width = newWidth;
                this.layout.x = newX;
                this.caption.reserve = upperBound - this.layout.width + 1;
            }
        }
    }

    _captionResize_MouseUp(e){
        // this.__dispatchEvent(EVENT_END_CAPTION_RESIZE, null);
        this._dragStartX = this._dragStartY = 0;
        this.commitResize();
    }

    // endregion
}
