/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
record	: ARIADNE / Any
Classes	: usw.yearspanselect.js
Summary	: years pan query field for use with query builder 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, usw.basecontrol.js
Example	: $('.tmp1').yearspanselect();
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 21/11/2016 CFB Initially created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing
			
	$.widget('usw.yearspanselect', $.usw.basecontrol, {			
		options: {
			yearMin: -3000,
			yearMax: 2000,
			valueMin: -3000,
            valueMax: 2000
		},
		
		_create: function(options) { 
			var self = this;			
			self.options = $.extend({}, self.options, options);
			self._super(self.options);

			$(self.element).addClass("usw-yearspanselect");
			$("<div class='label'/>")
                .css({ "text-align": "center", "margin": "auto", "width": "90%" })
                .appendTo(self.content);
			$("<div class='slider'/>")
                .slider({
                    range: true,
                    min: self.options.yearMin,
                    max: self.options.yearMax,
                    values: [self.options.valueMin, self.options.valueMax],
                    slide: function (event, ui) {
                        $(self.option({ "valueMin": ui.values[0], "valueMax": ui.values[1] }));                       
                        //self._refresh();
                        //$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
                    }
                })
                //.css({ width: "100%" })
				.appendTo(self.content);

		    // query to get min and max year for all timespans in the data
			var sparql = "SELECT Min(?y1) AS ?minn MAX(?y2) AS ?maxx WHERE {\n";
			sparql += "?ts a <" + usw.uri.CRM.E52 + ">; <" + usw.uri.CRM.P82a + "> ?yearMin ; <" + usw.uri.CRM.P82b + "> ?yearMax .\n";
			sparql += " BIND(year(?yearMin) as ?y1) .\nBIND(year(?yearMax) as ?y2) .\n";
			sparql += " FILTER(year(?yearMin) <= 2000 && year(?yearMax) <= 2000) .\n";
			sparql += "}";

			$(self.content).block({ message: "please wait..." });
		    // run query
			$.fn.sparqlquery({
			    query: sparql,
			    context: self,
			    limit: 0,
                offset: 0,
                success: function (data, status, jqXHR) {
                    if (data && data.results && data.results.bindings) {
                        var item = data.results.bindings[0];
                        if (item.minn && item.maxx) {
                            var minn = parseInt(item.minn.value);
                            var maxx = parseInt(item.maxx.value);
                            $(self.option({
                                "yearMin": minn,
                                "valueMin": minn,
                                "yearMax": maxx,
                                "valueMax": maxx
                            }));                            
                        }                       
                    }
                    //self._refresh();
                },
			    error: function (jqXHR, textStatus, errorThrown) { self._refresh(); },
			    complete: function (jqXHR, textStatus) { $(self.content).unblock(); }
			});				
			
			return(self);
		},	
	
		_refresh: function() {
			var self = this;					
			self._super();			   			   		    

			$(".slider:first", self.content).slider({
                min: self.options.yearMin,
                max: self.options.yearMax,
                values: [self.options.valueMin, self.options.valueMax]
			});
			$(".label:first", self.content).text(Math.abs(self.options.valueMin) + (self.options.valueMin < 0 ? " BC" : " AD") + " to " + Math.abs(self.options.valueMax) + (self.options.valueMax < 0 ? " BC" : " AD"));
		}		
		
	});	// end usw.yearspanselect
			
})(jQuery); // end of main jquery closure
