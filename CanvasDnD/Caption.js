/**
 * Created by David on 09/26/16.
 */

/**
 * Represents valid locations for a caption
 * @enum {string}
 */
var CaptionLocation = {
    Top: "Top",
    Right: "Right",
    Bottom: "Bottom",
    Left: "Left",
    Center: "Center",
    None: "none"
};

/**
 * Holds data about a caption
 */
class Caption {
    // region Constructor

    /**
     * Creates a new caption object
     */
    constructor(){
        /**
         * @private
         * @type {string}
         */
        this._text = "";

        /**
         * @private
         * @type {CaptionLocation}
         */
        this._location = CaptionLocation.None;

        /**
         * @private
         * @type {Font}
         */
        this._font = new Font();

        /**
         * @private
         * @type {number|null}
         */
        this._reserve = null;
    }

    // endregion

    // region Public Properties

    /**
     * Gets the text of the caption
     * @returns {string}
     */
    get text() { return this._text; }

    /**
     * Sets the text of the caption
     * @param {string} value
     */
    set text(value) { this._text = value; }


    /**
     * Gets the location of the caption
     * @returns {CaptionLocation}
     */
    get location() { return this._location; }

    /**
     * Sets the location of the caption
     * @param {CaptionLocation} value
     */
    set location(value) { this._location = value; }


    /**
     * Gets the font properties of the caption
     * @returns {Font}
     */
    get font() { return this._font; }


    /**
     * Gets the caption's reserve amount
     * @returns {number|null}
     */
    get reserve() { return this._reserve }

    /**
     * Sets the caption's reserve amount
     * @param {number|null} value
     */
    set reserve(value) { this._reserve = value; }

    // endregion
}