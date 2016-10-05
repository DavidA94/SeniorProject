/**
 * Created by David on 09/26/16.
 */

// import "FBObject";

class Box extends FBObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);

        this.__appearance.strokeThickness = 20;
        this.__appearance.strokeColor = "cyan";
        this.__appearance.background = "red";

        this.__caption.text = "Well, wha-da-ya know? It's a BOX!";
        this.__caption.font.fontFamily = FontFamilies.Tahoma;
        this.__caption.font.fontSize = 16;
        this.__caption.font.color = "blue";
        this.__caption.font.bold = true;
        this.__caption.font.italic = true;
        this.__caption.location = CaptionLocation.Center;
        this.__caption.reserve = 100;

        this.__border.color = "green";
        this.__border.right = 7;
        this.__border.bottom = 7;
        this.__border.left = 7;
        this.__border.top = 7;

        this.__layout.margin.top = 0;
        this.__layout.margin.right = 0;
    }

    __doDraw(context, scale){

        // Figure out where the box is going
        var boxX = scale * this.__layout._x;
        var boxY = scale * this.__layout._y;
        var boxH = scale * this.__layout.height;
        var boxW = scale * this.__layout.width;

        // First draw the box with its stroke
        context.beginPath();
        context.translate(boxX, boxY);
        context.fillStyle = this.__appearance.background;
        context.strokeStyle = this.__appearance.strokeColor;
        context.lineWidth = this.__appearance.strokeThickness;
        context.rect(0, 0, boxW, boxH);
        context.closePath();
        context.fill();
        context.stroke();
    }

    get minWidth() { return null; }
    get minHeight() { return null; }
}