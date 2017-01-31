REM echo off

REM get timestamp for naming the output files
set yyyy=%date:~6,4%
set mm=%date:~3,2%
set dd=%date:~0,2%
set hh=%time:~0,2%
if %hh% lss 10 (set hh=0%time:~1,1%)
set nn=%time:~3,2%
set ss=%time:~6,2%
set datestamp=%yyyy%%mm%%dd%
set timestamp=%hh%%nn%%ss%
set filename=usw.dendro.%datestamp%

REM combine scripts into single (datestamped) intermediate file 
REM copy *.js %filename%.tmp
REM alternative - combine files in specific order to ensure dependencies are present when referenced
copy jquery.blockUI.js+usw.uri.js+fn.sparqlquery.js+fn.gethashcode.js+usw.basecontrol.js+usw.resourcelist.js+usw.yearspanselect.js+usw.objectmaterialslist.js+usw.objecttypeslist.js file1.tmp
copy usw.textinputfield.js+usw.querytermsuggest.js+usw.querytermselect.js file2.tmp
copy usw.dendrorecordquery.js+usw.dendroobjecttype.js+usw.dendroobjectmaterial.js+usw.dendroobjectquery.js+usw.dendrosamplequery.js+usw.dendroqueryrunner.js+usw.resourceproperties.js file3.tmp
copy file1.tmp+file2.tmp+file3.tmp %filename%.tmp

REM minify combined scripts
jsmin.exe < %filename%.tmp > %filename%-min.tmp

REM deploy minified script to lib directory
COPY %filename%-min.tmp ..\lib\%filename%-min.js

REM remove local intermediate files
del *.tmp




   