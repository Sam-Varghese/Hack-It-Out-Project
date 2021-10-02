var mysql = require("mysql");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "SmAyMsVqAl11597",
  database: "attendance_records",
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected");
});

con.query(
  `SELECT 
COLUMN_NAME
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'Attendance_Records'
AND TABLE_NAME ='Class1'
ORDER BY ORDINAL_POSITION DESC 
LIMIT 1;`,
  (err, res) => {
    if (err) throw err;
    console.log(res);
  }
);
