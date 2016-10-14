/**
 * Created by David on 10/10/16.
 */

/**
 * Base class for Shapes to allow them to be passed into the BasicShape CTOR
 */
class Shape {
    /**
     * Draws the shape
     * @abstract
     * @param {CanvasRenderingContext2D} context
     * @param {number} scale
     */
    draw(context, scale){
        throw Error("draw function not implemented");
    }

    /**
     * Indicates if the point is within the shape
     * @abstract
     * @param {number} x - The x position
     * @param {number} y - The y position
     * @param {number} scale - The scaling of the shape
     */
    isPointInShape(x, y, scale){
        throw Error("isPointInShape function not implemented");
    }
}