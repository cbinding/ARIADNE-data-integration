/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE / Any
Classes	: usw.resourcelist.js
Summary	: List control  
Require	: jquery-2.X.X.min.js, jquery-ui.min.js
Example	: $('.tmp1').resourcelist({headertext: 'my label'});
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 14/01/2016 CFB created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing

    $.widget('usw.resourcelist',  $.usw.basecontrol, {
        version: "1.0.0",
        // default options
        options: {
            query: "",
            limit: 300, // max number of items to show 
            offset: 0
        },

        // initialization code (runs once only)
        _create: function (options) {
            var self = this;
            // override default options with passed in values, call super 
            self.options = $.extend({}, self.options, options);
            self._super(self.options);

            $(self.content).addClass("usw-resourcelist");

            // add the list element to hold the list items
            $("<ul/>")
                //.css({ width: "100%", "list-style-type": "none" })
                .css({ "list-style-type": "none" })
                .appendTo(self.content);

            return (self);
        },

        // put this.element	back to	how	it was before this script
        destroy: function () {
            var self = this;
            $("ul:first", self.content).remove();
            self.element.removeClass("usw-resourcelist");
        },
        
        // override this for different functionality
        render: function (data) {
            var self = this;

            // clear any existing items from list
            var list = $("ul:first", self.content);
            $(list).html("");

            // if no data is present we don't need to proceed
            if (!data || !data.results || !data.results.bindings)
                return;

            // map returned sparql results json to simpler structure: [ {uri, label, note, lang}, {uri, label, note, lang} ]  
            var arr = $.map(data.results.bindings, function (item) {
                var uri = (item.uri ? item.uri.value : "");
                var label = (item.label ? item.label.value : uri);
                var note = (item.note ? $('<div/>').text(item.note.value).html() : ""); // ensures correct html encoding for notes
                var lang = (item.label ? item.label["xml:lang"] : "");
                return ({ "uri": uri, "label": label + (item.counter ? " [" + item.counter.value + "]" : ""), "note": note, "lang": lang });
            });

            // sort data (case insensitive) by label 
            arr.sort(function (a, b) {
                return (a.label.toLowerCase() < b.label.toLowerCase() ? -1 : 1);
            });
            
            // add each item to the list
            $(arr).each(function (index, item) {
                $(list).append("<li><a href='" + item.uri + "'>" + item.label + "</a></li>");
            });

            // update the footer item count (whether displayed or not)
            $(self.footer).text((data ? data.length : "0") + " items");            
        },

        clear: function() {
            // clear any existing items from the list
            var self = this;
            $("ul:first", self.content).html("");
        },

        _refresh: function () {
            var self = this;
            // clear any existing items
            self.clear();           
            if (self.options.query === "") return;
            // block UI
            $(self.content).block({ message: "please wait..." });
            // run query
            $.fn.sparqlquery({
                query: self.options.query,
                context: self,
                limit: self.options.limit,
                offset: self.options.offset,
                success: function (data, status, jqXHR) { self.render(data); },
                error: function (jqXHR, textStatus, errorThrown) { self.render([]); },
                complete: function (jqXHR, textStatus) { $(self.content).unblock(); }
            });                
        }

    });	// end of widget code


})(jQuery);	//end of main jquery closure
