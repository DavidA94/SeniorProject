/**
 * Created by David on 11/25/16.
 */

/**
 * A wrapper for TextBlock to be used as a FormBuilder object
 */
class FBTextBlock extends FBObject {
    // region CTOR

    constructor(x, y, width, height, text){
        super(null);

        /**
         * @private
         * @type {TextBlock}
         */
        this._textBlock = new TextBlock(text);
        this.__addChild(this._textBlock);

        // Override the base-class layout to be the right one
        this._layout = this._textBlock.layout;

        this.__init(x, y, width, height);

        /**
         * Used to ignore a property change on the layout of `this` for when we change it on the textBlock
         * @type {boolean}
         * @private
         */
        this._ignoreLayoutChange = false;

        this.layout.subscribe(EVENT_PROPERTY_CHANGE, (e) => {
            // If we're editing or drawing, then do nothing
            if(HtmlTextBox.isOpen || this._ignoreLayoutChange) return;

            // If width or height was set, then make those no longer auto'd
            if(e.propertyName === "width"){
                this._textBlock.autoWidth = false;
            }
            if(e.propertyName === "height"){
                this._textBlock.autoHeight = false;
            }
        });
    }

    // endregion

    // region Public Properties

    /**
     * The text
     * @returns {string}
     */
    get text() { return this._textBlock.text; }

    /**
     * The text
     * @param {string} value
     */
    set text(value) { this._textBlock.text = value; this.__sendPropChangeEvent("text"); }

    /**
     * The font
     * @returns {Font}
     */
    get font() { return this._textBlock.font; }


    /**
     * The layout properties of the object
     * @return {Layout}
     */
    get layout() { return this._textBlock.layout; }

    /**
     * The maximum width when in auto mode
     * @return {number}
     */
    get maxWidth() { return this._textBlock.maxWidth; }

    /**
     * The maximum width when in auto mode
     * @param {number} value
     */
    set maxWidth(value) { this._textBlock.maxWidth = value; this.__sendPropChangeEvent("maxWidth"); }


    /**
     * The maximum height when in auto mode
     * @return {number}
     */
    get maxHeight() { return this._textBlock.maxHeight; }

    /**
     * The maximum height when in auto mode
     * @param {number} value
     */
    set maxHeight(value) { this._textBlock.maxHeight = value; this.__sendPropChangeEvent("maxHeight"); }

    // endregion

    // region Public Function

    /**
     * Cancels the current resize or move operation
     */
    cancelResize(){
        this._ignoreLayoutChange = true;
        super.cancelResize();
        this._ignoreLayoutChange = false;
    }

    toString() { return "FBTextBlock"; }

    getHtmlPropertyData(){
        const retVal = super.getHtmlPropertyData();

        retVal.text = this.__makePropertyData("Text", "Text", PropertyType.Text, "Text Block");
        retVal.font_family = this.__makePropertyData("Text", "Font Family", PropertyType.FontFamily, "Text Block");
        retVal.font_size = this.__makePropertyData("Text", "Font Size", PropertyType.ABS, "Text Block");
        retVal.font_color = this.__makePropertyData("Text", "Font Color", PropertyType.Color, "Text Block");
        retVal.font_color = this.__makePropertyData("Text", "Alignment", PropertyType.Alignment, "Text Block");
        retVal.font_bold = this.__makePropertyData("Text", "Bold", PropertyType.Checkbox, "Text Block");
        retVal.font_italic = this.__makePropertyData("Text", "Italic", PropertyType.Checkbox, "Text Block");
        retVal.maxHeight = this.__makePropertyData("Text", "Max Height", PropertyType.Number, "Text Block");
        retVal.maxWidth = this.__makePropertyData("Text", "Max Width", PropertyType.Number, "Text Block");

        return retVal;
    }

    getHtmlPropertyModelDict(){
        const retVal = super.getHtmlPropertyModelDict();
        retVal.text = this.__makeHtmlPropertyModel(this, "text");
        retVal.font_family = this.__makeHtmlPropertyModel(this.font, "family");
        retVal.font_size = this.__makeHtmlPropertyModel(this.font, "size");
        retVal.font_bold = this.__makeHtmlPropertyModel(this.font, "bold");
        retVal.font_italic = this.__makeHtmlPropertyModel(this.font, "italic");
        retVal.font_color = this.__makeHtmlPropertyModel(this.font, "color");
        retVal.font_color = this.__makeHtmlPropertyModel(this.font, "alignment");
        retVal.maxHeight = this.__makeHtmlPropertyModel(this, "maxHeight", parseInt,
            (value) => { if(!value) return "None"; else return value; });
        retVal.maxWidth = this.__makeHtmlPropertyModel(this, "maxWidth", parseInt,
            (value) => { if(!value) return "None"; else return value; });

        return retVal;
    }

    // endregion

    // region Private Methods

    _doDraw(context){
        this._textBlock.layout.x = this.x;
        this._textBlock.layout.y = this.y;

        this._ignoreLayoutChange = true;
        this._textBlock.draw(context);
        this._ignoreLayoutChange = false;
    }

    // endregion
}