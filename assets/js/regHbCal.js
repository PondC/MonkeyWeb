let cookie;
let courseClass;
$(document).ready(function () {
    cookie = getCookieDict();
    if (cookie.regisCourse === undefined) {
        self.location = "registrationCourse"
    }
    cookie.regisCourse = JSON.parse(cookie.regisCourse);
    for (let i in cookie.regisCourse) {
        if (cookie.regisCourse[i] !== false) {
            cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day);
            if (cookie.regisCourse[i].tutor[0]===99000){
                cookie.regisCourse[i].courseName+='(HB)'
            }
            if (cookie.regisCourse[i].day.getDay() === 6 && cookie.regisCourse[i].select === true) {
                courseClass = document.getElementsByClassName('btn-sat ' + cookie.regisCourse[i].day.getHours() + '.2');
                for (let j = 1; j >= 0; j--) {
                    courseClass[j].remove()
                }
                courseClass = document.getElementsByClassName('btn-sat ' + cookie.regisCourse[i].day.getHours() + '.1');
                for (let j = 0; j < courseClass.length; j++) {
                    courseClass[j].className = courseClass[j].className.replace(/btn-default/g, "btn-basic disabled");
                    if (courseClass[j].className.indexOf('col-md') !== -1) {
                        courseClass[j].innerHTML = '<strong>CR:</strong>'+'<br>' + cookie.regisCourse[i].courseName;
                        courseClass[j].style = "padding: 6% 0 6% 0 ; color:black";
                    }
                    else if (courseClass[j].className.indexOf('col-xs') !== -1) {
                        courseClass[j].innerHTML = '<strong>CR:</strong>' + '<br>' + cookie.regisCourse[i].courseName;
                        if (window.innerWidth > window.innerHeight) {
                            courseClass[j].style = "padding: 6% 0 6% 0 ; color:black";
                        } else {
                            courseClass[j].style = "padding: 10% 0 10% 0 ; color:black";
                        }
                    }
                }
            }
            if (cookie.regisCourse[i].day.getDay() === 0 && cookie.regisCourse[i].select === true) {
                courseClass = document.getElementsByClassName('btn-sun ' + cookie.regisCourse[i].day.getHours() + '.2');
                for (let j = 1; j >= 0; j--) {
                    courseClass[j].remove()
                }
                courseClass = document.getElementsByClassName('btn-sun ' + cookie.regisCourse[i].day.getHours() + '.1');
                for (let j = 0; j < courseClass.length; j++) {
                    courseClass[j].className = courseClass[j].className.replace(/btn-default/g, "btn-basic disabled");
                    if (courseClass[j].className.indexOf('col-md') !== -1) {
                        courseClass[j].innerHTML = '<strong>CR:</strong>'+'<br>' + cookie.regisCourse[i].courseName;
                        courseClass[j].style = "padding: 6% 0 6% 0 ; color:black";
                    }
                    else if (courseClass[j].className.indexOf('col-xs') !== -1) {
                        courseClass[j].innerHTML = '<strong>CR:</strong>' + '<br>' + cookie.regisCourse[i].courseName;
                        if (window.innerWidth > window.innerHeight) {
                            courseClass[j].style = "padding: 6% 0 6% 0 ; color:black";
                        } else {
                            courseClass[j].style = "padding: 10% 0 10% 0 ; color:black";
                        }
                    }
                }
            }
        }
    }
});
function next() {
    var selectHybrid = {
        tue171: false,
        tue172: false,
        thu171: false,
        thu172: false,
        sat81: false,
        sat82: false,
        sat101: false,
        sat102: false,
        sat131: false,
        sat132: false,
        sat151: false,
        sat152: false,
        sun81: false,
        sun82: false,
        sun101: false,
        sun102: false,
        sun131: false,
        sun132: false,
        sun151: false,
        sun152: false
    };
    let allselectHB = document.getElementsByClassName('btn-success');
    let i;
    for (i = 0; i < allselectHB.length; i++) {
        if (allselectHB[i].className.split(' ')[1][allselectHB[i].className.split(' ')[1].length - 1] === '1') {
            //noinspection ES6ModulesDependencies,JSUnresolvedFunction
            selectHybrid[allselectHB[i].className.slice(4, 7) + allselectHB[i].className.split(' ')[1].slice(0, this.length - 2) + allselectHB[i].className.split(' ')[1][allselectHB[i].className.split(' ')[1].length - 1]] = {
                subject: 'M',
                day: moment(0).day(daytoNum(allselectHB[i].className.slice(4, 7))).hour(allselectHB[i].className.split(' ')[1].slice(0, allselectHB[i].className.split(' ')[1].length - 2)).valueOf()
            }
        }
        if (allselectHB[i].className.split(' ')[1][allselectHB[i].className.split(' ')[1].length - 1] === '2') {
            //noinspection ES6ModulesDependencies,JSUnresolvedFunction
            selectHybrid[allselectHB[i].className.slice(4, 7) + allselectHB[i].className.split(' ')[1].slice(0, this.length - 2) + allselectHB[i].className.split(' ')[1][allselectHB[i].className.split(' ')[1].length - 1]] = {
                subject: 'PH',
                day: moment(0).day(daytoNum(allselectHB[i].className.slice(4, 7))).hour(allselectHB[i].className.split(' ')[1].slice(0, allselectHB[i].className.split(' ')[1].length - 2)).valueOf()
            }
        }
    }
    writeCookie('regisHybrid', JSON.stringify(selectHybrid));
    self.location = "registrationSkill"
}

function daytoNum(day) {
    switch (day) {
        case 'sun':
            return 0;
        case 'mon':
            return 1;
        case 'tue':
            return 2;
        case 'wed':
            return 3;
        case 'thu':
            return 4;
        case 'fri':
            return 5;
        case 'sat':
            return 6
    }
}

function calculate(btn) { /* run after click btn in HTML to switch between select and non-select */
    let i;
    let all_same = document.getElementsByClassName(btn.className.split(' ')[0] + ' ' + btn.className.split(' ')[1]);
    for (i = 0; i < all_same.length; i++) {
        let raw = all_same[i].className;
        let check = all_same[i].className.split(' ')[0] + ' ' + all_same[i].className.split(' ')[1];
        if (raw.indexOf("btn-default") !== -1) {
            raw = raw.replace(/btn-default/g, "btn-success");
            all_same[i].className = raw;
            let temp;
            if (check[check.length - 1] === '1') {
                temp = document.getElementsByClassName(check.slice(0, check.length - 1) + '2');
                for (let j = 0; j < temp.length; j++) {
                    if (temp[j].className.indexOf("btn-success") !== -1) {
                        deselect(temp[j])
                    }
                }
            }
            else if (check[check.length - 1] === '2') {
                temp = document.getElementsByClassName(check.slice(0, check.length - 1) + '1');
                for (let j = 0; j < temp.length; j++) {
                    if (temp[j].className.indexOf("btn-success") !== -1) {
                        deselect(temp[j])
                    }
                }
            }
        }
        else if (raw.indexOf("btn-success") !== -1) {
            raw = raw.replace(/btn-success/g, "btn-default");
            all_same[i].className = raw;
        }
    }
}

function deselect(btn) {     /* sub function to deselect duo btn if both is selected */
    let i;
    let all_same = document.getElementsByClassName(btn.className.split(' ')[0] + ' ' + btn.className.split(' ')[1]);
    for (i = 0; i < all_same.length; i++) {
        let raw = all_same[i].className;
        if (raw.indexOf("btn-default") !== -1) {
            raw = raw.replace(/btn-default/g, "btn-success");
            all_same[i].className = raw;
        }
        else if (raw.indexOf("btn-success") !== -1) {
            raw = raw.replace(/btn-success/g, "btn-default");
            all_same[i].className = raw;
        }
    }
}

function back() {
    self.location = "registrationCourse"
}
