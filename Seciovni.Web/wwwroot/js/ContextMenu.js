/**
 * Created by David on 2017-02-19.
 */

class ContextMenu {
    constructor(){
        this._menu = document.createElement("ul");
        this._menu.id = CONTEXT_MENU_ID;

        this._menu.style.position = "absolute";
        this._menu.style.top = "-999px";
        this._menu.style.left = "-999px";

        document.documentElement.appendChild(this._menu);
    }

    /**
     * Add an item to the context menu
     * @param {HTMLLIElement} menuItem - The menu item to be added
     */
    addItem(menuItem){
        this._menu.appendChild(menuItem);
    }

    /**
     * Removes an element from the context menu
     * @param {HTMLLIElement} menuItem - The menu item to be removed
     */
    removeItem(menuItem){
        this._menu.removeChild(menuItem);
    }

    /**
     * Shows the context menu at the given coordinate using absolute positioning
     * @param {number} x - The x position on the page
     * @param {number} y - The y position on the page
     */
    show(x, y){
        this._menu.style.top = y + "px";
        this._menu.style.left = x + "px";
    }

    /**
     * Hides the context menu
     */
    hide(){
        this._menu.style.top = "-999px";
        this._menu.style.tleft = "-999px";
    }
}