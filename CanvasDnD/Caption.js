/**
 * Created by David on 09/26/16.
 */

// import "Font";

var CaptionLocation = {
    Top: "Top",
    Right: "Right",
    Bottom: "Bottom",
    Left: "Left",
    Center: "Center",
    None: "none"
};

class Caption {
    constructor(){
        this._text = "";
        this._location = CaptionLocation.None;
        this._font = new Font();
        this._reserve = null;
    }

    get text() { return this._text; }
    set text(value) { this._text = value; }

    get location() { return this._location; }
    set location(value) { this._location = value; }

    get font() { return this._font; }
    set font(value) { this._font = value; }

    get reserve() { return this._reserve }
    set reserve(value) { this._reserve = value; }
}