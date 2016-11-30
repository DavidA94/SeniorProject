/**
 * Created by David on 09/26/16.
 */

/**
 * Represents the base appearance of an object
 */
class Appearance extends SubscribableProperty {
    // region Constructor

    constructor(){
        super();

        /**
         * The color of the background
         * @type {string|null}
         * @private
         */
        this._background = null;

        /**
         * The color of the foreground
         * @type {string}
         * @private
         */
        this._foreground = "#000000";

        /**
         * The color of the stroke
         * @type {string}
         * @private
         */
        this._strokeColor = "#000000";

        /**
         * The thickness of the stroke
         * @type {number}
         * @private
         */
        this._strokeThickness = 0.00000001;

        this.__addEvent(EVENT_PROPERTY_CHANGE);
    }

    // endregion

    // region Public Properties

    /**
     * The background color
     * @returns {string|null}
     */
    get background() { return this._background; }

    /**
     * The background color
     * @param {string|null} value
     */
    set background(value) { this._background = value; this.__sendPropChangeEvent("background"); }


    /**
     * The foreground color
     * @returns {string}
     */
    get foreground() { return this._foreground; }

    /**
     * The foreground color
     * @param {string} value
     */
    set foreground(value) { this._foreground = value; this.__sendPropChangeEvent("foreground"); }


    /**
     * The stroke color
     * @returns {string}
     */
    get strokeColor() { return this._strokeColor; }

    /**
     * The stroke color
     * @param {string} value
     */
    set strokeColor(value) { this._strokeColor = value; this.__sendPropChangeEvent("strokeColor"); }


    /**
     * The thickness of the stroke
     * @returns {number}
     */
    get strokeThickness() { return this._strokeThickness; }

    /**
     * The thickness of the stroke
     * @param {number} value
     */
    set strokeThickness(value) {
        // These values are ignored, so make it a really small value so it'll never be seen.
        if(value === 0 || value === Infinity){
            value = 0.00000001;
        }
        this._strokeThickness = value;

        this.__sendPropChangeEvent("strokeThickness");
    }

    // endregion


}