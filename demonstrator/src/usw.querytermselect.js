/*jslint browser: true, nomen: true, white: true, unparam: true */
/*global $, jQuery, alert, usw*/
/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE - data integration exercise
Classes	: usw.querytermselect.js
Summary	: List f terms to select single value from
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, usw.basecontrol.js, fn.sparqlquery.js
Example	: $("#div1").querytermselect();
License	: http://creativecommons.org/licenses/by/3.0/
===============================================================================
History

03/02/2016 CFB Adapted from usw.seneschal.querytermsuggest.js
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing
   
    $.widget("usw.querytermselect", $.usw.basecontrol, { //start of widget code
        
        // default options
        options: {
            useCache: true,
            query: "",
            value: "",
            limit: 0, // max number of items to show in drop down results box    
            offset: 0
        },

        // initialization code (runs once only)
        _create: function (options) {
            var self = this;
            self.options = $.extend({}, self.options, options);
            self._super(self.options);
                        
            $(self.element).addClass("usw-querytermselect");

            $("<select/>")                
                .css({ width: "100%", "background-color": "ButtonFace" })
                .change(function() {
                    $(self.option("value", $(this).val()));
                })                
                .appendTo(self.content);
            
            self._refresh();
            return (self);
        },

        // put this.element	back to	how	it was before this script
        destroy: function () {
            var self = this;
            self.element.removeClass("usw-querytermselect");            
        },

        _setOption: function (key, value) {
            var self = this;
            self._superApply(arguments);
            self._refresh();

            if (key === "query") {
                // use previously cached data (if present)
                var id = $.fn.gethashcode(value);
                var data = $(document.body).data(id);
                if (data) {
                    self.render(data);
                }
                else {
                    $.fn.sparqlquery({
                        query: value,
                        context: self,
                        limit: self.options.limit,
                        offset: self.options.offset,
                        success: function (data, status, jqXHR) {
                            // cache retrieved data for next time
                            $(document.body).data(id, data);
                            self.render(data);
                        }
                    });
                }
            }
        },

        
       
        /*_refresh: function () {
            var self = this;
            self._super();
            if(self.options.query === "") return;

            
        },*/

        render: function(data) {
            var self = this;           

            // result items may already be sorted, but ensure case insensitive sorting by label prior to display
            data.results.bindings.sort(function (a, b) {
                return ((a.label || "").value || "").toLowerCase() < ((b.label || "").value || "").toLowerCase() ? -1 : 1;
            });

            // sort	data alphabetically by label
            /*$(data).sort(function (a, b) {
                var lblA = $(a).attr("label"),
					lblB = $(b).attr("label");
                if (lblA < lblB) { return -1; }
                if (lblA > lblB) { return 1; }
                return 0;
            });*/

            // clear any existing options from select element
            var selectElement = $("select:first", self.content);
            $(selectElement).html("");
            $(data.results.bindings).each(function (index, item) {            
               
                var uri = item.uri ? item.uri.value : "";
                var label = item.label ? item.label.value : uri;
                var count = item.counter ? item.counter.value : 0;
               
                var s = label.length > 50 ? label.substring(0, 50) + "..." : label; // only display first 50 characters - prevent wide dropdown box
                $(selectElement).append("<option class='aat' title='" + label + "' value='" + uri + "'>" + s + (count > 0 ? " [" + count + "]":"") + "</option>");
            });
            $(self.option("value",  $(selectElement).val()));
        }       

    });	// end of widget code
   

})(jQuery);	//end of main jquery closure
