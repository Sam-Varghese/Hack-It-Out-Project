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

var array1 = [];
con.query(
  `USE ATTENDANCE_RECORDS;SELECT COUNT(*) AS Count FROM class1 WHERE 24_08_2021 = "Absent"`,
  (err, res) => {
    console.log(res);
  }
);
