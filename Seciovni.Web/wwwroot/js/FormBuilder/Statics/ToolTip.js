/**
 * Created by David on 2017-02-24.
 */

class ToolTip {
    static show(x, y, text){
        if(!ToolTip.box){
            ToolTip.box = document.createElement("div");
            ToolTip.box.id = "formBuilderToolTip";

            document.getElementById(WYSIWYG_CANVAS_HOLDER_ID).appendChild(ToolTip.box);
        }

        ToolTip.box.style.left = x + "px";
        ToolTip.box.style.top = y + "px";
        ToolTip.box.innerHTML = text;
    }

    static hide(){
        ToolTip.box.removeAttribute("style");
    }
}