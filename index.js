const MySQL = require("mysql");
const {sqlToXlsx} = require("./processing");

const CLIENT_ID = 1240;

// Connect to database
const connection = MySQL.createConnection({
    host: 'localhost',
    database: 'whitebox',
    user: 'whiteboxuser',
    password: 'supersecretpassword'
});
connection.connect();

// Query database for rows of specified client
const query = `
    SELECT start_weight, end_weight, zone, rate, shipping_speed, locale
    FROM rates
    WHERE client_id = ?
    ORDER BY start_weight ASC
`;
connection.query(query, [CLIENT_ID], (error, results) => {
    if (error) {
        throw error;
    }
    sqlToXlsx(results).then(() => {
        console.log("File written.");
    });
});

connection.end();
