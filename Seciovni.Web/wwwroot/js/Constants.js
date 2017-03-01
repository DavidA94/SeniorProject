// region Callbacks

/**
 * @callback MouseEventCallback
 * @param {MouseEvent} e
 */

/**
 * @callback StringValueConverter
 * @param {string} - The value to be converted
 * @returns {*}
 */

/**
 * @callback ValueToStringConverter
 * @param {*} - The value to be converted
 * @returns {string}
 */

const do_not_use = "this is here to make things stop auto-indenting after this section";

// endregion

// region Classes

const CONTACT_PREVIEW_CLASSES = "contactPreviewItem row";

const CONTEXT_MENU_SEPARATOR_CLASS = "contextSeparator";

// endregion

// region Custom Subscribable Event names

const EVENT_DATA_SAVED = "dataSaved";
const EVENT_OBJECT_CHANGE = "shapechange";
const EVENT_OBJECT_DESTROYED = "objectdestroyed";
const EVENT_PROPERTY_CHANGE = "propertychange";
const EVENT_SCALE_CHANGE = "scalechange";

// endregion

// region data-* attributes

const ATTRIBUTE_BIND = "data-bind";
const ATTRIBUTE_COLUMN = "data-column";
const ATTRIBUTE_ERROR = "data-error";
const ATTRIBUTE_FOUND_RESULT = "data-foundResult";
const ATTRIBUTE_SEARCH = "data-search";

// endregion

// region data-* CSS Queries

const BIND_QUERY = "*[" + ATTRIBUTE_BIND + "]";

// endregion

// region Enums

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
 * Represents the different types of binding fields
 * @enum {number}
 */
const BindingContext = {
    Both: 0,
    Repeating: 1,
    Single: 2
}

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
 * Represents the types of documents there can be
 * @enum {int}
 */
const DocumentType = {
    "One per Invoice": 0,
    "One per Vehicle": 1
};

const DOC_ONE_PER_INV = DocumentType["One per Invoice"];
const DOC_ONE_PER_VEH = DocumentType["One per Vehicle"];

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

/**
 * Represents valid locations for a caption
 * @enum {int}
 */
const Location = {
    Top: 1,
    Right: 4,
    Bottom: 2,
    Left: 8,
    Center: 16,
    None: 0
};

/**
 * Represents page orientation options
 * @enum {number}
 */
const Orientation = {
    Landscape: 0,
    Portrait: 1
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
    File: "text",
    Orientation: "orientation",
    DocumentType: "documentType",
};

// endregion

// region IDs

const CONTEXT_MENU_ID = "contextMenu";

const INVOICE_CHOSEN_CONTACT_ID = "chosenContact";
const INVOICE_CONTACTS_LIST_HEADER_ID = "contactsListHeader";
const INVOICE_CONTACTS_LIST_ID = "contactsList";
const INVOICE_CONTACTS_LIST_OUTER_ID = "contactsListOuter";
const INVOICE_CONTACTS_SEARCH_INPUT_ID = "contactSearchInput";
const INVOICE_CUSTOMER_CLOSE_ID = "hideCustomerButton";
const INVOICE_CUSTOMER_DATA_ID = "invoiceCustomerData";
const INVOICE_CUSTOMER_NEW_ID = "newCustomer";
const INVOICE_CUSTOMER_OPEN_ID = "openCustomerButton";
const INVOICE_CUSTOMER_SHOW_CONTACTS_ID = "showContacts";
const INVOICE_DOC_FEE_ID = "docFee";
const INVOICE_DOWN_PAYMENT_ID = "downPayment";
const INVOICE_LIEN_CLOSE_ID = "closeLienButton";
const INVOICE_LIEN_DATA_ID = "invoiceLienHolderData";
const INVOICE_LIEN_OPEN_ID = "openLienButton";
const INVOICE_MISC_CHARGE_ID = "miscChargeTemplate";
const INVOICE_PAYMENT_TEMPLATE_ID = "paymentTemplate";
const INVOICE_PAYMENTS_CLOSE_ID = "closePaymentsButton";
const INVOICE_PAYMENTS_DATA_ID = "paymentsData";
const INVOICE_PAYMENTS_OPEN_ID = "openPaymentsButton";
const INVOICE_RECENT_INVOICES_TABLE_ID = "recentInvoicesList";
const INVOICE_SHOW_CUSTOM_ID = "showCustom";
const INVOICE_STATE_ID = "invoiceState";
const INVOICE_TAX_ID = "tax";
const INVOICE_TOTAL_ID = "invoiceTotalDue";
const INVOICE_TOTAL_PAYMENTS_ID = "totalPayments";
const INVOICE_TOTAL_PAYMENTS_INNER_ID = "totalPaymentsInner";
const INVOICE_VEHICLE_TEMPLATE_ID = "vehicleTemplate";

const WYSIWYG_CANVAS_HOLDER_ID = "canvasHolder";
const WYSIWYG_CANVAS_ID = "editor";
const WYSIWYG_PROPERTIES_FORM_ID = "propForm";
const WYSIWYG_PROPERTIES_ID = "properties";
const WYSIWYG_SHAPES_ID = "shapes";
const WYSIWYG_ZOOM_ID = "zoom";

// endregion

// region Keyboard Keys

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

// endregion

// region Miscellaneous

/**
 * The key used for the authorization token in the local data
 * @type {string}
 */
const AUTH_TOKEN = "AuthorizationToken";

/**
 * The key used for the authorization token expiration time in the local data
 * @type {string}
 */
const AUTH_TOKEN_TIME = "AuthorizationTokenTime";

// region WYSIWYG

const WYSIWYG_PAGE_PPI = 72;
const WYSIWYG_ANCHOR_COUNT = 4;
const WYSIWYG_PAGE_HEIGHT = WYSIWYG_PAGE_PPI * 11;
const WYSIWYG_PAGE_WIDTH  = WYSIWYG_PAGE_PPI * 8.5;
const WYSIWYG_TITLE_ID = "builderTitle";

const WYSIWYG_CAPTION_TOP_BOTTOM = 3;  // Used for binary operations with @see Location
const WYSIWYG_CAPTION_LEFT_RIGHT = 12; // Ditto
const WYSIWYG_CAPTION_CENTER = 16;     // Ditto

const WYSIWYG_DRAG_CHECKBOX = "Check";
const WYSIWYG_DRAG_BOX = "Box";
const WYSIWYG_DRAG_TABLE = "Table";
const WYSIWYG_DRAG_ELLIPSE = "Ellipse";
const WYSIWYG_DRAG_TEXT = "Text";
const WYSIWYG_DRAG_IMAGE = "Image";

const WYSIWYG_CAPTION_AUTO = -1;

/**
 * Have a constant padding away from the shape so that the caption
 * will not butt up against it -- five seems like a nice number.
 * @type {number}
 */
const WYSIWYG_CAPTION_PADDING = 5;

/**
 * The key used for dragging shapes onto the canvas
 * @type {string}
 */
const WYSIWYG_DRAG_DATA = "shape";

/**
 * Font Line Height ratio
 * @type {number}
 */
const WYSIWYG_FLH_RATIO = 1.4;

/**
 * The border size for the table
 * @type {number}
 */
const WYSIWYG_TABLE_BORDER_SIZE = 1;

/**
 * The default image for when an image is being added to the WYSIWYG form
 * @type {string}
 */
const WYSIWYG_DEFAULT_IMG = "/images/FormBuilder/image.svg";

// endregion

// endregion
