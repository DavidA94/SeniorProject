/**
 * Created by David on 10/10/16.
 */

class EventPropagator extends Subscribable {

    constructor(){
        super();

        /**
         * Used for the last mouse element to know if the element has been changed
         * @type {EventPropagator}
         * @protected
         */
        this.__lastMouseElement = null;

        /**
         * The children in this object
         * @type {EventPropagator[]}
         * @protected
         */
        this.__children = [];

        /**
         * Keeps track of which element is focused for keyboard events
         * @type {EventPropagator|null}
         * @private
         */
        this._focusedElement = null;
    }

    /**
     * Sends and event down the chain
     * Note, data should be adjusted so scale is not needed
     * @param {BaseEventType} eventType - The name of the event to propagate
     * @param {EventArgs} eventData - The event data
     * @abstract
     * @protected
     */
    _propagate(eventType, eventData){

        // If a mouse event, figure out if the data is over any child
        var childTarget = null;
        if(eventData instanceof MouseEventArgs) {
            // Find the child target
            for (var child of this.__children) {
                // If we can get the location of the shape, and it's in it, then remember it, and stop the loop
                if (typeof child.isPointInObject === 'function' && child.isPointInObject(eventData.x, eventData.y)) {
                    childTarget = child;
                    break;
                }
            }

            // If we have a move event
            if (eventType.event == MouseEventType.MouseMove) {
                // Check if the last mouse element is different from the child we're over.
                // If it is, then we need to send a leave (if not null) and enter event,
                // Assuming we found a child

                if (this.__lastMouseElement != childTarget) {

                    // Send the leave event to the old element, if necessary
                    if (this.__lastMouseElement) {

                        console.log("Sending MouseLeave to " + this.__lastMouseElement.toString());

                        var leaveEvent = new MouseEvent(MouseEventType.MouseLeave);
                        this.__lastMouseElement._propagate(leaveEvent, eventData);
                    }

                    if(childTarget) {

                        // Send the enter event to the new element
                        var enterEvent = new MouseEvent(MouseEventType.MouseEnter);
                        childTarget._propagate(enterEvent, eventData);

                    }

                    // Update the last mouse element
                    this.__lastMouseElement = childTarget;
                }
            }
            else if (eventType.event == MouseEventType.MouseDown) {
                this._focusedElement = (childTarget ? childTarget : null);
            }
        }

        // Send the event to ourselves (as tunnel), then to the child, then to ourselves (as non-tunnel)

        // Start with outselves as tunnel
        this.__dispatchEvent(eventType.event, eventData, true);



        // If our capture didn't handle it...
        if(!eventData.handled) {

            // If there is a child
            if (childTarget){
                // Keep sending the data down
                childTarget._propagate(eventType, eventData);
            }
            // Otherwise, it's time to flip the sender, since we will be bubbling from this point on
            else{
                eventData.sender = this;
            }

            // And if that child didn't handle it...
            if(!eventData.handled){
                // Then send it to ourselves again as non-capture
                this.__dispatchEvent(eventType.event, eventData, false);
            }
        }
    }
}