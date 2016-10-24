/**
 * Created by dantonuc on 10/20/2016.
 */

/**
 * Used to keep track of what is focused at the Canvas layer
 */
class Keyboard {

    /**
     * The currently focused element
     * @returns {FBObject}
     */
    static get focusedElement() { return Keyboard._focusedEl; }

    /**
     * The currently focused element
     * @param {FBObject} el - The element which is to be given the focus
     */
    static set focusedElement(el){ Keyboard._focusedEl = el; }

}