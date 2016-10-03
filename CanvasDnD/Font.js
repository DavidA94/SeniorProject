/**
 * Created by David on 09/24/16.
 */

const FontFamilies = {
    "Arial" : "Arial",
    "Arial Black" : "Arial Black",
    "Courier New" : "Courier New",
    "Georgia": "Georgia",
    "Tahoma" : "Tahoma",
    "Times New Roman" : "Times New Roman",
    "Verdana" : "Verdana",
};

const FontAlignment = {
    Left: "left",
    Right: "right",
    Center: "center"
};

// Font Line Height Ratio
const FLH_RATIO = 1.4;

class Font {
    constructor(){
        this._alignment = FontAlignment.Left;
        this._bold = false;
        this._color = "#000000";
        this._fontFamily = FontFamilies.Arial;
        this._font = 12;
        this._italic = false;
        this._underline = false;
    }

    get alignment() { return this._alignment; }
    set alignment(value) { this._alignment = value; }

    get bold() { return this._bold; }
    set bold(value) { this._bold = value; }

    get color() { return this._color; }
    set color(value) { this._color = value; }

    get fontFamily() { return this._fontFamily; }
    set fontFamily(value) { this._fontFamily = value; }

    get size() { return this._font; }
    set size(value) { this._font = value; }

    get italic() { return this._italic; }
    set italic(value) { this._italic = value; }

    get underline() { return this._underline; }
    set underline(value) { this._underline = value; }
}