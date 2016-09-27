/**
 * Created by David on 09/26/16.
 */

// import "../Appearance"
// import "Border"
// import "Caption"
// import "Layout"

class FBObject {
    constructor(x, y, width, height){
        this.__appearance = new Appearance();
        this.__border = new Border();
        this.__caption = new Caption();
        this.__layout = new Layout();

        this._backupLayout = this.__layout;

        this.__properties = [
            // TODO
        ];

        this.__layout.x = x;
        this.__layout.y = y;
        this.__layout.width = width;
        this.__layout.height = height;
    }

    // region Public Properties

    get appearance() { return this.__appearance; }
    set appearance(value) { this.__appearance = value; }

    get border() { return this.__border; }
    set border(value) { this.__border = value; }

    get caption() { return this.__caption; }
    set caption(value) { this.__caption = value; }

    get layout() { return this.__layout; }
    set layout(value) { this.__layout = value; }

    // endregion

    // region Public Methods

    cancelResize(){
        this.__layout = this._backupLayout;
    }

    commitResize(){
        this._backupLayout = this.__layout;
    }

    draw(context, scale){
        context.save();
        this.__doDraw(context, scale);
        context.restore();

        context.save();
        this._drawBorder(context, scale);
        context.restore();

        context.save();
        this._drawCaption(context, scale);
        context.restore();
    }

    isPointInShape(x, y, scale){
        x = Math.floor(x - (this.x * scale));
        y = Math.floor(y - (this.y * scale));

        return x >= 0 && x <= Math.ceil(this.width * scale) &&
            y >= 0 && y <= Math.ceil(this.height * scale);
    }

    get properties(){
        return this.__properties;
    }

    resize(resizeX, resizeY, anchor, preserveRatio = false, keepCenter = false) {

        if (anchor < Anchor.LeftTop || anchor > Anchor.RightBottom) {
            throw "anchor must be ANCHOR_LEFT_TOP, ANCHOR_LEFT_BOTTOM, ANCHOR_RIGHT_TOP, or ANCHOR_RIGHT_BOTTOM";
        }

        var newX, newY, newW, newH;

        if (preserveRatio) {
            // If X is bigger
            if (Math.abs(resizeX) > Math.abs(resizeY)) {
                var adjAmt = 1 + (resizeX / this.resizeOrigWidth);
                resizeY = -1 * (this.resizeOrigHeight - (this.resizeOrigHeight * adjAmt));
            }
            // Else Y is bigger
            else {
                var adjAmt = 1 + (resizeY / this.resizeOrigHeight);
                resizeX = -1 * (this.resizeOrigWidth - (this.resizeOrigWidth * adjAmt));
            }
        }

        var adjScale = keepCenter ? 2 : 1;

        // If we're on the left side
        if (anchor === Anchor.LeftTop || anchor === Anchor.LeftBottom) {
            newX = this.resizeOrigX + resizeX;
            newW = this.resizeOrigWidth - (resizeX * adjScale);
        }
        // Otherwise, it must be the right
        else {
            newX = this.resizeOrigX - (keepCenter ? resizeX : 0);
            newW = this.resizeOrigWidth + (resizeX * adjScale);
        }

        // If we're on the top
        if (anchor === Anchor.LeftTop || anchor === Anchor.RightTop) {
            newY = this.resizeOrigY + resizeY;
            newH = this.resizeOrigHeight - (resizeY * adjScale);
        }
        // Otherwise, it must be the bottom
        else {
            newY = this.resizeOrigY - (keepCenter ? resizeY : 0);
            newH = this.resizeOrigHeight + (resizeY * adjScale);
        }

        if(newW < 0){
            newX += newW;
            newW = Math.abs(newW);
        }
        if(newH < 0){
            newY += newH;
            newH = Math.abs(newH);
        }

        this.__x = newX;
        this.__y = newY;
        this.__width = newW;
        this.__height = newH;
    }

    // endregion

    // region Private Methods

    _drawBorder(context, scale){
        var thickness = this.__border.thickness;
        var top = this.__border.top;
        var right = this.__border.right;
        var bottom = this.__border.bottom;
        var left = this.__border.left;
        var x = this.__layout.x;
        var y = this.__layout.y;
        var height = this.__layout.height;
        var width = this.__layout.width;

        context.fillStyle = this.__border.color;

        if(top){
            var bY = scale * (y - thickness);
            var bX = scale * (x - (left ? thickness : 0));
            var bW = scale * (width + (left ? thickness : 0) + (right ? thickness : 0));

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, bW, thickness);
            context.fill();
            context.closePath();
        }

        if(right){
            var bX = scale * (x + width);
            var bY = scale * (y - (top ? thickness : 0));
            var bH = scale * (height + (top ? thickness : 0) + (bottom ? thickness : 0));

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, thickness, bH);
            context.fill();
            context.closePath();
        }

        if(bottom){
            var bY = scale * (y + height);
            var bX = scale * (x - (left ? thickness : 0));
            var bW = scale * (width + (left ? thickness : 0) + (right ? thickness : 0));

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, bW, thickness);
            context.fill();
            context.closePath();
        }

        if(left){
            var bX = scale * (x - thickness);
            var bY = scale * (y - (top ? thickness : 0));
            var bH = scale * (height + (top ? thickness : 0) + (bottom ? thickness : 0));

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, thickness, bH);
            context.fill();
            context.closePath();
        }
    }

    _drawCaption(context, scale){

    }

    // endregion
}
