/**
 * Created by David on 09/26/16.
 */

// import "FBObject";

class Box extends FBObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);

        this.__appearance.strokeThickness = 4;
        this.__appearance.strokeColor = "blue";
        this.__appearance.background = "red";

        this.__caption.text = "Well, whadaya know? It's a BOX!";
        this.__caption.font.fontFamily = FontFamilies.Tahoma;
        this.__caption.font.fontSize = 16;
        this.__caption.font.color = "white";
        this.__caption.location = CaptionLocation.Bottom;

        this.__border.color = "green";
        this.__border.thickness = 10;
        this.__border.right = true;
        this.__border.bottom = true;
        this.__border.left = true;
        this.__border.top = true;
    }

    __doDraw(context, scale){

        // Figure out where the box is going
        var boxX = scale * this.__layout.x;
        var boxY = scale * this.__layout.y;
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
}