/**
 * Created by David on 11/07/16.
 */

class SubscribableProperty extends Subscribable {
    constructor() {
        super();
        this.__addEvent(EVENT_PROPERTY_CHANGE);
    }

    /**
     * Dispatches the EVENT_PROPERTY_CHANGE event
     * @param {string} propertyName - The name of the property being updated
     * @protected
     */
    __sendPropChangeEvent(propertyName){
        this.__dispatchEvent(EVENT_PROPERTY_CHANGE, new PropertyChangedEventArgs(propertyName, this));
    }
}