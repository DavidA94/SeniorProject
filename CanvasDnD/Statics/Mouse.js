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
    initialize(htmlElementWindow){
        /**
         * @private
         */
        Mouse._htmlElementWindow = htmlElementWindow;
    }

    /**
     * Sets the current mouse cursor
     * @param {Cursor} mouseCursor - The cursor to be set
     */
    setCursor(mouseCursor){
        if(Mouse._htmlElementWindow){
            Mouse._htmlElementWindow.style.cursor = mouseCursor;
        }
    }
}