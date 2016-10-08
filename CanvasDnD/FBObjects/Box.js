/**
 * Created by David on 09/26/16.
 */

/**
 * Represents a box form builder object
 */
class Box extends FBObject {
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
        this.appearance.strokeThickness = 20;
        this.appearance.strokeColor = "cyan";
        this.appearance.background = "red";

        this.caption.text = "Well, wha-da-ya know? It's a BOX!";
        this.caption.font.fontFamily = FontFamilies.Tahoma;
        this.caption.font.fontSize = 16;
        this.caption.font.color = "blue";
        this.caption.font.bold = true;
        this.caption.font.italic = true;
        this.caption.location = CaptionLocation.Center;
        this.caption.reserve = 100;

        this.border.color = "green";
        this.border.right = 7;
        this.border.bottom = 7;
        this.border.left = 7;
        this.border.top = 7;

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

    // region Private Methods

    /**
     * Draws the Box
     * @param {CanvasRenderingContext2D} context - The context to draw with
     * @param {number} scale - The scale to draw at
     * @private
     */
    _doDraw(context, scale){

        // Figure out where the box is going
        var boxX = scale * this.layout.x;
        var boxY = scale * this.layout.y;
        var boxH = scale * this.layout.height;
        var boxW = scale * this.layout.width;

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