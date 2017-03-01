/**
 * Created by David on 11/14/16.
 */

class HtmlTextBox {
    /**
     * Initializes HtmlTextBox
     * @param {Canvas} canvas - The canvas object to get the scaling from
     */
    static initialize(canvas){
        HtmlTextBox._canvas = canvas;
        HtmlTextBox._canvas.subscribe(EVENT_SCALE_CHANGE, HtmlTextBox._shiftBox);
        HtmlTextBox._isActive = false;
        HtmlTextBox._textArea = null;

        // Used for sizing
        HtmlTextBox._preArea = document.createElement("pre");
        HtmlTextBox._preArea.style.whiteSpace = "pre";
        HtmlTextBox._preArea.style.position = "absolute";
        HtmlTextBox._preArea.style.top = "-999px";
        HtmlTextBox._preArea.style.left = "-999px";
        HtmlTextBox._preArea.style.visibility = "hidden";
        HtmlTextBox._preArea.style.float = "left";
        HtmlTextBox._preArea.style.padding = "0";
        HtmlTextBox._preArea.style.margin = "0";
        HtmlTextBox._preArea.style.border = "0";

        document.documentElement.appendChild(HtmlTextBox._preArea);
    }

    /**
     * Creates a TextBox with the given information
     * @param {Layout} layout - The object which the TextBox will overlay
     * @param {string} text - The text to put into the box
     * @param {FontFamilies} fontFamily - The font family to use
     * @param {number} fontSize - The font size to use
     * @param {Alignment} alignment - How to text-align the text
     * @param {boolean} bold - Indicates if the text should be bold
     * @param {boolean} italic - Indicates if the text should be italic
     * @returns {HTMLTextAreaElement}
     */
    static makeTextBox(layout, text, fontFamily, fontSize, alignment, bold, italic){
        HtmlTextBox._isActive = true;

        if(HtmlTextBox._textArea){
            HtmlTextBox._textArea.blur();
        }

        const scale = HtmlTextBox._canvas.scale;

        if(HtmlTextBox._textArea === null) {
            const canvas = document.getElementById(WYSIWYG_CANVAS_ID);

            HtmlTextBox._textArea = document.createElement("textarea");
            HtmlTextBox._preArea.innerHTML = HtmlTextBox._textArea.innerHTML = text;
            HtmlTextBox._preArea.style.fontFamily = HtmlTextBox._textArea.style.fontFamily = fontFamily;
            HtmlTextBox._preArea.style.fontSize = HtmlTextBox._textArea.style.fontSize = fontSize + "px";
            HtmlTextBox._preArea.style.fontWeight = HtmlTextBox._textArea.style.fontWeight = (bold ? "bold" : "normal");
            HtmlTextBox._preArea.style.fontStyle = HtmlTextBox._textArea.style.fontStyle = italic ? "italic" : "normal";
            HtmlTextBox._preArea.style.testAlign = HtmlTextBox._textArea.style.textAlign = alignment;
            HtmlTextBox._textArea.style.position = "absolute";
            HtmlTextBox._textArea.style.top = (layout.y * scale) + canvas.offsetTop + "px";
            HtmlTextBox._textArea.style.left = (((layout.x + 2) * scale) - 2) + canvas.offsetLeft + "px";
            HtmlTextBox._textArea.style.width = layout.width + "px";
            HtmlTextBox._textArea.style.height = layout.height + "px";
            HtmlTextBox._preArea.style.transform = HtmlTextBox._textArea.style.transform = "scale(" + scale + ", " + scale + ")";
            HtmlTextBox._preArea.style.transformOrigin = HtmlTextBox._textArea.style.transformOrigin = "left top";
            HtmlTextBox._textArea.style.resize = "none";
            HtmlTextBox._textArea.style.overflow = "hidden";
            HtmlTextBox._textArea.style.background = "transparent";
            HtmlTextBox._textArea.style.border = "0";
            HtmlTextBox._textArea.style.lineHeight = (fontSize * WYSIWYG_FLH_RATIO) + "px";
            HtmlTextBox._textArea.style.padding = "0";

            const inputCallback = () => {
                HtmlTextBox._preArea.innerHTML = HtmlTextBox._textArea.value
            };
            HtmlTextBox._textArea.addEventListener('input', inputCallback);

            document.getElementById(WYSIWYG_CANVAS_HOLDER_ID).appendChild(HtmlTextBox._textArea);
            HtmlTextBox._textArea.focus();
        }
        else{
            HtmlTextBox._textArea.style.top = (layout.y * scale) + "px";
            HtmlTextBox._textArea.style.left = ((layout.x + 2) * scale) + "px";
            HtmlTextBox._textArea.style.width = layout.width + "px";
            HtmlTextBox._textArea.style.height = layout.height + "px";
            HtmlTextBox._textArea.innerHTML = text;
            HtmlTextBox._textArea.style.transform = "scale(" + scale + ", " + scale + ")";
        }

        return HtmlTextBox._textArea;
    }

    /**
     * Closes the currently opened TextBox
     */
    static closeTextBox(){
        if(!HtmlTextBox._textArea) return;

        // Ensure the lose-focus event happens
        HtmlTextBox._textArea.blur();
        HtmlTextBox._isActive = false;

        // Not sure why this is needed twice, but it is.
        if(!HtmlTextBox._textArea) return;

        HtmlTextBox._textArea.parentNode.removeChild(HtmlTextBox._textArea);
        HtmlTextBox._textArea = null;
    }

    /**
     * Indicates if there is currently an open TextBox
     * @returns {boolean}
     */
    static get isOpen(){
        return this._isActive;
    }

    /**
     * Shifts the text box when the canvas' scale changes
     * @param {ScaleChangeEventArgs} e
     * @private
     */
    static _shiftBox(e){
        if(HtmlTextBox._textArea){
            const x = (parseInt(HtmlTextBox._textArea.style.left) / e.oldScale) - 2;
            const y = parseInt(HtmlTextBox._textArea.style.top) / e.oldScale;

            HtmlTextBox._textArea.style.top = (y * e.scale) + "px";
            HtmlTextBox._textArea.style.left = ((x + 2) * e.scale) - 2 + "px";
            HtmlTextBox._textArea.style.transform = "scale(" + e.scale + ", " + e.scale + ")";
        }
    }

    static getWidth() {
        return parseInt(HtmlTextBox._preArea.scrollWidth) + 4;
    }

    static getHeight() {
        return HtmlTextBox._preArea.scrollHeight;
    }
}