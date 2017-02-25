/**
 * Created by David on 2017-02-24.
 */

class Warning extends Shape {
    constructor(x, y, width, height, error){
        super(x, y, 16, 16);

        this._errorMessage = error;
        this._timeout = 0;
        this._visible = false;

        /*
        this.subscribe(MouseEventType.MouseEnter, (e) => {
            this._timeout = setTimeout(() => ToolTip.show(e.x, e.y + 10, this._errorMessage), 500);
        });
        this.subscribe(MouseEventType.MouseLeave, () => {
            clearTimeout(this._timeout);
            ToolTip.hide();
        });*/
    }

    /**
     * Indicates if this should be visible
     * @param {boolean} value
     */
    set visible(value) { this._visible = value; }

    draw(context){
        if(!this._visible) return;
        context.lineJoin = "round";
        context.strokeStyle = "#b2b200";
        context.fillStyle = "#e5e500";
        context.lineWidth = 1;
        context.translate(this.layout.x, this.layout.y);
        context.beginPath();
        context.moveTo(0, 10);
        context.lineTo(5, 0);
        context.lineTo(10, 10);
        context.closePath();
        context.stroke();
        context.fill();
    }

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
}