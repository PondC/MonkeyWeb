//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const passwordCheck = (userID, pwd) => $.post("/post/password", {
    userID: userID,
    password: pwd
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const positionCheck = (userID) => $.post("/post/position", {
    userID: userID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const registrationStateCheck = (studentID) => $.post("post/registrationState", {
    studentID: studentID
});

function loginSubmit() {
    "use strict";
    let user = document.getElementById("usr");
    let pwd = document.getElementById("pwd");
    if (user.value.length === 0) {
        document.getElementById("usrReq").style.visibility = "visible";
        document.getElementById("usrFromGroup").classList.add("has-error")
    }
    if (user.value.length !== 0) {
        document.getElementById("usrReq").style.visibility = "hidden";
        document.getElementById("usrFromGroup").className = "form-group"
    }
    if (pwd.value.length === 0) {
        document.getElementById("pwdReq").style.visibility = "visible";
        document.getElementById("pwdFromGroup").classList.add("has-error")
    }
    if (pwd.value.length !== 0) {
        document.getElementById("pwdReq").style.visibility = "hidden";
        document.getElementById("pwdFromGroup").className = "form-group"
    }
    if (pwd.value.length !== 0 && user.value.length !== 0) {
        login(parseInt(user.value), pwd.value)
    }
}

function login(user, pwd) {
    "use strict";
    log("Username:" + user + ",Password:" + pwd);
    log(encrypt(pwd).toString());
    passwordCheck(user, encrypt(pwd).toString()).then((data) => {
        if (data.err) {
            log("[login()] : post/password => " + data.err);
        } else {
            log("[login()] : post/password => ");
            log(data);
            if (data.verified) {
                writeUserCookie(user, pwd);
                redirectLocation(user);
            } else {
                log("Wrong");
                alert("ID and password do not match.");
                clearInput();
            }
        }
    });
}

function redirectLocation(user) {
    positionCheck(user).then((data) => {
        if (data.err) {
            log("[redirectLocation()] : post/position => " + data.err);
        } else {
            log("[redirectLocation()] : post/position => ");
            log(data);
            switch (data.position) {
                case "student":
                    studentLogin(user);
                    break;
                case "tutor":
                    self.location = "/tutorCourseMaterial";
                    break;
                case "admin":
                case "dev":
                    self.location = "/adminAllstudent";
                    break;
                default:
                    break
            }
        }
    });
}

function studentLogin(studentID) {
    registrationStateCheck(studentID).then((data) => {
        if (data.err) {
            log("[studentLogin()] : post/registrationState => " + data.err);
        } else {
            log("[studentLogin()] : post/registrationState => ");
            log(data);
            //noinspection SpellCheckingInspection
            if (data.registrationState === "untransferred" || data.registrationState === "rejected") {
                self.location = "/registrationReceipt";
            } else {
                self.location = "/home";
            }
        }
    });
}

function clearInput() {
    "use strict";
    let pwd = document.getElementById("pwd");
    pwd.value = ""
}

function encrypt(text) {
    "use strict";
    return CryptoJS.SHA3(text)
}

function writeUserCookie(user, pwd) {
    "use strict";
    writeCookie("monkeyWebUser", user);
    writeCookie("monkeyWebPassword", encrypt(pwd).toString())
}
