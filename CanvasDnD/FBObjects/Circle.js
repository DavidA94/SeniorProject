/**
 * Created by David on 09/26/16.
 */

class Circle extends FBObject {
    constructor(centerX, centerY, radius){
        super(centerX - radius, centerY - radius, radius * 2, radius * 2);

        this.__appearance.background = "black";
    }

    __doDraw(context, scale){

        context.beginPath();
        context.fillStyle = this.__appearance.background;
        context.strokeStyle = this.__appearance.strokeColor;
        context.lineWidth = this.__appearance.strokeThickness;

        context.translate(Math.ceil(this._centerX * scale), Math.ceil(this._centerY * scale));
        context.ellipse(0, 0, Math.ceil(this._radiusX * scale), Math.ceil(this._radiusY * scale), 0, 0, 2 * Math.PI);
        context.closePath();

        context.fill();
        context.stroke();
    }

    isPointInObject(x, y, scale){
        var cX = Math.ceil(this._centerX * scale);
        var cY = Math.ceil(this._centerY * scale);
        var rX = Math.ceil(this._radiusX * scale);
        var rY = Math.ceil(this._radiusY * scale);
        return (Math.pow((x - cX), 2) / Math.pow(rX, 2)) + (Math.pow((y - cY), 2) / Math.pow(rY, 2)) <= 1;
    }

    get _centerX() { return this.__layout._x + (this.__layout.width / 2.0); }
    get _centerY() { return this.__layout._y + (this.__layout.height / 2.0); }
    get _radiusX() { return (this.__layout.width / 2.0); }
    get _radiusY() { return (this.__layout.height / 2.0); }

    get minWidth() { return null; }
    get minHeight() { return null; }
}