/**
 * Created by David on 11/26/16.
 */

class Cell extends TextBlock {
    constructor(text){
        super(text);

        /**
         * Holds the appearance properties for the object
         * @type {Appearance}
         * @private
         */
        this._appearance = new Appearance();

        /**
         * Holds the border properties for the object
         * @type {Border}
         * @private
         */
        this._border = new Border();

        this.layout.padding.top = this.layout.padding.right =
            this.layout.padding.bottom = this.layout.padding.left = WYSIWYG_TABLE_BORDER_SIZE;

        this.verticallyCenter = true;
        this.autoWidth = false;
        this.autoHeight = false;

        this.background = "#ffffff";
    }

    get borderColor() { return this._border.color; }
    set borderColor(value) { return this._border.color = value; }

    get background() { return this._appearance.background; }
    set background(value) { return this._appearance.background = value; }

    draw(context) {
        context.save();

        context.fillStyle = this.background;
        context.fillRect(this.layout.x, this.layout.y, this.layout.width, this.layout.height);

        super.draw(context);
        context.restore();

        // Because stroke does it half on each line
        const shiftAmt = WYSIWYG_TABLE_BORDER_SIZE / 2;
        context.lineWidth = WYSIWYG_TABLE_BORDER_SIZE;
        context.strokeStyle = this.borderColor;
        context.strokeRect(this.layout.x + shiftAmt, this.layout.y + shiftAmt,
            this.layout.width - WYSIWYG_TABLE_BORDER_SIZE, this.layout.height - WYSIWYG_TABLE_BORDER_SIZE);

        if(this.isFocused){
            // Draw another border if we're focused
            const shiftAmt = (WYSIWYG_TABLE_BORDER_SIZE / 2) + WYSIWYG_TABLE_BORDER_SIZE;
            context.lineWidth = 2 * WYSIWYG_TABLE_BORDER_SIZE;
            context.strokeStyle = "orange";
            context.strokeRect(this.layout.x + shiftAmt, this.layout.y + shiftAmt,
                this.layout.width - (2 * shiftAmt), this.layout.height - (2 * shiftAmt));
        }
    }
}