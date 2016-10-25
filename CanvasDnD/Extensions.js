/**
 * Created by dantonuc on 10/25/2016.
 */

Math.clip = function(number, min, max){
    return Math.max(min, Math.min(number, max));
}