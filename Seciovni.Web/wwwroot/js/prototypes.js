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


Math.clip = function(number, min, max){
    return Math.max(min, Math.min(number, max));
};

Array.prototype.move = function(oldIdx, newIdx){
    if (newIdx > this.length) {
        newIdx = this.length;
    }

    this.splice(newIdx, 0, this.splice(oldIdx, 1)[0]);
};