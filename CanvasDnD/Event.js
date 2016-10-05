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
class Event {

    // region Constructor

    /**
     * Creates a new Event class
     */
    constructor(){
        /**
         * @private
         * @type {Object<string, EventHandler[]>}
         */
        this._subscribers = {};
    }

    // endregion

    // region Protected Functions

    /**
     * Adds an event that can be subscribed to
     * @param {string} eventName - The name of the subscribable event
     * @protected
     */
    __addEvent(eventName) {
        this._subscribers[eventName] = [];
    }

    /**
     * Dispatches an event
     * @param {string} eventName - The name of the event to dispatch
     * @param {*} eventData - The data to send with the event
     * @protected
     */
    __dispatchEvent(eventName, eventData){
        if(this._subscribers[eventName]){
            for(var func of this._subscribers[eventName]){
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
     * @throws {string} Thrown if the eventName does not exist
     */
    subscribe(eventName, func){
        // If the event exists, add the method, otherwise, throw an exception
        if(this._subscribers[eventName]){
            this._subscribers[eventName].push(func);
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