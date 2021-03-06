/**
 * Created by David on 11/26/16.
 */

class CheckBox extends FBObject {
    constructor(x, y, size){
        super(x, y, size, size);

        /**
         * @private
         * @type {boolean}
         */
        this._checked = false;
    }

    _doDraw(context){
        const scaleAmt = Math.min(this.width, this.height) / 10;
        const cornerAmt = 2 * scaleAmt;
        const lineWidth = scaleAmt;
        let width = this.width - lineWidth;
        let height = this.height - lineWidth;
        let shiftX = 0;
        let shiftY = 0;

        if(width > height) {
            shiftX = (width - height) / 2.0;
            width = height;

        }
        if(width < height){
            shiftY = (height - width) / 2.0;
            height = width;
        }


        // Shift so we'll draw within the bounds
        context.translate(this.x + (lineWidth / 2) + shiftX, this.y + (lineWidth / 2) + shiftY);

        context.lineWidth = scaleAmt;
        context.lineCap = "round";
        context.lineJoin = "round";
        //context.beginPath();

        // Arcs are in clockwise order starting at the top left
        // Not fancy because PDFs
        /*context.moveTo(0, cornerAmt);
        context.quadraticCurveTo(0, 0, cornerAmt, 0);
        context.lineTo(width - cornerAmt, 0);
        context.quadraticCurveTo(width, 0, width, cornerAmt);
        context.lineTo(width, height - cornerAmt);
        context.quadraticCurveTo(width, height, width - cornerAmt, height);
        context.lineTo(cornerAmt, height);
        context.quadraticCurveTo(0, height, 0, height - cornerAmt);
        context.lineTo(0, cornerAmt);*/

        context.rect(0, 0, width, height);
        context.stroke();

        context.lineWidth = scaleAmt * 1.5;
        context.beginPath();
        context.moveTo(width * .2, height * .57);
        context.lineTo(width * .4, height * .77);
        context.lineTo(width * .8, height * .27);

        context.stroke();
        context.closePath();
    }

    toString(){
        return "Shared.FormBuilderObjects.FBObjects.CheckBox, Shared";
    }

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        return this.__toJSON();
    }

    /**
     * Creates a new object from the provided JSON
     * @param {JSON} json - The JSON to use
     * @return {FBImage}
     */
    static from_json(json){
        const checkbox = new CheckBox(null, null, null);
        checkbox.__init_json(json);
        return checkbox;
    }

    // endregion
}