/**
 * Created by David on 10/10/16.
 */

/**
 * Base class for Shapes to allow them to be passed into the BasicShape CTOR
 */
class Shape extends EventPropagator {

    constructor(x, y, width, height){
        super();

        /**
         * Holds the appearance properties for the object
         * @type {Appearance}
         * @private
         */
        this._appearance = new Appearance();

        /**
         * Holds the layout properties for the object
         * @type {Layout}
         * @private
         */
        this._layout = new Layout();
        this._layout.x = x;
        this._layout.y = y;
        this._layout.width = width;
        this._layout.height = height;
    }

    get appearance() { return this._appearance; }
    get layout() { return this._layout; }

    toString() { return "Shape"; }

    /**
     * Draws the shape
     * @abstract
     * @param {CanvasRenderingContext2D} context
     */
    draw(context){
        throw Error("draw function not implemented");
    }

    /**
     * Indicates if the point is within the shape
     * @abstract
     * @param {number} x - The x position
     * @param {number} y - The y position
     */
    isPointInShape(x, y){
        throw Error("isPointInShape function not implemented");
    }
}