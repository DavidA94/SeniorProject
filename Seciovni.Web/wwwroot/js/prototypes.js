/**
 * Created by David on 01/31/17.
 */

Date.prototype.getPrettyUTCDate = function() {
    const year = this.getUTCFullYear();

    let month = this.getUTCMonth() + 1;
    if(month < 10) month = "0" + month;

    let date = this.getUTCDate() + 1;
    if(date < 10) date = "0" + date;

    return year + "-" + month + "-" + date;
};