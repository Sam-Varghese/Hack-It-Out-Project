var mysql = require("mysql");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "SmAyMsVqAl11597",
  database: "attendance_records",
  multipleStatements: true,
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected");
});

var column_names = [];
con.query(
  "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='attendance_records' AND TABLE_NAME='class1';",
  (err, res) => {
    if (err) throw err;
    console.log(res);
  }
);
