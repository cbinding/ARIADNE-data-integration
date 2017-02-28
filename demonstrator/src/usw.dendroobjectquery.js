/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE / Any
Classes	: usw.dendroobjectquery.js
Summary	: dendro object query field for use with query builder 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, usw.basecontrol.js, usw.textinputfield.js
Example	: $('.tmp1').dendroobjectquery();
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 21/01/2016 CFB Initially created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;	// cross-origin resource sharing	    
			
	$.widget('usw.dendroobjectquery', $.usw.basecontrol, { 
		options: {
			isnested: false
		},
	   
		_create: function(options) { 
			var self = this;
			self._super(options);
			
			$(self.content).addClass("usw-dendro-object-query");
			$(self.content).addClass("usw-dendro-object");
			$("<div class='usw-dendro-object-id'/>").textinputfield({ headertext: "Object identifier" }).appendTo(self.content);
		    $("<div class='usw-dendro-object-type'/>").dendroobjecttype().appendTo(self.content);
			$("<div class='usw-dendro-object-note'/>").textinputfield({ headertext: "Object note contains" }).appendTo(self.content);
			$("<div class='usw-dendro-object-material'/>").dendroobjectmaterial({ headertext: "Object made of material" }).appendTo(self.content);

			//$("<div class='usw-dendro-object-date'/>").textinputfield({ headertext: "Object date (year)" }).appendTo(self.content);
		    $("<div class='usw-dendro-object-date'/>").yearspanselect({ headertext: "Object production date" }).appendTo(self.content);

			if (!self.options.isnested) {
			    $("<div class='usw-dendro-object-sample'/>")
                    .dendrosamplequery({
                        isnested: true,
                        headertext: "Object has sample",
                        showheader: true,
                        showcontent: false,
                        collapsible: true
                    }).appendTo(self.content);

			    $("<div class='usw-dendro-object-record'/>")
                    .dendrorecordquery({
                        isnested: true,
                        headertext: "Object referenced by record",
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
			varname = (varname || "object").trim();			
			
			//var q = "?" + varname + " <" + usw.uri.CRM.P2 + "> <" + usw.uri.TRIDAS.OBJECT + "> .\n";
			//var q = "?" + varname + " rdf:type/rdfs:subClassOf* <" + usw.uri.CRM.E22 + "> .\n";
			var q = "?" + varname + " rdf:type <" + usw.uri.CRM.E22 + "> .\n";
			// object-id					
			ctl = $(".usw-dendro-object-id:first", self.content);
			value = ctl.textinputfield("option", "showcontent") === true ? ctl.textinputfield("option", "value").trim() : "";
			if (value !== "") {
			    q += " ?" + varname + " <" + usw.uri.CRM.P1 + "> [<" + usw.uri.RDFS.LABEL + "> '" + value + "'] .\n";			    	    
			}			
					
			// object-note
			ctl = $(".usw-dendro-object-note:first", self.content);
			value = ctl.textinputfield("option", "showcontent") === true ? ctl.textinputfield("option", "value").trim() : "";
			if (value !== "") {
			    q += " ?" + varname + " <" + usw.uri.CRM.P3 + "> ?" + varname + "note .\n";
			    q += "FILTER(bif:contains(?" + varname + "note, \"'" + value + "'\")) .\n"; //using full-text index
			    //q += " FILTER regex(?" + varname + "note,'" + value + "','i') .\n";			    
			}

		    // object-date
			ctl = $(".usw-dendro-object-date:first", self.element);
			if (ctl.yearspanselect("option", "showcontent")) {
			    var valueMin = parseInt(ctl.yearspanselect("option", "valueMin"));
			    //yearMin = (yearMin < 0 ? "-" : "") + ("0000" + Math.abs(yearMin).toString()).slice(-4); // gYear is 4 digits with leading zeros (if required), may be negative number (e.g. "-0800")
			    var valueMax = parseInt(ctl.yearspanselect("option", "valueMax"));
			    //yearMax = (yearMax < 0 ? "-" : "") + ("0000" + Math.abs(yearMax).toString()).slice(-4);
			    q += " ?" + varname + "production <" + usw.uri.CRM.P108 + "> ?" + varname + "; <" + usw.uri.CRM.P4 + "> [<" + usw.uri.CRM.P82a + "> ?yearMin ; <" + usw.uri.CRM.P82b + "> ?yearMax ] .\n";
			    
			    // 21/01/2017 CFB year filter clause was not working on deployment server. This alternative syntax does
			    //q += "BIND(year(?yearMin) as ?y1) .\nBIND(year(?yearMax) as ?y2) .\n";
			    //q += " FILTER(?y1 >= " + valueMin.toString() + " && ?y2 <= " + valueMax.toString() + ") .\n";
			    //q += " FILTER (?yearMin >= '" + valueMin.toString() + "-01-01T00:00:00Z'^^xsd:gYear && ?yearMax <= '" + valueMax.toString() + "-01-01T00:00:00Z'^^xsd:gYear) .";
			    //q += " FILTER (year(xsd:DateTime(?yearMin)) >= " + valueMin.toString() + " && year(xsd:DateTime(?yearMax)) <= " + valueMax.toString() + ") .";
			    q += " FILTER (year(coalesce(xsd:DateTime(?yearMin), xsd:DateTime('5000'))) >= " + valueMin.toString() + " && year(coalesce(xsd:DateTime(?yearMin), xsd:DateTime('5000'))) <= " + valueMax.toString() + ") .";
			}

		    // object-type 
			ctl = $(".usw-dendro-object-type:first", self.content);
		    //value = ctl.querytermselect("option", "showcontent") === true ? ctl.querytermselect("option", "value").trim() : "";
			value = ctl.dendroobjecttype("option", "showcontent") === true ? (ctl.dendroobjecttype("option", "value") || "").trim() : "";
			if (value !== "") {
			    q += " ?" + varname + " crm:P2_has_type/gvp:broaderGeneric? <" + value + "> .\n";
			}
		    
		    //object-material (expanded)
			ctl = $(".usw-dendro-object-material:first", self.element);
			value = ctl.dendroobjectmaterial("option", "showcontent") === true ? ctl.dendroobjectmaterial("option", "value").trim() : "";
			if (value !== "") {
			    //q += " ?" + varname + " crm:P45_consists_of/gvp:broaderGeneric* <" + value + "> \n";
			    //q += " ?" + varname + " crm:P45_consists_of/gvp:broaderGeneric*/(gvp:aat2842_source_for|gvp:aat2841_derived-made_from)? <" + value + "> .\n";
			    q += " ?" + varname + " crm:P45_consists_of/gvp:broaderGeneric?/(gvp:aat2842_source_for|gvp:aat2841_derived-made_from)? <" + value + "> .\n";
			    //q += " ?" + varname + " <" + usw.uri.CRM.P45 + "> ?material .\n";
			    //q += "OPTIONAL { ?expanded1 <http://vocab.getty.edu/ontology#broaderGeneric>+ <" + value + "> } \n";
			    //q += "OPTIONAL { ?expanded2 (<http://vocab.getty.edu/ontology#aat2842_source_for> | <http://vocab.getty.edu/ontology#aat2841_derived-made_from>) <" + value + "> } \n";
			    //q += "OPTIONAL { ?expanded3 (<http://vocab.getty.edu/ontology#aat2842_source_for> | <http://vocab.getty.edu/ontology#aat2841_derived-made_from>) ?expanded1 } \n";			    
			    //q += "FILTER(?material = <" + value + "> || ?material = ?expanded1 || ?material = ?expanded2 || ?material = ?expanded3) .\n";			    
			}

		    

			if (!self.options.isnested) {
			    // object-record
				ctl = $(".usw-dendro-object-record:first", self.content);
				if(ctl.dendrorecordquery("option", "showcontent") === true) {						
					q += " ?" + varname + " <" + usw.uri.CRM.P67i + "> ?" + varname + "record .\n";
					q += ctl.dendrorecordquery("getSparqlBody", varname + "record");
				}

			    // object-sample
				ctl = $(".usw-dendro-object-sample:first", self.element);
				if (ctl.dendrosamplequery("option", "showcontent") === true) {
				    q += " ?" + varname + "sampling <" + usw.uri.CRM.P112 + "> ?" + varname + " .\n";
				    q += " ?" + varname + "sampling <" + usw.uri.CRM.P113 + "> ?" + varname + "sample .\n";
				    q += ctl.dendrosamplequery("getSparqlBody", varname + "sample");
				}
			}
			
			return q;
		},		

		getSparqlQuery: function(varname) {
		    var self = this;
		    varname = (varname || "object").trim();

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
		}*/					
	});	// end usw.dendroobjectquery
	
})(jQuery); // end of main jquery closure
