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
con.query(`SELECT * FROM Class1;`, (err, res) => {
  // console.log(res);
  res = JSON.stringify(res);
  console.log(res);
});
