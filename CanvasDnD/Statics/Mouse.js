/**
 * Created by David on 10/13/16.
 */

/**
 * Static class that can do things with the mouse on a "global" scale
 * Must call initialize first
 */
class Mouse {
    /**
     * Initializes the Mouse class
     * @param {HTMLElement} htmlElementWindow - The element that should have the mouse properties changed
     */
    static initialize(htmlElementWindow){
        /**
         * @private
         */
        Mouse._htmlElementWindow = htmlElementWindow;

        Mouse._cursorStack = [];
    }

    /**
     * Sets the current mouse cursor
     * @param {Cursor} mouseCursor - The cursor to be set
     * @param {boolean} doNotDuplicate - Indicates that the cursor should not be set if it is already what is needed
     */
    static setCursor(mouseCursor, doNotDuplicate = false){

        if(doNotDuplicate && Mouse._cursorStack[Mouse._cursorStack.length - 1] == mouseCursor) return;

        if(Mouse._htmlElementWindow.style.cursor && Mouse._htmlElementWindow.style.cursor != ""){
            Mouse._cursorStack.push(Mouse._htmlElementWindow.style.cursor);
        }

        if(Mouse._htmlElementWindow){
            Mouse._htmlElementWindow.style.cursor = mouseCursor;
        }
    }

    static restoreCursor(){
        if(Mouse._cursorStack.length > 0){
            Mouse._htmlElementWindow.style.cursor = Mouse._cursorStack.pop();
        }
        else{
            Mouse._htmlElementWindow.style.cursor = Cursor.Default;
        }
    }
}