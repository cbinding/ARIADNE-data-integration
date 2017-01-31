/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE / Any
Classes	: usw.dendroobjecttype.js
Summary	: drop down list of possible object types for use with query builder 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js,  $.usw.querytermselect.js, usw.basecontrol.js, usw.textinputfield.js
Example	: $('.tmp1').dendroobjectype();
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 21/01/2016 CFB Initially created script
===============================================================================
*/
;(function ($) {             // start of main jquery closure
    "use strict";            // strict mode pragma
    $.support.cors = true;   // cross-origin resource sharing

    $.widget('usw.dendroobjecttype', $.usw.querytermselect, {
        options: {
            language: "en",
            headertext: "Object type",
            collapsible: true,
            showheader: true,
            //showcontent: true,
            showfooter: false
        },

        _create: function (options) {
            var self = this;
            self._super(options);

            $(self.element).addClass("usw-dendro-object-type, usw-dendro-object");
            
            // query to get all object types linked to man-made objects
            //var sparql = "SELECT ?uri STR(?lbl) AS ?label COUNT(?uri) AS ?counter WHERE { \n";
            var sparql = "SELECT DISTINCT ?uri STR(?lbl) AS ?label WHERE { \n";
            sparql += "?obj a <" + usw.uri.CRM.E22 + ">; <" + usw.uri.CRM.P2 + "> ?uri .\n";
            sparql += "?uri <" + usw.uri.SKOS.INSCHEME + "> <http://vocab.getty.edu/aat/> .\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.SKOS.PREFLABEL + "> ?lbl_xx . FILTER(langMatches(lang(?lbl_xx),'" + self.options.language + "')) }\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.SKOS.PREFLABEL + "> ?lbl_en . FILTER(langMatches(lang(?lbl_en),'en')) }\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.GVP.PREFLABELGVP + "> [<" + usw.uri.GVP.TERM + "> ?lbl_xl ] }\n";
            sparql += "BIND(COALESCE(?lbl_xx, ?lbl_en, ?lbl_xl, '') AS ?lbl)\n"; // selected language first, then English if not found
            sparql += "}";

            $(self.option({ "query": sparql }));                 
        }
       
    });	// end usw.dendroobjecttype

})(jQuery); // end of main jquery closure
