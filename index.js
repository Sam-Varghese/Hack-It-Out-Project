const express = require("express");
var mysql = require("mysql");
var _ = require("lodash");
const app = express();
const port = 3000;
const path = require("path");

// Creating Connection With The MySQL Database

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

// Setting public as our content folder
app.use(express.static("public")); // We can thus specify multiple directories too

app.set("views", __dirname + "/public/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
var bodyParser = require("body-parser");
const { cursorTo } = require("readline");
const { Script } = require("vm");
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
var column_names = [];
var className;
var Date;
var Students;
var allStudents = [];
var newStudents = [];
var Students1 = [];
var columnCount;
var query;
var sql_data = [];

app.get("/", (req, res) => {
  // Finding Class Names, Recent Dates

  con.query("USE ATTENDANCE_RECORDS;SHOW TABLES;", (err, res) => {
    class_names = [];

    recent_date = [];
    absents_list = [];
    present_list = [];
    if (err) throw err;
    res[1].forEach((ClassNames) => {
      class_names.push(_.startCase(ClassNames.Tables_in_attendance_records));
      let k = ClassNames.Tables_in_attendance_records;
      con.query(
        `USE ATTENDANCE_RECORDS;SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'Attendance_Records' AND TABLE_NAME ='${k}' ORDER BY ORDINAL_POSITION DESC LIMIT 1;`,
        (err, res1) => {
          if (err) throw err;
          // console.log(class_names);
          // console.log(`Value of date: ${res1[1][0].COLUMN_NAME}`);
          recent_date.push(res1[1][0].COLUMN_NAME);
          let recent_class_date = res1[1][0].COLUMN_NAME;
          // console.log(recent_date);
          con.query(
            `USE ATTENDANCE_RECORDS;SELECT COUNT(*) AS Count FROM ${k} WHERE ${recent_class_date} = "Absent"`,
            (err, result) => {
              if (err) throw err;
              absents_list.push(result[1][0].Count);
            }
          );
          con.query(
            `USE ATTENDANCE_RECORDS;SELECT COUNT(*) AS Count FROM ${k} WHERE ${recent_class_date} = "Present"`,
            (err, result1) => {
              if (err) throw err;
              present_list.push(result1[1][0].Count);
            }
          );
        }
      );
    });
  });

  // console.log(class_names);
  // console.log(recent_date);
  // console.log(absents_list);
  // console.log(present_list);
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
          var ab_rep;
          if (column_count == 0) {
            ab_rep = `'${req.body.Name}'`;
          } else {
            ab_rep =
              `'${req.body.Name}', ` +
              ab.repeat(column_count - 1) +
              "'Not joined'";
          }

          // console.log(column_count, ab_rep);
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

  res.redirect("/");
});

app.get("/newClass", (req, res) => {
  res.render(path.join(__dirname, "/views/NewClass.html"));
});

app.get("/Attendance", (req, res) => {
  res.render(path.join(__dirname, "/views/Attendance.html"), {
    classNames: class_names,
  });
});

// Class Naming Convention

// No underscores, dashes or any such separator
// Simply write class followed by its number
// But it does not matter at all if you put these separators, because they are automatically going to be removed
// So use only alphabets and digits

app.post("/attendanceForm", (req, post_res) => {
  Students = [];
  allStudents = [];
  className = "";
  Date = "";
  className = _.camelCase(req.body.ClassName);
  Date = req.body.Date.split("-");
  Date = Date[2] + "_" + Date[1] + "_" + Date[0];
  Students = req.body.Students.replace(/\r\n/g, "\n").split("\n");
  Students = Students.filter((item) => {
    if (
      [undefined, "", "Paul", "Paul Classes", "C.Paul Varghese"].includes(
        _.startCase(item)
      ) == false
    ) {
      console.log(Students);
      Students1.push(_.startCase(item));
      return _.startCase(item);
    }
  });
  console.log("Rough array1: ");
  console.log(Students1);

  console.log(className);
  console.log(Date);
  console.log("Here's the students list: ");
  console.log(Students);

  function saveAttendanceRecords() {
    con.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='attendance_records' AND TABLE_NAME='${className}';`,
      (err, res) => {
        console.log(res);
        res.forEach((element) => {
          column_names.push(element.COLUMN_NAME);
        });
        if (column_names.includes(Date)) {
          con.query(`UPDATE ${className} SET ${Date}='Absent';`, (err, res) => {
            if (err) throw err;
            Students.forEach((element) => {
              let k = element;
              con.query(
                `UPDATE ${className} SET ${Date} = 'Present' WHERE Students = '${k}';`,
                (err, res) => {
                  if (err) throw err;
                  console.log(`Attendance of ${k} marked.`);
                }
              );
            });
          });
        } else {
          con.query(
            `USE Attendance_Records; ALTER TABLE ${className} ADD COLUMN ${Date} ENUM('Absent', 'Present', 'Not joined') DEFAULT 'Absent';`,
            (err, res) => {
              if (err) throw err;
              Students.forEach((element) => {
                let k = element;
                con.query(
                  `UPDATE ${className} SET ${Date} = 'Present' WHERE Students = '${k}';`,
                  (err, res) => {
                    if (err) throw err;
                    console.log(`Attendance of ${k} marked.`);
                  }
                );
              });
            }
          );
        }
      }
    );
  }

  con.query(`SELECT Students FROM ${className};`, (err, res) => {
    if (err) throw err;
    allStudents.push("New student");
    allStudents.push("Ignore");
    res.forEach((element) => {
      allStudents.push(_.startCase(element.Students));
    });
    if (_.difference(Students1, allStudents).length != 0) {
      console.log("Unidentified names detected sir");
      newStudents = _.difference(Students1, allStudents);
      console.log(newStudents);
      console.log(allStudents);
      post_res.render(path.join(__dirname, "/views/unidentifiedNames.html"), {
        unidentifiedNames: newStudents,
        allStudents: allStudents,
      });
    } else {
      console.log(
        "No unidentified names detected, proceeding to save the data"
      );
      saveAttendanceRecords();
      post_res.redirect("/");
    }
  });

  console.log("About to send the following data: ");
  console.log(newStudents);
  console.log(allStudents);
});

app.get("/newStudentInfoGatherer", (req, res) => {
  res.render(path.join(__dirname, "/views/unidentifiedNames.html"), {
    unidentifiedNames: newStudents,
    allStudents: allStudents,
  });
});

app.post("/unidentifiedStudentsForm", (req, res) => {
  console.log("*".repeat(20));
  console.log("From unidentified students form: ");
  console.log(className);
  // Finding column names
  con.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='attendance_records' AND TABLE_NAME='${className}';`, (err, res) => {
      if (err) throw err;
      res.forEach((columnName) => {
        let column_name = columnName;
        column_names.push(columnName.COLUMN_NAME);
      })
      if (column_names.includes(Date)) {
        console.log(`Date ${Date} already exists sir.`);
        query = `USE ATTENDANCE_RECORDS; UPDATE ${className} SET ${Date}='Absent';`;
        con.query(query, (err, res) => {
          if (err) throw err;
        })
      } else {
        console.log(`Date ${Date} does not exists sir.`);
        query = `USE Attendance_Records; ALTER TABLE ${className} ADD COLUMN ${Date} ENUM('Absent', 'Present', 'Not joined') DEFAULT 'Absent';`;
        con.query(query, (err, res) => {
          if (err) throw err;
        })
      }
      columnCount = column_names.length;
      for (var Name in req.body) {
        let studentName = Name;
        if (req.body[studentName] == "New student") {
          var expression =
            "'" +
            studentName +"'"+
            ", 'Not joined'".repeat(columnCount - 2) +
            ", 'Present'";
          con.query(`INSERT INTO ${className} VALUES (${expression});`, (err, res) => {
            if (err) throw err;
            console.log(`Student named ${studentName} added to ${className}`);
          });
        } else if (req.body[studentName] == "Ignore") {
          
        } else {
          con.query(`UPDATE ${className} SET ${Date}='Present' WHERE Students = '${req.body[studentName]}';`, (err, res) => {
            if (err) throw err;
            console.log(`Attendance of ${studentName} who is ${req.body[studentName]} marked successfully.`);
          })
        }
      }
      Students.forEach((Student) => {
        if (Student in req.body == false) {
          let k = Student;
          con.query(
            `UPDATE ${className} SET ${Date} = 'Present' WHERE Students = '${k}';`, (err, res) => {
              if (err) throw err;
              console.log(`Attendance of ${k} marked sir.`);
            }
          );
        }
      })
    }
  );
  res.redirect("/");
})
  
app.post("/newClassForm", (req, res) => {
  console.log(req.body.Name);
  className = _.camelCase(req.body.Name);
  console.log(req.body.StudentNames.replace(/\r\n/g, "\n").split("\n"));

  studentsList = req.body.StudentNames.replace(/\r\n/g, "\n").split("\n");

  con.query(
    `CREATE TABLE IF NOT EXISTS ${className} (Students varchar(30));`,
    (err, res) => {
      if (err) throw err;
      studentsList.forEach((element) => {
        let k = element;
        con.query(`INSERT INTO ${className} VALUES("${k}");`, (err, res) => {
          if (err) throw err;
        });
      });
    }
  );

  res.redirect("/");
});

app.get("/attendanceRecordsPage", (req, response) => {
  class_names = [];
  con.query("SHOW TABLES;", (err, res) => {
    if (err) throw err;
    res.forEach((classNames) => {
      class_names.push(_.startCase(classNames.Tables_in_attendance_records));
    })
    response.render(path.join(__dirname, "/views/attendanceRecords1.html"), {
      classNames: class_names,
    });
  })
})

app.post("/attendanceRecordsPageSubmit", (req, res) => {
  className = _.replace(req.body.Class, " ", ""); // Beware, this may also cause errors
  sql_data = [];
  con.query(`SELECT * FROM ${className};`, (error, result) => {
    if (error) throw error;
    result = JSON.stringify(result);
    // console.log(result);
    res.render(path.join(__dirname, "/views/attendanceRecords.html"), {
      classData: result,
      className: _.startCase(className)
    });
  })
})

app.delete("/page1", (req, res) => {
  res.send("Got a delete request on page1 sir");
});

app.post("/processForm", (req, res) => {
  res.send("Hello " + req.body.name + " from " + req.body.country);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
