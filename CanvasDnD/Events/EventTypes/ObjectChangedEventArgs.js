/**
 * Created by David on 11/02/16.
 */

class ObjectChangedEventArgs extends EventArgs {
    /**
     * Creates a new ObjectChangedEventArgs
     * @param {EventPropagator} originalTarget - The original target of the event
     * @param {FBObject} focusedObject - The object that was focused
     */
    constructor(originalTarget, focusedObject){
        super(originalTarget);

        this._focusedObject = focusedObject;
    }

    /**
     * The object that was focused
     * @returns {FBObject}
     */
    get focusedObject() { return this._focusedObject; }
}