/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE - data integration exercise
Classes	: usw.objecttypeslist.js
Summary	: List of AAT types linked to objects in the dataset
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, usw.basecontrol.js, fn.sparqlquery.js
Example	: $("#div1").objecttypes();
License	: http://creativecommons.org/licenses/by/3.0/
===============================================================================
History

03/02/2016 CFB Created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing

    $.widget('usw.objecttypeslist', $.usw.resourcelist, {
        options: {
            language: "en",
            //headertext: "Object Types",
            collapsible: false,
            showheader: false,
            showcontent: true,
            showfooter: false
        },

        _create: function (options) {
            var self = this;

            // override default options with passed in values, call super 
            self.options = $.extend(true, {}, self.options, options);
            self._super(self.options);
            
            $(self.element).addClass("usw-object-types");

            // query to get all object types linked to man-made objects
            var sparql = "SELECT ?uri STR(?lbl) AS ?label COUNT(?uri) AS ?counter WHERE { \n";
            sparql += "?obj a <" + usw.uri.CRM.E22 + ">; <" + usw.uri.CRM.P2 + "> ?uri .\n";
            sparql += "?uri <" + usw.uri.SKOS.INSCHEME + "> <http://vocab.getty.edu/aat/> .\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.SKOS.PREFLABEL + "> ?lbl_xx . FILTER(langMatches(lang(?lbl_xx),'" + self.options.language + "')) }\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.SKOS.PREFLABEL + "> ?lbl_en . FILTER(langMatches(lang(?lbl_en),'en')) }\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.GVP.PREFLABELGVP + "> [<" + usw.uri.SKOSXL.LITERALFORM + "> ?lbl_xl ] }\n";
            sparql += "BIND(COALESCE(?lbl_xx, ?lbl_en, ?lbl_xl, '') AS ?lbl)\n"; // selected language first, then English if not found
            sparql += "}";

            $(self.option({ "query": sparql }));
        }        
    });	// end usw.objecttypeslist

})(jQuery); // end of main jquery closure
