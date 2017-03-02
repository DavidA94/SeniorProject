/**
 * Created by David on 10/10/16.
 */

class ShapeFields{
    static get appearance() { return "appearance"; }
    static get layout() { return "layout"; }
    static get shapeName() { return "shapeName"; }
}

/**
 * Base class for Shapes to allow them to be passed into the BasicShape CTOR
 */
class Shape extends EventPropagator {

    // region CTOR

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

    // endregion

    // region Public Properties

    /**
     * Gets the appearance properties of the object
     * @returns {Appearance}
     */
    get appearance() { return this._appearance; }

    /**
     * Gets the layout properties of the object
     * @returns {Layout|*}
     */
    get layout() { return this._layout; }

    /**
     * Gets the margin properties of the object
     * @returns {TRBL}
     */
    get margin() { return this._layout.margin; }

    /**
     * Gets the padding properties of the object
     * @returns {TRBL}
     */
    get padding() { return this._layout.padding; }

    /**
     * Gets the x position of the base object
     * @returns {number}
     */
    get x() { return this.layout.x; }

    /**
     * Gets the y position of the base object
     * @returns {number}
     */
    get y() { return this.layout.y; }

    /**
     * Gets the width of the base object
     * @returns {number}
     */
    get width() { return this.layout.width; }

    /**
     * Gets the height of the base object
     * @returns {number}
     */
    get height() { return this.layout.height; }

    // endregion

    // region Public Methods

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

    // endregion

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = {};
        properties[ShapeFields.appearance] = this.appearance;
        properties[ShapeFields.layout] = this.layout;
        properties[ShapeFields.shapeName] = this.toString();
        return properties;
    }

    /**
     * Initializes the object from the provided JSON
     * @param {json} json - The JSON to use
     */
    initialize_json(json){
        this.appearance.initialize_json(json[ShapeFields.appearance]);
        this.layout.initialize_json(json[ShapeFields.layout]);
    }

    // endregion
}