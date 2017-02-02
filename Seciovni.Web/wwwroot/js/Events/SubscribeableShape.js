/**
 * Created by David on 01/31/17.
 */

/**
 * Creates a class which allows for Javascript-like event subscription
 */
class SubscribableShape extends Subscribable{

    // region Constructor

    /**
     * Creates a new Subscribable class
     */
    constructor(){
        this.__addEvent(MouseEventType.DblClick);
        this.__addEvent(MouseEventType.MouseDown);
        this.__addEvent(MouseEventType.MouseEnter);
        this.__addEvent(MouseEventType.MouseLeave);
        this.__addEvent(MouseEventType.MouseMove);
        this.__addEvent(MouseEventType.MouseUp);
        this.__addEvent(KeyboardEventType.GotFocus);
        this.__addEvent(KeyboardEventType.LostFocus);
        this.__addEvent(KeyboardEventType.KeyDown);
        this.__addEvent(KeyboardEventType.KeyUp);
    }

    // endregion
}