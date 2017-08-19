let availableCourse;
const pricepercourse = 7800;
let allSuggest;
let suggestCourse;
$(document).ready(function () {
    const cookie = getCookieDict();
    if (cookie.regisCourse !== undefined) {
        deleteCookie("regisCourse")
    }
    if (typeof(cookie.name) !== 'string') {
        self.location = "registrationName"
    }
    cookie.name = JSON.parse(cookie.name);
    $('#nname').html(decodeURIComponent(cookie.name.nname));
    $('#name').html(decodeURIComponent(cookie.name.name));
    $('#sname').html(decodeURIComponent(cookie.name.sname));
    let $grade = $('#grade');
    $grade.val(cookie.grade);
    const grade = parseInt($grade.val());
    if (grade >= 10) {
        $('#info2,#info4').hide()
    }
    genTable();
    //noinspection ES6ModulesDependencies,JSUnresolvedFunction
    $.post("post/listCourseSuggestion", {grade: grade}, function (suggestCR) {
        allSuggest = suggestCR;
        for (let i = 0; i < allSuggest.course.length; i++) {
            const lv = allSuggest.course[i].level;
            $('#level').append('<option value="' + lv + '">' + lv + '</option>');
        }
    });
    //noinspection JSValidateTypes
    document.getElementById('show_price').innerHTML = 0;
    availableCourse = {
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
    if (grade !== 0) {
        //add SAT for high school student
        if (grade >= 10) {
            //noinspection ES6ModulesDependencies,JSUnresolvedFunction
            $.post("post/gradeCourse", {grade: 13}, function (arrayCourse) {
                updateAvaiCr(arrayCourse)
            });
        }
        //noinspection ES6ModulesDependencies,JSUnresolvedFunction
        $.post("post/gradeCourse", {grade: grade}, function (arrayCourse) {
            updateAvaiCr(arrayCourse);
            updateTable(availableCourse);
        });
    }

    $('#level').change(function () {
        if ($('#level').val() === '0') {
            $('.suggest').removeClass('suggest')
        }
    })
});
function updateAvaiCr(arrayCourse) {
    for (let i = 0; i < arrayCourse.course.length; i++) {
        arrayCourse.course[i].day = new Date(arrayCourse.course[i].day);
        if (arrayCourse.course[i].day.getDay() === 6) {
            if (arrayCourse.course[i].day.getHours() === 8) {
                if (availableCourse.sat81 === false) {
                    availableCourse.sat81 = arrayCourse.course[i]
                }
                else if (availableCourse.sat82 === false) {
                    availableCourse.sat82 = arrayCourse.course[i]
                }
            }
            if (arrayCourse.course[i].day.getHours() === 10) {
                if (availableCourse.sat101 === false) {
                    availableCourse.sat101 = arrayCourse.course[i]
                }
                else if (availableCourse.sat102 === false) {
                    availableCourse.sat102 = arrayCourse.course[i]
                }
            }
            if (arrayCourse.course[i].day.getHours() === 13) {
                if (availableCourse.sat131 === false) {
                    availableCourse.sat131 = arrayCourse.course[i]
                }
                else if (availableCourse.sat132 === false) {
                    availableCourse.sat132 = arrayCourse.course[i]
                }
            }
            if (arrayCourse.course[i].day.getHours() === 15) {
                if (availableCourse.sat151 === false) {
                    availableCourse.sat151 = arrayCourse.course[i]
                }
                else if (availableCourse.sat152 === false) {
                    availableCourse.sat152 = arrayCourse.course[i]
                }
            }
        }
        if (arrayCourse.course[i].day.getDay() === 0) {
            if (arrayCourse.course[i].day.getHours() === 8) {
                if (availableCourse.sun81 === false) {
                    availableCourse.sun81 = arrayCourse.course[i]
                }
                else if (availableCourse.sun82 === false) {
                    availableCourse.sun82 = arrayCourse.course[i]
                }
            }
            if (arrayCourse.course[i].day.getHours() === 10) {
                if (availableCourse.sun101 === false) {
                    availableCourse.sun101 = arrayCourse.course[i]
                }
                else if (availableCourse.sun102 === false) {
                    availableCourse.sun102 = arrayCourse.course[i]
                }
            }
            if (arrayCourse.course[i].day.getHours() === 13) {
                if (availableCourse.sun131 === false) {
                    availableCourse.sun131 = arrayCourse.course[i]
                }
                else if (availableCourse.sun132 === false) {
                    availableCourse.sun132 = arrayCourse.course[i]
                }
            }
            if (arrayCourse.course[i].day.getHours() === 15) {
                if (availableCourse.sun151 === false) {
                    availableCourse.sun151 = arrayCourse.course[i]
                }
                else if (availableCourse.sun152 === false) {
                    availableCourse.sun152 = arrayCourse.course[i]
                }
            }
        }
    }
}
function updateTable(course) { /* update table after gen to change from blank to recieved data */
    for (let i in course) {
        if (course[i] !== false) {
            let temp = document.getElementsByClassName("btn-" + i.slice(0, 3) + " " + i.slice(3, i.length - 1) + "." + i[i.length - 1]);
            for (let j = 0; j < temp.length; j++) {
                let rep = temp[j].className;
                rep = rep.replace(/btn-basic disabled/g, "btn btn-default");
                temp[j].className = rep;
                temp[j].innerHTML = course[i].courseName;
                if (course[i].tutor[0] === 99000) {
                    temp[j].innerHTML += '(HB)'
                }
                if (course[i].suggest === true && temp[j].className.indexOf('suggest') === -1) {
                    temp[j].className = temp[j].className + ' suggest';
                }
                else if (course[i].suggest === false) {
                    temp[j].className = temp[j].className.replace(/ suggest/g, '')
                }
            }
        }
    }
}
function genTable() { /* gen blank table at first */
    let satTable = document.getElementsByClassName("btn-sat");
    let sunTable = document.getElementsByClassName("btn-sun");
    let i;
    let raw;
    for (i = 0; i < satTable.length; i++) {
        raw = satTable[i].className.split(' ');
        satTable[i].className = raw[0] + ' ' + raw[1] + ' btn btn-basic disabled ' + raw[raw.length - 1];
        satTable[i].innerHTML = "&nbsp;"
    }
    for (i = 0; i < sunTable.length; i++) {
        raw = sunTable[i].className.split(' ');
        sunTable[i].className = raw[0] + ' ' + raw[1] + ' btn btn-basic disabled ' + raw[raw.length - 1];
        sunTable[i].innerHTML = "&nbsp;"
    }
}
function calculate(btn) {
    let temp;
    /* run after click btn in HTML to switch between select and non-select */
    let all_same = document.getElementsByClassName(btn.className.split(' ')[0] + ' ' + btn.className.split(' ')[1]);
    for (let i = 0; i < all_same.length; i++) {
        let raw = all_same[i].className;
        let check = all_same[i].className.split(' ')[0] + ' ' + all_same[i].className.split(' ')[1];
        if (raw.indexOf("btn-default") !== -1) {
            raw = raw.replace(/btn-default/g, "btn-success");
            all_same[i].className = raw;
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
    temp = btn.className.split(' ');
    let dayHour = temp[0].slice(temp[0].length - 3, temp[0].length) + temp[1];
    dayHour = dayHour.replace('.', '');
    if (availableCourse[dayHour] !== false) {
        availableCourse[dayHour]["select"] = btn.className.indexOf("btn-success") !== -1;
    }
    //noinspection JSValidateTypes
    document.getElementById('show_price').innerHTML = document.getElementsByClassName('btn-success').length * pricepercourse / 2;
    nextCheck();
}
function deselect(btn) {     /* sub function to deselect duo btn if both is selected */
    let all_same = document.getElementsByClassName(btn.className.split(' ')[0] + ' ' + btn.className.split(' ')[1]);
    for (let i = 0; i < all_same.length; i++) {
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
function nextCheck() { /* check next btn */
    let check = false;
    for (let i in availableCourse) {
        if (availableCourse[i] !== false) {
            if (availableCourse[i].select === true && availableCourse[i].tutor[0] !== 99000) {
                check = true;
            }
        }
    }
    if (parseInt($('#grade').val()) >= 10) {
        check = true
    }
    if (check && document.getElementsByClassName('btn-success').length * pricepercourse / 2 >= 2 * pricepercourse) {
        document.getElementById("next").className = "btn btn-default";
    }
    else {
        document.getElementById("next").className = "btn btn-basic disabled";
    }
}
function next(gg) {
    if (gg.className.indexOf("disabled") === -1) {
        writeCookie('courseFee', document.getElementsByClassName('btn-success').length * pricepercourse / 2);
        writeCookie("regisCourse", JSON.stringify(availableCourse));
        self.location = "registrationHybrid";
    }
}
function back() {
    self.location = "registrationName";
}
function highlight() {
    let level = $('#level').val();
    for (let i = 0; i < allSuggest.course.length; i++) {
        if (level === allSuggest.course[i].level) {
            suggestCourse = allSuggest.course[i].courseID;
        }
    }
    for (let i in availableCourse) {
        if (availableCourse[i] !== false) {
            availableCourse[i]["suggest"] = suggestCourse.includes(availableCourse[i].courseID);
        }
    }
    updateTable(availableCourse);
}

function getDescription() {
    let description = document.getElementById("description");
    let innerHtml = "";
    let cookie = getCookieDict();

    switch (cookie.grade) {
        case "4":
        case "5":
        case "6":
            innerHtml = '<p class="form-control-static"><b>SCIP456z</b>: เนื้อหาทั่วไป (สำหรับทุกคน)</p>' +
                '<p class="form-control-static"><b>SCIP6x</b>: ตะลุยโจทย์สอบเข้า (สำหรับป.6 สอบเข้า)</p>' +
                '<p class="form-control-static"><b>MP456a</b>: เนื้อหาสอบเข้าที่จำเป็น</p>' +
                '<p class="form-control-static"><b>MP456x</b>: ตะลุยโจทย์สอบเข้า (สำหรับทุกคน)</p>' +
                '<p class="form-control-static"><b>MP456g</b>: กลุ่ม gifted (สำหรับนร.ที่ผ่านคอร์สพี่พรีมาแล้ว)</p>';
            break;
        case "7":
            innerHtml = '<p class="form-control-static"><b>ES123a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>' +
                '<p class="form-control-static"><b>ES123b</b>: สำหรับนร.ทั่วไป</p>' +
                '<p class="form-control-static"><b>CHS123z</b>: เนื้อหาเคมีทั่วไป (สำหรับทุกคน)</p>';
            break;
        case "8":
            innerHtml = '<p class="form-control-static"><b>ES123a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>' +
                '<p class="form-control-static"><b>ES123b</b>: สำหรับนร.ทั่วไป</p>' +
                '<p class="form-control-static"><b>MS23w</b>: เนื้อหาและโจทย์สอบเข้า (ระดับเริ่มต้น)</p>' +
                '<p class="form-control-static"><b>MS23x</b>: ตะลุยโจทย์สอบเข้า (ระดับยาก)</p>' +
                '<p class="form-control-static"><b>PHS12b</b>: กลุ่มพื้นฐาน (สำหรับนร.ที่ผ่านคอร์สพี่แก๊กมาแล้ว)</p>' +
                '<p class="form-control-static"><b>PHS2g</b>: กลุ่ม gifted (สำหรับนร.ที่ยังไม่เคยผ่านคอร์สพี่เต๋า)</p>' +
                '<p class="form-control-static"><b>PHS23g</b>: กลุ่ม gifted (สำหรับนร.ที่ผ่านคอร์สพี่เต๋ามาแล้ว)</p>' +
                '<p class="form-control-static"><b>CHS123z</b>: เนื้อหาเคมีทั่วไป (สำหรับทุกคน)</p>';
            break;
        case "9":
            innerHtml = '<p class="form-control-static"><b>ES123a</b>: สำหรับนร.ที่มีพื้นฐานดี หรือ นร.ม.3</p>' +
                '<p class="form-control-static"><b>ES23b</b>: สำหรับนร.ทั่วไป</p>' +
                '<p class="form-control-static"><b>MS23w</b>: เนื้อหาและโจทย์สอบเข้า (ระดับเริ่มต้น)</p>' +
                '<p class="form-control-static"><b>MS23x</b>: ตะลุยโจทย์สอบเข้า (ระดับยาก)</p>' +
                '<p class="form-control-static"><b>PHS3a</b>: สำหรับนร.ที่ยังไม่เคยผ่านคอร์สพี่เต๋า</p>' +
                '<p class="form-control-static"><b>PHS23g</b>: สำหรับนร.ที่ผ่านคอร์สพี่เต๋ามาแล้ว</p>' +
                '<p class="form-control-static"><b>CHS123z</b>: เนื้อหาเคมีทั่วไป (สำหรับทุกคน)</p>';
            break;
        case "10":
            innerHtml = '<p class="form-control-static"><b>ES456a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>' +
                '<p class="form-control-static"><b>ES45b</b>: สำหรับนร.ทั่วไป</p>' +
                '<p class="form-control-static"><b>CHS456a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>' +
                '<p class="form-control-static"><b>CHS456b</b>: สำหรับนร.ทั่วไป</p>';
            break;
        case "11":
            innerHtml = '<p class="form-control-static"><b>ES456a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>' +
                '<p class="form-control-static"><b>ES45b</b>: สำหรับนร.ทั่วไป</p>' +
                '<p class="form-control-static"><b>ES56s</b>: สำหรับนร.ที่ต้องการสอบ SAT</p>' +
                '<p class="form-control-static"><b>MS56s</b>: สำหรับนร.ที่ต้องการสอบ SAT</p>' +
                '<p class="form-control-static"><b>CHS456a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>' +
                '<p class="form-control-static"><b>CHS456b</b>: สำหรับนร.ทั่วไป</p>' +
                '<p class="form-control-static"><b>PHS56v</b>: เนื้อหาพิเศษทางวิศวกรรม (เพิ่มคะแนน PAT3)</p>';
            break;
        case "12":
            innerHtml = '<p class="form-control-static"><b>ES56s</b>: สำหรับนร.ที่ต้องการสอบ SAT</p>' +
                '<p class="form-control-static"><b>CHS456a</b>: สำหรับนร.ที่มีพื้นฐานดี หรือ นร.ม.6</p>' +
                '<p class="form-control-static"><b>CHS456b</b>: สำหรับนร.ทั่วไป</p>' +
                '<p class="form-control-static"><b>PHS56v</b>: เนื้อหาพิเศษทางวิศวกรรม (เพิ่มคะแนน PAT3)</p>' +
                '<p class="form-control-static"><b>PHS6x</b>: ตะลุยโจทย์ฟิสิกส์สอบเข้า (กสพท.+ PAT3)</p>' +
                '<p class="form-control-static"><b>MS56s</b>: สำหรับนร.ที่ต้องการสอบ SAT</p>' +
                '<p class="form-control-static"><b>MS6x</b>: ตะลุยโจทย์เลขสอบเข้า (สายวิทย์)</p>' +
                '<p class="form-control-static"><b>MS6w</b>: ตะลุยโจทย์เลขสอบเข้า (สายศิลป์)</p>';
            break;
        default:
            innerHtml = "";
            break;
    }
    description.innerHTML = innerHtml;
}