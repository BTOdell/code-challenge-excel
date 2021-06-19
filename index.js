const MySQL = require("mysql");
const {sqlToXlsx} = require("./processing");

const {host, database, user, password, clientID, output} = require("./config.json");

// Connect to database
const connection = MySQL.createConnection({host, database, user, password});
connection.connect();

// Query database for rows of specified client
const query = `
    SELECT start_weight, end_weight, zone, rate, shipping_speed, locale
    FROM rates
    WHERE client_id = ?
    ORDER BY start_weight ASC
`;
connection.query(query, [clientID], (error, results) => {
    if (error) {
        throw error;
    }
    sqlToXlsx(results).xlsx.writeFile(output).then(() => {
        console.log("File written to " + output);
    });
});

connection.end();
