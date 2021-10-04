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

con.query(
  `USE ATTENDANCE_RECORDS;SELECT count(*) as Count FROM information_schema.columns WHERE table_name = 'Class1';`,
  (err, res) => {
    if (err) throw err;
    console.log("Result: ");
    console.log(res[1][0].Count);
  }
);
