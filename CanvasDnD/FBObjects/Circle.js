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

        context.translate(Math.ceil(this.centerX * scale), Math.ceil(this.centerY * scale));
        context.ellipse(0, 0, Math.ceil(this.radiusX * scale), Math.ceil(this.radiusY * scale), 0, 0, 2 * Math.PI);
        context.closePath();

        context.fill();
        context.stroke();
    }

    isPointInShape(x, y, scale){
        var cX = Math.ceil(this.centerX * scale);
        var cY = Math.ceil(this.centerY * scale);
        var rX = Math.ceil(this.radiusX * scale);
        var rY = Math.ceil(this.radiusY * scale);
        return (Math.pow((x - cX), 2) / Math.pow(rX, 2)) + (Math.pow((y - cY), 2) / Math.pow(rY, 2)) <= 1;
    }

    get centerX() { return this.__layout.x + (this.__layout.width / 2.0); }
    get centerY() { return this.__layout.y + (this.__layout.height / 2.0); }
    get radiusX() { return (this.__layout.width / 2.0); }
    get radiusY() { return (this.__layout.height / 2.0); }
}