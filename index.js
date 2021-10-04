const express = require("express");
var mysql = require("mysql");
const app = express();
const port = 3000;
const path = require("path");

// Creating Connection With The MySQL Database

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "SmAyMsVqAl11597",
  database: "attendance_records",
  multipleStatements: true
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected");
});

// Setting public as our content folder
app.use(express.static("public")); // We can thus specify multiple directories too

app.set("views", __dirname + "/public/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
var bodyParser = require("body-parser");
const { cursorTo } = require("readline");
app.use(bodyParser.urlencoded({ extended: true }));

// Now we can do these

// http://localhost:3000/images/kitten.jpg
// http://localhost:3000/css/style.css
// http://localhost:3000/js/app.js
// http://localhost:3000/images/bg.png
// http://localhost:3000/hello.html

// Here / is for homepage
var class_names = [];
var recent_date = [];
var absents_list = [];
var present_list = [];

app.get("/", (req, res) => {
  // Finding Class Names, Recent Dates

  con.query("SHOW TABLES;", (err, res) => {
    class_names = [];
    recent_date = [];
    absents_list = [];
    present_list = [];
    if (err) throw err;
    res.forEach((ClassNames) => {
      class_names.push(ClassNames.Tables_in_attendance_records);
      let k = ClassNames.Tables_in_attendance_records;
      con.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'Attendance_Records' AND TABLE_NAME ='${k}' ORDER BY ORDINAL_POSITION DESC LIMIT 1;`,
        (err, res) => {
          if (err) throw err;
          recent_date.push(res[0].COLUMN_NAME);
          con.query(
            `SELECT COUNT(*) AS Count FROM ${k} WHERE ${res[0].COLUMN_NAME} = "Absent"`,
            (err, result) => {
              if (err) throw err;
              absents_list.push(result[0].Count);
            }
          );
          con.query(
            `SELECT COUNT(*) AS Count FROM ${k} WHERE ${res[0].COLUMN_NAME} = "Present"`,
            (err, result) => {
              if (err) throw err;
              present_list.push(result[0].Count);
            }
          );
        }
      );
    });
  });

  console.log(class_names);
  console.log(recent_date);
  console.log(absents_list);
  console.log(present_list);
  res.render(path.join(__dirname, "/views/Homepage.html"), {
    classNames: class_names,
    recentDates: recent_date,
    absentees: absents_list,
    presentees: present_list,
  });
});

// Backend for /page1
app.get("/newStudent", (req, res) => {
  res.render(path.join(__dirname, "/views/NewStudent.html"), {
    classNames: class_names,
  });
});

app.post("/saveStudentRecord", (req, res) => {
  console.log(req.body.Name);
  console.log(req.body.Class);
  console.log(req.body.School);
  console.log(req.body.DOJ);
  console.log(req.body.MoP);
  console.log(req.body.Fee);

  function student_record_queries() {
    con.query("CREATE DATABASE IF NOT EXISTS Student_Records;", (err, res) => {
      // Not so necessary though
      if (err) throw err;
      con.query(`USE Student_Records;`, (err, res) => {
        if (err) throw err;
        con.query(
          `USE Student_Records;CREATE TABLE IF NOT EXISTS Records (Name varchar(50) PRIMARY KEY, Class varchar(20) NOT NULL, School varchar(50) NOT NULL, Date_Of_Joining varchar(25) NOT NULL, Payment_Pattern ENUM('Monthly', 'Yearly'), Fee INT NOT NULL)`,
          (err, res) => {
            if (err) throw err;
            con.query(
              `USE Student_Records;INSERT INTO Records VALUES("${req.body.Name}", "${req.body.Class}", "${req.body.School}", "${req.body.DOJ}", "${req.body.MoP}", ${req.body.Fee});`,
              (err, res) => {
                if (err) throw err;
              }
            );
          }
        );
      });
    });
  }

  function attendance_queries() {
    con.query(`USE Attendance_Records;`, (err, res) => {
      if (err) throw err;
      console.log(
        `SELECT count(*) as Count FROM information_schema.columns WHERE table_name = '${req.body.Class}';`
      );
      con.query(
        `USE ATTENDANCE_RECORDS;SELECT count(*) as Count FROM information_schema.columns WHERE table_name = '${req.body.Class}';`,
        (err, res) => {
          if (err) throw err;
          let column_count = res[1][0].Count - 1;
          let ab = "'Not joined', ";
          let ab_rep =
            `'${req.body.Name}', ` +
            ab.repeat(column_count - 1) +
            "'Not joined'";
          console.log(column_count, ab_rep);
          con.query(
            `USE ATTENDANCE_RECORDS;INSERT INTO ${req.body.Class} values (${ab_rep})`,
            (err, res) => {
              if (err) throw err;
            }
          );
        }
      );
    });
  }

  student_record_queries();
  attendance_queries();

  // Working on Student_Records Database

  

  
  
  res.render(path.join(__dirname, "/views/Homepage.html"), {
    classNames: class_names,
    recentDates: recent_date,
    absentees: absents_list,
    presentees: present_list,
  });
});

app.put("/page1", (req, res) => {
  res.send("Got a put request on page1 sir");
});

app.delete("/page1", (req, res) => {
  res.send("Got a delete request on page1 sir");
});

app.post("/processForm", (req, res) => {
  res.send("Hello " + req.body.name + " from " + req.body.country);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
