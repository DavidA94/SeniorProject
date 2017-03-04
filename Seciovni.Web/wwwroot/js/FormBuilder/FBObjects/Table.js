/**
 * Created by David on 11/26/16.
 */

class TableFields {
    static get cells() { return "cells"; }
    static get columnWidths() { return "columnWidths"; }
    static get contentHeight() { return "contentHeight"; }
    static get headerHeight() { return "headerHeight"; }
    static get height() { return "height"; }
    static get width() { return "width"; }
}

class Table extends FBObject {

    // region CTOR

    constructor(x, y, width, height){
        super(x, y, width, height);

        /**
         * The height of the header row
         * @type {number}
         * @private
         */
        this._headerHeight = 30;

        /**
         * The height of the content row
         * @type {number}
         * @private
         */
        this._contentHeight = height - 30;

        /**
         * The widths of all the columns
         * @type {number[]}
         * @private
         */
        this._columnWidths = [width];

        /**
         * Used for resizing
         * @type {number}
         * @private
         */
        this._separatorPosBackup = 0;

        this._dragStartX = 0;
        this._dragStartY = 0;

        /**
         *
         * @type {{header: Cell, content: Cell}[]}
         * @private
         */
        this._cells = [];

        const horizontalSep = new Box(0, 0, width, 2 * WYSIWYG_TABLE_BORDER_SIZE);
        horizontalSep.subscribe(MouseEventType.MouseDown, this.__getBoundFunc(this._separator_MouseDown));
        horizontalSep.subscribe(MouseEventType.MouseEnter, this.__getBoundFunc(this._separator_MouseEnter));
        horizontalSep.subscribe(MouseEventType.MouseLeave, this.__getBoundFunc(this._separator_MouseLeave));
        horizontalSep.subscribe(MouseEventType.MouseMove, this.__getBoundFunc(this._separator_MouseMove));
        horizontalSep.subscribe(MouseEventType.MouseUp, this.__getBoundFunc(this._separator_MouseUp));

        /**
         * The spearators between the columns
         * @type {Box[]}
         * @private
         */
        this._separators = [horizontalSep];
        this.children.push(horizontalSep);


        this.border.top = WYSIWYG_TABLE_BORDER_SIZE;
        this.border.right = WYSIWYG_TABLE_BORDER_SIZE;
        this.border.bottom = WYSIWYG_TABLE_BORDER_SIZE;
        this.border.left = WYSIWYG_TABLE_BORDER_SIZE;
        this.border.color = "#000000";

        this.addCol(0);

        // Keep things in sync when we're resized
        this.layout.subscribe(EVENT_PROPERTY_CHANGE, (e) => {
            if(e.propertyName == "width"){
                for(let separator of this._separators){
                    // horizontal bar
                    if(separator.layout.height == 2 * WYSIWYG_TABLE_BORDER_SIZE){
                        separator.layout.width = this.layout.width;
                    }
                }

                this._columnWidths[this._columnWidths.length - 1] += this.width - this._columnWidths.reduce((a, b) => a + b);
            }
            else if(e.propertyName == "height"){
                for(let separator of this._separators){
                    // vertical bar
                    if(separator.layout.width == 2 * WYSIWYG_TABLE_BORDER_SIZE){
                        separator.layout.height = this.layout.height;
                    }
                }

                this._contentHeight = this.height - this._headerHeight;
                this.__sendPropChangeEvent("contentHeight");
            }
        });

        // If this is clicked on, update the focused element, since it may change what cell is focused
        this.subscribe(MouseEventType.MouseDown, (e) => {
            //e.handled = true;
            Keyboard.focusedElement = this;
        });
    }

    // endregion

    // region Public Properties

    get minWidth() {
        if(this._columnWidths.length === 1){
            return 5;
        }

        return this._columnWidths.slice(0, -1).reduce((a, b) => a + b);
    }

    get minHeight() { return this.headerHeight; }


    /**
     * The height of the header row
     * @return {number}
     */
    get headerHeight() { return this._headerHeight; }

    /**
     * The height of the header row
     * @param {number} value
     */
    set headerHeight(value) {

        const moveDist = (value - this._headerHeight);
        this._headerHeight = Math.clip((this.headerHeight + moveDist), 5, this.height - 5);
        this._contentHeight = (this.height - this.headerHeight);

        this.__sendPropChangeEvent("headerHeight");
    }


    /**
     * The height of the content row
     * @return {number}
     */
    get contentHeight() { return this._contentHeight; }

    /**
     * The height of the content row
     * @param {number} value
     */
    set contentHeight(value) {
        if(this._contentHeight != value) {
            this.layout.height -= (this._contentHeight - value);
            //this._contentHeight = value;
            this.__sendPropChangeEvent("contentHeight");
        }
    }

    // endregion

    // region Public Methods

    /**
     * Adds a column to the table
     * @param {number} column - The position of the new column
     * @param {number} suggestedWidth - The desired width (may be smaller)
     */
    addCol(column, suggestedWidth = 90) {

        column = Math.clip(column, 0, this._cells.length);

        const headerCell = new Cell("Header Text", column, 0);
        headerCell.layout.height = this.headerHeight;
        headerCell.borderColor = this.border.color;
        headerCell.background = "#e9e9e9";
        headerCell.font.bold = true;
        headerCell.font.family = FontFamilies.Tahoma;

        const contentCell = new Cell("Content Text", column, 1);
        contentCell.layout.height = this.contentHeight;
        contentCell.borderColor = this.border.color;

        if(this._cells.length == 0){
            // No-op
        }
        else{
            let widthToUse;

            // If it's not the first one
            if(column > 0){
                widthToUse = Math.min(suggestedWidth, this._columnWidths[column - 1] / 2);
                this._columnWidths[column - 1] -= widthToUse;
                this._cells[column - 1].content.layout.width -= widthToUse;
                this._cells[column - 1].header.layout.width -= widthToUse;
            }

            // If it's not the last one and we didn't already set this above
            if(column < this._cells.length && !widthToUse) {
                widthToUse = Math.min(suggestedWidth, this._columnWidths[column] / 2);
                this._columnWidths[column] -= widthToUse;
                this._cells[column].content.layout.width -= widthToUse;
                this._cells[column].header.layout.width -= widthToUse;
            }

            headerCell.layout.width = widthToUse;
            contentCell.layout.width = widthToUse;

            this._addSeparator(column);

            this._columnWidths.splice(column, 0, widthToUse);
        }

        this._cells.splice(column, 0, {header: headerCell, content: contentCell});
        this.__addChild(headerCell);
        this.__addChild(contentCell);
    }

    /**
     * Deletes a column
     * @param {number} column - The column to be deleted
     */
    deleteColumn(column){
        const sep = this._separators.splice(column + 1, 1);
        const col = this._cells.splice(column, 1);
        const width = this._columnWidths.splice(column, 1);

        console.log(width[0]);

        this._columnWidths[this._columnWidths.length - 1] += width[0];
        this.__removeChild(col[0].header);
        this.__removeChild(col[0].content);
        this.__removeChild(sep[0]);
    }

    getCustomContextOptions(){

        let hasFocusedCell = false;
        let i = 0;

        for(; i < this._cells.length; ++i){
            if(this._cells[i].header.isFocused || this._cells[i].content.isFocused){
                hasFocusedCell = true;
                break;
            }
        }

        if(hasFocusedCell){
            const retVal = [
                {text: "Add Column Before", callback: () => { this.addCol(i); }},
                {text: "Add Column After", callback: () => { this.addCol(i + 1); }}
            ];

            if(this._cells.length > 1){
                retVal.push({text: "Remove Column", callback: () => { this.deleteColumn(i); }});
            }

            return retVal;
        }

        return null;
    }

    getBindings() {
        /*if(this.__focusedChild && this.__focusedChild instanceof Cell) {
         const bindings = this.__focusedChild.bindings;

         const retBindings = [];

         for (const id of Object.keys(bindings)) {
         if (bindings[id] === null) {
         bindings[id] = new Binding(id, BindingContext.Repeating);
         bindings[id].options.addEvent('change', () => this.__focusedChild.processBindings());
         }

         retBindings.push(bindings[id]);
         }

         return retBindings;
         }
         else{*/
        const retBindings = [];
        for (const col of this._cells) {
            let bindings = col.header.bindings;

            for (let i = 0; i < 2; ++i) {
                for (const id of Object.keys(bindings)) {
                    if (bindings[id] === null) {
                        bindings[id] = new Binding(id, BindingContext.Repeating);
                        bindings[id].options.addEvent('change', () => this.__focusedChild.processBindings());
                    }

                    retBindings.push(bindings[id]);
                }

                bindings = col.content.bindings;
            }
        }

        return retBindings;
        // }
    }

    getHtmlPropertyData(){
        const retVal = super.getHtmlPropertyData();

        retVal.headerHeight = ObjProp.makePropertyData("Layout", "Header", PropertyType.ABS, "Row Heights");
        retVal.contentHeight = ObjProp.makePropertyData("Layout", "Content", PropertyType.ABS, "Row Heights");

        if(this.__focusedChild && this.__focusedChild instanceof Cell) {
            retVal.cell_text = ObjProp.makePropertyData("Text", "Text", PropertyType.Text, "Cell");
            retVal.cell_font_family = ObjProp.makePropertyData("Text", "Font Family", PropertyType.FontFamily, "Cell");
            retVal.cell_font_size = ObjProp.makePropertyData("Text", "Font Size", PropertyType.ABS, "Cell");
            retVal.cell_font_color = ObjProp.makePropertyData("Text", "Font Color", PropertyType.Color, "Cell");
            retVal.cell_font_color = ObjProp.makePropertyData("Text", "Alignment", PropertyType.Alignment, "Cell");
            retVal.cell_font_bold = ObjProp.makePropertyData("Text", "Bold", PropertyType.Checkbox, "Cell");
            retVal.cell_font_italic = ObjProp.makePropertyData("Text", "Italic", PropertyType.Checkbox, "Cell");
        }

        return retVal;
    }

    getHtmlPropertyModelDict(){
        const retVal = super.getHtmlPropertyModelDict();

        retVal.headerHeight = ObjProp.makeHtmlPropertyModel(this, "headerHeight", ptToPx, pxToPt);
        retVal.contentHeight = ObjProp.makeHtmlPropertyModel(this, "contentHeight", ptToPx, pxToPt);


        if(this.__focusedChild && this.__focusedChild instanceof Cell) {

            retVal.cell_text = ObjProp.makeHtmlPropertyModel(this.__focusedChild, "text");
            retVal.cell_font_family = ObjProp.makeHtmlPropertyModel(this.__focusedChild.font, "family");
            retVal.cell_font_size = ObjProp.makeHtmlPropertyModel(this.__focusedChild.font, "size", ptToPx, pxToPt);
            retVal.cell_font_bold = ObjProp.makeHtmlPropertyModel(this.__focusedChild.font, "bold");
            retVal.cell_font_italic = ObjProp.makeHtmlPropertyModel(this.__focusedChild.font, "italic");
            retVal.cell_font_color = ObjProp.makeHtmlPropertyModel(this.__focusedChild.font, "color");
            retVal.cell_font_color = ObjProp.makeHtmlPropertyModel(this.__focusedChild.font, "alignment");
        }

        return retVal;
    }

    toString(){ return "Seciovni.APIs.WebHelpers.FormBuilder.FBObjects.Table, Seciovni.APIs"; }

    // endregion

    // region JSON

    /**
     * Gets the JSON data for this class
     * @return {Object<string, *>}
     */
    toJSON() {
        const properties = this.__toJSON();
        properties[TableFields.cells] = this._cells;
        properties[TableFields.columnWidths] = this._columnWidths;
        properties[TableFields.contentHeight] = this.contentHeight;
        properties[TableFields.headerHeight] = this.headerHeight;
        properties[TableFields.height] = this.height;
        properties[TableFields.width] = this.width;

        return properties;
    }

    /**
     * Creates a new object from the provided JSON
     * @param {json} json - The JSON to use
     * @return {Table}
     */
    static from_json(json){
        const table = new Table(0, 0, json[TableFields.width], json[TableFields.height]);
        table.__init_json(json);
        table.headerHeight = json[TableFields.headerHeight];
        table.contentHeight = json[TableFields.contentHeight];

        // Update the first column
        const firstCol = json[TableFields.cells][0];
        table._cells[0].header.initialize_json(firstCol.header);
        table._cells[0].content.initialize_json(firstCol.content);

        // Then set the widths
        table._columnWidths = json[TableFields.columnWidths];

        // Then add teh cells
        for(let i = 1; i < json[TableFields.cells].length; ++i){
            const header = new Cell("");
            header.initialize_json(json[TableFields.cells][i]["header"]);

            const content = new Cell("");
            content.initialize_json(json[TableFields.cells][i]["content"]);

            table._addSeparator(i);
            table._cells.splice(i, 0, {header: header, content: content});
            table.__addChild(header);
            table.__addChild(content);
        }

        return table;
    }

    // endregion

    // region Private methods

    /**
     * Adds a separator
     * @param {number} column
     * @private
     */
    _addSeparator(column){
        const newSep = new Box(0, 0, WYSIWYG_TABLE_BORDER_SIZE * 2, this.height);

        newSep.subscribe(MouseEventType.MouseDown, this.__getBoundFunc(this._separator_MouseDown));
        newSep.subscribe(MouseEventType.MouseEnter, this.__getBoundFunc(this._separator_MouseEnter));
        newSep.subscribe(MouseEventType.MouseLeave, this.__getBoundFunc(this._separator_MouseLeave));
        newSep.subscribe(MouseEventType.MouseMove, this.__getBoundFunc(this._separator_MouseMove));
        newSep.subscribe(MouseEventType.MouseUp, this.__getBoundFunc(this._separator_MouseUp));

        this._separators.splice(column + 1, 0, newSep);
        this.__addChild(newSep, true);
    }

    /**
     * Draws the table
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    _doDraw(context){
        context.save();

        let currentXPos = 0;

        for(let i = 0; i < this._cells.length; ++i){
            const column = this._cells[i];

            column.header.layout.x = this.x + currentXPos;
            column.header.layout.y = this.y;
            column.header.layout.width = this._columnWidths[i];
            column.header.layout.height = this.headerHeight;
            column.header.borderColor = this.border.color;

            context.save();
            column.header.draw(context);
            context.restore();

            column.content.layout.x = this.x + currentXPos;
            column.content.layout.y = this.y + this.headerHeight;
            column.content.layout.width = this._columnWidths[i];
            column.content.layout.height = this.contentHeight;
            column.content.borderColor = this.border.color;

            context.save();
            column.content.draw(context);
            context.restore();

            currentXPos += this._columnWidths[i];
        }

        if(this._separators.length > 0) {
            this._separators[0].layout.y = this.y + this.headerHeight - WYSIWYG_TABLE_BORDER_SIZE;
            this._separators[0].layout.x = this.x;
            this._separators[0].appearance.background = this.border.color;

            context.save();
            this._separators[0].draw(context);
            context.restore();

            currentXPos = 0;

            for (let i = 1; i < this._separators.length; ++i) {
                currentXPos += this._columnWidths[i - 1];

                this._separators[i].layout.x = this.x + currentXPos - WYSIWYG_TABLE_BORDER_SIZE;
                this._separators[i].layout.y = this.y;
                this._separators[i].appearance.background = this.border.color;

                context.save();
                this._separators[i].draw(context);
                context.restore();
            }
        }

        context.restore();
    }

    // endregion

    // region Event Handlers

    _separator_MouseDown(e){
        this._dragStartX = e.x;
        this._dragStartY = e.y;

        // If it's vertical
        if(e.sender.layout.width === 2 * WYSIWYG_TABLE_BORDER_SIZE){
            this._separatorPosBackup = this._columnWidths[this._separators.indexOf(e.sender) - 1];
        }
        else{
            this._separatorPosBackup = this.headerHeight
        }

        e.sender.setCapture();
        e.handled = true;
    }

    _separator_MouseEnter(e){
        e.handled = true;

        // If it's vertical
        if(e.sender.layout.width === 2 * WYSIWYG_TABLE_BORDER_SIZE){
            Mouse.setCursor(Cursor.ColumnResize);
        }
        else {
            Mouse.setCursor(Cursor.RowResize);
        }
    }

    _separator_MouseLeave(e){
        Mouse.setCursor(Cursor.Default);
    }

    _separator_MouseMove(e){

        if(this._dragStartX > 0 && this._dragStartY > 0) {

            e.handled = true;

            // Find the index of the separator
            const sepIdx = this._separators.indexOf(e.sender);

            // If it's the first one, we have the row separator
            if(sepIdx === 0){
                const moveDist = e.y - this._dragStartY;

                this.headerHeight = Math.clip((this._separatorPosBackup + moveDist), 5, this.height - 5);
                this.contentHeight = (this.height - this.headerHeight);
            }
            else{
                const moveDist = e.x - this._dragStartX;

                const totalWidth = this._columnWidths[sepIdx - 1] + this._columnWidths[sepIdx];
                const newLeftColumn = Math.clip((this._separatorPosBackup + moveDist), 5, totalWidth - 5);

                this._columnWidths[sepIdx - 1] = newLeftColumn;
                this._columnWidths[sepIdx] = totalWidth - newLeftColumn;
            }
        }
    }

    _separator_MouseUp(e){
        this._dragStartX = this._dragStartY = 0;
        // this.commitResize();
    }

    // endregion
}