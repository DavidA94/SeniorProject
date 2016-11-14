/**
 * Created by David on 11/07/16.
 */

class PropertyChangedEventArgs extends EventArgs {
    constructor(propertyName, originalTarget) {
        super(originalTarget);

        /**
         * @private
         * @type {string}
         */
        this._propertyName = propertyName;
    }

    /**
     * The name of the property that was changed
     * @returns {string}
     */
    get propertyName() { return this._propertyName; }
}
