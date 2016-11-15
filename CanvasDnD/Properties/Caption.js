/**
 * Created by David on 09/26/16.
 */

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
         * @type {string}
         */
        this._text = "";

        /**
         * @private
         * @type {Location}
         */
        this._location = Location.None;

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
    set text(value) { this._text = value; this.__sendPropChangeEvent("text"); }


    /**
     * Gets the location of the caption
     * @returns {Location}
     */
    get location() { return this._location; }

    /**
     * Sets the location of the caption
     * @param {Location} value
     */
    set location(value) { this._location = value; this.__sendPropChangeEvent("location"); }


    /**
     * Gets the font properties of the caption
     * @returns {Font}
     */
    get font() { return this._font; }


    /**
     * Gets the caption's reserve amount
     * @returns {number}
     */
    get reserve() { return this._reserve }

    /**
     * Sets the caption's reserve amount
     * @param {number} value
     */
    set reserve(value) { this._reserve = value; this.__sendPropChangeEvent("reserve"); }

    // endregion
}