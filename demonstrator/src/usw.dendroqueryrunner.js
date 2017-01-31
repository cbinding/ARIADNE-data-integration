/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE
Classes	: usw.dendroqueryrunner.js
Summary	: Run built dendro SPARQL query and render the results 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, fn.sparqlquery.js
Example	: $('.tmp1').dendroqueryrunner();
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 21/01/2016 CFB Initially created script
===============================================================================
*/	
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing
	
    $.widget('usw.dendroqueryrunner', $.usw.resourcelist, {
        options: {
            collapsible: false,
            showheader: false,
            showcontent: true,
            showfooter: false,
		    //query: "SELECT * WHERE { ?s ?p ?o }"
		    query: ""
		},
		
		// TODO - counter, paging controls (using LIMIT/OFFSET)
		_create: function(options){
			var self = this;			
			self.options = $.extend({}, self.options, options);
			self._super(self.options);
			
			$(self.content).css({
			    border: "1px solid lightgray",
			    "overflow-y": "scroll",
                padding: "5px",
			    //width: "100%",
			    height: "500px"			    
			});		
		},			
               
		render: function (data) {
			var self = this;
		    
			if (!data || !data.results || !data.results.bindings)
			    return;

			// clear the current results list 
			var list = $("ul:first", self.content).html("");
			
			// case insensitive sorting of results based on 'label' prior to display
			//data.results.bindings.sort(function (a, b) {
				//return a.label.value.toLowerCase() < b.label.value.toLowerCase() ? -1 : 1;
			//});	
			
			// add each result item to the list as a new listitem element
			$(data.results.bindings).each(function (index, item) {
			    var uri = "";
			    var cssclass= "";
			    var label = "";
			    var source = "";
			    var note = "";
			    var language = "en";

			    if (item.uri) { uri = item.uri.value; cssclass = ""; }
			    if (item.record) { uri = item.record.value; cssclass = "usw-dendro-record"; }
			    if (item.object) { uri = item.object.value; cssclass = "usw-dendro-object"; }
			    if (item.sample) { uri = item.sample.value; cssclass = "usw-dendro-sample"; }
			    
			    if (item.label) { 
			        label = $('<div/>').text(item.label.value).html(); // ensures correct html encoding
			        language = item.label["xml:lang"] || "";
			    }
			    else
			        label = uri;

			    if (item.source)
			        source = $('<div/>').text(item.source.value).html(); // ensures correct html encoding	

                 if (item.note) {			        
			        note = $('<div/>').text(item.note.value).html(); // ensures correct html encoding			        
			    }			    
				
				// if uri is blank it's just a literal value, otherwise create a link
			    if (uri === "") {
			       $("<li/>")
                        .addClass(cssclass)
                        .attr("xml:lang", language)
                        .text(label)
                        .appendTo(list);				   
				}
				else {
			        var li = $("<li/>")
                        .addClass(cssclass)
                        .appendTo(list);
				    $("<a/>")
                        .attr("href", uri)
                        .attr("xml:lang", language)
                        .text(label)                        
			            .appendTo(li);
			        $("<span/>")
                        .text(" (source: '" + source + "')")
                        .css({"font-style": "italic"})
			            .appendTo(li);

			        // toggle full display of longer notes (could make this into a reusable widget?)
			        const MAXVISIBLENOTELENGTH = 80;
			        if (note.length > MAXVISIBLENOTELENGTH) {
			            var p = $("<p/>")
                            .text(note.substring(0, MAXVISIBLENOTELENGTH))
                            .appendTo(li);
			            var more = $("<span/>")                            
                            .text(note.substring(MAXVISIBLENOTELENGTH))
                            .hide()
                            .appendTo(p);

			            var toggler = $("<span><span>...</span><br><img></span>").appendTo(p);
			            $("img:first", toggler)
                            .attr("src", "./img/expand.gif")			            
                            .css({
                                cursor: "pointer",
                                background: "lightgray",
                                "padding-left": "3px",
                                "padding-right": "3px"
                            })
                            .mouseover(function () {
                                $(this).css({background: "lightyellow"});
                            })
                            .mouseleave(function () {
                                $(this).css({ background: "lightgray" });
                            })
                            .click(function () {
                                $(more).toggle();
                                $("span:first",toggler).text($(more).is(":visible") ? "" : "...");
                                $(this).attr("src", $(more).is(":visible") ? "./img/collapse.gif" : "./img/expand.gif");
                                //$(this).text($(more).is(":visible") ? "[<<]" : "[>>]");
                            })
                            .appendTo(p);
			        }
			        else {
			            $("<p/>")
                            .text(note)
                            .appendTo(li);
			        }
			        	    
				}
			});			
		}
	}); // end usw.dendroqueryrunner
	
})(jQuery); // end of main jquery closure
