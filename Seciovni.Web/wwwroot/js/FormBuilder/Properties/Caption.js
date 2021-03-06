/**
 * Created by David on 09/26/16.
 */

class CaptionFields {
    static get location() { return "location"; }
    static get reserve() { return "reserve"; }
    static get textBlock() { return "textBlock"; }
}

/**
 * Holds data about a caption
 */
class Caption extends SubscribableProperty {
    // region Constructor

    /**
     * Creates a new caption object
     */
    constructor(){
        super();

        /**
         * @private
         * @type {Location}
         */
        this._location = Location.None;

        /**
         * @private
         * @type {number}
         */
        this._reserve = WYSIWYG_CAPTION_AUTO;

        /**
         * @private
         * @type {TextBlock}
         */
        this._textBlock = new TextBlock("");

        /**
         * Indicates if we need to ensure the TextBlock is in the right location
         * @type {boolean}
         * @private
         */
        this._needToRecalc = true;

        /**
         * The last layout that was given to draw with. Used to know if we need to recalculate
         * @type {Layout}
         * @private
         */
        this._lastDrawLayout = new Layout();

        /**
         * The last border that was given to draw with. Used to know if we need to recalculate
         * @type {Border}
         * @private
         */
        this._lastDrawBorder = new Border();

        this._textBlock.font.subscribe(EVENT_PROPERTY_CHANGE, (e) => this._needToRecalc = true);
    }

    // endregion

    // region Public Properties

    /**
     * Gets the text of the caption
     * @returns {string}
     */
    get text() { return this._textBlock.text; }

    /**
     * Sets the text of the caption
     * @param {string} value
     */
    set text(value) { this._textBlock.text = value; this._needToRecalc = true; this.__sendPropChangeEvent("text"); }


    /**
     * Gets the location of the caption
     * @returns {Location}
     */
    get location() { return this._location; }

    /**
     * Sets the location of the caption
     * @param {Location} value
     */
    set location(value) {
        this._location = value;

        // Set the reserve to zero if we're not on one of the sides
        if(value === Location.Center || value === Location.None) this.reserve = 0;

        this._needToRecalc = true;
        this.__sendPropChangeEvent("location");
    }


    /**
     * Gets the font properties of the caption
     * @returns {Font}
     */
    get font() { return this._textBlock.font; }


    /**
     * Gets the caption's reserve amount
     * @returns {number}
     */
    get reserve() { return this._reserve }

    /**
     * Sets the caption's reserve amount
     * @param {number} value
     */
    set reserve(value) { this._reserve = value; this._needToRecalc = true; this.__sendPropChangeEvent("reserve"); }

    /**
     * The height of the caption
     * @returns {number}
     */
    get height() { return this._textBlock.layout.height; }

    /**
     * The width of the caption
     * @returns {number}
     */
    get width() { return this._textBlock.layout.width; }

    // endregion

    // region Public Methods

    /**
     * Draws the caption
     * @param {CanvasRenderingContext2D} context
     * @param {Layout} layout - The layout of the object that has the caption
     * @param {Border} border - The border of the object that has the caption
     */
    draw(context, layout, border){

        // If there's nothing to draw, stop here.
        if(this.location === Location.None || this.text === "") return;

        if(!layout.equals(this._lastDrawLayout) || border !== this._lastDrawBorder){
            this._needToRecalc = true;
            this._lastDrawBorder = border.clone();
            this._lastDrawLayout = layout.clone();
        }

        if(this._needToRecalc){
            // Set the width and height

            // Remove the auto-sizing on both side
            this._textBlock._autoWidth = this._textBlock._autoHeight = false;

            // And if we're to auto-size
            if(this.reserve === WYSIWYG_CAPTION_AUTO){
                // Then set the correct side to auto
                if(this.location & WYSIWYG_CAPTION_TOP_BOTTOM) this._textBlock._autoHeight = true;
                else if(this.location & WYSIWYG_CAPTION_LEFT_RIGHT) this._textBlock._autoWidth = true;
            }
            else{
                if(this.location & WYSIWYG_CAPTION_TOP_BOTTOM) this._textBlock.layout.height = this.reserve;
                else if(this.location & WYSIWYG_CAPTION_LEFT_RIGHT) this._textBlock.layout.width = this.reserve;
            }

            // Get the size of the caption
            const captionData = this._textBlock.getTextProperties(context);

            this._textBlock.layout.x = layout.x;
            this._textBlock.layout.y = layout.y;
            this._textBlock.layout.width = layout.width;
            this._textBlock.layout.height = layout.height;


            if(this.location === Location.Top){
                this._textBlock.layout.y = layout.y - border.top - captionData.height - WYSIWYG_CAPTION_PADDING;
            }
            else if(this.location === Location.Right){
                this._textBlock.layout.x = layout.x + layout.width + border.right + WYSIWYG_CAPTION_PADDING;
            }
            else if(this.location === Location.Bottom){
                this._textBlock.layout.y = layout.y + layout.height + border.bottom + WYSIWYG_CAPTION_PADDING;
            }
            else if(this.location === Location.Left){
                this._textBlock.layout.x = layout.x - border.left - captionData.width - WYSIWYG_CAPTION_PADDING;
            }

            if(this.location & WYSIWYG_CAPTION_LEFT_RIGHT){
                this._textBlock.verticallyCenter = true;
            }

            this._needToRecalc = false;
        }

        this._textBlock.draw(context);
    }

    // endregion

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = {};
        properties[CaptionFields.location] = this.location;
        properties[CaptionFields.reserve] = this.reserve;
        properties[CaptionFields.textBlock] = this._textBlock;

        return properties;
    }

    /**
     * Initializes the object from the provided JSON
     * @param {JSON} json - The JSON to use
     */
    initialize_json(json){
        this.location = json[CaptionFields.location];
        this.reserve = json[CaptionFields.reserve];
        this._textBlock.initialize_json(json[CaptionFields.textBlock]);
    }

    // endregion
}