/**
 * Created by David on 10/10/16.
 */

class BasicShape extends FBObject {
    constructor(shape) {

        if (!(shape instanceof Shape)) {
            throw TypeError("shape parameter must be an instance of Shape");
        }

        super(null);

        /**
         * @private
         * @type {Shape}
         */
        this._shape = shape;
        this.__addChild(this._shape);

        this.__init(shape.layout.x, shape.layout.y, shape.layout.width, shape.layout.height)
    }

    /**
     * Draws the shape and its dependencies
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    _doDraw(context){
        // The shape layout is used to draw itself, but the one that everyone else is drawing on
        // is kept in `this`. This is a side-effect of the composition. Since we only want the
        // shape to draw itself, and the margin and padding are taken care of in `this`, only
        // pass in x, y, width, height, or weird things will happen
        // if(this._shape.layout.x !== this.layout.x) this._shape.layout.x = this.layout.x;
        // if(this._shape.layout.y !== this.layout.y) this._shape.layout.y = this.layout.y;
        // if(this._shape.layout.width !== this.layout.width) this._shape.layout.width = this.layout.width;
        // if(this._shape.layout.height !== this.layout.height) this._shape.layout.height = this.layout.height;
        this._shape.draw(context);
    }

    toString() { return "BasicShape"; }

    get minWidth() { return this._shape.minWidth; }
    get minHeight() { return this._shape.minHeight; }

    get layout() { return this._shape.layout; }

    get appearance() { return this._shape.appearance; }
}