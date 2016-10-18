/**
 * Created by David on 10/10/16.
 */

class BasicShape extends FBObject {
    constructor(shape) {

        if (!(shape instanceof Shape)) {
            throw TypeError("shape parameter must be an instance of Shape");
        }

        super();
        super.setLayout(shape.layout);

        /**
         * @private
         * @type {Shape}
         */
        this._shape = shape;
        this.__children.push(this._shape);

        this.caption.text = "Well, wha-da-ya know? It's a BOX!";
        this.caption.font.fontFamily = FontFamilies.Tahoma;
        this.caption.font.fontSize = 16;
        this.caption.font.color = "blue";
        this.caption.font.bold = true;
        this.caption.font.italic = true;
        this.caption.location = CaptionLocation.Right;
        this.caption.reserve = 100;

        this.border.color = "green";
        this.border.right = 7;
        this.border.bottom = 7;
        this.border.left = 7;
        this.border.top = 7;

        super._layout = this._layout
    }

    /**
     * Draws the shape and its dependencies
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    _doDraw(context){
        this._shape.draw(context);
    }

    toString() { return "BasicShape"; }

    get minWidth() { return this._shape.minWidth; }
    get minHeight() { return this._shape.minHeight; }
}