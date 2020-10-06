/********************************************************************************* 
 * * WEB322 – Assignment 06 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 * * of this assignment has been copied manually or electronically from any other source 
 * * (including 3rd party web sites) or distributed to other students. 
 * * 
 * * Name: JaehyunAhn Student ID: 157826181 Date: 2020/04/02
 * * 
 * * Online (Heroku) Link: https://git.heroku.com/shrouded-peak-14339.git/
 * * ********************************************************************************/

var dataService = require("./data-service");
var express = require("express");
var multer = require("multer");
var bodyParser = require("body-parser");
var path = require("path");
const exphbs = require("express-handlebars");
var app = express();
const fs = require("fs");
var HTTP_PORT = process.env.PORT || 8080;
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');
app.use((req, res, next) => {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// app.get-----------------------------
app.get("/", function (req, res) {
    res.render("home"); 
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.get("/employees/add", (req, res) => {
    dataService.getDepartments().then((data) => {
        res.render("addEmployee", { departments: data });
    }).catch((err) => {
        res.render("addEmployee", { departments: [] });
    })
});

app.get("/images/add", (req, res) => {
    res.render("addImage");
});

app.get("/employee/:empNum", (req, res) => {
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; 
        } else {
            viewData.employee = null; 
        }
    }).catch(() => {
        viewData.employee = null; 
    }).then(dataService.getDepartments)
        .then((data) => {
            viewData.departments = data; 
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; 
        }).then(() => {
            if (viewData.employee == null) {
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); 
            }
        });
});

app.get("/employees", function (req, res) {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    } else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    } else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    } else {
        dataService.getAllEmployees().then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
});

app.get("/employees/delete/:empNum", (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

app.get("/managers", function (req, res) {
    dataService.getManagers()
        .then((data) => { return res.json(data); })
        .catch((err) => { return res.json({ message: err }); });
});

app.get('/departments', (req, res) => {
    dataService.getDepartments().then((data) => {
        if (data.length > 0) {
            res.render("departments", { departments: data });
        } else {
            res.render("departments", { message: "no results" });
        }
    }).catch((err) => {
        res.render("departments", { message: "no results" });
    });
})

app.get("/departments/add", (req, res) => {
    res.render("addDepartment");
});

app.get("/department/:departmentId", (req, res) => {
    dataService.getDepartmentById(req.params.departmentId).then((data) => {
        res.render("department", { department: data });
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId", (req, res) => {
    dataService.deleteDepartmentById(req.params.departmentId).then((data) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Department / Department not found");
    });
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        res.render("images", { "images": items });
    })
})

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
})

app.post("/employees/add", (req, res) => {
    dataService.addEmployee(req.body).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        res.render("employees", { message: "no results" });
    });
})

app.post("/employee/update", (req, res) => {
    dataService.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Update Employee");
    });
});

app.post("/departments/add", (req, res) => {
    dataService.addDepartment(req.body).then((data) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.render("departments", { message: "no results" });
    });
});

app.post("/departments/update", (req, res) => {

    dataService.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Update Department");
    });
});

app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, "./views/error.html"));
})

dataService.initialize().then((data) => {
    app.listen(HTTP_PORT, function () {
        console.log(`Express http server listening on ${HTTP_PORT}`)
    });
}).catch((data) => {
    console.log("No initializing");
});
