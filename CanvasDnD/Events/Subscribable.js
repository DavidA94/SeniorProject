/**
 * Created by David on 10/04/16.
 */

/**
 * @callback EventHandler
 * @param {*} - The event data
 */

/**
 * Creates a class which allows for Javascript-like event subscription
 */
class Subscribable {

    // region Constructor

    /**
     * Creates a new Subscribable class
     */
    constructor(){
        /**
         * @private
         * @type {Object<string, Object<boolean, EventHandler[]>>}
         */
        this._subscribers = {};
        this.__addEvent(MouseEventType.MouseDown);
        this.__addEvent(MouseEventType.MouseEnter);
        this.__addEvent(MouseEventType.MouseLeave);
        this.__addEvent(MouseEventType.MouseMove);
        this.__addEvent(MouseEventType.MouseUp);
    }

    // endregion

    // region Protected Functions

    /**
     * Adds an event that can be subscribed to
     * @param {string} eventName - The name of the subscribable event
     * @protected
     */
    __addEvent(eventName) {
        if(!this._subscribers[eventName]) {
            this._subscribers[eventName] = {
                true: [],
                false: []
            };
        }
    }

    /**
     * Dispatches an event
     * @param {string} eventName - The name of the event to dispatch
     * @param {*} eventData - The data to send with the event
     * @param {boolean} isCapture - Indicates if the capture event is to be dispatched
     * @protected
     */
    __dispatchEvent(eventName, eventData, isCapture = false){
        if(this._subscribers[eventName] && this._subscribers[eventName][isCapture]){
            for(var func of this._subscribers[eventName][isCapture]){
                // setTimeout = run in new thread
                // Really weird syntax so things are kept in scope correctly
                // -- func is passed into an anonymous method, which then calls that function with the event data
                ((f) => setTimeout(() => f(eventData), 0))(func);
            }
        }
    }

    // endregion

    // region Public Functions

    /**
     * Subscribes to a given event, if it exists
     * @param {string} eventName - The name of the vent to subscribe to
     * @param {EventHandler} func - The callback function to be called
     * @param {boolean} useCapture - Indicates if the callback should be called on capture
     * @throws {string} Thrown if the eventName does not exist
     */
    subscribe(eventName, func, useCapture = false){
        // If the event exists, add the method, otherwise, throw an exception
        if(this._subscribers[eventName]){
            this._subscribers[eventName][useCapture].push(func);
        }
        else{
            throw eventName + " is not a valid event";
        }
    }

    /**
     * Unsubscribes the given EventHandler from the given event
     * @param {string} eventName - The name of the event to unsubscribe from
     * @param {EventHandler} func - The EventHandler to remove from the event subscribers
     */
    unsubscribe(eventName, func){
        if(this._subscribers[eventName]){
            this._subscribers[eventName].splice(this._subscribers.indexOf(func));
        }
    }

    // endregion
}