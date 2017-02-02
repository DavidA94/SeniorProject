/**
 * Created by David on 11/14/16.
 */

/**
 * Holds informatino about a keyboard event
 */
class KeyboardEventArgs extends EventArgs {
    /**
     * Creates a new KeyboardEventArgs
     * @param {Subscribable} originalTarget - The object that is sending the event
     * @param {number|null} key - The key that was pressed
     */
    constructor(originalTarget, key){
        super(originalTarget);

        this._key = key;
    }

    get key() { return this._key; }
}