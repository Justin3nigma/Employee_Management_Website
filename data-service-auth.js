const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User;

module.exports.initialize = function(){
    return new Promise((resolve, reject)=>{
        let db = mongoose.createConnection("mongodb+srv://jahn31:jahn31@senecaweb322-dajdw.mongodb.net/web322a6?retryWrites=true&w=majority"); 
        
        db.on('error', (err)=>{
            reject(err);
        });

        db.once('open', ()=>{
            User = db.model("users",userSchema);
            resolve(); 
        });
    });
};

module.exports.registerUser = function(userData){
    return new Promise((resolve, reject)=>{
        if(userData.password != userData.password2){
            reject('Passwords do not match');
        }else{
           
            bcrypt.genSalt(10, function(err, salt){
                bcrypt.hash(userData.password, salt, function(err, hash){
                    if(!err){
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if(err){
                                if(err.code == 11000){
                                    reject("User Name already taken");
                                }
                                reject("There was an error creating the user: " + err);
                            }
                            else{
                                resolve();
                            }
                        })
                    }
                    else {
                        reject("There was an error encrypting the password");
                    }
                });  
            });
        }     
    });
};

module.exports.checkUser = function(userData){
    return new Promise((resolve, reject)=>{
        User.find({
            userName: userData.userName
        }).exec()
        .then((users)=>{
            if(!users){
                reject("Unable to find user: " + userData.userName);
            } else {
                bcrypt.compare(userData.password, users[0].password).then((res)=>{
                    if(res === true){
                        users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                        User.update({userName: users[0].userName},{$set: {loginHistory: users[0].loginHistory }},{multi: false}).exec().then(()=>{
                            resolve(users[0]);
                        }).catch((err)=>{
                            reject("There was an error verifying the user: " + err);
                        });
                    }else {
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                })
            }
            
        }).catch((err)=>{
            reject("Unable to find user: " + userData.userName);
        })
    });
};
