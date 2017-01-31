/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE / Any
Classes	: usw.dendrosamplequery.js
Summary	: dendro sample query field for use with query builder 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, usw.basecontrol.js, usw.textinputfield.js
Example	: $('.tmp1').dendrosamplequery();
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 21/01/2016 CFB Initially created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
	"use strict";           // strict mode pragma
	$.support.cors = true;  // cross-origin resource sharing	    
	
	$.widget('usw.dendrosamplequery', $.usw.basecontrol, { 
		options: {
			isnested: false
		},
		
		_create: function(options) { 
			var self = this;					
			self._super();	
			
			$(self.content).addClass("usw-dendro-sample-query");
			$(self.content).addClass("usw-dendro-sample");
			$("<div class='usw-dendro-sample-id'/>").textinputfield({ headertext: "Sample identifier" }).appendTo(self.content);
			$("<div class='usw-dendro-sample-note'/>").textinputfield({headertext: "Sample note contains"}).appendTo(self.content);	
			if(!self.options.isnested) {
				$("<div class='usw-dendro-sample-object'/>")
					.dendroobjectquery({
						headertext: "Sample of object", 
						isnested: true,
						showheader: true,
						showcontent: false,
						collapsible: true
					}).appendTo(self.content);	
			
			    $("<div class='usw-dendro-sample-record'/>")
					.dendrorecordquery({
					    headertext: "Sample referenced by record",
					    isnested: true,
					    showheader: true,
					    showcontent: false,
					    collapsible: true
					}).appendTo(self.content);
			}
		},	

		// build SPARQL query based on current status of query fields					
		getSparqlBody: function(varname) {
			var self = this;
			var ctl, value;
			varname = (varname || "sample").trim();

			var q = "?" + varname + " a <" + usw.uri.CRM.E22 + ">; <" + usw.uri.CRM.P2 + "> <http://vocab.getty.edu/aat/300028875> .\n"; // "samples"
		    	    
			// sample-id
			ctl = $(".usw-dendro-sample-id:first", self.content);
			value = ctl.textinputfield("option", "showcontent") === true? ctl.textinputfield("option", "value").trim() : "";
			if (value !== "") {
			    q += " ?" + varname + " <" + usw.uri.CRM.P1 + "> [<" + usw.uri.RDFS.LABEL + "> '" + value + "'] .\n";			   
			}		    
		
			// sample-note
			ctl = $(".usw-dendro-sample-note:first", self.content);
			value = ctl.textinputfield("option", "showcontent") === true? ctl.textinputfield("option", "value").trim() : "";
			if (value !== "") {
			    q += " ?" + varname + " <" + usw.uri.CRM.P3 + "> ?" + varname + "note .\n";
			    //q += " FILTER regex(?" + varname + "note,'" + value + "','i') .\n";
			    q += "FILTER(bif:contains(?" + varname + "note, \"'" + value + "'\")) .\n";
			}
			
			// sample-object
			if(!self.options.isnested) {	
				ctl = $(".usw-dendro-sample-object:first", self.content);
				if(ctl.dendroobjectquery("option", "showcontent") === true) {	
					q += " ?" + varname + "sampling <" + usw.uri.CRM.P112 + "> ?" + varname + "object .\n";
					q += " ?" + varname + "sampling <" + usw.uri.CRM.P113 + "> ?" + varname + " .\n";
					q += ctl.dendroobjectquery("getSparqlBody", varname + "object");
				}
			}

		    // sample-record
			if (!self.options.isnested) {
			    ctl = $(".usw-dendro-sample-record:first", self.content);
			    if (ctl.dendrorecordquery("option", "showcontent") === true) {
			        q += " ?" + varname + " <" + usw.uri.CRM.P67i + "> ?" + varname + "record .\n";
			        q += ctl.dendrorecordquery("getSparqlBody", varname + "record");
			    }
			}

			return q;
		},

		getSparqlQuery: function (varname) {
		    var self = this;
		    varname = (varname || "sample").trim();

		    var sparql = "SELECT DISTINCT ?" + varname + " ?label ?note ?source WHERE { \n";
		    sparql += self.getSparqlBody(varname);
		    sparql += "OPTIONAL { ?" + varname + " <" + usw.uri.RDFS.LABEL + "> ?label }\n";
		    sparql += "OPTIONAL { ?" + varname + " <" + usw.uri.CRM.P3 + "> ?note }\n";
		    sparql += "OPTIONAL { ?" + varname + " <" + usw.uri.CRM.P67i + "> [ a <http://rdfs.org/ns/void#Dataset>; <" + usw.uri.RDFS.LABEL + "> ?source ] }\n";
		    sparql += "}\n";
		    return sparql;
		},
	
		/*_refresh: function() {
			var self = this;					
			self._super();					
		}	*/				
	});	// end usw.dendrosamplequery
	
})(jQuery); // end of main jquery closure
