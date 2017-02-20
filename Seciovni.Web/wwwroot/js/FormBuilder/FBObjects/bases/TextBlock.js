/**
 * Created by David on 11/14/16.
 */

class TextBlock extends EventPropagator {
    /**
     * Creates a new TextBlock object
     * @param {string} text - The text for the TextBlock to start with
     */
    constructor(text = "Your Text Here"){
        super();

        /**
         * @private
         * @type {string}
         */
        this._text = text;

        /**
         * @private
         * @type {Font}
         */
        this._font = new Font();

        this.font.alignment = Alignment.Center;

        /**
         * @private
         * @type {Layout}
         */
        this._layout = new Layout();

        /**
         * The maximum width when in auto-size mode, or the width of the object
         * @type {number|null}
         * @private
         */
        this._maxWidth = null;

        /**
         * The maximum height when in auto-size mode, or the height of the object
         * @type {number|null}
         * @private
         */
        this._maxHeight = null;

        /**
         * Indicates if the height should be auto-sized
         * @type {boolean}
         */
        this.autoHeight = true;

        /**
         * Indicates if the width should be auto-sized
         * @type {boolean}
         */
        this.autoWidth = true;

        /**
         * Indicates if the text block is in edit mode
         * @type {boolean}
         * @private
         */
        this._inEditMode = false;

        /**
         * Indicates if the text should be centered vertically
         * @type {boolean}
         * @private
         */
        this._verticallyCenter = false;

        // TODO: Use this
        this._bindings = [];

        this.subscribe(MouseEventType.DblClick, (e) => this._dblClick(e));
        this.subscribe(MouseEventType.MouseDown, (e) => this._mouseDown(e));
        this.subscribe(MouseEventType.MouseMove, (e) => this._mouseMove(e));

        // Forward any event from layout
        this.layout.subscribe(EVENT_PROPERTY_CHANGE, (e) => this.__sendPropChangeEvent(e.propertyName));
    }

    // region Public Properties

    /**
     * The text
     * @returns {string}
     */
    get text() { return this._text; }

    /**
     * The text
     * @param {string} value
     */
    set text(value) { this._text = value; this.__sendPropChangeEvent("text"); }


    /**
     * The maximum width when in auto mode
     * @return {number}
     */
    get maxWidth() { return this._maxWidth; }

    /**
     * The maximum width when in auto mode
     * @param {number} value
     */
    set maxWidth(value) { this._maxWidth = value; }


    /**
     * The maximum height when in auto mode
     * @return {number}
     */
    get maxHeight() { return this._maxHeight; }

    /**
     * The maximum height when in auto mode
     * @param {number} value
     */
    set maxHeight(value) { this._maxHeight = value; }


    /**
     * Indicates if the text is vertically centered
     * @return {boolean}
     */
    get verticallyCenter() { return this._verticallyCenter; }

    /**
     * Indicates if the text is vertically centered
     * @param {boolean} value
     */
    set verticallyCenter(value) { this._verticallyCenter = value; }


    /**
     * The font
     * @returns {Font}
     */
    get font(){ return this._font; }

    /**
     * The layout
     * @returns {Layout}
     */
    get layout() { return this._layout; }

    // endregion

    // region Public Functions

    /**
     * Draws the shape and its dependencies
     * @param {CanvasRenderingContext2D} context
     */
    draw(context){

        // If we're in edit mode, don't draw the text, as the TextArea has it currently
        if(this._inEditMode){
            return;
        }

        // Get if bold/italic -- Italic must be first because that's how they designed it
        let fontProps = this.font.italic ? "italic" : "";
        fontProps += this.font.bold ? " bold" : "";
        fontProps = fontProps.trim(); // ensure there's no excess spaces from one not being set

        const fontSize = this.font.size;

        // Setup the context properties
        context.font = fontProps + " " + fontSize + "px " + this.font.family;
        context.fillStyle = this.font.color;
        context.textAlign = this.font.alignment.toLowerCase();
        context.textBaseline = "top"; // Y value is where the top of the text will be

        // Get the properties of the text
        const textProps = this.getTextProperties(context);

        // If we're auto-sizing
        if(this.autoWidth) this.layout.width = textProps.width;
        if(this.autoHeight) { this.layout.height = textProps.height; } // console.log("Height set to " + textProps.height); }

        // e.g. If a font size of 20, then with WYSIWYG_FLH_RATIO=1.5 the line height will be 30.
        const lineHeight = (this.font.size * WYSIWYG_FLH_RATIO);
        let yShiftAmt = ((lineHeight - this.font.size) / 2) + this.layout.padding.top;

        // If we want things vertically centered, increase the yShiftAmt
        if(this.verticallyCenter){
            const realHeight = this.layout.height - this.layout.padding.top - this.layout.padding.bottom;
            yShiftAmt += (realHeight - textProps.height) / 2;
        }

        // Default position for Left
        let xPos = this.layout.x + this.layout.padding.left;

        // Set the center position or right position if necessary
        if(this.font.alignment === Alignment.Center) xPos = this.layout.x + (this.layout.width / 2);
        else if(this.font.alignment === Alignment.Right) xPos = this.layout.x + this.layout.width - this.layout.padding.right;

        // Translate to that location so we can just draw at 0, Y
        context.translate(xPos, this.layout.y + yShiftAmt);

        // Draw each line
        for (let lineIdx = 0; lineIdx < textProps.textLines.length; ++lineIdx) {
            const line = textProps.textLines[lineIdx];
            const yPos = lineIdx * lineHeight;

            context.fillText(line, 0, yPos);
        }
    }

    /**
     * Gets the text properties based on the size it must fit in
     * @param {CanvasRenderingContext2D} context
     * @returns {TextProperties|null}
     */
    getTextProperties(context){
        let width = this.autoWidth ? (this.maxWidth > 0 ? this.maxWidth : null) : this.layout.width;
        if(width) {
            width -= (this.layout.padding.left + this.layout.padding.right);
        }

        let height = this.autoHeight ? (this.maxHeight > 0 ? this.maxHeight : null) : this.layout.height;
        if(height) {
            height -= (this.layout.padding.top + this.layout.padding.bottom);
        }

        return TextBlock._getTextProperties(context, this.text, width, height, this.font.size);
    }

    /**
     * Indicates if the given coordinates are in the object
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {boolean}
     */
    isPointInObject(x, y){
        x = x - this.layout.x;
        y = y - this.layout.y;

        const width = this.layout.width + this.layout.margin.left + this.layout.margin.right;
        const height = this.layout.height + this.layout.margin.top + this.layout.margin.bottom;

        return x >= 0 && x <= width && y >= 0 && y <= height;
    }

    toString() { return "TextBlock"; }

    // endregion

    // region Event Handlers

    _textArea_Blur(e){
        const box = e.originalTarget;

        // Go out of edit mode
        this._inEditMode = false;
        this._text = box.value;

        // Unsubscribe from all the events
        box.onblur = box.onchange = box.oncut = box.onpaste = box.ondrop = box.keydown = null;

        // Close the box
        HtmlTextBox.closeTextBox();
    }

    _textArea_Change(e){
        const box = e.originalTarget;

        if(this.autoWidth){
            box.style.whiteSpace = "pre";
            box.style.width = "auto";

            let width = box.scrollWidth;

            if(this._maxWidth > 0) width = Math.min(this._maxWidth, width);

            box.style.width = width + "px";
            box.style.whiteSpace = "";

            this.layout.width = width;
        }

        if(this.autoHeight){
            box.style.height = "auto";

            let height = box.scrollHeight;

            if(this._maxHeight > 0) height = Math.min(this._maxHeight, width);

            box.style.height = height + "px";

            this.layout.height = height;
        }
    }

    _textArea_DelayedChange(e){
        setTimeout(() => this._textArea_Change(e), 0);
    }

    _dblClick(e){
        e.handled = true;
        this._inEditMode = true;
        const textarea = HtmlTextBox.makeTextBox(this.layout, this.text, this.font.family, this.font.size,
            this.font.alignment, this.font.bold, this.font.italic);

        textarea.onblur = (e) => this._textArea_Blur(e);
        textarea.onchange = (e) => this._textArea_Change(e);
        textarea.oncut = (e) => this._textArea_DelayedChange(e);
        textarea.onpaste = (e) => this._textArea_DelayedChange(e);
        textarea.ondrop = (e) => this._textArea_DelayedChange(e);
        textarea.onkeydown = (e) => this._textArea_DelayedChange(e);
    }

    _mouseDown(e){
        if(this._inEditMode){
            e.handled = true;
        }
    }

    _mouseMove(e){
        if(this._inEditMode){
            e.handled = true;
        }
    }

    // endregion

    /**
     * Gets the text properties based on the size it must fit in
     * @param {CanvasRenderingContext2D} context
     * @param {string} text - The text to be analyzed
     * @param {number|null} width - The width the text must fit in
     * @param {number|null} height - The height the text must fit in
     * @param {number} fontSize - The size of the font / height of a line of text
     * @returns {TextProperties|null}
     * @private
     */
    static _getTextProperties(context, text, width, height, fontSize){
        let calcWidth = 0;  // Holds what we calculated the width to be for a given line
        let calcHeight = 0; // Holds what we calculated the height to be
        let maxWidth = 0;   // Holds the maximum line width we find

        const outputText = []; // Holds the lines of text to be returned
        let tempLine = "";   // Holds the line being measured

        // Hold a dash and a [255] character
        const dash255 = "-" + String.fromCharCode(255);

        // Hold the regex to find either a [space] or [255] character, globally
        const space255reg = new RegExp("[ " + String.fromCharCode(255) + "]", "g");

        // Replace - with [255], and split by [space] and [space] and [255] to preserve -'s.
        // This makes us be able to keep words together, and break on the dashes.
        const lines = text.split("\n");

        // The current word we're on
        let wordStartIdx = 0;
        let lineIdx = 0;

        // Start with the first line as the words
        let words = lines[lineIdx].replace(/-/g, dash255).split(space255reg);

        // While we either don't have a height, or while the number of lines we have has not exceeded the height
        while(height === null || calcHeight < height) {

            calcWidth = 0; // Start width a width of zero
            tempLine = ""; // And no text in the line
            let wordEndIdx = wordStartIdx; // Adjust the end index so when we ++ it will be the word after the start

            // If no width restriction
            if(width === null){
                // Push all but the last line back
                for(let i = 0; i < lines.length - 1; ++i) outputText.push(lines[i]);

                // Use the last line as the line to be pushed later
                tempLine = lines[lines.length - 1];
                wordEndIdx = words.length;
                lineIdx = lines.length;
            }
            else{
                // While we haven't reached the end of the words
                while(wordEndIdx <= words.length) {

                    // Get the [startWord] to [endWord], and join them with spaces, then
                    // remove spaces after hyphens, since the hyphen is what we originally
                    // split on
                    const wordConcat = words.slice(wordStartIdx, ++wordEndIdx).join(" ").replace(/- /g, "-");

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
            calcHeight = fontSize + ((fontSize * WYSIWYG_FLH_RATIO) * (outputText.length - 1));

            // If we've gotten too tall, remove the last element we added, and stop processing
            if(height && calcHeight > height){
                outputText.pop();

                // Recalculate the height
                calcHeight = fontSize + ((fontSize * WYSIWYG_FLH_RATIO) * (outputText.length - 1));

                break;
            }
            // Otherwise, If we've reached the end
            else if(wordEndIdx >= words.length){
                // If there's another line, go to that, otherwise stop processing
                if(lineIdx < lines.length - 1){
                    ++lineIdx;
                    words = lines[lineIdx].replace(/-/g, dash255).split(space255reg);
                    wordStartIdx = wordEndIdx = 0;
                }
                else {
                    break;
                }
            }
        }

        // Ensure not a decimal; Go up so not too small
        calcHeight = Math.ceil(calcHeight);

        // Return what we got
        return {
            width: maxWidth,
            height: calcHeight,
            textLines: outputText
        };
    }
}