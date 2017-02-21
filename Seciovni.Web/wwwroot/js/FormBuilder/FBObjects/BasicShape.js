/**
 * Created by David on 10/10/16.
 */

class BasicShapeFields {
    static get shape() { return "shape"; }
}

class BasicShapeTypes {
    static get box() { return "box"; }
    static get ellipse() { return "ellipse"; }
}

class BasicShape extends FBObject {
    // region CTOR

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

    // endregion

    // region Private Methods

    /**
     * Draws the shape and its dependencies
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    _doDraw(context){
        this._shape.draw(context);
    }

    // endregion

    // region Public Methods

    toString() { return "BasicShape"; }

    // endregion

    // region Public Properties

    get minWidth() { return this._shape.minWidth; }
    get minHeight() { return this._shape.minHeight; }

    get layout() { return this._shape.layout; }

    get appearance() { return this._shape.appearance; }

    // endregion

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = this.__toJSON();
        let key;

        if(this._shape instanceof Box) key = BasicShapeTypes.box;
        else if(this._shape instanceof Ellipse) key = BasicShapeFields.ellipse;

        const shape = [];
        shape.push(key);
        shape.push(this._shape);
        properties[BasicShapeFields.shape] = shape;

        return properties;
    }

    /**
     * Creates a new object from the provided JSON
     * @param {json} json - The JSON to use
     * @return {BasicShape}
     */
    static from_json(json){
        const shape_json = json[BasicShapeFields.shape];

        let shape;
        if(shape_json[0] === BasicShapeTypes.box) shape = new Box(0, 0, 0, 0);
        else if(shape_json[0] === BasicShapeTypes.ellipse) shape = new Ellipse(0, 0, 0);

        shape.initialize_json(shape_json[1]);

        const basicShape = new BasicShape(shape);
        basicShape.__init_json(json);

        return basicShape;
    }

    // endregion
}