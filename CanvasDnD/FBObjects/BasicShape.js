/**
 * Created by David on 10/10/16.
 */

class BasicShape extends FBObject {
    constructor(shape){

        if(!(shape instanceof Shape)){
            throw TypeError("shape parameter must be an instance of Shape");
        }

        super();

        /**
         * @private
         * @type {Shape}
         */
        this._shape = shape;
    }

    _propagateDown(eventName, eventData){

    }

    _propagateUp(eventName, eventData){

    }

    /**
     * Draws the shape and its dependencies
     * @param {CanvasRenderingContext2D} context
     * @param {number} scale
     * @private
     */
    _doDraw(context, scale){
        this._shape.draw(context, scale);
    }
}