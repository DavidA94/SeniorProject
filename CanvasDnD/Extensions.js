/**
 * Created by David on 10/25/2016.
 */

Math.clip = function(number, min, max){
    return Math.max(min, Math.min(number, max));
};

Array.prototype.move = function(oldIdx, newIdx){
    if (newIdx > this.length) {
        newIdx = this.length;
    }

    this.splice(newIdx, 0, this.splice(oldIdx, 1)[0]);
};