/**
 * Created by David on 09/24/16.
 */

/**
 * Represents the different aspects text can take
 */
class Font extends SubscribableProperty {
    // region Constructor

    /**
     * Creates a new Font class
     */
    constructor(){
        super();

        /**
         * @private
         * @type {Alignment}
         */
        this._alignment = Alignment.Left;

        /**
         * @private
         * @type {boolean}
         */
        this._bold = false;

        /**
         * @private
         * @type {string}
         */
        this._color = "#000000";

        /**
         * @private
         * @type {FontFamilies}
         */
        this._family = FontFamilies.Arial;

        /**
         * @private
         * @type {number}
         */
        this._font = 12;

        /**
         * @private
         * @type {boolean}
         */
        this._italic = false;

        /**
         * @private
         * @type {boolean}
         */
        this._underline = false;
    }

    // endregion

    // region Public Properties

    /**
     * Gets the current alignment
     * @returns {Alignment}
     */
    get alignment() { return this._alignment; }

    /**
     * Sets the current alignment
     * @param {Alignment} value
     */
    set alignment(value) { this._alignment = value; this.__sendPropChangeEvent("alignment"); }


    /**
     * Indicates if the font is bold
     * @returns {boolean}
     */
    get bold() { return this._bold; }

    /**
     * Sets if the font is bold
     * @param {boolean} value
     */
    set bold(value) { this._bold = value; this.__sendPropChangeEvent("bold"); }


    /**
     * Gets the color of this font
     * @returns {string}
     */
    get color() { return this._color; }

    /**
     * Sets the color of this font
     * @param {string} value
     */
    set color(value) { this._color = value; this.__sendPropChangeEvent("color"); }


    /**
     * Gets the font family
     * @returns {FontFamilies}
     */
    get family() { return this._family; }

    /**
     * Set the font family
     * @param {FontFamilies} value
     */
    set family(value) { this._family = value; this.__sendPropChangeEvent("family"); }


    /**
     * Gets the size of the font
     * @returns {number}
     */
    get size() { return this._font; }

    /**
     * Sets the size of the font
     * @param {number} value
     */
    set size(value) { this._font = value; this.__sendPropChangeEvent("size"); }


    /**
     * Gets if the font is italic
     * @returns {boolean}
     */
    get italic() { return this._italic; }

    /**
     * Sets if the font is italic
     * @param {boolean} value
     */
    set italic(value) { this._italic = value; this.__sendPropChangeEvent("italic"); }


    // Uncomment if underline is ever supported
    // /**
    //  * Gets if the font is underlined
    //  * @returns {boolean}
    //  */
    // get underline() { return this._underline; }
    //
    // /**
    //  * Sets if the font is underlined
    //  * @param {boolean} value
    //  */
    // set underline(value) { this._underline = value; }

    // endregion
}