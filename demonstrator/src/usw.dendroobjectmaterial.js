/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE / Any
Classes	: usw.dendroobjectmaterial.js
Summary	: drop down list of possible object materials for use with query builder 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js,  $.usw.querytermselect.js, usw.basecontrol.js, usw.textinputfield.js
Example	: $('.tmp1').dendroobjectmaterial();
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 21/01/2016 CFB Initially created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing

    $.widget('usw.dendroobjectmaterial', $.usw.querytermselect, {
        options: {
            language: "en",
            headertext: "Object material",
            collapsible: true,
            showheader: true,
            //showcontent: true,
            showfooter: false
        },

        _create: function (options) {
            var self = this;
            self._super(options);

            $(self.element).addClass("usw-dendro-object-material, usw-dendro-object");
            
            // query to get all materials linked to anything via P45
            //var sparql = "SELECT ?uri STR(?lbl) AS ?label count(?uri) AS ?counter WHERE { \n";
            var sparql = "SELECT DISTINCT ?uri STR(?lbl) AS ?label WHERE { \n";
            sparql += "{?obj <" + usw.uri.CRM.P45 + "> ?uri} UNION {?uri a <" + usw.uri.CRM.E57 + ">}\n";
            sparql += "?uri <" + usw.uri.SKOS.INSCHEME + "> <http://vocab.getty.edu/aat/> .\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.SKOS.PREFLABEL + "> ?lblxx . FILTER(langMatches(lang(?lblxx),'" + self.options.language + "')) }\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.SKOS.PREFLABEL + "> ?lblen . FILTER(langMatches(lang(?lblen),'en')) }\n";
            sparql += "OPTIONAL { ?uri <" + usw.uri.GVP.PREFLABELGVP + "> [<" + usw.uri.SKOSXL.LITERALFORM + "> ?lbl_xl ] }\n";
            sparql += "BIND(COALESCE(?lblxx, ?lblen, ?lbl_xl, '') AS ?lbl)\n"; // selected language first, then English if not found
            sparql += "}";
            //sparql += "ORDER BY ?label\n";

            $(self.option({ "query": sparql }));
        }
        
    });	// end usw.dendroobjectmaterial

})(jQuery); // end of main jquery closure
