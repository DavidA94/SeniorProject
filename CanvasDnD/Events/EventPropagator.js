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

            // If somebody is capturing mouse data, send it directly to them.
            if(EventPropagator.captureObj && EventPropagator.captureObj !== this){

                console.log("Redirecting " + eventType.event + " to " + EventPropagator.captureObj);

                // Update the initial target, then start propagation
                eventData.originalTarget = EventPropagator.captureObj;
                EventPropagator.captureObj._propagate(eventType, eventData);

                // If the event was the mouse being released, then stop capturing
                if(eventType.event === MouseEventType.MouseUp) {
                    console.log("Got MouseUp event from " + this.toString());
                    this.releaseCapture();
                }

                return;
            }
            // Only bother to look for children if we're not capturing. This prevents infinite recursion.
            else if(!EventPropagator.captureObj) {
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

                            var leaveEvent = new MouseEvent(MouseEventType.MouseLeave);
                            this.__lastMouseElement._propagate(leaveEvent, eventData);
                        }

                        // If we found a child, send the enter event to them, otherwise send it to ourself
                        var enterEvent = new MouseEvent(MouseEventType.MouseEnter);
                        if (childTarget) {

                            // Send the enter event to the new element
                            childTarget._propagate(enterEvent, eventData);

                        }
                        else {
                            this._propagate(enterEvent, eventData);
                        }

                        // Update the last mouse element
                        this.__lastMouseElement = childTarget;
                    }
                }
                else if (eventType.event == MouseEventType.MouseDown) {
                    this._focusedElement = (childTarget ? childTarget : null);
                }

            }
        }

        // Send the event to ourselves (as tunnel), then to the child, then to ourselves (as non-tunnel)

        // ----- Going DOWN

        // Start with outselves as tunnel
        this.__dispatchEvent(eventType.event, eventData, true);



        // If our capture didn't handle it...
        if(!eventData.handled) {

            // If there is a child
            if (childTarget){
                // Keep sending the data down
                childTarget._propagate(eventType, eventData);

                // FLIP POINT

                // If the child has a focused element, make the child be this level's focus
                if(childTarget._focusedElement) this._focusedElement = childTarget;
            }
            // Otherwise, it's time to flip the originalTarget, since we will be bubbling from this point on
            else if(eventData.originalTarget !== this){
                eventData.originalTarget = this;
            }

            // And if that child didn't handle it...
            if(!eventData.handled){

                // ----- Going UP

                // Then send it to ourselves again as non-capture
                this.__dispatchEvent(eventType.event, eventData, false);
            }
        }
    }

    /**
     * Causes all mouse events to be sent to this object until the mouse is released, or until
     * @see {@link releaseCapture} is called.
     */
    setCapture(){
        EventPropagator.captureObj = this;
        console.log("Mouse capture is bound to " + this.toString());
    }

    /**
     * Releases the mouse capture, if it's currently enabled.
     */
    releaseCapture(){
        console.log("Releasing capture");
        EventPropagator.captureObj = null;
    }
}