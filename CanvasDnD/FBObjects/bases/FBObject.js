/**
 * Created by David on 09/26/16.
 */

/**
 * @typedef {{width:number, height: number, textLines: string[]}} TextProperties
 */

/**
 * Represents a form-builder object
 */
class FBObject extends EventPropagator {

    // region Constructor

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
         * Holds the layout properties for the object
         * @type {Layout}
         * @private
         */
        this._layout = new Layout();

        /**
         * Holds the caption size data for an object
         * @type {TextProperties}
         * @private
         */
        this._captionData = null;

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

        // Initialize the layout properties with what was passed in
        this._layout.x = x;
        this._layout.y = y;
        this._layout.width = width;
        this._layout.height = height;

        /**
         * Holds a copy of layout properties so that things can be reverted if a move or resize is cancelled
         * @type {Layout}
         * @private
         */
        this._backupLayout = this._layout.clone();

        this._captionResizer = new Box(0, 0, 0, 0);
        this.__children.unshift(this._captionResizer);

        this._captionResizer.subscribe(MouseEventType.MouseDown, this._getBoundFunc(this._captionResize_MouseDown));
        this._captionResizer.subscribe(MouseEventType.MouseEnter, this._getBoundFunc(this._captionResize_MouseEnter));
        this._captionResizer.subscribe(MouseEventType.MouseLeave, this._getBoundFunc(this._captionResize_MouseLeave));
        this._captionResizer.subscribe(MouseEventType.MouseMove, this._getBoundFunc(this._captionResize_MouseMove));
        this._captionResizer.subscribe(MouseEventType.MouseUp, this._getBoundFunc(this._captionResize_MouseUp));

        // this.subscribe(MouseEventType.MouseMove, this._getBoundFunc(this._captionResize_MouseMove));
    }

    /**
     * Set the layout
     * @param {Layout} layout
     */
    setLayout(layout){
        this._layout = layout;
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
     * Gets the layout properties of the object
     * @returns {Layout|*}
     */
    get layout() { return this._layout; }

    get margin() { return this._layout.margin; }

    get padding() { return this._layout.padding; }


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
        var x = this.x;
        var border = this.border.left;
        var margin = this.layout.margin.left;
        var caption = 0;

        if(this.caption.location == CaptionLocation.Left) {
            caption = this.caption.reserve === null ? this._captionData.width : this.caption.reserve;
        }

        return x - border - caption - margin;
    }

    /**
     * Gets the y position of the entire object, including the border, margin, and caption
     * @returns {number}
     */
    get visualY() {
        var y = this.y;
        var border = this.border.top;
        var margin = this.layout.margin.top;
        var caption = 0;

        if(this.caption.location == CaptionLocation.Top) {
            caption = this.caption.reserve === null ? this._captionData.height : this.caption.reserve;
        }

        return y - border - caption - margin;
    }

    /**
     * Gets the width of the entire object, including the border, margin, and caption
     * @returns {*}
     */
    get visualWidth() {
        var width = this.width;
        var border = this._border.left + this._border.right;
        var margin = this._layout.margin.left + this._layout.margin.right;
        var caption = 0;

        if(this.caption.location == CaptionLocation.Left || this.caption.location == CaptionLocation.Right) {
            caption = (this.caption.reserve === null ? this._captionData.width : this.caption.reserve);
        }

        return width + border + caption + margin;
    }

    /**
     * Gets the height of the entire object, including the border, margin, and caption
     * @returns {*}
     */
    get visualHeight() {
        var height = this.height;
        var border = this._border.top + this._border.bottom;
        var margin = this._layout.margin.top + this._layout.margin.bottom;
        var caption = 0;

        if(this.caption.location == CaptionLocation.Top || this.caption.location == CaptionLocation.Bottom) {
            caption = this.caption.reserve === null ? this._captionData.height : this.caption.reserve;
        }

        return height + border + caption + margin;
    }

    // endregion

    // region Public Methods

    /**
     * Cancels the current resize or move operation
     */
    cancelResize(){
        this._layout = this._backupLayout.clone();
        this._caption.reserve = this._backupCaptionReserve;
    }

    /**
     * Commits or saves the current resize or move operation
     */
    commitResize(){
        this._backupLayout = this._layout.clone();
        this._backupCaptionReserve = this._caption.reserve;
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
            this._drawCaption(context);
            context.restore();

            if(this._captionData) {

                var capLoc = this.caption.location;
                if (capLoc === CaptionLocation.Top) {
                    this._captionResizer.layout.x = this.left;
                    this._captionResizer.layout.y = this.top - this.border.top - this.margin.top - (CAPTION_PADDING * 0.2);
                    this._captionResizer.layout.width = this.width;
                    this._captionResizer.layout.height = (CAPTION_PADDING * 0.6);
                }
                else if (capLoc === CaptionLocation.Right) {
                    this._captionResizer.layout.x = this.x + this.width + this.border.right + this.margin.right + (CAPTION_PADDING * 0.2);
                    this._captionResizer.layout.y = this.y;
                    this._captionResizer.layout.width = (CAPTION_PADDING * 0.6);
                    this._captionResizer.layout.height = this.height;

                    this._captionResizer.draw(context);
                }
            }
        }
    }

    toString() { return "FBObject"; }

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
        this._layout._x = this._backupLayout._x + relativeX;
        this._layout._y = this._backupLayout._y + relativeY;
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
        var newX, newY, newW, newH;

        // If we're going to preserve the ratio, we have to do some math
        if (preserveRatio) {
            /* Basically, we figure out where the X/Y value should be (the smaller one gets adjusted)
            ** and then "put" the value where it would be if the user was extremely skilled at moving
            ** their mouse perfect to keep the ratio.
            */

            var adjAmt = 0;

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
        var adjScale = keepCenter ? 2 : 1;

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
            newW = this.minWidth;
        }
        // Otherwise, if we have a minimum visual, make it no smaller than zero
        else if (newW < 0 && this.__getMinVisualWidth() > 0) {
            newW = 0;
        }

        // DITTO for height
        if (this.minHeight && newH < this.minHeight) {
            newH = this.minHeight;
        }
        else if (newH < 0 && this.__getMinVisualHeight() > 0) {
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

    // endregion

    // region Private Methods

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
     * Gets the minimum visual height this object can be
     * @returns {number}
     * @protected
     */
    __getMinVisualHeight(){
        // Get the parts that contribute to the height
        var minHeight = this.minHeight + this.border.top + this.border.bottom+ this.layout.margin.top+ this.layout.margin.bottom;

        // If the caption is at the top or bottom, add it in
        if(this.caption.location === CaptionLocation.Top || this.caption.location === CaptionLocation.Bottom){
            minHeight += this.caption.reserve === null ? this._captionData.width : this.caption.reserve;
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
        var minWidth = this.minWidth + this.border.left + this.border.right + this.layout.margin.left + this.layout.margin.right;

        // If the caption is on the left or right, add that in
        if(this.caption.location === CaptionLocation.Left || this.caption.location === CaptionLocation.Right){
            minWidth += this.caption.reserve === null ? this._captionData.width : this.caption.reserve;
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
        var topThickness = this.border.top;
        var rightThickness = this.border.right;
        var bottomThickness = this.border.bottom;
        var leftThickness = this.border.left;
        var x = this.layout._x;
        var y = this.layout._y;
        var height = this.layout.height;
        var width = this.layout.width;

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
            var bY = (y - topThickness);
            var bX = (x - leftThickness);
            var bW = (width + leftThickness + rightThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, bW, topThickness);
            context.fill();
            context.closePath();
        }

        if(rightThickness > 0){
            var bX = (x + width);
            var bY = (y - topThickness);
            var bH = (height + topThickness + bottomThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, rightThickness, bH);
            context.fill();
            context.closePath();
        }

        if(bottomThickness > 0){
            var bY = (y + height);
            var bX = (x - leftThickness);
            var bW = (width + leftThickness + rightThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, bW, bottomThickness);
            context.fill();
            context.closePath();
        }

        if(leftThickness > 0){
            var bX = (x - leftThickness);
            var bY = (y - topThickness);
            var bH = (height + topThickness + bottomThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, leftThickness, bH);
            context.fill();
            context.closePath();
        }
    }

    /**
     * Draws the caption for this object
     * @param {CanvasRenderingContext2D} context - The context to draw with
     * @private
     */
    _drawCaption(context) {

        // Get some of the caption properties for easier use later
        var capLoc = this.caption.location;
        var capText = this.caption.text;
        var capAlign = this.caption.font.alignment;
        var capPadding = CAPTION_PADDING;

        // If the reserve is null, then it is auto sized, but if it's set,
        // then scale it, and remove the padding from it
        var reserve = this.caption.reserve === null ? null : this.caption.reserve - capPadding;

        // Italic must be first because that's how they designed it
        var fontProps = this._caption.font.italic ? "italic" : "";
        fontProps += this._caption.font.bold ? " bold" : "";
        fontProps = fontProps.trim(); // ensure there's no excess spaces from one not being set

        var fontSize = this._caption.font.size;

        // Setup the context properties
        context.font = fontProps + " " + fontSize + "px " + this._caption.font.fontFamily;
        context.fillStyle = this._caption.font.color;
        context.textAlign = this._caption.font.alignment;
        context.textBaseline = "top"; // Y value is where the top of the text will be

        // Holds the data we get back
        var captionData;

        // If we're on the left or right, the the reserve is the width
        if (capLoc == CaptionLocation.Left || capLoc == CaptionLocation.Right) {
            captionData = this.__getTextProperties(context, capText, reserve, this.height, fontSize);
            reserve = reserve === null ? captionData.width : reserve;
        }
        // Otherwise if we're on the top or bottom, the reserve is the height
        else if (capLoc == CaptionLocation.Top || capLoc == CaptionLocation.Bottom) {
            captionData = this.__getTextProperties(context, capText, this.width, reserve, fontSize);
            reserve = reserve === null ? captionData.height : reserve;
        }
        // Otherwise if we're in the center, the width and height are specified by the shape's width
        else if (capLoc == CaptionLocation.Center) {
            // Remove the padding from the width/height, and then twice the capPadding since it has to apply to
            // both sides.
            var resWidth = (this.width - this.layout.padding.left - this.layout.padding.right) - (capPadding * 2);
            var resHeight = (this.height - this.layout.padding.top - this.layout.padding.bottom) - (capPadding * 2);
            captionData = this.__getTextProperties(context, capText, resWidth, resHeight, fontSize);
        }
        // None
        else {
            return;
        }

        // Remember the caption data we got back
        this._captionData = captionData;

        // If we didn't get any caption data back, then stop here
        if (captionData === null) {
            return;
        }

        // I HATE CANVAS TEXT!

        // Figure out the position of the shape
        var left = this.x;
        var top = this.y;
        var width = this.width;
        var height = this.height;
        var xShift = 0;
        var yShift = 0;

        // And based on the caption's location, shift the caption accordingly
        switch (capLoc) {
            case CaptionLocation.Top:
                // Start at the left side
                xShift = left;

                // If we're in the center, move it to half a width to the right, otherwise move it the entire width
                if (capAlign == FontAlignment.Center) xShift += (width / 2);
                else if (capAlign == FontAlignment.Right) xShift += width;

                // Then pull it up so that it's above the border and capPadding
                yShift = top - this.border.top - capPadding - captionData.height;

                break;
            case CaptionLocation.Right:
                // Ditto, just different math for different sides

                xShift = left + width + this.border.right + capPadding;

                if (capAlign == FontAlignment.Center) xShift += (reserve / 2);
                else if (capAlign == FontAlignment.Right) xShift += reserve;

                yShift = top + ((height - captionData.height) / 2);

                break;
            case CaptionLocation.Bottom:
                // Ditto, just different math for different sides

                xShift = left;

                if (capAlign == FontAlignment.Center) xShift += (width / 2);
                else if (capAlign == FontAlignment.Right) xShift += width;

                yShift = top + height + this.border.bottom + capPadding;

                break;
            case CaptionLocation.Left:
                // Ditto, just different math for different sides

                xShift = left - this.border.left - capPadding;

                if (capAlign == FontAlignment.Center) xShift -= (reserve / 2);
                else if (capAlign == FontAlignment.Left) xShift -= reserve;

                yShift = top + ((height - captionData.height) / 2);

                break;
            case CaptionLocation.Center:
                // Ditto, just different math for different sides

                xShift = left + this.layout.padding.left + capPadding;

                if (capAlign == FontAlignment.Center) xShift += ((width - this.layout.padding.right) / 2) - capPadding;
                if (capAlign == FontAlignment.Right) xShift = left + (width - this.layout.padding.left - this.layout.padding.right);

                yShift = top + ((height - this.layout.padding.top - this.layout.padding.bottom - captionData.height) / 2);
        }

        // Translate to that location so we can just draw at 0, 0
        context.translate(xShift, yShift);

        // Draw each line
        for (var lineIdx = 0; lineIdx < captionData.textLines.length; ++lineIdx) {
            var line = captionData.textLines[lineIdx];

            // The y position is based on the line number, where FLH_RATIO is the line height to font size ratio
            // e.g. If a font size of 20, then with FLH_RATIO=1.5 the line height will be 30.
            context.fillText(line, 0, lineIdx * (fontSize * FLH_RATIO));
        }
    }

    /**
     * Gets the text properties based on the size it must fit in
     * @param {CanvasRenderingContext2D} context
     * @param {string} text - The text to be analyzed
     * @param {number|null} width - The width the text must fit in
     * @param {number|null} height - The height the text must fit in
     * @param {number} fontSize - The size of the font / height of a line of text
     * @returns {TextProperties|null}
     * @protected
     */
    __getTextProperties(context, text, width, height, fontSize){
        var calcWidth = 0;  // Holds what we calculated the width to be for a given line
        var calcHeight = 0; // Holds what we calculated the height to be
        var maxWidth = 0;   // Holds the maximum line width we find

        var outputText = []; // Holds the lines of text to be returned
        var tempLine = "";   // Holds the line being measured

        // If we don't have enough height for one line
        if(height !== null && fontSize > height){
            return null;
        }

        // Hold a dash and a [255] character
        var dash255 = "-" + String.fromCharCode(255);

        // Hold the regex to find either a [space] or [255] character, globally
        var space255reg = new RegExp("[ " + String.fromCharCode(255) + "]", "g");

        // Replace - with [255], and split by [space] and [space] and [255] to preserve -'s.
        // This makes us be able to keep words together, and break on the dashes.
        var words = text.replace(/-/g, dash255).split(space255reg);

        // The current word we're on
        var wordStartIdx = 0;

        // While we either don't have a height, or while the number of lines we have has not exceeded the height
        while(height === null || calcHeight < height) {

            calcWidth = 0; // Start width a width of zero
            tempLine = ""; // And no text in the line
            var wordEndIdx = wordStartIdx; // Adjust the end index so when we ++ it will be the word after the start

            // If no width restriction
            if(width === null){
                // Use the original text
                tempLine = text;
                wordEndIdx = words.length;
            }
            else{
                // While we haven't reached the end of the words
                while(wordEndIdx <= words.length) {

                    // Get the [startWord] to [endWord], and join them with spaces, then
                    // remove spaces after hyphens, since the hyphen is what we originally
                    // split on
                    var wordConcat = words.slice(wordStartIdx, ++wordEndIdx).join(" ").replace(/- /g, "-");

                    // Measure how long the string of words is
                    calcWidth = context.measureText(wordConcat).width;

                    // If we didn't exceed the width, then, remember what we have so far
                    if(calcWidth <= width){
                        tempLine = wordConcat;
                    }
                    // Otherwise, back up the last word (so it will be the starting word next time) and stop processing
                    else{
                        --wordEndIdx;
                        break;
                    }
                }
            }

            // If we didn't get any text back, then there wasn't enough width for one word, so stop processing
            if(tempLine === "") break;

            // Determine if this line is longer than the last max
            maxWidth = Math.max(maxWidth, context.measureText(tempLine).width);

            // Add the line to the array of lines
            outputText.push(tempLine);

            // Set the starting word for next time to be the word after the one we ended width
            // (No, it shouldn't have a +1, it's how the slice method works)
            wordStartIdx = wordEndIdx;

            // Calculate how high we are now
            calcHeight = fontSize + ((fontSize * FLH_RATIO) * (outputText.length - 1));

            // If we've reached the end, the stop processing
            if(wordEndIdx == words.length){
                break;
            }
        }

        // Return what we got
        return {
            width: maxWidth,
            height: calcHeight,
            textLines: outputText
        };
    }

    // endregion

    // region Event Handlers

    _captionResize_MouseDown(e){
        // this.__dispatchEvent(EVENT_BEGIN_CAPTION_RESIZE, null);
        this._dragStartX = e.x;
        this._dragStartY = e.y;
        e.sender.setCapture();
        e.handled = true;
    }

    _captionResize_MouseEnter(e){
        e.handled = true;

        if(this.caption.location & CAPTION_TOP_BOTTOM){
            Mouse.setCursor(Cursor.RowResize);
        }
        else if(this.caption.location & CAPTION_LEFT_RIGHT){
            Mouse.setCursor(Cursor.ColumnResize);
        }


    }

    _captionResize_MouseLeave(e){
        Mouse.restoreCursor();
    }

    _captionResize_MouseMove(e){

        if(this._dragStartX > 0 && this._dragStartY > 0) {

            e.handled = true;

            if(this._caption.location == CaptionLocation.Right){
                var moveDist = e.x - this._dragStartX;

                var newWidth = this._backupLayout.width + moveDist;
                var newReserve = this._backupCaptionReserve - moveDist;

                if(newWidth < 0){
                    newWidth = 0;
                    newReserve = this._backupCaptionReserve + this._backupLayout.width;
                }
                else if(newReserve < 0){
                    newWidth = this._backupCaptionReserve + this._backupLayout.width;
                    newReserve = 0;
                }

                this.layout.width = newWidth;
                this.caption.reserve = newReserve;

            }
        }
    }

    _captionResize_MouseUp(e){
        console.log("Got Up");
        // this.__dispatchEvent(EVENT_END_CAPTION_RESIZE, null);
        this._dragStartX = this._dragStartY = 0;
    }

    // endregion
}
