/**
 * Created by David on 10/04/16.
 */

// region HTML constants

const CANVAS_ID = "dnd";
const CANVAS_CONTEXT_MENU_ID = "canvasContextMenu";
const FORM_BUILDER_ID = "formBuilder";
const PROPERTIES = "properties";
const ZOOM_ID = "zoom";

// endregion

// region Keyboard Keys

const ESCAPE_KEY = 27;

// endregion

// region Page Properties

const PAGE_HEIGHT = 300 * 11;
const PAGE_WIDTH  = 300 * 8.5;
const PAGE_MODE_L = "landscape";
const PAGE_MODE_P = "portrait";

// endregion

// region Custom Subscribable Names

const EVENT_SHAPE_CHANGE = "shapechange";

// endregion

// region Enums

/**
 * Represents Anchor handles
 * @enum {number}
 */
const Anchor = {
    TopLeft: 1,
    TopRight: 2,
    BottomLeft: 3,
    BottomRight: 4
};

/**
 * Represents valid locations for a caption
 * @enum {string}
 */
var CaptionLocation = {
    Top: "Top",
    Right: "Right",
    Bottom: "Bottom",
    Left: "Left",
    Center: "Center",
    None: "none"
};

/**
 * Represents the types of cursors that can be returned
 * @enum {string}
 */
const Cursor = {
    Hand: "hand",
    TopLeft: "nwse-resize",
    TopRight: "nesw-resize",
    BottomLeft: "nesw-resize",
    BottomRight: "nwse-resize",
    UpDown: "ns-resize",
    LeftRight: "ew-resize",
    ColumnResize: "col-resize",
    RowResize: "row-resize",
    Default: "default"
};

/**
 * Font alignment options
 * @enum {string}
 */
const FontAlignment = {
    Left: "left",
    Right: "right",
    Center: "center"
};

/**
 * Valid web-safe font-families
 * @enum {string}
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

// endregion

// region Miscellaneous

/**
 * Have a constant padding away from the shape so that the caption
 * will not butt up against it -- five seems like a nice number.
 * @type {number}
 */
const CAPTION_PADDING = 5;

/**
 * Font Line Height ratio
 * @type {number}
 */
const FLH_RATIO = 1.4;


// endregion