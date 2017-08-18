console.log("[START] post.js");
module.exports=function(app,db){
    var chalk=require("chalk");
    var CryptoJS=require("crypto-js");
    var fs=require("fs-extra");
    var moment=require("moment");
    var ObjectID=require("mongodb").ObjectID;
    var request=require("request");

    var configDB=db.collection("config");
    var courseSuggestionDB=db.collection("courseSuggestion");
    var fullHybridDB=db.collection("fullHybrid");
    // var hybridSeatDB=db.collection("hybridSeat");
    // var hybridSheetDB=db.collection("hybridSheet");
    var studentAttendanceModifierDB=db.collection("studentAttendanceModifier");
    var studentCommentDB=db.collection("studentComment");
    var randomPasswordDB=db.collection("randomPassword");
    var userDB=db.collection("user");

    var gradeBitToString=function(bit){
        var output="",p=false,s=false;
        for(var i=0;i<6;i++){
            if(bit&(1<<i)){
                if(p==false){
                    p=true;
                    output+="P";
                }
                output+=(i+1);
            }
        }
        for(var i=0;i<6;i++){
            if(bit&(1<<(i+6))){
                if(s==false){
                    s=true;
                    output+="S";
                }
                output+=(i+1);
            }
        }
        if(bit&(1<<12))output+="SAT";
        return output;
    };
    var gradeBitToArray=function(bit){
        var output=[];
        for(var i=0;i<13;i++){
            if(bit&(1<<i)){
                output.push(i+1);
            }
        }
        return output;
    };
    var gradeArrayToBit=function(array){
        var output=0;
        for(var i=0;i<array.length;i++){
            output|=(1<<(array[i]-1));
        }
        return output;
    };
    var prettify=function(str){
        return JSON.stringify(str,null,2);
    };
    var bool=function(str){
        if(str=="false"||str=="0"||str=="")return false;
        return true;
    };
    // function splitCourseName(name){
    //     if(typeof(name)=="string"){
    //         if(name.slice(0,3).toLowerCase()=="sat"){
    //             return {subject:name.slice(3),grade:"SAT",level:""}
    //         }
    //         var subject,grade,level;
    //         var firstdigit=name.indexOf(name.match(/\d/));
    //         subject=name.slice(0,firstdigit-1).toUpperCase();
    //         if(/[0-9]/.test(name[name.length-1])){
    //             grade=name.slice(firstdigit-1,name.length).toUpperCase();
    //             level="";
    //         }
    //         else{
    //             grade=name.slice(firstdigit-1,name.length-1).toUpperCase();
    //             level=name[name.length-1].toLowerCase();
    //         }
    //         return {subject:subject,grade:grade,level:level};
    //     }
    //     else return {subject:"Wrong input",grade:"Wrong input",level:"Wrong input"};
    // };
    // var gradeStringToBit=function(grade){
    //     var output=0;
    //     if(grade[0]=="P"){
    //         for(var i=1;i<grade.length;i++){
    //             output|=(1<<(grade[i]-"1"));
    //         }
    //     }
    //     if(grade[0]=="S"){
    //         for(var i=1;i<grade.length;i++){
    //             output|=(1<<(grade[i]-"1"+6));
    //         }
    //     }
    //     return output;
    // };
    var getCourseDB=function(callback){
        configDB.findOne({},function(err,config){
            callback(db.collection("CR"+config.year+"Q"+config.quarter));
        });
    };
    var getCourseName=function(courseID,callback){
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                var subject=result.subject;
                var grade=result.grade;
                var level=result.level;
                callback(subject+gradeBitToString(grade)+level);
            });
        });
    };

    var logPosition=function(cookie,callback){
        var userID=parseInt(cookie.monkeyWebUser);
        var password=cookie.monkeyWebPassword;
        if(userID&&password){
            userDB.findOne({_id:userID,password:password},function(err,result){
                if(result==null)callback(chalk.black.bgRed);
                else if(result.position=="dev")callback(chalk.black.bgBlue);
                else if(result.position=="admin")callback(chalk.black.bgCyan);
                else if(result.position=="tutor")callback(chalk.black.bgMagenta);
                else callback(chalk.black.bgGreen);
            });
        }
        else callback(chalk.black.bgWhite);
    }
    var findUser=function(res,userID,options,callback){
        userDB.findOne({_id:userID},function(err,result){
            if(result==null)res.send({err:"The requested userID doesn't exist."});
            else{
                if(options.position!=undefined){
                    if(typeof(options.position)=="string"){
                        if(options.position!=result.position){
                            res.send({err:"The requested userID isn't a "+options.position+"."});
                        }
                        else callback(result);
                    }
                    else{
                        if(!options.position.includes(result.position)){
                            res.send({err:"The requested userID isn't a "+options.position+"."});
                        }
                        else callback(result);
                    }
                }
                else callback(result);
            }
        });
    };

    var callbackLoop=function(n,inLoop,endLoop){
        var c=0;
        var finish=function(){
            if(c==n)endLoop();
            c++;
        };
        for(var i=0;i<n;i++){
            inLoop(i,function(){
                finish();
            });
        }
        finish();
    };
    var lineNotify=function(recipient,message,callback){
        if(callback===undefined)callback=function(){};
        if(app.locals.recipientToken[recipient]===undefined){
            callback({err:"Recipient not found."});
        }
        else{
            request.post("https://notify-api.line.me/api/notify",{
                auth:{bearer:app.locals.recipientToken[recipient]},
                form:{message:message}
            },function(err,res,body){
                if(body.status==500){
                    console.log(chalk.black.bgRed("LINE Notify failed"));
                    console.log(chalk.black.bgRed(body.message));
                    callback(err,res,body);
                }
                else callback(err,res,body);
            });
        }
    };

    // All post will return {err} if error occurs
    var post=function(url,callback){
        app.locals.postFunction[url.slice(1)]=callback;
        app.post(url,function(req,res){
            logPosition(req.cookies,function(positionColor){
                console.log(chalk.black.bgBlue("[POST REQUEST]"),url.slice(1),
                    "FROM",req.ip,positionColor("#"+req.cookies.monkeyWebUser),
                    moment().format("@ dddDDMMMYYYY HH:mm:ss")
                );
                var file=[];
                if(req.files!=undefined)file=req.files.map(function(x){return x.originalname});
                console.log("\treq.body","=>",req.body);
                console.log("\treq.files","=>",file);
                var oldSend=res.send;
                res.send=function(){
                    oldSend.apply(this,arguments);
                    if(arguments[0].err){
                        console.log(chalk.black.bgRed("[ERROR POST REQUEST]",url.slice(1),
                            "FROM",req.ip,positionColor("#"+req.cookies.monkeyWebUser),
                            moment().format("@ dddDDMMMYYYY HH:mm:ss")
                        ));
                        console.log(chalk.black.bgRed("\treq.body","=>",prettify(req.body)));
                        console.log(chalk.black.bgRed("\treq.files","=>",prettify(file)));
                        console.log(chalk.black.bgRed("\terror.detail","=>",prettify(arguments[0])));
                    }
                }
                callback(req,res);
            });
        });
    };

    // User Information
    //OK {userID,password} return {verified}
    post("/post/password",function(req,res){
        var userID=parseInt(req.body.userID);
        var password=req.body.password;
        userDB.findOne({_id:userID,password:password},function(err,result){
            if(result==null){
                res.send({verified:false});
            }
            else{
                if(result.position=="student"){
                    if(["active","inactive"].includes(result.student.status)){
                        res.send({verified:true});
                    }
                    else res.send({verified:false});
                }
                else res.send({verified:true});
            }
        });
    });
    //OK {userID} return {firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn}
    post("/post/name",function(req,res){
        var userID=parseInt(req.body.userID);
        findUser(res,userID,{},function(result){
            res.send({
                firstname:result.firstname,
                lastname:result.lastname,
                nickname:result.nickname,
                firstnameEn:result.firstnameEn,
                lastnameEn:result.lastnameEn,
                nicknameEn:result.nicknameEn
            });
        });
    });
    //OK {userID} return {position}
    post("/post/position",function(req,res){
        var userID=parseInt(req.body.userID);
        findUser(res,userID,{},function(result){
            res.send({position:result.position});
        });
    });
    //OK {userID} return {status}
    post("/post/status",function(req,res){
        var userID=parseInt(req.body.userID);
        findUser(res,userID,{},function(result){
            if(result.position=="student"){
                res.send({status:result.student.status});
            }
            else res.send({status:result.tutor.status});
        });
    });
    //OK {userID,status} return {}
    post("/post/changeStatus",function(req,res){
        var userID=parseInt(req.body.userID);
        var status=req.body.status;
        findUser(res,userID,{},function(result){
            if(result.position=="student"){
                userDB.updateOne({_id:userID},{
                    $set:{"student.status":status}
                },function(){
                    res.send({});
                });
            }
            else{
                userDB.updateOne({_id:userID},{
                    $set:{"tutor.status":status}
                },function(){
                    res.send({});
                });
            }
        });
    });

    // Student Information
    //OK {} return {student:[{studentID,firstname,lastname,nickname,grade,registrationState,status,inCourse,inHybrid}]}
    post("/post/allStudent",function(req,res){
        var output=[];
        userDB.find({position:"student"}).sort({_id:1}).toArray(function(err,result){
            callbackLoop(result.length,function(i,continueLoop){
                getCourseDB(function(courseDB){
                    courseDB.findOne({student:result[i]._id},function(err,course){
                        fullHybridDB.findOne({"student.studentID":result[i]._id},function(err,hybrid){
                            output[i]={
                                studentID:result[i]._id,
                                firstname:result[i].firstname,
                                lastname:result[i].lastname,
                                nickname:result[i].nickname,
                                grade:result[i].student.grade,
                                registrationState:result[i].student.registrationState,
                                status:result[i].student.status,
                                inCourse:course!=null,
                                inHybrid:hybrid!=null
                            };
                            continueLoop();
                        });
                    });
                });
            },function(){
                res.send({student:output});
            });
        });
    });
    //OK {studentID} return {user.student,firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn,[courseID],[hybridDay]}
    post("/post/studentProfile",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var output={};
        findUser(res,studentID,{position:"student"},function(result){
            output=Object.assign(result.student,{
                firstname:result.firstname,
                lastname:result.lastname,
                nickname:result.nickname,
                firstnameEn:result.firstnameEn,
                lastnameEn:result.lastnameEn,
                nicknameEn:result.nicknameEn,
                email:result.email,phone:result.phone,
                courseID:[],hybridDay:[]
            });
            getCourseDB(function(courseDB){
                courseDB.find({student:studentID}).sort({day:1}).toArray(function(err,course){
                    for(var i=0;i<course.length;i++){
                        output.courseID.push(course[i]._id);
                    }
                    fullHybridDB.find({"student.studentID":studentID}).sort({day:1}).toArray(function(err,hybrid){
                        for(var i=0;i<hybrid.length;i++){
                            var index=hybrid[i].student.findIndex(function(x){
                                return x.studentID==studentID;
                            });
                            output.hybridDay.push({
                                subject:hybrid[i].student[index].subject,
                                day:hybrid[i].day
                            });
                        }
                        res.send(output);
                    });
                });
            });
        });
    });
    //OK {studentID} return {registrationState}
    post("/post/registrationState",function(req,res){
        var studentID=parseInt(req.body.studentID);
        findUser(res,studentID,{position:"student"},function(result){
            res.send({registrationState:result.student.registrationState});
        });
    });
    //OK {studentID,registrationState} return {}
    post("/post/changeRegistrationState",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var registrationState=req.body.registrationState;
        findUser(res,studentID,{position:"student"},function(result){
            userDB.updateOne({_id:studentID},{
                $set:{"student.registrationState":registrationState}
            },function(){
                res.send({});
            });
        });
    });

    // Student Timetable
    //OK {studentID,[courseID]} return {}
    post("/post/addStudentCourse",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var courseID=req.body.courseID;
        //TODO var errOutput=[];
        findUser(res,studentID,{position:"student"},function(result){
            getCourseDB(function(courseDB){
                callbackLoop(courseID.length,function(i,continueLoop){
                    courseDB.updateOne({_id:courseID[i]},{
                        $addToSet:{student:studentID}
                    },function(){
                        continueLoop();
                    });
                },function(){
                    res.send({});
                });
            });
        });
    });
    //OK {studentID,[courseID]} return {}
    post("/post/removeStudentCourse",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var courseID=req.body.courseID;
        //TODO var errOutput=[];
        findUser(res,studentID,{position:"student"},function(result){
            getCourseDB(function(courseDB){
                callbackLoop(courseID.length,function(i,continueLoop){
                    courseDB.updateOne({_id:courseID[i]},{
                        $pull:{student:studentID}
                    },function(){
                        continueLoop();
                    });
                },function(){
                    res.send({});
                });
            });
        });
    });
    //OK {studentID,day,subject} return {}
    post("/post/addSkillDay",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        var subject=req.body.subject;
        findUser(res,studentID,{position:"student"},function(result){
            userDB.updateOne({_id:studentID},{
                $addToSet:{"student.skillDay":{subject:subject,day:day}}
            },function(){
                res.send({});
            });
        });
    });
    //OK {studentID,day} return {}
    post("/post/removeSkillDay",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        findUser(res,studentID,{position:"student"},function(result){
            userDB.updateOne({_id:studentID},{
                $pull:{"student.skillDay":{day:day}}
            },function(){
                res.send({});
            });
        });
    });
    //OK {studentID,day,subject} return {}
    post("/post/addHybridDay",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        var subject=req.body.subject;
        findUser(res,studentID,{position:"student"},function(result){
            fullHybridDB.updateOne({day:day},{
                $setOnInsert:{_id:moment(day).format("dddHH")},
                $addToSet:{student:{studentID:studentID,subject:subject}}
            },{upsert:true},function(){
                res.send({});
            });
        });
    });
    //OK {studentID,day} return {}
    post("/post/removeHybridDay",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        findUser(res,studentID,{position:"student"},function(result){
            fullHybridDB.updateOne({day:day},{
                $pull:{student:{studentID:studentID}}
            },function(){
                res.send({});
            });
        });
    });

    // User Management
    //OK {password,firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn,email,phone,grade(1-12),phoneParent} return {}
    post("/post/addStudent",function(req,res){
        var password=req.body.password;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var firstnameEn=req.body.firstnameEn;
        var lastnameEn=req.body.lastnameEn;
        var nicknameEn=req.body.nicknameEn;
        var email=req.body.email;
        var phone=req.body.phone;
        var grade=parseInt(req.body.grade);
        var phoneParent=req.body.phoneParent;
        configDB.findOne({},function(err,config){
            userDB.insertOne({
                _id:config.nextStudentID,password:password,position:"student",
                firstname:firstname,lastname:lastname,nickname:nickname,
                firstnameEn:firstnameEn,lastnameEn:lastnameEn,nicknameEn:nicknameEn,
                email:email,phone:phone,
                student:{
                    grade:grade,registrationState:"unregistered",
                    skillDay:[],phoneParent:phoneParent,status:"active"
                }
            },function(err,result){
                configDB.updateOne({},{$inc:{nextStudentID:1}});
                // res.send({}); TODO
                res.send(result.ops);
            });
        });
    });
    //OK {studentID} return {}
    post("/post/removeStudent",function(req,res){
        var studentID=parseInt(req.body.studentID);
        findUser(res,studentID,{position:"student"},function(result){
            userDB.deleteOne({_id:studentID},function(){
                res.send({});
            });
        });
    });
    //OK {studentID,password,firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn,email,phone,grade(1-12),phoneParent} return {}
    post("/post/editStudent",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var input={};
        var addField=function(field,options){
            var out=field;
            if(options==undefined)options={};
            if(options.out)out=options.out;
            if(req.body[field]){
                if(options.toInt)input[out]=parseInt(req.body[field]);
                else input[out]=req.body[field];
            }
        };
        addField("password");
        addField("firstname");
        addField("lastname");
        addField("nickname");
        addField("firstnameEn");
        addField("lastnameEn");
        addField("nicknameEn");
        addField("email");
        addField("phone");
        addField("grade",{out:"student.grade",toInt:true});
        addField("phoneParent",{out:"student.phoneParent"});
        findUser(res,studentID,{position:"student"},function(result){
            userDB.updateOne({_id:studentID},{$set:input},function(){
                if(result.student.registrationState=="unregistered"){
                    userDB.updateOne({_id:studentID},{
                        $set:{"student.registrationState":"untransferred"}
                    },function(){
                        res.send({});
                    });
                }
                else res.send({});
            });
        });
    });
    //OK {password,firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn,email,phone} return {}
    post("/post/addTutor",function(req,res){
        var password=req.body.password;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var firstnameEn=req.body.firstnameEn;
        var lastnameEn=req.body.lastnameEn;
        var nicknameEn=req.body.nicknameEn;
        var email=req.body.email;
        var phone=req.body.phone;
        configDB.findOne({},function(err,config){
            userDB.insertOne({
                _id:config.nextTutorID,password:password,position:"tutor",
                firstname:firstname,lastname:lastname,nickname:nickname,
                firstnameEn:firstnameEn,lastnameEn:lastnameEn,nicknameEn:nicknameEn,
                email:email,phone:phone,
                tutor:{status:"active"}
            },function(err,result){
                configDB.updateOne({},{$inc:{nextTutorID:1}});
                // res.send({}); TODO
                res.send(result.ops);
            });
        });
    });
    //OK {tutorID} return {}
    post("/post/removeTutor",function(req,res){
        var tutorID=parseInt(req.body.tutorID);
        findUser(res,studentID,{position:"tutor"},function(result){
            userDB.deleteOne({_id:tutorID},function(){
                res.send({});
            });
        });
    });
    //OK editTutor {tutorID,password,firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn,email,phone} return {}
    post("/post/editTutor",function(req,res){
        var tutorID=parseInt(req.body.tutorID);
        var input={};
        var addField=function(field,options){
            var out=field;
            if(options==undefined)options={};
            if(options.out)out=options.out;
            if(req.body[field]){
                if(options.toInt)input[out]=parseInt(req.body[field]);
                else input[out]=req.body[field];
            }
        };
        addField("password");
        addField("firstname");
        addField("lastname");
        addField("nickname");
        addField("firstnameEn");
        addField("lastnameEn");
        addField("nicknameEn");
        addField("email");
        addField("phone");
        findUser(res,tutorID,{position:["tutor","admin","dev"]},function(result){
            userDB.updateOne({_id:tutorID},{$set:input},function(){
                res.send({});
            });
        });
    });
    //OK {studentID} return {}
    post("/post/addBlankStudent",function(req,res){
        var studentID=req.body.studentID.split(" ");
        for(var i=0;i<studentID.length;i++){
            studentID[i]=parseInt(studentID[i]);
            var password="";
            password+=Math.floor(Math.random()*10);
            password+=Math.floor(Math.random()*10);
            password+=Math.floor(Math.random()*10);
            password+=Math.floor(Math.random()*10);
            userDB.insertOne({
                _id:studentID[i],password:CryptoJS.SHA3(password).toString(),
                position:"student",
                firstname:"",lastname:"",nickname:"",
                firstnameEn:"",lastnameEn:"",nicknameEn:"",
                email:"",phone:"",
                student:{
                    grade:0,registrationState:"unregistered",
                    skillDay:[],phoneParent:"",status:"active"
                }
            });
            randomPasswordDB.insertOne({_id:studentID[i],password:password});
        }
        res.send({});
    });
    //OK {} return {[student]}
    post("/post/listRandomStudent",function(req,res){
        var output=[];
        randomPasswordDB.find().sort({_id:1}).toArray(function(err,result){
            for(var i=0;i<result.length;i++){
                output[i]={
                    studentID:result[i]._id,
                    password:result[i].password
                };
            }
            res.send({student:output});
        });
    });
    //OK {tutorID,position} return {}
    post("/post/changePosition",function(req,res){
        var tutorID=parseInt(req.body.tutorID);
        var position=req.body.position;
        findUser(res,tutorID,{position:["tutor","admin","dev"]},function(result){
            userDB.updateOne({_id:tutorID},{
                $set:{position:position}
            },function(){
                res.send({});
            });
        });
    });

    // Course
    //OK {} return {course:[{courseID,subject,[grade],level,day,[tutor],[student],courseName,[tutorNicknameEn]}]}
    post("/post/allCourse",function(req,res){
        var output=[];
        getCourseDB(function(courseDB){
            courseDB.find().sort({subject:1,grade:1,level:1,tutor:1}).toArray(function(err,result){
                callbackLoop(result.length,function(i,continueLoop){
                    getCourseName(result[i]._id,function(courseName){
                        output[i]={courseID:result[i]._id};
                        output[i]=Object.assign(output[i],result[i]);
                        delete output[i]._id;
                        output[i].grade=gradeBitToArray(output[i].grade);
                        delete output[i].submission;
                        output[i].courseName=courseName;
                        output[i].tutorNicknameEn=[];
                        callbackLoop(result[i].tutor.length,function(j,continueLoop){
                            userDB.findOne({_id:result[i].tutor[j]},function(err,tutor){
                                output[i].tutorNicknameEn[j]=tutor.nicknameEn;
                                continueLoop();
                            });
                        },function(){
                            continueLoop();
                        });
                    });
                },function(){
                    res.send({course:output});
                });
            });
        });
    });
    //OK {grade(1-13)} return {course:[{courseID,courseName,day,[tutor]}]}
    post("/post/gradeCourse",function(req,res){
        var grade=parseInt(req.body.grade);
        var output=[];
        getCourseDB(function(courseDB){
            courseDB.find({grade:{$bitsAllSet:[grade-1]}}).sort({subject:1,grade:1,level:1,tutor:1}).toArray(function(err,result){
                callbackLoop(result.length,function(i,continueLoop){
                    getCourseName(result[i]._id,function(courseName){
                        output.push({
                            courseID:result[i]._id,courseName:courseName,
                            day:result[i].day,tutor:result[i].tutor
                        });
                        continueLoop();
                    });
                },function(){
                    res.send({course:output});
                });
            });
        });
    });
    //OK {courseID} return {courseName,day,[tutor],[student]}
    post("/post/courseInfo",function(req,res){
        var courseID=req.body.courseID;
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                if(result==null)res.send({err:"The requested course doesn't exist."});
                else{
                    getCourseName(courseID,function(courseName){
                        res.send({
                            courseName:courseName,day:result.day,
                            tutor:result.tutor,student:result.student
                        });
                    });
                }
            });
        });
    });
    //OK {grade} return {[course]}
    post("/post/listCourseSuggestion",function(req,res){
        var grade=parseInt(req.body.grade);
        var output=[];
        courseSuggestionDB.find({grade:grade}).sort({level:1}).toArray(function(err,result){
            if(result==null)res.send({course:output});
            else{
                for(var i=0;i<result.length;i++){
                    output[i]={
                        level:result[i].level,
                        courseID:result[i].courseID
                    };
                }
                res.send({course:output});
            }
        });
    });
    //OK {grade,level,[courseID]} return {}
    post("/post/addCourseSuggestion",function(req,res){
        var grade=parseInt(req.body.grade);
        var level=req.body.level;
        var courseID=req.body.courseID;
        courseSuggestionDB.updateOne({grade:grade,level:level},{
            $setOnInsert:{_id:grade+level},
            $addToSet:{courseID:{$each:courseID}}
        },{upsert:true},function(){
            res.send({});
        });
    });
    //OK {grade,level,[courseID]} return {}
    post("/post/removeCourseSuggestion",function(req,res){
        var grade=parseInt(req.body.grade);
        var level=req.body.level;
        var courseID=req.body.courseID;
        courseSuggestionDB.updateOne({grade:grade,level:level},{
            $pull:{courseID:{$in:courseID}}
        },function(){
            res.send({});
        });
    });
    //OK {subject,[grade],level,day,[tutor],description,room} return {}
    post("/post/addCourse",function(req,res){
        var courseID=new ObjectID().toString();
        var subject=req.body.subject;
        var grade=req.body.grade;
        for(var i=0;i<grade.length;i++){
            grade[i]=parseInt(grade[i]);
        }
        grade=gradeArrayToBit(grade);
        var level=req.body.level;
        var day=parseInt(req.body.day);
        var tutor=req.body.tutor;
        for(var i=0;i<tutor.length;i++){
            tutor[i]=parseInt(tutor[i]);
        }
        var description=req.body.description;
        var room=parseInt(req.body.room);
        getCourseDB(function(courseDB){
            courseDB.insertOne({
                _id:courseID,
                subject:subject,grade:grade,level:level,
                day:day,tutor:tutor,
                student:[],submission:[],
                description:description,room:room
            },function(err,result){
                res.send(result.ops);//TODO ret {}
            });
        });
    });
    //OK {courseID} return {}
    post("/post/removeCourse",function(req,res){
        var courseID=req.body.courseID;
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                if(result==null)res.send({err:"The requested course doesn't exist."});
                else{
                    courseDB.deleteOne({_id:courseID},function(){
                        res.send({});
                    });
                }
            });
        });
    });
    //OK editCourse {courseID,subject,[grade],level,day,[tutor],description,room} return {}
    post("/post/editCourse",function(req,res){
        var courseID=req.body.courseID;
        var input={};
        var addField=function(field,options){
            var out=field;
            if(options==undefined)options={};
            if(options.out)out=options.out;
            if(req.body[field]){
                if(options.toInt)input[out]=parseInt(req.body[field]);
                else input[out]=req.body[field];
            }
        };
        addField("subject");
        if(req.body.grade){
            for(var i=0;i<req.body.grade.length;i++){
                req.body.grade[i]=parseInt(req.body.grade[i]);
            }
            req.body.grade=gradeArrayToBit(req.body.grade);
        }
        addField("grade");
        addField("level");
        addField("day",{toInt:true});
        if(req.body.tutor){
            for(var i=0;i<req.body.tutor.length;i++){
                req.body.tutor[i]=parseInt(req.body.tutor[i]);
            }
        }
        addField("tutor");
        addField("description");
        addField("room",{toInt:true});
        getCourseDB(function(courseDB){
            courseDB.updateOne({_id:courseID},{$set:input},function(){
                res.send({});
            });
        });
    });

    // Room Management
    //OK {day} return {[course],[unassignedCourse],[courseHybrid],[fullHybrid],maxHybridSeat}
    post("/post/roomInfo",function(req,res){
        var day=parseInt(req.body.day);
        var output={course:[],unassignedCourse:[],courseHybrid:[],fullHybrid:[]};
        configDB.findOne({},function(err,config){
            getCourseDB(function(courseDB){
                courseDB.find({day:day}).sort({subject:1,grade:1,level:1,tutor:1}).toArray(function(err,course){
                    for(var i=0;i<course.length;i++){
                        if(course[i].tutor.includes(99000)){
                            output.courseHybrid.push(course[i]._id);
                        }
                        else{
                            if(course[i].room>=0){
                                output.course[course[i].room]={
                                    courseID:course[i]._id,
                                    maxSeat:config.maxSeat[course[i].room]
                                };
                            }
                            else output.unassignedCourse.push(course[i]._id);
                        }
                    }
                    fullHybridDB.findOne({day:day},function(err,fullHybrid){
                        if(!fullHybrid)res.send(output);
                        else{
                            for(var i=0;i<fullHybrid.student.length;i++){
                                var index=output.fullHybrid.findIndex(function(x){
                                    return x.subject==fullHybrid.student[i].subject;
                                });
                                if(index==-1)index=output.fullHybrid.length;
                                if(output.fullHybrid[index]==undefined){
                                    output.fullHybrid[index]={
                                        subject:fullHybrid.student[i].subject,
                                        studentID:[]
                                    };
                                }
                                output.fullHybrid[index].studentID.push(fullHybrid.student[i].studentID);
                            }
                            output.maxHybridSeat=config.maxSeat[0];
                            res.send(output);
                        }
                    });
                });
            });
        });
    });

    // File Uploading
    //OK {studentID,file} return {}
    post("/post/submitReceipt",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var file=req.files[0];
        var errOutput=[];
        findUser(res,studentID,{position:"student"},function(result){
            configDB.findOne({},function(err,config){
                var newPath=config.receiptPath+"CR"+config.year+"Q"+config.quarter+"/";
                fs.ensureDir(newPath,function(err){
                    if(err)res.send({err:err,at:"ensureDir"});
                    else{
                        var originalName=file.originalname;
                        var originalType=originalName.slice(originalName.lastIndexOf("."));
                        var oldPath=file.path;
                        fs.readdir(newPath,function(err,files){
                            callbackLoop(files.length,function(i,continueLoop){
                                if(files[i].split(".",1)[0]==studentID){
                                    fs.remove(newPath+files[i],function(err){
                                        if(err)errOutput.push({err:err,at:"remove#"+(i+1)});
                                        continueLoop();
                                    });
                                }
                                else continueLoop();
                            },function(){
                                if(errOutput.length)res.send({err:errOutput});
                                else{
                                    fs.readFile(oldPath,function(err,data){
                                        if(err)res.send({err:err,at:"readFile"});
                                        else fs.writeFile(newPath+studentID+originalType.toLowerCase(),data,function(err){
                                            if(err)res.send({err:err,at:"writeFile"});
                                            else{
                                                if(result.student.registrationState=="untransferred"||result.student.registrationState=="rejected"){
                                                    userDB.updateOne({_id:studentID},{
                                                        $set:{"student.registrationState":"transferred"}
                                                    },function(){
                                                        res.send({});
                                                    });
                                                }
                                                else res.send({});
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                });
            });
        });
    });
    //OK {userID,file} return {}
    post("/post/updateProfilePicture",function(req,res){
        var userID=parseInt(req.body.userID);
        var file=req.files[0];
        var errOutput=[];
        findUser(res,userID,{},function(result){
            configDB.findOne({},function(err,config){
                var newPath=config.profilePicturePath;
                fs.ensureDir(newPath,function(err){
                    if(err)res.send({err:err,at:"ensureDir"});
                    else{
                        var originalName=file.originalname;
                        var originalType=originalName.slice(originalName.lastIndexOf("."));
                        var oldPath=file.path;
                        fs.readdir(newPath,function(err,files){
                            callbackLoop(files.length,function(i,continueLoop){
                                if(files[i].split(".",1)[0]==userID){
                                    fs.remove(newPath+files[i],function(err){
                                        if(err)errOutput.push({err:err,at:"remove#"+(i+1)});
                                        continueLoop();
                                    });
                                }
                                else continueLoop();
                            },function(){
                                if(errOutput.length)res.send({err:errOutput});
                                else{
                                    fs.readFile(oldPath,function(err,data){
                                        if(err)res.send({err:err,at:"readFile"});
                                        else fs.writeFile(newPath+userID+originalType.toLowerCase(),data,function(err){
                                            if(err)res.send({err:err,at:"writeFile"});
                                            else res.send({});
                                        });
                                    });
                                }
                            });
                        });
                    }
                });
            });
        });
    });
    //OK {file} return {}
    post("/post/updateStudentSlideshow",function(req,res){
        var files=req.files;
        var errOutput=[];
        configDB.findOne({},function(err,config){
            var newPath=config.studentSlideshowPath;
            fs.emptyDir(newPath,function(err){
                if(err)res.send({err:err,at:"emptyDir"});
                else{
                    callbackLoop(files.length,function(i,continueLoop){
                        var file=files[i];
                        var originalName=file.originalname;
                        var oldPath=file.path;
                        fs.readFile(oldPath,function(err,data){
                            if(err){
                                errOutput.push({err:err,at:"readFile#"+(i+1)});
                                continueLoop();
                            }
                            else fs.writeFile(newPath+originalName,data,function(err){
                                if(err)errOutput.push({err:err,at:"writeFile#"+(i+1)});
                                continueLoop();
                            });
                        });
                    },function(){
                        if(errOutput.length)res.send({err:errOutput});
                        else res.send({});
                    });
                }
            });
        });
    });
    //OK {courseID,numberOfSub,file} return {}
    post("/post/submitCourseMaterial",function(req,res){
        var courseID=req.body.courseID;
        var numberOfSub=parseInt(req.body.numberOfSub);
        var files=req.files;
        var errOutput=[];
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                if(result==null)res.send({err:"The requested course doesn't exist."});
                else{
                    configDB.findOne({},function(err,config){
                        var newPath=config.courseMaterialPath+"CR"+config.year+"Q"+config.quarter+"/"+courseID+"/"+numberOfSub+"/";
                        fs.emptyDir(newPath,function(err){
                            if(err)res.send({err:err,at:"emptyDir"});
                            else{
                                callbackLoop(files.length,function(i,continueLoop){
                                    var file=files[i];
                                    var originalName=file.originalname;
                                    var oldPath=file.path;
                                    fs.readFile(oldPath,function(err,data){
                                        if(err){
                                            errOutput.push({err:err,at:"readFile#"+(i+1)});
                                            continueLoop();
                                        }
                                        else fs.writeFile(newPath+originalName,data,function(err){
                                            if(err)errOutput.push({err:err,at:"writeFile#"+(i+1)});
                                            continueLoop();
                                        });
                                    });
                                },function(){
                                    if(errOutput.length)res.send({err:errOutput});
                                    else{
                                        courseDB.updateOne({_id:courseID},{
                                            $set:{["submission."+(numberOfSub-1)]:"pending"}
                                        },function(){
                                            res.send({});
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    });
    //OK {courseID,numberOfSub,action} return {}
    post("/post/judgeCourseMaterial",function(req,res){
        var courseID=req.body.courseID;
        var numberOfSub=parseInt(req.body.numberOfSub);
        var action=req.body.action;
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                if(result==null)res.send({err:"The requested course doesn't exist."});
                else{
                    if(action=="accept"){
                        courseDB.updateOne({_id:courseID},{
                            $set:{["submission."+(numberOfSub-1)]:"accepted"}
                        },function(){
                            res.send({});
                        });
                    }
                    else if(action=="reject"||action=="remove"){
                        configDB.findOne({},function(err,config){
                            var newPath=config.courseMaterialPath+"CR"+config.year+"Q"+config.quarter+"/"+courseID+"/"+numberOfSub+"/";
                            fs.remove(newPath,function(err){
                                if(err)res.send({err:err,at:"remove"});
                                else{
                                    if(action=="reject"){
                                        courseDB.updateOne({_id:courseID},{
                                            $set:{["submission."+(numberOfSub-1)]:"rejected"}
                                        },function(){
                                            res.send({});
                                        });
                                    }
                                    else if(action=="remove"){
                                        courseDB.updateOne({_id:courseID},{
                                            $set:{["submission."+(numberOfSub-1)]:null}
                                        },function(){
                                            res.send({});
                                        });
                                    }
                                }
                            });
                        });
                    }
                }
            });
        });
    });
    //OK {} return {[course]->courseID,[tutor],[tutorNicknameEn],[tutorEmail],day,courseName,[submission]}
    post("/post/allCourseMaterial",function(req,res){
        var output=[];
        getCourseDB(function(courseDB){
            courseDB.find({tutor:{$ne:99000}}).sort({tutor:1,day:1,subject:1,grade:1,level:1}).toArray(function(err,course){
                callbackLoop(course.length,function(i,continueLoop){
                    getCourseName(course[i]._id,function(courseName){
                        var tutorNicknameEn=[];
                        var tutorEmail=[];
                        callbackLoop(course[i].tutor.length,function(j,continueLoop){
                            userDB.findOne({_id:course[i].tutor[j]},function(err,tutor){
                                tutorNicknameEn[j]=tutor.nicknameEn;
                                tutorEmail[j]=tutor.email;
                                continueLoop();
                            });
                        },function(){
                            output[i]={
                                courseID:course[i]._id,
                                tutor:course[i].tutor,
                                tutorNicknameEn:tutorNicknameEn,tutorEmail:tutorEmail,
                                day:course[i].day,courseName:courseName,
                                submission:course[i].submission
                            };
                            continueLoop();
                        });
                    });
                },function(){
                    res.send({course:output});
                });
            });
        });
    });

    // Assessment
    //OK {studentID,tutorID,message,priority,hasAttachment} return {}
    post("/post/addStudentComment",function(req,res){
        var commentID=new ObjectID().toString();
        var studentID=parseInt(req.body.studentID);
        var tutorID=parseInt(req.body.tutorID);
        var message=req.body.message;
        var priority=parseInt(req.body.priority);
        if(req.body.priority===undefined)priority=0;
        var hasAttachment=bool(req.body.hasAttachment);
        if(req.body.hasAttachment===undefined)hasAttachment=false;
        findUser(res,studentID,{position:"student"},function(){
            findUser(res,tutorID,{position:["tutor","admin","dev"]},function(){
                studentCommentDB.insertOne({
                    _id:commentID,studentID:studentID,tutorID:tutorID,
                    message:message,timestamp:moment().valueOf(),
                    priority:priority,hasAttachment:hasAttachment
                },function(){
                    res.send({});
                });
            });
        });
    });
    //OK {commentID} return {}
    post("/post/removeStudentComment",function(req,res){
        var commentID=req.body.commentID;
        studentCommentDB.deleteOne({_id:commentID},function(){
            res.send({});
        });
    });
    //OK {commentID,priority} return {}
    post("/post/changeStudentCommentPriority",function(req,res){
        var commentID=req.body.commentID;
        var priority=parseInt(req.body.priority);
        studentCommentDB.updateOne({_id:commentID},{
            $set:{priority:priority}
        },function(){
            res.send({});
        });
    });
    //OK {studentID,limit} return {[comment]->_id,studentID,tutorID,message,timestamp,priority,hasAttachment}
    post("/post/listStudentCommentByStudent",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var limit=parseInt(req.body.limit);
        var output=[];
        findUser(res,studentID,{position:"student"},function(){
            var cursor=studentCommentDB.find({studentID:studentID}).sort({priority:-1,timestamp:-1});
            if(req.body.limit!==undefined)cursor=cursor.limit(limit);
            cursor.toArray(function(err,result){
                for(var i=0;i<result.length;i++){
                    output[i]={commentID:result[i]._id};
                    delete result[i]._id;
                    Object.assign(output[i],result[i]);
                }
                res.send({comment:output});
            });
        });
    });
    //OK {start,end} return {[comment]->_id,studentID,tutorID,message,timestamp,priority,hasAttachment}
    post("/post/listStudentCommentByTime",function(req,res){
        var start=parseInt(req.body.start);
        var end=parseInt(req.body.end);
        var output=[];
        studentCommentDB.find({timestamp:{$gte:start,$lte:end}}).sort({timestamp:-1}).toArray(function(err,result){
            for(var i=0;i<result.length;i++){
                output[i]={commentID:result[i]._id};
                delete result[i]._id;
                Object.assign(output[i],result[i]);
            }
            res.send({comment:output});
        });
    });
    //OK {start,limit} return {[comment]->_id,studentID,tutorID,message,timestamp,priority,hasAttachment}
    post("/post/listStudentCommentByIndex",function(req,res){
        var start=parseInt(req.body.start);
        if(start<0)start=0;
        var limit=parseInt(req.body.limit);
        var output=[];
        studentCommentDB.find().sort({priority:-1,timestamp:-1}).skip(start).limit(limit).toArray(function(err,result){
            for(var i=0;i<result.length;i++){
                output[i]={commentID:result[i]._id};
                delete result[i]._id;
                Object.assign(output[i],result[i]);
            }
            res.send({comment:output});
        });
    });

    // Student Attendance
    //OK {studentID,day,reason,sender} return {}
    post("/post/addStudentAbsenceModifier",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var day=req.body.day;
        for(var i=0;i<day.length;i++){
            day[i]=parseInt(day[i]);
        }
        var reason=req.body.reason;
        var sender=req.body.sender;
        var timestamp=moment().valueOf();
        findUser(res,studentID,{position:"student"},function(result){
            callbackLoop(day.length,function(i,continueLoop){
                studentAttendanceModifierDB.insertOne({
                    _id:new ObjectID().toString(),studentID:studentID,
                    day:day[i],type:"absence",reason:reason,subjectToAdd:"",
                    timestamp:timestamp,sender:sender
                },function(){
                    continueLoop();
                });
            },function(){
                // var message="แจ้งเตือนการลาคอร์ส\n\n"+
                //     "ชื่อ : "+result.firstname+" "+result.lastname+" ("+result.nickname+")\n"+
                //     "วันที่ลา : "+moment(day[0]).locale("th").format("วันddddที่ D MMMM พ.ศ.")+(moment(day[0]).year()+543)+"\n"+
                //     "คอร์สที่ลามีดังนี้ :\n";
                // for(var i=0;i<day.length;i++){
                //     message+="    "+moment(day[i]).format("ddd H-").toUpperCase()+moment(day[i]).add(2,"h").hour()+
                //         // " "+courseName+"\n";
                //         "\n";
                // }
                // message+="เนื่องจาก : "+reason+"\n";
                // message+="ผู้แจ้งลา : "+sender+"\n";
                // lineNotify("Chiang",message);
                res.send({});
            });
        });
    });
    //OK {studentID,day,subjectToAdd,sender} return {}
    post("/post/addStudentPresenceModifier",function(req,res){
        var modifierID=new ObjectID().toString();
        var studentID=parseInt(req.body.studentID);
        var day=parseInt(req.body.day);
        var subjectToAdd=req.body.subjectToAdd;
        var sender=req.body.sender;
        findUser(res,studentID,{position:"student"},function(){
            studentAttendanceModifierDB.insertOne({
                _id:modifierID,studentID:studentID,
                day:day,type:"presence",subjectToAdd:subjectToAdd,reason:"",
                timestamp:moment().valueOf(),sender:sender
            },function(){
                res.send({});
            });
        });
    });
    //OK {modifierID} return {}
    post("/post/removeStudentAttendanceModifier",function(req,res){
        var modifierID=req.body.modifierID;
        studentAttendanceModifierDB.deleteOne({_id:modifierID},function(){
            res.send({});
        });
    });
    //OK {day} return {[absence][presence]->modifierID,studentID,reason|subjectToAdd,timestamp,sender,subject(absence)}
    post("/post/listStudentAttendanceModifierByDay",function(req,res){
        var day=parseInt(req.body.day);
        var absence=[],presence=[];
        var momentDay=moment(day);
        // TODO change 0/7 var generalizedDay=moment(0).day(momentDay.day()?momentDay.day():7).hour(momentDay.hour()).valueOf();
        var generalizedDay=[
            moment(0).day(momentDay.day()?momentDay.day():7).hour(momentDay.hour()).valueOf(),
            moment(0).day(momentDay.day()).hour(momentDay.hour()).valueOf()
        ];
        studentAttendanceModifierDB.find({day:day}).sort({timestamp:1}).toArray(function(err,result){
            for(var i=0;i<result.length;i++){
                if(result[i].type=="absence"){
                    absence.push({
                        modifierID:result[i]._id,studentID:result[i].studentID,
                        reason:result[i].reason,timestamp:result[i].timestamp,
                        sender:result[i].sender
                    });
                }
                else if(result[i].type=="presence"){
                    presence.push({
                        modifierID:result[i]._id,studentID:result[i].studentID,
                        subjectToAdd:result[i].subjectToAdd,
                        timestamp:result[i].timestamp,sender:result[i].sender
                    });
                }
            }
            callbackLoop(absence.length,function(i,continueLoop){
                fullHybridDB.findOne({
                    // TODO day:generalizedDay,"student.studentID":absence[i].studentID
                    day:{$in:generalizedDay},"student.studentID":absence[i].studentID
                },function(err,result){
                    if(result){
                        var index=result.student.findIndex(function(x){
                            return x.studentID==absence[i].studentID;
                        });
                        absence[i].subject="FHB"+result.student[index].subject[0];//TODO remove [0]
                        continueLoop();
                    }
                    else{
                        getCourseDB(function(courseDB){
                            courseDB.findOne({
                                // TODO day:generalizedDay,student:absence[i].studentID
                                day:{$in:generalizedDay},student:absence[i].studentID
                            },function(err,result){
                                if(result){
                                    absence[i].subject=result._id;
                                    continueLoop();
                                }
                                else{
                                    absence[i].subject="No timetable";
                                    console.log(chalk.black.bgRed("[ERROR] No timetable"));
                                    continueLoop();
                                }
                            });
                        });
                    }
                });
            },function(){
                res.send({absence:absence,presence:presence});
            });
        });
    });
    //OK {studentID,start} return {[modifier]->modifierID,day,type,reason,subjectToAdd,timestamp,sender,subject}
    post("/post/listStudentAttendanceModifierByStudent",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var start=parseInt(req.body.start);
        var output=[];
        findUser(res,studentID,{position:"student"},function(){
            studentAttendanceModifierDB.find({
                studentID:studentID,day:{$gte:start}
            }).sort({day:1}).toArray(function(err,result){
                for(var i=0;i<result.length;i++){
                    output.push({
                        modifierID:result[i]._id,
                        day:result[i].day,
                        type:result[i].type,
                        reason:result[i].reason,
                        subjectToAdd:result[i].subjectToAdd,
                        timestamp:result[i].timestamp,
                        sender:result[i].sender,
                    });
                }
                callbackLoop(result.length,function(i,continueLoop){
                    if(result[i].type=="absence"){
                        var momentDay=moment(result[i].day);
                        // TODO var generalizedDay=moment(0).day(momentDay.day()?momentDay.day():7).hour(momentDay.hour()).valueOf();
                        var generalizedDay=[
                            moment(0).day(momentDay.day()?momentDay.day():7).hour(momentDay.hour()).valueOf(),
                            moment(0).day(momentDay.day()).hour(momentDay.hour()).valueOf()
                        ];
                        fullHybridDB.findOne({
                            // day:generalizedDay,"student.studentID":studentID
                            day:{$in:generalizedDay},"student.studentID":studentID
                        },function(err,result){
                            if(result){
                                var index=result.student.findIndex(function(x){
                                    return x.studentID==studentID;
                                });
                                output[i].subject="FHB"+result.student[index].subject[0];//TODO remove [0]
                                continueLoop();
                            }
                            else{
                                getCourseDB(function(courseDB){
                                    courseDB.findOne({
                                        // day:generalizedDay,student:studentID
                                        day:{$in:generalizedDay},student:studentID
                                    },function(err,result){
                                        if(result){
                                            output[i].subject=result._id;
                                            continueLoop();
                                        }
                                        else{
                                            output[i].subject="No timetable";
                                            console.log(chalk.black.bgRed("[ERROR] No timetable"));
                                            continueLoop();
                                        }
                                    });
                                });
                            }
                        });
                    }
                    else continueLoop();
                },function(){
                    res.send({modifier:output});
                });
            });
        });
    });

    // Configuration
    //OK {} return {_id,year,quarter,courseMaterialPath,receiptPath,nextStudentID,nextTutorID,profilePicturePath,studentSlideshowPath,maxSeat}
    post("/post/getConfig",function(req,res){
        configDB.findOne({},function(err,config){
            res.send(config);
        });
    });
    //OK {year,quarter,courseMaterialPath,receiptPath,nextStudentID,nextTutorID,profilePicturePath,studentSlideshowPath,maxSeat} return {}
    post("/post/editConfig",function(req,res){
        var dirPath=function(path){
            if(path.endsWith("/"))return path;
            return path+"/";
        };
        var maxSeat=[];
        for(var i=0;i<req.body.maxSeat.length;i++){
            maxSeat.push(parseInt(req.body.maxSeat[i]));
        }
        configDB.updateOne({},{
            $set:{
                year:parseInt(req.body.year),
                quarter:parseInt(req.body.quarter),
                courseMaterialPath:dirPath(req.body.courseMaterialPath),
                receiptPath:dirPath(req.body.receiptPath),
                nextStudentID:parseInt(req.body.nextStudentID),
                nextTutorID:parseInt(req.body.nextTutorID),
                profilePicturePath:dirPath(req.body.profilePicturePath),
                studentSlideshowPath:dirPath(req.body.studentSlideshowPath),
                maxSeat:maxSeat
            }
        },function(){
            configDB.findOne({},function(err,config){
                console.log("[SHOW] config");
                console.log(config);
                res.send({});
            });
        });
    });
    //OK {toAdd} return {}
    post("/post/addStudentGrade",function(req,res){
        userDB.updateMany({position:"student"},{$inc:{"student.grade":parseInt(req.body.toAdd)}});
        res.send({});
    });
    post("/post/lineNotify",function(req,res){
        lineNotify(req.body.recipient,req.body.message,function(err,x,body){
            res.send({err:err,body:body});
        });
    });

    // Debug
    app.post("/debug/listUser",function(req,res){
        userDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
    app.post("/debug/listCourse",function(req,res){
        getCourseDB(function(courseDB){
            courseDB.find().toArray(function(err,result){
                res.send(result);
            });
        });
    });
    app.post("/debug/listfullHybrid",function(req,res){
        fullHybridDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
    app.post("/debug/listCourseSuggestion",function(req,res){
        courseSuggestionDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
    app.post("/debug/listStudentComment",function(req,res){
        studentCommentDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
    app.post("/debug/listStudentAttendanceModifier",function(req,res){
        studentAttendanceModifierDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
}
