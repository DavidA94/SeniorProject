/**
 * Created by David on 09/26/16.
 */

class Border {
    constructor(){
        this._color = "#000000";
        this._thickness = 1;
        this._top = false;
        this._right = false;
        this._bottom = false;
        this._left = false;
    }

    get color() { return this._color; }
    set color(value) { this._color = value; }

    get thickness() { return this._thickness; }
    set thickness(value) { this._thickness = value; }

    get top() { return this._top; }
    set top(value) { this._top = value; }

    get right() { return this._right; }
    set right(value) { this._right = value; }

    get bottom() { return this._bottom; }
    set bottom(value) { this._bottom = value; }

    get left() { return this._left; }
    set left(value) { this._left = value; }
}