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
    }

    // endregion

    // region Public Properties

    /**
     * Gets the minimum width the object can be, or null if there is no minimum width
     * @returns {number|null}
     */
    get minWidth() { return null; }

    /**
     * Gets the minimum height the object can be, or null if there is no minimum height
     * @returns {number|null}
     */
    get minHeight() { return null; }

    // endregion

    // region Public Functions

    /**
     * Indicates if the given coordinates are in the object
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {boolean}
     */
    isPointInObject(x, y){
        x = x - this.layout.x;
        y = y - this.layout.y;

        const width = this.layout.width + this.layout.margin.left + this.layout.margin.right;
        const height = this.layout.height + this.layout.margin.top + this.layout.margin.bottom;

        return x >= 0 && x <= width && y >= 0 && y <= height;
    }

    /**
     * Draws the Box
     * @param {CanvasRenderingContext2D} context - The context to draw with
     */
    draw(context){

        // Figure out where the box is going
        const boxX = this.layout.x;
        const boxY = this.layout.y;
        const boxH = this.layout.height;
        const boxW = this.layout.width;
        const marginL = this.layout.margin.left;
        const marginT = this.layout.margin.top;

        // First draw the box with its stroke
        context.beginPath();
        context.translate(boxX + marginL, boxY + marginT);
        context.fillStyle = this.appearance.background;
        context.strokeStyle = this.appearance.strokeColor;
        context.lineWidth = this.appearance.strokeThickness;
        context.rect(0, 0, boxW, boxH);
        context.closePath();
        context.fill();
        context.stroke();
    }

    toString() { return "Box"; }

    // endregion
}