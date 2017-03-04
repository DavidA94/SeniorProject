/**
 * Created by David on 11/25/16.
 */

class FBTextBlockFields {
    static get textBlock() { return "textBlock"; }
}

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

        // If we were given good data, call init (bad data given from @see from_json)
        if(x) this.__init(x, y, width, height);

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

    toString() { return "Seciovni.APIs.WebHelpers.FormBuilder.FBObjects.FBTextBlock, Seciovni.APIs"; }

    /**
     * Gets the bindings for the given object
     * @return {Binding[]}
     */
    getBindings() {
        const bindings = this._textBlock.bindings;

        const retBindings = [];

        for(const id of Object.keys(bindings)){
            if(bindings[id] === null){
                const currentContext = this.parent.documentType == DOC_ONE_PER_INV ? BindingContext.Single :
                        BindingContext.Both;
                bindings[id] = new Binding(id, currentContext);
                bindings[id].options.addEvent('change', () => this._textBlock.processBindings());
            }

            retBindings.push(bindings[id]);
        }

        return retBindings;
    }

    getHtmlPropertyData(){
        const retVal = super.getHtmlPropertyData();

        retVal.text = ObjProp.makePropertyData("Text", "Text", PropertyType.Text, "Text Block");
        retVal.font_family = ObjProp.makePropertyData("Text", "Font Family", PropertyType.FontFamily, "Text Block");
        retVal.font_size = ObjProp.makePropertyData("Text", "Font Size", PropertyType.ABS, "Text Block");
        retVal.font_color = ObjProp.makePropertyData("Text", "Font Color", PropertyType.Color, "Text Block");
        retVal.font_color = ObjProp.makePropertyData("Text", "Alignment", PropertyType.Alignment, "Text Block");
        retVal.font_bold = ObjProp.makePropertyData("Text", "Bold", PropertyType.Checkbox, "Text Block");
        retVal.font_italic = ObjProp.makePropertyData("Text", "Italic", PropertyType.Checkbox, "Text Block");
        retVal.maxHeight = ObjProp.makePropertyData("Text", "Max Height", PropertyType.Number, "Text Block");
        retVal.maxWidth = ObjProp.makePropertyData("Text", "Max Width", PropertyType.Number, "Text Block");

        return retVal;
    }

    getHtmlPropertyModelDict(){
        const retVal = super.getHtmlPropertyModelDict();
        retVal.text = ObjProp.makeHtmlPropertyModel(this, "text");
        retVal.font_family = ObjProp.makeHtmlPropertyModel(this.font, "family");
        retVal.font_size = ObjProp.makeHtmlPropertyModel(this.font, "size", ptToPx, pxToPt);
        retVal.font_bold = ObjProp.makeHtmlPropertyModel(this.font, "bold");
        retVal.font_italic = ObjProp.makeHtmlPropertyModel(this.font, "italic");
        retVal.font_color = ObjProp.makeHtmlPropertyModel(this.font, "color");
        retVal.font_color = ObjProp.makeHtmlPropertyModel(this.font, "alignment");
        retVal.maxHeight = ObjProp.makeHtmlPropertyModel(this, "maxHeight", ptToPx,
            (value) => { if(!value) return "None"; else return pxToPt(value); });
        retVal.maxWidth = ObjProp.makeHtmlPropertyModel(this, "maxWidth", ptToPx,
            (value) => { if(!value) return "None"; else return pxToPt(value); });

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

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = this.__toJSON();
        properties[FBTextBlockFields.textBlock] = this._textBlock;
        return properties;
    }

    /**
     * Creates a new object from the provided JSON
     * @param {json} json - The JSON to use
     * @return {FBImage}
     */
    static from_json(json){
        const textBlock = new FBTextBlock(null, null, null, null);
        textBlock.__init_json(json);
        textBlock._textBlock.initialize_json(json[FBTextBlockFields.textBlock]);
        return textBlock;
    }

    // endregion
}