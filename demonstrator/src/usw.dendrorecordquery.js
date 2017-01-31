/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE / Any
Classes	: usw.dendrorecordquery.js
Summary	: dendro record query field for use with query builder 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, usw.basecontrol.js, 
            usw.textinputfield.js, usw.sparqlquery.js
Example	: $('.tmp1').dendrorecordquery();
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 21/01/2016 CFB Initially created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing

    $.widget('usw.dendrorecordquery', $.usw.basecontrol, {
        options: {
            isnested: false
        },

        _create: function (options) {
            var self = this;
            self._super(options);
            $(self.content).addClass("usw-dendro-record-query");
            $(self.content).addClass("usw-dendro-record");
            var sources = $("<div class='usw-dendro-document-id'/>").querytermselect({ headertext: "Record data source"}).appendTo(self.content);
            
            var qry = "SELECT DISTINCT ?uri ?label WHERE {\n";
            qry += "?uri a void:Dataset; <" + usw.uri.CRM.P148i + "> [a void:Dataset] ." ;
            qry += "OPTIONAL { ?uri rdfs:label ?label }\n";
            qry += "}";
            $(sources).querytermselect("option", "query", qry);
                        
            $("<div class='usw-dendro-record-id'/>").textinputfield({ headertext: "Record identifier" }).appendTo(self.content);
            $("<div class='usw-dendro-record-note'/>").textinputfield({ headertext: "Record note contains" }).appendTo(self.content);
            $("<div class='usw-dendro-record-material'/>")
                .dendroobjectmaterial({ headertext: "Record refers to material" })
                .removeClass("usw-dendro-object")
                .addClass("usw-dendro-record")
                .appendTo(self.content);
            $("<div class='usw-dendro-record-date'/>").yearspanselect({ headertext: "Record refers to date" }).appendTo(self.content);


            if (!self.options.isnested) {
                $("<div class='usw-dendro-record-object'/>").dendroobjectquery({
                    isnested: true,
                    headertext: "Record refers to object",
                    showheader: true,
                    showcontent: false,
                    collapsible: true
                }).appendTo(self.content);
            }
            if (!self.options.isnested) {
                $("<div class='usw-dendro-record-sample'/>").dendrosamplequery({
                    isnested: true,
                    headertext: "Record refers to sample",
                    showheader: true,
                    showcontent: false,
                    collapsible: true
                }).appendTo(self.content);
            }
        },

        // build SPARQL body clauses based on current status of query fields
        getSparqlBody: function (varname) {
            var self = this;
            var ctl, value;
            varname = (varname || "record").trim();

            // record is component of a dataset, but is not a dataset itself
            var q = "?" + varname + " a <" + usw.uri.CRM.E73 + ">; <" + usw.uri.CRM.P148i + "> [ a void:Dataset ] .\n";
            q += "MINUS { ?" + varname + " a void:Dataset }\n";
            
            // document-id
            ctl = $(".usw-dendro-document-id:first", self.content);
            value = ctl.querytermselect("option", "showcontent") === true ? ctl.querytermselect("option", "value").trim() : "";
            if (value !== "") {
                q += "<" + value + "> <" + usw.uri.CRM.P148 + "> ?" + varname + ".\n"; 
            }

            // record-id
            ctl = $(".usw-dendro-record-id:first", self.content);
            value = ctl.textinputfield("option", "showcontent") === true ? ctl.textinputfield("option", "value").trim() : "";
            if (value !== "") {
                q += " ?" + varname + " <" + usw.uri.CRM.P1 + "> [<" + usw.uri.RDFS.LABEL + "> '" + value + "'] .\n";               
            }

            // record-note
            ctl = $(".usw-dendro-record-note:first", self.content);
            value = ctl.textinputfield("option", "showcontent") === true ? ctl.textinputfield("option", "value").trim() : "";
            if (value !== "") {
                q += " ?" + varname + " <" + usw.uri.CRM.P3 + "> ?" + varname + "note .\n";
                //q += " FILTER regex(?" + varname + "note,'" + value + "','i') .\n";
                q += "FILTER(bif:contains(?" + varname + "note, \"'" + value + "'\")) .\n";
            }
            
            // record-refers-to-date
            ctl = $(".usw-dendro-record-date:first", self.element);
            if (ctl.yearspanselect("option", "showcontent")) {
                var valueMin = parseInt(ctl.yearspanselect("option", "valueMin"));
                var valueMax = parseInt(ctl.yearspanselect("option", "valueMax"));
                q += " ?" + varname + " <" + usw.uri.CRM.P67 + "> [a <" + usw.uri.CRM.E52 + ">; <" + usw.uri.CRM.P82a + "> ?yearMin ; <" + usw.uri.CRM.P82b + "> ?yearMax ] .\n";
                q += "BIND(year(?yearMin) as ?y1) .\nBIND(year(?yearMax) as ?y2) .\n";
                q += " FILTER(?y1 >= " + valueMin.toString() + " && ?y2 <= " + valueMax.toString() + ") .\n";
            }

            // record-refers-to-material
            ctl = $(".usw-dendro-record-material:first", self.content);
            value = ctl.dendroobjectmaterial("option", "showcontent") === true ? ctl.dendroobjectmaterial("option", "value").trim() : "";
            if (value !== "") {
                q += " ?" + varname + " crm:P67_refers_to/gvp:broaderGeneric?/(gvp:aat2842_source_for|gvp:aat2841_derived-made_from)? <" + value + "> .\n";
            }

            // record-object
            ctl = $(".usw-dendro-record-object:first", self.content);
            if (ctl.dendroobjectquery("option", "showcontent") === true) {
                q += " ?" + varname + " <" + usw.uri.CRM.P67 + "> ?" + varname + "object .\n";
                q += ctl.dendroobjectquery("getSparqlBody", varname + "object");
            }

            // record-sample
            ctl = $(".usw-dendro-record-sample:first", self.content);
            if (ctl.dendrosamplequery("option", "showcontent") === true) {
                q += " ?" + varname + " <" + usw.uri.CRM.P67 + "> ?" + varname + "sample .\n";
                q += ctl.dendrosamplequery("getSparqlBody", varname + "sample");
            }

            return q;
        },

        getSparqlQuery: function (varname) {
            var self = this;
            varname = (varname || "record").trim();

            var sparql = "SELECT DISTINCT ?" + varname + " ?label ?note ?source WHERE { \n";
            sparql += self.getSparqlBody(varname);
            sparql += "OPTIONAL { ?" + varname + " <" + usw.uri.RDFS.LABEL + "> ?label }\n";
            sparql += "OPTIONAL { ?" + varname + " <" + usw.uri.CRM.P3 + "> ?note }\n";
            sparql += "OPTIONAL { ?" + varname + " <" + usw.uri.CRM.P148i + "> [ a <http://rdfs.org/ns/void#Dataset>; <" + usw.uri.RDFS.LABEL + "> ?source ] }\n";
            sparql += "}\n";
            return sparql;
        },

        /*_refresh: function () {
            var self = this;
            self._super();
        }*/
    });	// end usw.dendrorecordquery

})(jQuery); // end of main jquery closure
