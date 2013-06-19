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
    }
};