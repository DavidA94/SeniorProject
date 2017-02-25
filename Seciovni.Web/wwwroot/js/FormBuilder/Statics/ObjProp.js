/**
 * Created by David on 2017-02-23.
 */

class ObjProp {

    /**
     * @param {string} group - The group this object belongs is
     * @param {string} name - The name to be put in the label
     * @param {PropertyType} type - The type of content this property is
     * @param {string|null} subGroup - The subgroup, if any for this property
     * @returns {{Group: string, SubGroup: string|null, Name: string, Type: PropertyType}}
     */
    static makePropertyData(group, name, type, subGroup = null){
        return {Group: group, SubGroup: subGroup, Name: name, Type: type};
    }

    /**
     * @param {*} object - The object to target
     * @param {string} property - The property on the object to get the get/set for
     * @param {StringValueConverter} setConverter - A method which converts a string to the correct type
     * @param {ValueToStringConverter} getConverter - A method which converts a string to the correct type
     * @returns {{get: (function()), set: (function({string}): boolean)}}
     */
    static makeHtmlPropertyModel(object, property,
                          setConverter = (value) => { return value; },
                          getConverter = (value) => { return value; }){
        return {
            get: () => getConverter(Reflect.get(object, property)),
            set: (value) => Reflect.set(object, property, setConverter(value)),
        };
    }
}