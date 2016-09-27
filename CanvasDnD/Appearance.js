/**
 * Created by David on 09/26/16.
 */

class Appearance {
    constructor(){
        this._background = null;
        this._foreground = "#000000";
        this._strokeColor = "#000000";
        this._strokeThickness = 0;
    }

    get background() { return this._background; }
    set background(value) { this._background = value; }

    get foreground() { return this._foreground; }
    set foreground(value) { this._foreground = value; }

    get strokeColor() { return this._strokeColor; }
    set strokeColor(value) { this._strokeColor = value; }

    get strokeThickness() { return this._strokeThickness; }
    set strokeThickness(value) { this._strokeThickness = value; }

}