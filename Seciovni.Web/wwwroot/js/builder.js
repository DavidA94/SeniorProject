/**
 * Created by David on 2017-04-14.
 */

/**
 * The type of object makeHtmlElem needs
 * @name HtmlElemData
 * @type {Object}
 * @property [string] tag - The HTML tag name
 * @property [string] class - The element's class
 * @property [string] text - The element's text / innerHTML
 * @property [HtmlElemData[]] children - The children that go inside this element
 */


/**
 * Creates an HTML element from the given data
 * @param {HtmlElemData} data
 */
function makeHtmlElem(data){
    const elem = document.createElement(data.tag);

    for(const prop in data){
        if(prop === "tag") {} // Skip this one
        else if(prop === "class") elem.className = data.class;
        else if(prop === "children"){
            for(const childData of data.children){
                elem.appendChild(makeHtmlElem(childData));
            }
        }
        else if(prop === "text") elem.innerHTML = data.text;
        else elem.setAttribute(prop, data[prop]);
    }

    return elem;
}

/**
 * Creates a new HtmlElemData object for a span
 * @param {string} text - The text inside the span
 * @param {string} [className] - The class for the span
 * @return {HtmlElemData}
 */
function makeSpanData(text, className){
   return {
       tag: "span",
       class: className,
       text: text,
   };
}

/**
 * Creates a new HtmlElemData object for a div
 * @param {string} text - The text inside the div
 * @param {string} [className] - The class for the div
 * @return {HtmlElemData}
 */
function makeDivData(text, className){
    return {
        tag: "div",
        class: className,
        text: text,
    };
}