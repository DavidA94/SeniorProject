/**
 * Created by David on 10/10/16.
 */

class EventPropagator extends SubscribableProperty {

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
         * @private
         */
        this._children = [];

        /**
         * Holds the parent of this object, if it is a child
         * @type {EventPropagator}
         * @private
         */
        this._parent = null;

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
        let childTarget = null;
        if(eventData instanceof MouseEventArgs) {

            // If somebody is capturing mouse data, send it directly to them.
            if(EventPropagator.captureObj && EventPropagator.captureObj !== this){

                // Update the initial target, then start propagation
                eventData.originalTarget = EventPropagator.captureObj;
                EventPropagator.captureObj._propagate(eventType, eventData);

                // If the event was the mouse being released, then stop any capturing
                if(eventType.event === MouseEventType.MouseUp) {
                    this.releaseCapture();
                }

                return;
            }
            // Only bother to look for children if we're not capturing. This prevents infinite recursion.
            else if(!EventPropagator.captureObj) {
                // Find the child target
                for (let child of this._children) {
                    // If we can get the location of the shape, and it's in it, then remember it, and stop the loop
                    if (typeof child.isPointInObject === 'function' && child.isPointInObject(eventData.x, eventData.y)) {
                        childTarget = child;
                        break;
                    }
                }

                // If we have a move event
                if (eventType.event === MouseEventType.MouseMove) {
                    // Check if the last mouse element is different from the child we're over.
                    // If it is, then we need to send a leave (if not null) and enter event,
                    // Assuming we found a child

                    if (this.__lastMouseElement !== childTarget) {

                        // Send the leave event to the old element, if necessary
                        if (this.__lastMouseElement) {

                            const leaveEvent = new MouseEvent(MouseEventType.MouseLeave);
                            this.__lastMouseElement._propagate(leaveEvent, eventData);
                        }

                        // If we found a child, send the enter event to them, otherwise send it to ourself
                        const enterEvent = new MouseEvent(MouseEventType.MouseEnter);
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
                else if (eventType.event === MouseEventType.MouseDown) {
                    const kbEventData = new KeyboardEventArgs(eventData.originalTarget, null);

                    if(this._focusedElement && this._focusedElement !== childTarget){
                        this._focusedElement._propagate(new KeyboardEvent(KeyboardEventType.LostFocus), kbEventData)
                    }

                    this._focusedElement = (childTarget ? childTarget : null);
                    if(this._focusedElement) {
                        this._focusedElement._propagate(new KeyboardEvent(KeyboardEventType.GotFocus), kbEventData);
                    }
                }

            }
        }

        // Send the event to ourselves (as tunnel), then to the child, then to ourselves (as non-tunnel)

        // ----- Going DOWN

        // Start with ourselves as tunnel
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
            // Otherwise, if there's a focused element (for keyboard stuff)
            else if(this._focusedElement && eventData instanceof KeyboardEventArgs){
                this._focusedElement._propagate(eventType, eventData);
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
    }

    /**
     * Releases the mouse capture, if it's currently enabled.
     */
    releaseCapture(){
        EventPropagator.captureObj = null;
    }

    /**
     * Adds a child
     * @param {EventPropagator} child
     * @param {boolean} addToBack - Indicates if the child should be added to the opposite side
     * @param {number} pos - The position from the back to add at (e.g. 1 will put it as element 1
     * @protected
     */
    __addChild(child, addToBack = false, pos = -1){
        if(child.parent  && child.parent !== this){
            throw Error(child.toString() + " is already a child of " + child.parent.toString())
        }

        if(child.parent !== this){
            child._parent = this;
            if(addToBack){
                if(pos > 0) {
                    this._children.splice(pos, 0, child);
                }
                else {
                    this._children.unshift(child);
                }
            }
            else {
                this._children.push(child)
            }
        }
    }

    /**
     * Removes a child
     * @param {EventPropagator} child
     * @protected
     */
    __removeChild(child){
        const idx = this._children.indexOf(child);
        if(idx < 0){
            throw Error("Child must be added before it can be removed");
        }

        // Otherwise, remove it from the array
        this._children.splice(idx, 1);
    }

    /**
     * The parent of this element
     * @returns {EventPropagator}
     */
    get parent() { return this._parent; }

    /**
     * The children of this element
     * @returns {EventPropagator[]}
     */
    get children() { return this._children; }

    /**
     * Checks if the current element is focused
     * @return {boolean}
     */
    get isFocused() {

        if(this.parent) return this.parent._focusedElement === this && this.parent.isFocused;
        else return (this === Keyboard.focusedElement || this instanceof Canvas);
    }

    /**
     * Gets the focused element for this object
     * @return {EventPropagator|*}
     * @protected
     */
    get __focusedChild(){ return this._focusedElement; }
}