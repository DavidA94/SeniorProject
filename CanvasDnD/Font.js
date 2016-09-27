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

class Font {
    constructor(){
        this._bold = false;
        this._color = "#000000";
        this._fontFamily = FontFamilies.Arial;
        this._fontSize = 12;
        this._italic = false;
        this._underline = false;
    }

    get bold() { return this._bold; }
    set bold(value) { this._bold = value; }

    get color() { return this._color; }
    set color(value) { this._color = value; }

    get fontFamily() { return this._fontFamily; }
    set fontFamily(value) { this._fontFamily = value; }

    get fontSize() { return this._fontSize; }
    set fontSize(value) { this._fontSize = value; }

    get italic() { return this._italic; }
    set italic(value) { this._italic = value; }

    get underline() { return this._underline; }
    set underline(value) { this._underline = value; }
}