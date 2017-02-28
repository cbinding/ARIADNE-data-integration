/*
===============================================================================
Creator	: Ceri Binding,	University of South	Wales ceri.binding@southwales.ac.uk
Project	: ARIADNE - dendro item integration
Classes	: fn.sparqlquery.js
Summary	: Run SPARQL queries against given (dydra) endpoint and return results 
Require	: jquery-2.X.X.min.js, jquery-ui.min.js
Example	: var result = $.fn.sparqlquery({sparql: "SELECT * WHERE {?s ?p ?o}"});
License	: http://creativecommons.org/publicdomain/zero/1.0/
History : 02/02/2016 CFB Initially created script
===============================================================================
*/
;(function ($) {            // start of main jquery closure
	"use strict";           // strict mode pragma
	$.support.cors = true;  // cross-origin resource sharing

	$.fn.sparqlquery = function(options) {
	    var defaults = {
            // using DYDRA server:
			//endpointURI: "http://dydra.com/cbinding/dendro/sparql",
	        //authToken: "yC9uXSCkT5NsYA28rWtA",
            // using (local) OpenLink Virtuoso server:
	        //endpointURI: "http://localhost:8890/sparql",
	        endpointURI: "http://ariadne-lod.isti.cnr.it:8890/sparql",
	        // restrict queries to specific set of named graphs - comment out to query all 
            // change to suit deployment named graph URIs
	        namedGraphs: ["http://registry.ariadne-infrastructure.eu/usw-data-integration-case-study", "http://vocab.getty.edu/dataset/aat"],
	        prefixes: {
	            xsd: "http://www.w3.org/2001/XMLSchema#",
	            rdf: usw.uri.RDF.NS,
	            rdfs: usw.uri.RDFS.NS,
	            skos: usw.uri.SKOS.NS,
                skosxl: usw.uri.SKOSXL.NS,
                crm: usw.uri.CRM.NS,
                dcterms: usw.uri.DCTERMS.NS,
	            gvp: usw.uri.GVP.NS, 
	            aat: usw.uri.AAT.NS
	        }, 
	        query: "", // SELECT * WHERE { ?s ?p ?o }
			context: this,
			limit: 500,
			offset: 0,
			success: function (data, status, jqXHR) { },
			error: function (jqXHR, status, errorThrown) { },
			complete: function (jqXHR, status) { }
		};	
	    var opts = $.extend({}, defaults, options);

	    // if there is no query don't bother going further...
	    if (opts.query === "") {
	        opts.success({});
	        opts.complete();
	    }
	   
	    // build the complete SPARQL query	
		var sparql = "";		

	    // cycle through prefixes keys to prepend prefix headers
		Object.keys(opts.prefixes).forEach(function (key, index) {
		    sparql += "PREFIX " + key + ": <" + opts.prefixes[key] + ">\n";
		});

        // add the main query body
		sparql += (opts.query || "").trim();

	    // if named graph is specified use it
		if (opts.namedGraphs && opts.namedGraphs.length > 0) {
		    var names = "";
		    for (var i = 0; i < opts.namedGraphs.length; i++) {
		        names += "\nFROM <" + opts.namedGraphs[i] + ">";
		    }
		    sparql = sparql.replace(/WHERE\s+\{/, names + "\nWHERE {");
		}
		//var graphs = (opts.graphURI || "").trim();
        //if(graph !== "")
		    //sparql = sparql.replace(/WHERE\s+\{/, "FROM <" + graph + "> WHERE {");

        // if limit is specified use it
        var limit = parseInt(opts.limit || 0);
		if (limit > 0) {
			sparql += "LIMIT " + limit + "\n";
		}

        // if offset is specified use it
		var offset = parseInt(opts.offset || 0);
		if (offset > 0) {
			sparql += "OFFSET " + offset + "\n";
		}

	    // We may have cached results from a previous query
	    //if so, use these instead of expensive server call
		var key = $.fn.gethashcode(sparql);		
		var data = $(document.body).data(key);		
		if (data) {
		    opts.success(data);
		    opts.complete();
		}
		else {
		    // execute the SPARQL query via an AJAX call
		    $.ajax({
		        method: "POST", // GET works, but POST is better for longer SPARQL query text
		        url: opts.endpointURI,
		        //crossDomain: true,
		        dataType: "json",
		        data: { query: sparql },
		        context: (opts.context || this),
		        cache: true, // makes no difference - no browser caching... need to implement it
		        success:  function (data, status, jqXHR) {
		            // cache successful result of this query for next time
		            $(document.body).data(key, data);
		            // call the 'success' callback
		            opts.success(data, status, jqXHR);
		        },		       
		        error: opts.error,
                complete: opts.complete
		    }); // end of ajax call
		}
		return this;
	};

})(jQuery); // end of main jquery closure
