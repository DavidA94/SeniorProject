/**
 * Created by David on 11/15/16.
 */

class ScaleChangeEventArgs extends EventArgs {
    /**
     * Creates a new ScaleChangeEventArgs
     * @param {Subscribable} originalTarget - The original target of the event
     * @param {number} scale - The new scale
     * @param {number} oldScale - The old scale
     */
    constructor(originalTarget, scale, oldScale){
        super(originalTarget);

        this._scale = scale;

        this._oldScale = oldScale;
    }

    /**
     * The new scale
     * @returns {number}
     */
    get scale() { return this._scale; }

    /**
     * The old scale
     * @returns {number}
     */
    get oldScale() { return this._oldScale; }
}