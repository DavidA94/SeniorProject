/**
 * Created by David on 09/26/16.
 */

class Border {
    constructor(){
        this._color = "#000000";
        this._thickness = new TRBL();
    }

    get color() { return this._color; }
    set color(value) { this._color = value; }

    get top() { return this._thickness.top; }
    set top(value) { this._thickness.top = value; }

    get right() { return this._thickness.right; }
    set right(value) { this._thickness.right = value; }

    get bottom() { return this._thickness.bottom; }
    set bottom(value) { this._thickness.bottom = value; }

    get left() { return this._thickness.left; }
    set left(value) { this._thickness.left = value; }
}