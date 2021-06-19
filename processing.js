const ExcelJS = require("exceljs");

// For start weight and end weight
const COLUMN_OFFSET = 2;

function createRow(startWeight, endWeight, zones) {
    const rowLength = COLUMN_OFFSET + zones.length;
    const row = [startWeight, endWeight];
    while (row.length < rowLength) {
        row.push(0);
    }
    return row;
}

exports.sqlToXlsx = async function (results) {
    const workbook = new ExcelJS.Workbook();

    function sheet(name, locale, shippingSpeed) {
        const sheet = workbook.addWorksheet(name);

        function filter(result, locale, shippingSpeed) {
            return result["locale"] === locale &&
                result["shipping_speed"] === shippingSpeed;
        }

        // Dynamically determine the valid zones
        const zoneSet = new Set();
        for (const result of results) {
            if (filter(result, locale, shippingSpeed)) {
                zoneSet.add(result["zone"]);
            }
        }
        const zones = Array.from(zoneSet).sort();
        console.log(name, zones);

        // Columns and header row
        const columns = [
            {header: "Start Weight", key: 'startWeight', width: 15},
            {header: "End Weight", key: 'endWeight', width: 15}
        ];
        for (const zone of zones) {
            const header = "Zone " + zone
            const key = 'zone' + zone
            columns.push({header, key, width: 15});
        }
        sheet.columns = columns;

        // Calculate number of rows
        const rowMap = new Map(); // Start weight -> row number
        for (const result of results) {
            if (filter(result, locale, shippingSpeed)) {
                const startWeight = result["start_weight"];
                if (!rowMap.has(startWeight)) {
                    const newRow = sheet.addRow(createRow(startWeight, result["end_weight"], zones));
                    rowMap.set(startWeight, newRow.number);
                }
            }
        }
        console.log(rowMap);

        // Fill data
        for (const result of results) {
            if (filter(result, locale, shippingSpeed)) {
                const rowNumber = rowMap.get(result["start_weight"]);
                if (rowNumber == null) {
                    continue;
                }
                const row = sheet.getRow(rowNumber);
                const zone = result["zone"];
                const zoneKey = 'zone' + zone;
                row.getCell(zoneKey).value = result["rate"];
            }
        }
    }

    sheet("Domestic Standard Rates", "domestic", "standard");
    sheet("Domestic Expedited Rates", "domestic", "expedited");
    sheet("Domestic Next Day Rates", "domestic", "nextDay");
    sheet("International Economy Rates", "international", "intlEconomy");
    sheet("International Expedited Rates", "international", "intlExpedited");

    return workbook.xlsx.writeFile("output.xlsx");
}