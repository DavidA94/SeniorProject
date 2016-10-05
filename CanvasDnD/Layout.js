/**
 * Created by David on 09/26/16.
 */

// import "TRBL";

class Layout {
    constructor(){
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._margin = new TRBL();
        this._padding = new TRBL();
    }

    get x() { return this._x; }
    set x(value) { this._x = value; }

    get y() { return this._y; }
    set y(value) { this._y = value; }

    get width() { return this._width; }
    set width(value) { this._width = value; }

    get height() { return this._height; }
    set height(value) { this._height = value; }

    get margin() { return this._margin; }
    set margin(value) { this._margin = value; }

    get padding() { return this._padding; }
    set padding(value) { this._padding = value; }

    clone(){
        var newLayout = new Layout();
        newLayout._x = this._x;
        newLayout._y = this._y;
        newLayout.width = this.width;
        newLayout.height = this.height;
        newLayout.margin = this.margin.clone();
        newLayout.padding = this.padding.clone();

        return newLayout;
    }
}