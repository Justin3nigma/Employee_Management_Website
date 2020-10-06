const Sequelize = require('sequelize');
var sequelize = new Sequelize('d4vga7j66ab7rm', 'ohxfgupefdbenh', '3da6e98499706ed37330c951f69550325800be7972f6ee60a386791c5973ae36', {
    host: 'ec2-52-71-85-210.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

const Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    matritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

const Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, { foreignKey: 'department' });

module.exports.initialize = function () {

    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => {
            resolve();
        }).catch((err) => {
            reject("unable to sync the database");
        });
    });
}

module.exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) {
        Employee.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
    });
}

module.exports.getEmployeesByStatus = function (status) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { status: status }
        })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned.");
            });
    });
}

module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { department: department }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.getEmployeesByManager = function (manager) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { employeeManagerNum: manager }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: { employeeNum: num }
        }).then((data) => {
            resolve(data[0]);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.getDepartments = function () {
    return new Promise(function (resolve, reject) {
        Department.findAll()
            .then((data) => {
                resolve(data);
            }).catch((err) => {
                reject("no results returned");
            });
    });
}


module.exports.addEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (let i in employeeData) {
            if (employeeData[i] == "") {
                employeeData[i] = null;
            }
        }
        Employee.create(employeeData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to create employee");
            });
    });
}

module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (let i in employeeData) {
            if (employeeData[i] == "") {
                employeeData[i] = null;
            }
        }
        Employee.update(employeeData, {
            where: { employeeNum: employeeData.employeeNum }
        })
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to update employee");
            });
    });
}

module.exports.addDepartment = (departmentData) => {
    return new Promise((resolve, reject) => {
        for (let i in departmentData) {
            if (departmentData[i] == "") {
                departmentData[i] = null;
            }
        }
        Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }).then(() => {
            resolve(Department);
        }).catch((err) => {
            reject("unable to create department.");
        });
    });
}

module.exports.updateDepartment = (departmentData) => {
    return new Promise((resolve, reject) => {
        for (let i in departmentData) {
            if (departmentData[i] == "") {
                departmentData[i] = null;
            }
        }
        Department.update({
            departmentName: departmentData.departmentName
        }, {
            where: { departmentId: departmentData.departmentId }
        }).then(() => {
            resolve(Department);
        }).catch((err) => {
            reject("unable to create department.");
        });
    });
}

module.exports.getDepartmentById = (id) => {
    return new Promise((resolve, reject) => {
        Department.findAll({
            where: { departmentId: id }
        }).then((data) => {
            resolve(data[0]);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.deleteDepartmentById = (id) => {
    return new Promise(function (resolve, reject) {
        Department.destroy({
            where: { departmentId: id }
        }).then(() => {
            resolve();
        })
            .catch((err) => {
                reject("Unable to delete department");
            });
    });
}

module.exports.deleteEmployeeByNum = (empNum) => {
    return new Promise(function (resolve, reject) {
        Employee.destroy({
            where: { employeeNum: empNum }
        }).then(function () {
            resolve();
        })
            .catch(function (err) {
                reject("unable to delete employee");
            });
    });
}