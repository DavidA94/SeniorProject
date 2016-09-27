/**
 * Created by David on 09/26/16.
 */

class TRBL {
    constructor(){
        this._top = 0;
        this._right = 0;
        this._bottom = 0;
        this._left = 0;
    }

    get top() { return this._top; }
    set top(value) { this._top = value; }

    get right() { return this._right; }
    set right(value) { this._right = value; }

    get bottom() { return this._bottom; }
    set bottom(value) { this._bottom = value; }

    get left() { return this._left; }
    set left(value) { this._left = value; }
}
