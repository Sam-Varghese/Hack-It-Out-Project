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
//Another query in order to access previous date
      con.query(
        `SELECT 
COLUMN_NAME,
ORDINAL_POSITION
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'YOUR_DATABASE_NAME'
AND TABLE_NAME ='YOUR_TABLE_NAME'
ORDER BY ORDINAL_POSITION DESC 
LIMIT 1;`,
        (req, result) => {
          if (err) throw err;
          console.log(`  Class inside con.query is ${className}`);
          yesterdays_date = result[1].COLUMN_NAME;
          console.log(
            `    Yeserday's date detected ${yesterdays_date} for class ${className}`
          );
          //Another query to access present students count for previous date
          con.query(
            `SELECT COUNT(*) AS COUNT from ${className} WHERE ${yesterdays_date}="Present"`,
            (err, result) => {
              if (err) throw err;
              present_students = result[0].COUNT;
              class_names.ClassName.Present = present_students;
            }
          );
          //Another query to access absent students count for previous date
          con.query(
            `SELECT COUNT(*) AS COUNT from ${className} WHERE ${yesterdays_date}="Absent"`,
            (err, result) => {
              if (err) throw err;
              absent_students = result[0].COUNT;
              class_names.ClassName.Absent = absent_students;
            }
          );
        }
      );