/**
 * Created by David on 11/28/16.
 */

class FBImageFields {
    static get imgSrc() { return "imgSrc"; }
    static get preserveRatio() { return "preserveRatio"; }
}

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

        this._boundOnError = this._image_onerror.bind(this);
        this._boundOnLoad = this._image_onload.bind(this);

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
        this._image.removeEventListener('error', this._boundOnError);
        this._image.removeEventListener('load', this._boundOnLoad);

        this._image = new Image();
        this._image.addEventListener('error', this._boundOnError);
        this._image.addEventListener('load', this._boundOnLoad);

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

        retVal.preserveRatio = ObjProp.makePropertyData("Image", "Preserve Ratio", PropertyType.Checkbox);
        retVal.src = ObjProp.makePropertyData("Image", "Image", PropertyType.File);

        return retVal;
    }

    getHtmlPropertyModelDict(){
        const retVal = super.getHtmlPropertyModelDict();
        retVal.preserveRatio = ObjProp.makeHtmlPropertyModel(this, "preserveRatio");
        retVal.src = ObjProp.makeHtmlPropertyModel(this, "src");

        return retVal;
    }

    toString() {
        return "Shared.FormBuilderObjects.FBObjects.FBImage, Shared";
    }

    // endregion

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = this.__toJSON();
        properties[FBImageFields.imgSrc] = decodeURIComponent(this.src.substring(this.src.lastIndexOf("/") + 1));
        properties[FBImageFields.preserveRatio] = this.preserveRatio;

        return properties;
    }

    /**
     * Creates a new object from the provided JSON
     * @param {JSON} json - The JSON to use
     * @return {FBImage}
     */
    static from_json(json){
        const fbImage = new FBImage(null, null, null, null);
        fbImage.__init_json(json);
        fbImage.preserveRatio = json[FBImageFields.preserveRatio];
        fbImage.src = WYSIWYG_IMAGE_BASE_PATH + json[FBImageFields.imgSrc];

        return fbImage;
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

    _image_onerror(){
        console.log("failed to find image");
        this._image.src = WYSIWYG_DEFAULT_IMG;
    }

    _image_onload(){
        this._imageWidth = this._image.width;
        this._imageHeight = this._image.height;
        this._canDraw = true;
    }

    // endregion
}