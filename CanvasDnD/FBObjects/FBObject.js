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

        this.__layout.x = x;
        this.__layout.y = y;
        this.__layout.width = width;
        this.__layout.height = height;

        this._backupLayout = this.__layout.clone();

        this.__properties = [
            // TODO
        ];
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
        this.__layout = this._backupLayout.clone();
    }

    commitResize(){
        this._backupLayout = this.__layout.clone();
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
        x = Math.floor(x - (this.__layout.x * scale));
        y = Math.floor(y - (this.__layout.y * scale));

        return x >= 0 && x <= Math.ceil(this.__layout.width * scale) &&
            y >= 0 && y <= Math.ceil(this.__layout.height * scale);
    }

    move(relativeX, relativeY){
        this.__layout.x = this._backupLayout.x + relativeX;
        this.__layout.y = this._backupLayout.y + relativeY;
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
                var adjAmt = 1 + (resizeX / this._backupLayout.width);
                resizeY = -1 * (this._backupLayout.height - (this._backupLayout.height * adjAmt));
            }
            // Else Y is bigger
            else {
                var adjAmt = 1 + (resizeY / this._backupLayout.height);
                resizeX = -1 * (this._backupLayout.width - (this._backupLayout.width * adjAmt));
            }
        }

        var adjScale = keepCenter ? 2 : 1;

        // If we're on the left side
        if (anchor === Anchor.LeftTop || anchor === Anchor.LeftBottom) {
            newX = this._backupLayout.x + resizeX;
            newW = this._backupLayout.width - (resizeX * adjScale);
        }
        // Otherwise, it must be the right
        else {
            newX = this._backupLayout.x - (keepCenter ? resizeX : 0);
            newW = this._backupLayout.width + (resizeX * adjScale);
        }

        // If we're on the top
        if (anchor === Anchor.LeftTop || anchor === Anchor.RightTop) {
            newY = this._backupLayout.y + resizeY;
            newH = this._backupLayout.height - (resizeY * adjScale);
        }
        // Otherwise, it must be the bottom
        else {
            newY = this._backupLayout.y - (keepCenter ? resizeY : 0);
            newH = this._backupLayout.height + (resizeY * adjScale);
        }

        if(newW < 0){
            newX += newW;
            newW = Math.abs(newW);
        }
        if(newH < 0){
            newY += newH;
            newH = Math.abs(newH);
        }

        this.__layout.x = newX;
        this.__layout.y = newY;
        this.__layout.width = newW;
        this.__layout.height = newH;
    }

    get x() { return this.__layout.x; }
    get y() { return this.__layout.y; }
    get width() { return this.__layout.width; }
    get height() { return this.__layout.height; }

    get visualX() {
        var x = this.x;
        var border = this.__border.left;
        var margin = this.__layout.margin.left;
        return x - border - margin;
    }
    get visualY() {
        var y = this.y;
        var border = this.__border.top;
        var margin = this.__layout.margin.top;
        return y - border - margin;
    }
    get visualWidth() {
        var width = this.width;
        var border = this.__border.left + this.__border.right;
        var margin = this.__layout.margin.left + this.__layout.margin.right;
        return width + border + margin;
    }
    get visualHeight() {
        var height = this.height;
        var border = this.__border.top + this.__border.bottom;
        var margin = this.__layout.margin.top + this.__layout.margin.bottom;
        return height + border + margin;
    }

    // endregion

    // region Private Methods

    _drawBorder(context, scale){
        var topThickness = this.__border.top;
        var rightThickness = this.__border.right;
        var bottomThickness = this.__border.bottom;
        var leftThickness = this.__border.left;
        var x = this.__layout.x;
        var y = this.__layout.y;
        var height = this.__layout.height;
        var width = this.__layout.width;

        context.fillStyle = this.__border.color;

        if(topThickness > 0){
            var bY = scale * (y - topThickness);
            var bX = scale * (x - leftThickness);
            var bW = scale * (width + leftThickness + rightThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, bW, topThickness);
            context.fill();
            context.closePath();
        }

        if(rightThickness > 0){
            var bX = scale * (x + width);
            var bY = scale * (y - topThickness);
            var bH = scale * (height + topThickness + bottomThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, rightThickness, bH);
            context.fill();
            context.closePath();
        }

        if(bottomThickness > 0){
            var bY = scale * (y + height);
            var bX = scale * (x - leftThickness);
            var bW = scale * (width + leftThickness + rightThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, bW, bottomThickness);
            context.fill();
            context.closePath();
        }

        if(leftThickness > 0){
            var bX = scale * (x - leftThickness);
            var bY = scale * (y - topThickness);
            var bH = scale * (height + topThickness + bottomThickness);

            context.beginPath();
            context.moveTo(bX, bY);
            context.rect(bX, bY, leftThickness, bH);
            context.fill();
            context.closePath();
        }
    }

    _drawCaption(context, scale){

    }

    // endregion
}
