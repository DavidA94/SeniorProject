/**
 * Created by David on 09/26/16.
 */

/**
 * Represents a Ellipse on the form builder
 */
class Ellipse extends Shape {

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
        this.appearance.background = "black";
    }

    // endregion

    // region Public Properties

    /**
     * Gets the minimum width the object can be, or null if there is no minimum width
     * @returns {boolean|null}
     */
    get minWidth() { return null; }

    /**
     * Gets the minimum height the object can be, or null if there is no minimum height
     * @returns {boolean|null}
     */
    get minHeight() { return null; }

    // endregion

    // region Private Properties

    /**
     * Gets the center X position
     * @returns {number}
     * @private
     */
    get _centerX() { return this.layout._x + (this.layout.width / 2.0); }

    /**
     * Gets the center Y position
     * @returns {number}
     * @private
     */
    get _centerY() { return this.layout._y + (this.layout.height / 2.0); }

    /**
     * Gets the radius width
     * @returns {number}
     * @private
     */
    get _radiusX() { return (this.layout.width / 2.0); }

    /**
     * Gets the radius height
     * @returns {number}
     * @private
     */
    get _radiusY() { return (this.layout.height / 2.0); }

    // endregion

    // region Private Functions

    /**
     * Draws the Ellipse
     * @param {CanvasRenderingContext2D} context - The context to draw with
     * @private
     */
    draw(context){

        // Begin the path, and setup the context properties from the shape properties
        context.beginPath();
        context.fillStyle = this.appearance.background;
        context.strokeStyle = this.appearance.strokeColor;
        context.lineWidth = this.appearance.strokeThickness;

        // Draw the ellipse with its stroke
        context.translate(this._centerX, this._centerY);
        context.ellipse(0, 0, this._radiusX, this._radiusY, 0, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.stroke();
    }

    /**
     * Checks if the given coordinates are within the shape
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {boolean}
     */
    isPointInObject(x, y){
        // Scale all the parameters, and then do the math for just the circle
        const cX = this._centerX;
        const cY = this._centerY;
        const rX = this._radiusX;
        const rY = this._radiusY;
        return (Math.pow((x - cX), 2) / Math.pow(rX, 2)) + (Math.pow((y - cY), 2) / Math.pow(rY, 2)) <= 1;
    }

    // endregion

    toString() { return "Ellipse"; }
}