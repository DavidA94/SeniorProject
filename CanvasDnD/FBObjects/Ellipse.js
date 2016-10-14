/**
 * Created by David on 09/26/16.
 */

/**
 * Represents a Ellipse on the form builder
 */
class Ellipse extends FBObject {

    // region Constructor

    /**
     * Creates a new circle object
     * @param {number} centerX - The initial X center position of the circle
     * @param {number} centerY - The initial Y center position of the circle
     * @param {number} radius - The initial radius of the circle
     */
    constructor(centerX, centerY, radius){
        super(centerX - radius, centerY - radius, radius * 2, radius * 2);

        // Setup some default properties
        this._appearance.background = "black";
    }

    // endregion

    // region Public Properties

    get minWidth() { return null; }
    get minHeight() { return null; }

    // endregion

    // region Private Properties

    /**
     * Gets the center X position
     * @returns {number}
     * @private
     */
    get _centerX() { return this._layout._x + (this._layout.width / 2.0); }

    /**
     * Gets the center Y position
     * @returns {number}
     * @private
     */
    get _centerY() { return this._layout._y + (this._layout.height / 2.0); }

    /**
     * Gets the radius width
     * @returns {number}
     * @private
     */
    get _radiusX() { return (this._layout.width / 2.0); }

    /**
     * Gets the radius height
     * @returns {number}
     * @private
     */
    get _radiusY() { return (this._layout.height / 2.0); }

    // endregion

    // region Private Functions

    /**
     * Draws the Ellipse
     * @param {CanvasRenderingContext2D} context - The context to draw with
     * @param {number} scale - The scale to draw at
     * @private
     */
    _doDraw(context, scale){

        // Begin the path, and setup the context properties from the shape properties
        context.beginPath();
        context.fillStyle = this._appearance.background;
        context.strokeStyle = this._appearance.strokeColor;
        context.lineWidth = this._appearance.strokeThickness;

        // Translate to the center of the circle, and draw the ellipse
        context.translate(Math.ceil(this._centerX * scale), Math.ceil(this._centerY * scale));
        context.ellipse(0, 0, Math.ceil(this._radiusX * scale), Math.ceil(this._radiusY * scale), 0, 0, 2 * Math.PI);

        // Close the path, then fill and stroke it
        context.closePath();

        context.fill();
        context.stroke();
    }

    /**
     * Gets the cursor for the given coordinates, if they are within the shape
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} scale - The scale of the object
     * @returns {Cursor}
     */
    _getHoverCursor(x, y, scale){
        if(!this._isPointInRealObject(x, y, scale)) return null;
        return Cursor.Hand;
    }

    /**
     * Checks if the given coordinates are within the shape
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} scale - The scale of the object
     * @returns {boolean}
     */
    _isPointInRealObject(x, y, scale){
        // Scale all the parameters, and then do the math for just the circle
        var cX = this._centerX * scale;
        var cY = this._centerY * scale;
        var rX = this._radiusX * scale;
        var rY = this._radiusY * scale;
        return (Math.pow((x - cX), 2) / Math.pow(rX, 2)) + (Math.pow((y - cY), 2) / Math.pow(rY, 2)) <= 1;
    }

    // endregion








}