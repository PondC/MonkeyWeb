console.log("[START] post.js");
var run=function(app,db){
    var events=require("events");
    var moment=require("moment");
    var ObjectID=require('mongodb').ObjectID;
    var path=require("path");

    var configDB=db.collection("config");
    var hybridSeatDB=db.collection("hybridSeat");
    // var hybridSheetDB=db.collection("hybridSheet");
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
    // var gradeStringToBit=function(grade){
    //     var output=0,p=false,s=false;
    //     if(grade[0]=='S'&&grade[1]=='A')return (1<<12);
    //     if(grade[0]=='P'){
    //         for(var i=1;i<grade.length;i++){
    //             output|=(1<<(grade[i]-'1'));
    //         }
    //     }
    //     if(grade[0]=='S'){
    //         for(var i=1;i<grade.length;i++){
    //             output|=(1<<(grade[i]-'1'+6));
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
    /*var pagedata=function(fileName){
        var fs=require("fs-extra");
        var data=fs.readFileSync(path.join(__dirname,"../",fileName+".html")).toString();
        return data.replace(/public\//g,"").replace(/\.html/g,"");
    };
    var addPage=function(pageName){
        app.get("/"+pageName,function(req,res){
            console.log("[PAGE REQUEST] "+pageName+" FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
            res.send(pagedata(pageName))
        });
    };*/
    var addPage=function(page,url){
        if(url==undefined)url="/"+page;
        app.get(url,function(req,res){
            console.log("[PAGE REQUEST] "+page+" FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
            res.sendFile(path.join(__dirname,"../",page+".html"));
        });
    };

    // addPage("login","/");
    addPage("login");
    addPage("registrationCourse");
    addPage("registrationHybrid");
	addPage("registrationName");
	addPage("registrationSkill");
    addPage("registrationReceipt");
	addPage("studentProfile");
    addPage("home");
    addPage("home2");
    addPage("adminHome");
    addPage("adminAllcourse");
    addPage("adminCoursedescription");
    addPage("adminAllstudent");
    addPage("adminStudentprofile");
    app.get("/testadmin",function(req,res){
        console.log("[PAGE REQUEST] testadmin FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        res.sendFile(path.join(__dirname,"testadmin.html"));
    });
    app.get("/firstConfig",function(req,res){
        console.log("[PAGE REQUEST] firstConfig FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        res.sendFile(path.join(__dirname,"firstConfig.html"));
    });

    // All post will return {err} if error occurs

    // User Information
    //OK {userID,password} return {verified}
    app.post("/post/password",function(req,res){
        console.log(req.body);
        console.log("[PAGE REQUEST] post/password FROM "+req.ip+moment().format(" @ dddDDMMMYYYY HH:mm:ss"));
        var userID=parseInt(req.body.userID);
        var password=req.body.password;
        userDB.findOne({_id:userID,password:password},function(err,result){
            if(result==null){
                res.send({verified:false});
            }
            else{
                res.send({verified:true});
            }
        });
    });
    //OK {userID} return {firstname,lastname,nickname,firstnameEn,lastnameEn,nicknameEn}
    app.post("/post/name",function(req,res){
        var userID=parseInt(req.body.userID);
        userDB.findOne({_id:userID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else{
                res.send({firstname:result.firstname,lastname:result.lastname,nickname:result.nickname,
                    firstnameEn:result.firstnameEn,lastnameEn:result.lastnameEn,nicknameEn:result.nicknameEn
                });
            }
        });
    });
    //OK {userID} return {position}
    app.post("/post/position",function(req,res){
        var userID=parseInt(req.body.userID);
        userDB.findOne({_id:userID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else res.send({position:result.position});
        });
    });
    //OK {userID} return {status}
    app.post("/post/status",function(req,res){
        var userID=parseInt(req.body.userID);
        userDB.findOne({_id:userID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else if(result.position=="student")res.send({status:result.student.status});
            else res.send({status:result.tutor.status});
        });
    });


    // Student Information
    //TODO TEST {} return {student:[{studentID,firstname,lastname,nickname,inCourse,inHybrid}]}
    app.post("/post/allStudent",function(req,res){
        var output=[];
        var eventEmitter=new events.EventEmitter();
        userDB.find({position:"student"}).sort({"_id":1}).toArray(function(err,result){
            var c=0;
            eventEmitter.on("finish",function(){
                if(c==result.length)res.send({student:output});
                c++;
            });
            for(i=0;i<result.length;i++){
                (function(i){
                    getCourseDB(function(courseDB){
                        courseDB.find({student:{$all:[result[i]._id]}}).toArray(function(err,course){
                            output[i]={studentID:result[i]._id,
                                firstname:result[i].firstname,
                                lastname:result[i].lastname,
                                nickname:result[i].nickname,
                                inCourse:course.length!=0,
                                // inHybrid:result[i].student.hybridDay.length!=0
                                inHybrid:true
                            };
                            eventEmitter.emit("finish");
                        });
                    });
                })(i);
            }
            eventEmitter.emit("finish");
        });
    });
    //TODO TEST {studentID} return {grade,registrationState,[skillDay],[balance],status,email,phone,firstname,lastname,nickname,[courseID],[hybridDay]}
    app.post("/post/studentProfile",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var output={};
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else{
                if(result.position=="student"){
                    output=result.student;
                    var request=require("request");
                    request.post("http://localhost:8080/post/name",{form:{userID:studentID}},function(err,response,body){
                        body=JSON.parse(body);
                        output=Object.assign(output,body);
                        output.courseID=[];
                        getCourseDB(function(courseDB){
                            courseDB.find({student:{$all:[studentID]}}).sort({"day":1}).toArray(function(err,course){
                                for(var i=0;i<course.length;i++){
                                    output.courseID.push(course[i]._id);
                                }
                                res.send(output);
                            });
                        });
                    });
                }
                else res.send({err:"The requested ID isn't a student."});
            }
        });
    });
    //OK {studentID} return {registrationState}
    app.post("/post/registrationState",function(req,res){
        var studentID=parseInt(req.body.studentID);
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else if(result.position=="student")res.send({registrationState:result.student.registrationState});
            else res.send({err:"The requested ID isn't a student."});
        });
    });

    // Student Timetable
    //TODO course {studentID,[courseID]} return {}
    app.post("/post/addStudentCourse",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var courseID=req.body.courseID;
        var eventEmitter=new events.EventEmitter();
        //TODO var errOutput=[];
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null){
                res.send({err:"The requested student ID doesn't exist."});
            }
            else{
                if(result.position=="student"){
                    var c=0;
                    eventEmitter.on("finish",function(){
                        if(c==courseID.length)res.send({});
                        c++;
                    });
                    getCourseDB(function(courseDB){
                        for(var i=0;i<courseID.length;i++){
                            courseDB.updateOne({_id:courseID[i]},{$addToSet:{student:studentID}});
                            eventEmitter.emit("finish");
                        }
                        eventEmitter.emit("finish");
                    });
                }
                else res.send({err:"The requested ID isn't a student."});
            }
        });
    });
    //TODO course {studentID,[courseID]} return {}
    app.post("/post/removeStudentCourse",function(req,res){
        var studentID=parseInt(req.body.studentID);
        var courseID=req.body.courseID;
        var eventEmitter=new events.EventEmitter();
        //TODO var errOutput=[];
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null){
                res.send({err:"The requested student ID doesn't exist."});
            }
            else{
                if(result.position=="student"){
                    var c=0;
                    eventEmitter.on("finish",function(){
                        if(c==courseID.length)res.send({});
                        c++;
                    });
                    getCourseDB(function(courseDB){
                        for(var i=0;i<courseID.length;i++){
                            courseDB.updateOne({_id:courseID[i]},{$pull:{student:studentID}});
                            eventEmitter.emit("finish");
                        }
                        eventEmitter.emit("finish");
                    });
                }
                else res.send({err:"The requested ID isn't a student."});
            }
        });
    });
    //TODO Date {studentID,[day]} return {}
    app.post("/post/addSkillDay",function(req,res){
        //
    });
    //TODO Date {studentID,[day]} return {}
    app.post("/post/removeSkillDay",function(req,res){
        //
    });
    //TODO Date {studentID,[day]} return {}
    app.post("/post/addHybridDay",function(req,res){
        //
    });
    //TODO Date {studentID,[day]} return {}
    app.post("/post/removeHybridDay",function(req,res){
        //
    });

    // Tutor Information
    //OK {tutorID} return {nicknameEng}
    app.post("/post/tutorNickname",function(req,res){
        var tutorID=parseInt(req.body.tutorID);
        userDB.findOne({_id:tutorID},function(err,result){
            if(result==null){
                res.send({err:"The requested ID doesn't exist."});
            }
            else if(result.position=="tutor")res.send({nicknameEng:result.tutor.nicknameEng});
            else res.send({err:"The requested ID isn't a tutor."});
        });
    });

    // User Management
    //OK {password,firstname,lastname,nickname,grade(1-12),email,phone} return {}
    app.post("/post/addStudent",function(req,res){
        console.log("[REQUEST] addStudent");
        var password=req.body.password;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var grade=parseInt(req.body.grade);
        var email=req.body.email;
        var phone=req.body.phone;
        var balance=[{subject:"M",value:0},{subject:"PH",value:0}];
        configDB.findOne({},function(err,config){
            userDB.insertOne({
                _id:config.nextStudentID,password:password,position:"student",
                firstname:firstname,lastname:lastname,nickname:nickname,
                student:{grade:grade,registrationState:"unregistered",skillDay:[],balance:balance,status:"active",email:email,phone:phone}
            },function(err,result){
                configDB.updateOne({},{$inc:{nextStudentID:1}});
                // res.send({}); TODO
                res.send(result.ops);
            });
        });
    });
    //OK {studentID} return {}
    app.post("/post/removeStudent",function(req,res){
        console.log("[REQUEST] removeStudent");
        var studentID=parseInt(req.body.studentID);
        userDB.findOne({_id:studentID},function(err,result){
            if(result==null)res.send({err:"The requested ID doesn't exist."});
            else if(result.position!="student")res.send({err:"The requested ID isn't a student."});
            else{
                userDB.deleteOne({_id:studentID});
                res.send({});
            }
        });
    });
    //TODO ADD editStudent
    //OK {password,firstname,lastname,nickname,email,nicknameEng} return {}
    app.post("/post/addTutor",function(req,res){
        console.log("[REQUEST] addTutor");
        var password=req.body.password;
        var firstname=req.body.firstname;
        var lastname=req.body.lastname;
        var nickname=req.body.nickname;
        var email=req.body.email;
        var nicknameEng=req.body.nicknameEng;
        configDB.findOne({},function(err,config){
            userDB.findOne({firstname:firstname,lastname:lastname},function(err,result){
                if(result==null){
                    userDB.insertOne({
                        _id:config.nextTutorID,password:password,position:"tutor",
                        firstname:firstname,lastname:lastname,nickname:nickname,
                        tutor:{email:email,nicknameEng:nicknameEng,status:"active"}
                    },function(err,result){
                        configDB.updateOne({},{$inc:{nextTutorID:1}});
                        // res.send({}); TODO
                        res.send(result.ops);
                    });
                }
                else res.send({err:"Tutor is already exists."});
            });
        });
    });
    //OK {tutorID} return {}
    app.post("/post/removeTutor",function(req,res){
        console.log("[REQUEST] removeTutor");
        var tutorID=parseInt(req.body.tutorID);
        userDB.findOne({_id:tutorID},function(err,result){
            if(result==null)res.send({err:"The requested ID doesn't exist."});
            else if(result.position!="tutor")res.send({err:"The requested ID isn't a tutor."});
            else{
                userDB.deleteOne({_id:tutorID});
                res.send({});
            }
        });
    });
    //TODO ADD editTutor

    // Course
    //OK course {} return {course:[{courseID,subject,[grade],level,day,[tutor],[student],courseName}]}
    app.post("/post/allCourse",function(req,res){
        var output=[];
        var eventEmitter=new events.EventEmitter();
        getCourseDB(function(courseDB){
            courseDB.find().sort({"subject":1,"grade":1,"level":1,"tutor":1}).toArray(function(err,result){
                var c=0;
                eventEmitter.on("finish",function(){
                    if(c==result.length)res.send({course:output});
                    c++;
                });
                for(var i=0;i<result.length;i++){
                    (function(i){
                        getCourseName(result[i]._id,function(courseName){
                            output[i]={courseID:result[i]._id};
                            output[i]=Object.assign(output[i],result[i]);
                            delete output[i]._id;
                            output[i].grade=gradeBitToArray(output[i].grade);
                            delete output[i].submission;
                            output[i].courseName=courseName;
                            eventEmitter.emit("finish");
                        });
                    })(i);
                }
                eventEmitter.emit("finish");
            });
        });
    });
    //OK {grade(1-13)} return {course:[{courseID,courseName,day,[tutor]}]}
    app.post("/post/gradeCourse",function(req,res){
        var grade=parseInt(req.body.grade);
        var output=[];
        var eventEmitter=new events.EventEmitter();
        getCourseDB(function(courseDB){
            courseDB.find({grade:{$bitsAllSet:[grade-1]}}).sort({"subject":1,"grade":1,"level":1,"tutor":1}).toArray(function(err,result){
                var c=0;
                eventEmitter.on("finish",function(){
                    if(c==result.length)res.send({course:output});
                    c++;
                });
                for(var i=0;i<result.length;i++){
                    (function(i){
                        getCourseName(result[i]._id,function(courseName){
                            output.push({courseID:result[i]._id,courseName:courseName,day:result[i].day,tutor:result[i].tutor});
                            eventEmitter.emit("finish");
                        });
                    })(i);
                }
                eventEmitter.emit("finish");
            });
        });
    });
    //TODO {courseID} return {courseName,day,[tutor],[student]}
    app.post("/post/courseInfo",function(req,res){
        var courseID=req.body.courseID;
        console.log("ID : ",courseID);
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:ObjectID(courseID)},function(err,result){
                if(result==null)res.send({err:"No course found"});
                else{
                    console.log(result);
                    getCourseName(courseID,function(courseName){
                        res.send({courseName:courseName,day:result.day,tutor:result.tutor,student:result.student});
                    });
                }
            });
        });
    });
    //OK {subject,[grade],level,day,[tutor]} return {}
    app.post('/post/addCourse',function(req,res){
        // console.log("==================");
        // console.log(req.body);
        // return;
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
        var courseID=new ObjectID().toString();
        getCourseDB(function(courseDB){
            courseDB.insertOne({_id:courseID,subject:subject,grade:grade,level:level,day:day,tutor:tutor,student:[],submission:[]},function(err,result){
                console.log(result.ops);
                res.send(result.ops);//TODO ret {}
            });
        });
    });
    //OK {courseID} return {}
    app.post("/post/removeCourse",function(req,res){
        var courseID=req.body.courseID;
        getCourseDB(function(courseDB){
            courseDB.findOne({_id:courseID},function(err,result){
                if(result==null)res.send({err:"The requested course doesn't exist."});
                else{
                    courseDB.deleteOne({_id:courseID});
                    res.send({});
                }
            });
        });
    });
    //TODO ADD editCourse

    // Reciept
    //TODO configPath/File {studentID,file} return {}
    app.post("/post/submitReceipt",function(req,res){
        //
    });

    // Configuration
    //OK {} return {_id,year,quarter,courseMaterialPath,receiptPath,nextStudentID,nextTutorID}
    app.post('/post/getConfig',function(req,res){
        configDB.findOne({},function(err,config){
            res.send(config);
        });
    });
    //OK {year,quarter,courseMaterialPath,receiptPath,nextStudentID,nextTutorID,maxHybridSeat} return {}
    app.post('/post/editConfig',function(req,res){
        configDB.updateOne({},{
            year:parseInt(req.body.year),
            quarter:parseInt(req.body.quarter),
            courseMaterialPath:req.body.courseMaterialPath,
            receiptPath:req.body.receiptPath,
            nextStudentID:parseInt(req.body.nextStudentID),
            nextTutorID:parseInt(req.body.nextTutorID),
            maxHybridSeat:parseInt(req.body.maxHybridSeat)
        },function(){
            configDB.findOne({},function(err,config){
                console.log(config);
                res.send({});
            });
        });
    });
    //OK {toAdd} return {}
    app.post('/post/addStudentGrade',function(req,res){
        userDB.updateMany({position:"student"},{$inc:{"student.grade":parseInt(req.body.toAdd)}});
        res.send({});
    });


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
    app.post("/debug/listHybridSeat",function(req,res){
        hybridSeatDB.find().toArray(function(err,result){
            res.send(result);
        });
    });
}
module.exports.run=run;