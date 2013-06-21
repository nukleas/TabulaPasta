// TabulaPasta
// By Nader Heidari
//

var TabulaPasta = {
    cleanupTools: {
	/*
		This object contains methods to clean a table array of funky characters
		as well as prepare subgroups for later row grouping.
	*/
        cleanCell: function (cell) {
            "use strict";
			// Clear nonstandard characters at the beginning of the string
            cell = cell.replace(/^([^\x00-\xFF])+/g, '');
			// Clear nonstandard characters at the end of the string
            cell = cell.replace(/([^\x00-\xFF])+$/g, '');
			// Allow single dashes to be used to denote intentionally blank fields
            cell = cell.replace(/^-[^\-]/g, '\t');
			// Convert two or more leading spaces to dashes for row grouping
            cell = cell.replace(/^\s{2,}/g, '--');
            return cell;
        },
        cleanRow: function (array) {
            "use strict";
            var i;
            for (i = 0; i < array.length; i += 1) {
			    // If the cell contains something, clean cell
                if (array[i]) {
                    array[i] = this.cleanCell(array[i]);
                } else {
				    // If it's bad, cut it out!
                    array.splice(i, 1);
					// And step back a bit so you don't get ahead of yourself. Arraywise.
                    i += -1;
                }
            }
            return array;
        },
        removeEmptyArrays: function (arrays) {
            "use strict";
            var i;
            for (i = 0; i < arrays.length; i += 1) {
                if (arrays[i].length === 0) {
				    // Cut cut cut all the empty arrays
                    arrays.splice(i, 1);
                    i += -1;
                }
            }
            return arrays;
        },
        cleanTableArray: function (table_array) {
            "use strict";
            var i;
			// Iterate through rows, cleaning and splicing as you go
            for (i = 0; i < table_array.length; i += 1) {
                this.cleanRow(table_array[i]);
            }
			// And clean the empty arrays left behind
            this.removeEmptyArrays(table_array);
            return table_array; // Clean and shiny!
        }
    },
    doubleSplit: function (string, split_one, split_two) {
        "use strict";
        var i, array = string.split(split_one);
        for (i = 0; i < array.length; i += 1) {
            array[i] = array[i].split(split_two);
        }
        return array;
    },
    convertTableToString: function (table) {
        "use strict";
        var i;
        if (table) {
            for (i = 0; i < table.length; i += 1) {
                table[i] = table[i].join("\t");
            }
            table = table.join("\n");
            return table;
        }
    },
    convertStringToTable: function (table_string) {
        "use strict";
        var info_array;
        if (table_string) {
            table_string = this.convertSingleLetterParensToSuperscript(table_string);
            table_string = this.cleanAroundTabs(table_string);
            table_string = table_string.replace(/['"]/g, "\\'");
            info_array = this.doubleSplit(table_string, "\n", "\t");
            return info_array;
        }
    },
    convertSingleLetterParensToSuperscript: function (table_string) {
        "use strict";
        table_string = table_string.replace(/(| )\(([a-z])\)/g, "<sup>$2</sup>");
        return table_string;
    },
    cleanAroundTabs: function (table_string) {
        "use strict";
        table_string = table_string.replace(/( +|)\t( +|)/g, "\t");
        return table_string;
    },
    parseTableArray: function (table_info) {
        "use strict";
        /*
            This function parses an array of arrays (hence TableArray) and returns a table object.
            The object includes certain things separated out, such as the header and the deck.
        */
        var i, parsed_table = {};
        if (table_info) {
            // Assumption: First line with length 1 is Headline
            parsed_table.head = table_info[0].length === 1 ? table_info[0] : "";
            // Assumption: Second line with length 1 is Deck
            parsed_table.deck = table_info[1].length === 1 ? table_info[1] : "";
            // Find first line that appears to have the same length as the following rows, assume headers
            for (i = 2; i < table_info.length; i += 1) {
                if (table_info[i].length === table_info[i + 1].length || table_info[i].length === table_info[i + 2].length) {
                    break;
                }
            }
            parsed_table.headers = table_info[i];
            // Instantiate rows
            parsed_table.rows = [];
            // Instantiate footer
            parsed_table.footer = [];
            // Filter out note and source lines as well as footnotes, concatenate at end
            // Also locate footer (will contain something like TOTAL or ALL and not be a subcategory)
            for (i = i += 1; i < table_info.length; i += 1) {
                if (table_info[i].length === 1 && table_info[i][0].match(/(^[a-z] |NOTE:|SOURCE:)/)) {
                    parsed_table.note = parsed_table.note ? parsed_table.note += " " + table_info[i] : table_info[i];
                } else {
                    if (table_info[i][0].match("(TOTAL|ALL|All|OVERALL)") && !table_info[i][0].match(/\-\-/)) {
                        parsed_table.footer = table_info[i];
                    } else {
                        if (table_info[i]) {
                            parsed_table.rows.push(table_info[i]);
                        }
                    }
                }
            }
        }
        // If row grouping is set up, detect row grouping and proceed accordingly
        if (this.Grouping) {
            parsed_table = this.Grouping.detectGroupingType(parsed_table);
        }
        // Hoist signs such as dollars and percentages to the headline if not previously defined
        parsed_table = this.columnDetectSignsStripAndAddToHeaderRowIfNotAlreadyDefined(parsed_table);
        return parsed_table;
    },
	columnDetectSignsStripAndAddToHeaderRowIfNotAlreadyDefined: function (table) {
    //Longest function name evar
        "use strict";
        var i, j, matched_character;
        for (i = 0; i < table.headers.length; i += 1) {
            if (!table.headers[i].match(/(\$|%|YEAR)/)) {
                for (j = 0; j < table.rows.length; j += 1) {
                    if (table.rows[j][i] && table.rows[j][i].match(/(\$|%)/)) {
                        matched_character = table.rows[j][i].match(/(\$|%)/)[0];
                        break;
                    }
                }
                if ((table.rows[0][i] && table.rows[0][i].match(/(\$|%)/)) || (table.rows[1][i] && table.rows[1][i].match(/(\$|%)/))) {
                    table.headers[i] = table.headers[i] += " (" + matched_character + ")";
                    matched_character = undefined;
                }
            }
        }
        for (i = 0; i < table.rows.length; i += 1) {
            for (j = 0; j < table.rows[i].length; j += 1) {
                table.rows[i][j] = table.rows[i][j].replace(/(\$|%)/, "");
            }
        }
        return table;
    },
    createTableObjectFromArray: function (table_array) {
        "use strict";
        var parsed_array;
        if (table_array) {
            table_array = TabulaPasta.cleanupTools.cleanTableArray(table_array);
            parsed_array = TabulaPasta.parseTableArray(table_array);
            return parsed_array;
        }
    }
};