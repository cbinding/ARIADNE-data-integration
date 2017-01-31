;(function ($) {    // start of main jquery closure
    "use strict";   // strict mode pragma
   
    $.fn.gethashcode = function (s) {
        var hash = 0, i, chr, len;
        if (s.length === 0) return hash;
        for (i = 0, len = s.length; i < len; i++) {
            chr = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash).toString();
    };

})(jQuery); // end of main jquery closure
