/**
 * Created by David on 11/28/16.
 */

class FBImage extends FBObject {
    constructor(x, y, width, height, imageURL = null){
        super(x, y, width, height);

        /**
         * The source of the image
         * @type {Image}
         * @private
         */
        this._image = new Image();

        this._imageWidth = 0;
        this._imageHeight = 0;

        this._canDraw = false;

        this._image.onerror = () => {
            console.log("failed to find image");
            this._image.src = WYSIWYG_DEFAULT_IMG;
        };

        this._image.onload = () => {
            this._imageWidth = this._image.width;
            this._imageHeight = this._image.height;
            this._canDraw = true;
        };

        this._preserveRatio = true;

        // Set the source of the image
        this.src = imageURL;
    }

    // region Public Properties

    /**
     * The source of the image
     * @return {string}
     */
    get src() { return this._image.src; }

    /**
     * The source of the image
     * @param {string} value
     */
    set src(value){
        console.log("Setting src");
        this._canDraw = false;
        this._image.src = value;
    }

    /**
     * Indicates if the image's ratio should be preserved
     * @return {boolean}
     */
    get preserveRatio() { return this._preserveRatio; }

    /**
     * Indicates if the image's ratio should be preserved
     * @param {boolean} value
     */
    set preserveRatio(value) { this._preserveRatio = value; this.__sendPropChangeEvent("preserveRatio"); }

    // endregion

    // region Public Functions

    getHtmlPropertyData(){
        const retVal = super.getHtmlPropertyData();

        retVal.preserveRatio = this.__makePropertyData("Image", "Preserve Ratio", PropertyType.Checkbox);
        retVal.src = this.__makePropertyData("Image", "Image", PropertyType.File);

        return retVal;
    }

    getHtmlPropertyModelDict(){
        const retVal = super.getHtmlPropertyModelDict();
        retVal.preserveRatio = this.__makeHtmlPropertyModel(this, "preserveRatio");
        retVal.src = this.__makeHtmlPropertyModel(this, "src");

        return retVal;
    }

    // endregion

    // region Private Functions

    /**
     * Draws the image
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    _doDraw(context){
        if(!this._image.src || !this._canDraw) return;

        this._image.width = this.width;

        if(this.preserveRatio){
            this._image.height = this._imageHeight * (this.width / this._imageWidth);

            // If we went the wrong way, reverse it
            if(this._image.height > this.height){
                this._image.height = this.height;
                this._image.width = this._imageWidth * (this.height / this._imageHeight);
            }
        }
        else{
            this._image.height = this.height;

        }

        context.drawImage(this._image, this.x, this.y, this._image.width, this._image.height);
    }

    // endregion
}