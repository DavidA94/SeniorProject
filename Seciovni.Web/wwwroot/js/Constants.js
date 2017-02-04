/**
 * Created by David on 10/04/16.
 */

// region HTML constants

const CANVAS_HOLDER = "canvasHolder";
const CANVAS_ID = "dnd";
const CANVAS_CONTEXT_MENU_ID = "canvasContextMenu";
const CANVAS_CONTEXT_SEPARATOR = "canvasContextSeparator";
const CANVAS_CONTEXT_CUSTOM = "custom";
const FORM_BUILDER_ID = "formBuilder";
const PROPERTIES = "properties";
const PROPERTIES_FORM = "propForm";
const ZOOM_ID = "zoom";
const SHAPES_ID = "shapes";

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

const EVENT_OBJECT_CHANGE = "shapechange";
const EVENT_PROPERTY_CHANGE = "propertychange";
const EVENT_SCALE_CHANGE = "scalechange";
const EVENT_BEGIN_CAPTION_RESIZE = "beginCaptionResize";
const EVENT_END_CAPTION_RESIZE = "endCaptionResize";
const EVENT_DATA_SAVED = "dataSaved";

// endregion

// region Enums

/**
 * Represents Anchor handles
 * @enum {number}
 */
const Anchor = {
    TopLeft: 0,
    TopRight: 1,
    BottomLeft: 2,
    BottomRight: 3
};

/**
 * Represents what types a property can be
 * @enum {string}
 */
const PropertyType = {
    ABS: "abs",
    Number: "number",
    Color: "color",
    Text: "text",
    FontFamily: "family",
    Checkbox: "checkbox",
    Location: "location",
    Alignment: "alignment",
    File: "text"
};

const FIRST_IDX_AFTER_ANCHORS = 4;

/**
 * Represents valid locations for a caption
 * @enum {int}
 */
let Location = {
    Top: 1,
    Right: 4,
    Bottom: 2,
    Left: 8,
    Center: 16,
    None: 0
};

const CAPTION_TOP_BOTTOM = 3;  // Used for binary operations with Location
const CAPTION_LEFT_RIGHT = 12; // Ditto
const CAPTION_NONE = 0;
const CAPTION_CENTER = 16;

/**
 * Represents the types of cursors that can be returned
 * @enum {string}
 */
const Cursor = {
    Pointer: "pointer",
    TopLeft: "nwse-resize",
    TopRight: "nesw-resize",
    BottomLeft: "nesw-resize",
    BottomRight: "nwse-resize",
    UpDown: "ns-resize",
    LeftRight: "ew-resize",
    ColumnResize: "col-resize",
    RowResize: "row-resize",
    Default: "default",
    Text: "text",
};

/**
 * Font alignment options
 * @enum {string}
 */
const Alignment = {
    Left: "Left",
    Right: "Right",
    Center: "Center"
};

/**
 * Valid web-safe font-families
 * @enum {string}
 */
const FontFamilies = {
    "Arial" : "Arial",
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

/**
 * The border size for the table
 * @type {number}
 */
const TABLE_BORDER_SIZE = 1;

/**
 * The key used for dragging shapes onto the canvas
 * @type {string}
 */
const DRAG_DATA = "shape";

const DRAG_CHECKBOX = "Checkbox";
const DRAG_BOX = "Box";
const DRAG_TABLE = "Table";
const DRAG_ELLIPSE = "Ellipse";
const DRAG_TEXT = "Text";
const DRAG_IMAGE = "Image";


const DEFAULT_IMG = "/CanvasDnD/Images/image.svg";

const AUTH_TOKEN = "AuthorizationToken";
const AUTH_TOKEN_TIME = "AuthorizationTokenTime";

// endregion