/**
 * Created by David on 09/26/16.
 */

/**
 * Represents a box form builder object
 */
class Box extends Shape {
    // region Constructor

    /**
     * Creates a new Box object
     * @param {number} x - The starting x value of the box
     * @param {number} y - The starting y value of the box
     * @param {number} width - The starting width of the box
     * @param {number} height - The starting height of the box
     */
    constructor(x, y, width, height) {
        // Initialize the base class
        super(x, y, width, height);

        // Initialize some defaults for testing purposes
        this.appearance.strokeThickness = 0;
        this.appearance.strokeColor = "cyan";
        this.appearance.background = "red";

        this.layout.margin.top = 0;
        this.layout.margin.right = 0;
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

    // region Public Functions

    /**
     * Indicates if the given coordinates are in the object
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} scale - The scale of the object
     * @returns {boolean}
     */
    isPointInObject(x, y){
        x = x - this.visualX;
        y = y - this.visualY;

        return x >= 0 && x <= this.visualWidth &&
            y >= 0 && y <= this.visualHeight;
    }

    /**
     * Draws the Box
     * @param {CanvasRenderingContext2D} context - The context to draw with
     * @private
     */
    draw(context){

        // Figure out where the box is going
        var boxX = this.layout.x;
        var boxY = this.layout.y;
        var boxH = this.layout.height;
        var boxW = this.layout.width;

        // First draw the box with its stroke
        context.beginPath();
        context.translate(boxX, boxY);
        context.fillStyle = this.appearance.background;
        context.strokeStyle = this.appearance.strokeColor;
        context.lineWidth = this.appearance.strokeThickness;
        context.rect(0, 0, boxW, boxH);
        context.closePath();
        context.fill();
        context.stroke();
    }

    // endregion
}