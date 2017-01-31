/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE / Any
Classes	: usw.resourceproperties.js
Summary	: display all properties of specified project|object|element|sample
Require	: jquery-2.X.X.min.js, jquery-ui.min.js, $.fn.sparqlquery.js
Example	: $('.tmp1').resourceproperties({ uri: 'http://xyz'});
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 26/01/2016 CFB Initially created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
    "use strict";           // strict mode pragma
    $.support.cors = true;  // cross-origin resource sharing

    $.widget('usw.resourceproperties', $.usw.resourcelist, {
        options: {
            uri: "http://tempuri/12345",
            language: "en",
            collapsible: false,
            showheader: false,
            showcontent: true,
            showfooter: true,
            query: "",
            limit: 1000
        },

        _create: function (options) {
            var self = this;
            self.options = $.extend(true, {}, self.options, options);
            self._super(self.options);
            //$(self.element).addClass("usw-resourceproperties");    
            $(self.content).css({
                border: "1px solid lightgray",
                padding: "5px",
                "overflow-y": "scroll",
                //width: "100%",
                height: "500px"
            });
        },
        
    
        _setOption: function (key, value) {
            var self = this;
            if (key == "uri" && value !== self.options.uri) {
                var sparql = "SELECT DISTINCT ?predicate ?plabel ?object ?olabel ?otype WHERE { \n";
                sparql += "<" + value + "> ?predicate ?object . \n";
                // sparql += " OPTIONAL { ?object skos:prefLabel ?skos_olabel. FILTER(langMatches(lang(?skos_olabel), \"" + self.options.language + "\") || lang(?skos_olabel)='') }\n";
                // sparql += " OPTIONAL { ?object gvp:prefLabelGVP [gvp:term ?gvp_olabel] . FILTER(langMatches(lang(?gvp_olabel), \"" + self.options.language + "\") || lang(?gvp_olabel)='') }\n";
                // sparql += " OPTIONAL { ?object rdfs:label ?rdfs_olabel . FILTER(langMatches(lang(?rdfs_olabel), \"" + self.options.language + "\") || lang(?rdfs_olabel)='') }\n";
                
                sparql += " OPTIONAL { ?predicate rdfs:label ?rdfs_plabel . FILTER(langMatches(lang(?rdfs_plabel), \"" + self.options.language + "\") || lang(?rdfs_plabel)='') }\n";
                sparql += " OPTIONAL { ?predicate skos:prefLabel ?skos_plabel . FILTER(langMatches(lang(?skos_plabel), \"" + self.options.language + "\") || lang(?skos_plabel)='') }\n";

                sparql += " OPTIONAL { ?object gvp:prefLabelGVP [gvp:term ?gvp_olabel1] . FILTER(langMatches(lang(?gvp_olabel1), 'en') || lang(?gvp_olabel1)='') }\n";
                sparql += " OPTIONAL { ?object gvp:term ?gvp_olabel2 . FILTER(langMatches(lang(?gvp_olabel2), 'en') || lang(?gvp_olabel2)='') }\n";
                sparql += " OPTIONAL { ?object skosxl:literalForm ?skosxl_olabel1 . FILTER(langMatches(lang(?skosxl_olabel1), 'en') || lang(?skosxl_olabel1)='') }\n";
                sparql += " OPTIONAL { ?object skosxl:prefLabel [skosxl:literalForm ?skosxl_olabel2] . FILTER(langMatches(lang(?skosxl_olabel2), 'en') || lang(?skosxl_olabel2)='') }\n";

                sparql += " OPTIONAL { ?object rdfs:label ?rdfs_olabel_en . FILTER(langMatches(lang(?rdfs_olabel_en), 'en') || lang(?rdfs_olabel_en)='') }\n";
                sparql += " OPTIONAL { ?object rdfs:label ?rdfs_olabel }\n";
                sparql += " BIND(COALESCE(?skos_plabel, ?rdfs_plabel, '') AS ?plabel)\n";
                sparql += " BIND(COALESCE(?gvp_olabel1, ?gvp_olabel2, ?skosxl_olabel1, ?skosxl_olabel2, ?rdfs_olabel_en, ?rdfs_olabel, '') AS ?olabel)\n";
                sparql += "}\n";
                self.options.query = sparql;                
            }
            if (self.options[key] !== value)
                self._super(key, value);                
            
        }, 

        render: function (data) {
            var self = this;

            if (!data || !data.results || !data.results.bindings)
                return;
            
            // TODO - cluster and sort multiple objects under predicates for more sensible display...

            // display the data
            var list = $("ul:first", self.content).empty();
            //var hash = {};

            $(data.results.bindings).each(function (index, item) {
                var predicate = "";
                var plabel = "";
                var olabel = "";
                
                if (item.predicate && item.predicate.type === "uri") {
                    predicate = item.predicate.value;
                }

                // if we have a predicate label then use that
                if (item.plabel && item.plabel.value && item.plabel.value !== "") {
                    plabel = item.plabel.value;
                }               
                else   // else parse fragment part of URI to use as label
                 {
                    var i = predicate.lastIndexOf("#");
                    if (i === -1)
                        i = predicate.lastIndexOf("/");
                    if (i === -1) 
                        plabel = predicate;
                    else
                        plabel = predicate.substring(i + 1);                   
                }

                // if we have an object label then use that
                if (item.olabel && item.olabel.value && item.olabel.value !== "") {
                    olabel = item.olabel.value;
                }
                // if the property is a literal value then use that
                else if (item.object && item.object.type === "literal") {
                    olabel = item.object.value;
                }
                else   // else parse fragment part of URI to use as label
                {
                    var s = item.object.value;
                    var i = s.lastIndexOf("#");
                    if (i === -1)
                        i = s.lastIndexOf("/");
                    if (i === -1 || i === s.length-1) // if not found or at end
                        olabel = s;
                    else
                        olabel = s.substring(i + 1);
                }                

                var li = $("<li/>").appendTo(list);
                //$("<span>" + plabel + "&nbsp;:&nbsp;</span>").css({ "font-weight": "bold" }).appendTo(li);
                $("<span><a href='" + predicate + "'>" + plabel + "</a>&nbsp;:&nbsp;</span>").css({ "font-weight": "bold" }).appendTo(li);
                // if it's a uri, display as labelled anchor, otherwise just as text
                if (item.object && item.object.type === "uri")
                    $("<span><a href='" + item.object.value + "'>" + olabel + "</a></span>").appendTo(li);
                else
                    $("<span>" + olabel + "</span>").appendTo(li);                
            });
        }        

    });	// end usw.resourceproperties

})(jQuery); // end of main jquery closure
