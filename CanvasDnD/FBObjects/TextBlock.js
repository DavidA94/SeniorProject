/**
 * Created by David on 11/14/16.
 */

class TextBlock extends FBObject {
    /**
     * Creates a new TextBlock object
     * @param {number} x - The starting x value of the box
     * @param {number} y - The starting y value of the box
     * @param {number} width - The starting width of the box
     * @param {number} height - The starting height of the box
     * @param {string} text - The text for the TextBlock to start with
     */
    constructor(x, y, width, height, text = "Your Text Here"){
        super(x, y, width, height);

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

        /**
         * The start of the selection
         * @type {{line: number, pos: number, charPos: number}}
         * @private
         */
        this._selectionStart = {line: 0, pos: 0, charPos: 0};

        /**
         * The end of the selection
         * @type {{line: number, pos: number, charPos: number}}
         * @private
         */
        this._selectionEnd = {line: 0, pos: 0, charPos: 0};

        /**
         * The last spot the mouse was clicked, and an indicator if this needs to be used
         * @type {{x: number, y: number, new: boolean}}
         * @private
         */
        this._lastMouseClick = {x: 0, y: 0, new: false};

        /**
         * The last spot the mouse was moved -- used for selections
         * @type {{x: number, y: number}}
         * @private
         */
        this._lastMouseMove = {x: 0, y: 0};

        /**
         * Indicates if the text block is in edit mode
         * @type {boolean}
         * @private
         */
        this._inEditMode = false;

        // TODO: Use this
        this._bindings = [];

        this.subscribe(MouseEventType.DblClick, (e) => this._dblClick(e));
        this.subscribe(MouseEventType.MouseDown, (e) => this._mouseDown(e));
        this.subscribe(MouseEventType.MouseMove, (e) => this._mouseMove(e));
    }

    /**
     * Gets the minimum width the object can be, or null if there is no minimum width
     * @returns {number|null}
     */
    get minWidth() { return null; }

    /**
     * Gets the minimum height the object can be, or null if there is no minimum height
     * @returns {number|null}
     */
    get minHeight() { return null; }

    /**
     * The text
     * @returns {string}
     */
    get text() { return this._text; }

    /**
     * The text
     * @param {string} value
     */
    set text(value) { this._text = value; } //this.__sendPropChangeEvent("text"); }

    /**
     * The font
     * @returns {Font}
     */
    get font(){ return this._font; }

    toString() { return "TextBlock"; }

    /**
     * Draws the shape and its dependencies
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    _doDraw(context){

        // Get if bold/italic -- Italic must be first because that's how they designed it
        let fontProps = this.font.italic ? "italic" : "";
        fontProps += this.font.bold ? " bold" : "";
        fontProps = fontProps.trim(); // ensure there's no excess spaces from one not being set

        const fontSize = this.font.size;

        // Setup the context properties
        context.font = fontProps + " " + fontSize + "px " + this.font.fontFamily;
        context.fillStyle = this.font.color;
        context.textAlign = this.font.alignment;
        context.textBaseline = "top"; // Y value is where the top of the text will be

        // Get the properties of the text
        const textProps = TextBlock._getTextProperties(context, this.text, this.width, this.height, this.font.size);

        // e.g. If a font size of 20, then with FLH_RATIO=1.5 the line height will be 30.
        const lineHeight = (this.font.size * FLH_RATIO);
        const yShiftAmt = ((lineHeight - this.font.size) / 2);

        // Translate to that location so we can just draw at 0, Y
        context.translate(this.x + 2, this.y + yShiftAmt);

        // If we're in edit mode, don't draw the text, as the TextArea has it currently
        if(this._inEditMode){
            return;
        }

        // Draw each line
        for (let lineIdx = 0; lineIdx < textProps.textLines.length; ++lineIdx) {
            const line = textProps.textLines[lineIdx];
            const yPos = lineIdx * lineHeight;

            context.fillText(line, 0, yPos);
        }
    }

    _lostFocus(e){
        this._inEditMode = false;
        this._text = e.originalTarget.value;
        HtmlTextBox.closeTextBox();
    }

    _dblClick(e){
        e.handled = true;
        this._inEditMode = true;
        HtmlTextBox.makeTextBox(this, this.text, this.font.fontFamily,
            this.font.size, this.font.bold, this.font.italic, (e) => this._lostFocus(e));
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
        const words = text.replace(/-/g, dash255).split(space255reg);

        // The current word we're on
        let wordStartIdx = 0;

        // While we either don't have a height, or while the number of lines we have has not exceeded the height
        while(height === null || calcHeight < height) {

            calcWidth = 0; // Start width a width of zero
            tempLine = ""; // And no text in the line
            let wordEndIdx = wordStartIdx; // Adjust the end index so when we ++ it will be the word after the start

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
            calcHeight = fontSize + ((fontSize * FLH_RATIO) * (outputText.length - 1));

            // If we've gotten too tall, remove the last element we added, and stop processing
            if(height && calcHeight > height){
                outputText.pop();

                // Recalculate the height
                calcHeight = fontSize + ((fontSize * FLH_RATIO) * (outputText.length - 1));

                break;
            }
            // Otherwise, If we've reached the end, the stop processing
            else if(wordEndIdx == words.length){
                break;
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