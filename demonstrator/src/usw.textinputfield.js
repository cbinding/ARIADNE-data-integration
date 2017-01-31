/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
record	: ARIADNE / Any
Classes	: usw.textinputfield.js
Summary	: text input query field for use with query builder 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, usw.basecontrol.js
Example	: $('.tmp1').textinputfield();
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 14/01/2016 CFB adapted from components in STAR.UI.js
TODO: implement startsWith, contains, endsWith, caseSensitive on text fields
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing
			
	$.widget('usw.textinputfield', $.usw.basecontrol, {			
		options: {
			value: "",
			placeholder: "Enter value"
		},
		
		_create: function(options) { 
			var self = this;
			self._super(options);
			
			$(self.element).addClass("usw-textinputfield");					
		    $("<input type='search'/>")
                .attr("placeholder", self.options.placeholder)
				.attr("autocomplete", "on")						
				.css({ width: "100%" })
				.appendTo(self.content)					
				.mouseover(function() {
					$(this).focus();
				})
				.keyup(function() {
					$(self.option("value", $(this).val()));
					$(self.element).trigger('valueChanged'); 
				})
				.change(function() {
					$(self.option("value", $(this).val()));
					$(self.element).trigger('valueChanged'); 
				});
			
			self._refresh();					
			return(self);
		},	
	
		_refresh: function() {
			var self = this;					
			self._super();	
			$("input:first", self.content)
				.attr("placeholder", self.options.placeholder)
				.val(self.options.value);
		}		
		
	});	// end usw.textinputfield
			
})(jQuery); // end of main jquery closure
