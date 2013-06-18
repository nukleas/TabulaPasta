TabulaPasta
===========

A Javascript tool to parse nonstandard tables for use in [DataTables](http://www.datatables.net/).

About
=====

TabulaPasta was designed to rapidly prepare tables for the web using tables that were prepared for print.

This is not necessarily an easy process. Tables can come in that are not completely clean or standard, so sometimes we need to do some thinking to clean up and prepare tables however we like.

TabulaPasta tries to interpret your tables and then output an object which can be tossed into a Handlebars.js template or something similar to create a DataTable on the fly.

Features
========

###Detection Of Row Grouping

TabulaPasta can detect some forms of row grouping and prepare the columns accordingly. For example, if you have something like this:

- All Bob Businesses

-  --Bob's Auto Repair

-  --Bob's Home Repair

-  --Bob's Relationship Repair

TabulaPasta will create an invisible right column that will group these elements together by the parent.

In the case of, say, something chunked like:

- BOB'S AUTO PROFITS
- 2013
- 2012
- 2011
- ----
- BOB'S RELATIONSHIP PROFITS
- 2013
- 2012
- 2011

TabulaPasta can detect those two and create two invisible columns so you can correctly sort within chunks without a problem.

