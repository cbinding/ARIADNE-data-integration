/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE / Any
Classes	: usw.basecontrol.js
Summary	: Base collapsible control for other controls to inherit from 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js
Example	: $('.tmp1').basecontrol({headertext: 'my label'});
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 14/01/2016 CFB adapted from original components in STAR.UI.js
===============================================================================
*/
;(function ($) {             // start of main jquery closure
	"use strict";            // strict mode pragma
	$.support.cors = true;   // cross-origin resource sharing	
	
    $.widget('usw.basecontrol', {
        version: "1.0.0",
		options: {
		    headertext: '',
		    footertext: '',
			showheader: true,
			showcontent: false,
            showfooter: false, 
			collapsible: true
		},
		
		_create: function(options) { 
			var self = this;
			self.options = $.extend(true, {}, self.options, options);
			$(self.element).css({ "padding": "2px" }).addClass("usw-basecontrol");
			//$(self.element).css({padding: 1});
			// wrap existing content into content element
			self.content = $("<div class='usw-basecontrol-content'/>");
			$(self.element).wrapInner(self.content);
			
			// Append any additional content passed in 
			if(self.options.content) {	
				$(self.content).append(self.options.content);
			}
			
			// prepend the header and label elements
			self.header = $("<div class='usw-basecontrol-header'/>").prependTo(self.element);
		    $("<span class='usw-basecontrol-header-lbl'/>")
                .css({ "font-weight": "bold" })
                .text(self.options.headertext)
			    .appendTo(self.header);

            // append the footer element (currently unused)
			self.footer = $("<div class='usw-basecontrol-footer'/>")
                .css({ display: "none" })
                .text(self.options.footertext)
                .appendTo(self.element);

			// add header controls for collapsible behaviour
			if(self.options.collapsible) {
				var ctl = $("<span class='usw-basecontrol-header-ctl'/>")
					.css({ "cursor": "pointer", "vertical-align": "middle", "float":"right"})
                    .appendTo(self.header);
					//.prependTo(self.header);
				$("<img class='usw-basecontrol-header-img'/>")
					.css({ "margin-right": "5px" })
                    /*.click(function () {
                        self.option("showcontent", !self.options.showcontent);
                        $(self.element).trigger('fieldChanged');
                        return false;
                    })*/
					.appendTo(ctl);

			    /*$("<img class='usw-basecontrol-help-img'/>")
			        .attr("src", "./img/help.png")
                    .attr("title", "what's this?")
					.css({ "margin-right": "5px" })
                    .click(function () {
                        //todo - display help page srolled to pertinent section...
                        //self.option("showcontent", !self.options.showcontent);
                        //$(self.element).trigger('fieldChanged');
                        return false;
                    })
					.appendTo(ctl);*/
					
			    $(self.header)
                    .css({"cursor": "pointer"})
					.mouseover(function() {
						$(this).addClass("highlight");
					})
					.mouseout(function() {
						$(this).removeClass("highlight");
					})
					.click(function() {						
						self.option("showcontent", !self.options.showcontent);	
						$(self.element).trigger('fieldChanged'); 
						return false;
					});			
			}

		    // fire	an event to	notify other controls when any list item 
		    // link is clicked, instead of actually following the link
			$(self.content).on("click", "a", function () {
			    var uri = $(this).attr('href'), label = $(this).text();
			    $(self.element).trigger("selected", { "uri": uri, "label": label });
			    return false;
			});
						
		    self._refresh();
			return(self);
		},

		_setOptions: function (options) {
		    var self = this;
		    self._super(options);
		    self._refresh();
		},

		_setOption: function(key, value) {
		    var self = this;
		    if (self.options[key] !== value) {
		        self._super(key, value);
		        //self._refresh();
		    }		    
		},

        _refresh: function() {
			var self = this;					
			$(".usw-basecontrol-header-lbl:first", self.header).text(self.options.headertext);
			$(self.footer).text(self.options.footertext);
			
			if (self.options.collapsible) {
			    $(self.content).css({ "padding-left": "15px" });
			}

			// show or hide the header according to option set
			if(self.options.showheader)
				$(self.header).show(); 
			else
			    $(self.header).hide();

		    // show or hide the footer according to option set
			if (self.options.showfooter)
			    $(self.footer).show();
			else
			    $(self.footer).hide();
							
		    // show or hide the content according to option set
			var img = $('.usw-basecontrol-header-img:first', self.element);
			if(self.options.showcontent) {
			    //img.attr("src", "./img/delete.png"); 
			    img.attr("src", "./img/collapse.gif");
				self.content.show();						
			}
			else {
			    //img.attr("src", "./img/add.png"); 
			    img.attr("src", "./img/expand.gif");
				self.content.hide();						
			}	
		},	
		
		_destroy: function(){
			var self = this;
			
			self.element.removeClass("usw-basecontrol");					
			$(self.header).remove();
			$(self.content).remove();
			$(self.footer).remove();
			self._destroy();
		}	

	}); // end usw.basecontrol
			
})(jQuery); // end of main jquery closure
