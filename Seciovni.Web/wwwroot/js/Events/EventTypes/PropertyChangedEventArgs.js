/**
 * Created by David on 11/07/16.
 */

class PropertyChangedEventArgs extends EventArgs {
    constructor(propertyName, originalTarget, originalValue = null) {
        super(originalTarget);

        /**
         * @private
         * @type {string}
         */
        this._propertyName = propertyName;

        this._originalValue = originalValue;
    }

    /**
     * The name of the property that was changed
     * @returns {string}
     */
    get propertyName() { return this._propertyName; }

    /**
     * The original value
     * @return {*}
     */
    get originalValue() { return this._originalValue; }
}
