$(document).ready(function () {
    modal = document.getElementById('id01');
    genTable();
    updateTable();
    var cookie = getCookieDict();
    cookie.regisCourse = JSON.parse(cookie.regisCourse);
    cookie.regisHybrid = JSON.parse(cookie.regisHybrid);
    cookie.name = JSON.parse(cookie.name);
    cookie.nameE = JSON.parse(cookie.nameE);
    cookie.tel = JSON.parse(cookie.tel);
    console.log(cookie)
    $('#name').html(decodeURIComponent(cookie.name['nname']) + ' ' + decodeURIComponent(cookie.name['name']) + ' ' + decodeURIComponent(cookie.name['sname']));
    $('#nameE').html(decodeURIComponent(cookie.nameE['nname']) + ' ' + decodeURIComponent(cookie.nameE['name']) + ' ' + decodeURIComponent(cookie.nameE['sname']));
    $('#parentTel').html(cookie.tel.parent + '(ผู้ปกครอง)');
    $('#studentTel').html(cookie.tel.student + '(นักเรียน)');
    $('#email').html(cookie.email);
    $('#crFee').html(cookie.courseFee.slice(0, cookie.courseFee.length - 3) + ',' + cookie.courseFee.slice(cookie.courseFee.length - 3, cookie.courseFee.length) + ' บาท');
    $('#grade').html(gradetoText(cookie.grade));
    var crPrint = '';
    for (let i in cookie.regisCourse) {
        if (cookie.regisCourse[i] !== false) {
            cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day);
            if (cookie.regisCourse[i].tutor[0] === 99000) {
                cookie.regisCourse[i].courseName += '(HB)'
            }
            if (cookie.regisCourse[i].select) {
                crPrint += numtoDay(cookie.regisCourse[i].day.getDay()) + ' ' + cookie.regisCourse[i].day.getHours() + '.00-' + (cookie.regisCourse[i].day.getHours() + 2) + '.00 น. : ' + cookie.regisCourse[i].courseName + '<br>'
            }
        }
    }
    $('#cr').html(crPrint);
    var hbPrint = '';
    for (let i in cookie.regisHybrid) {
        if (cookie.regisHybrid[i] !== false) {
            cookie.regisHybrid[i].day = new Date(cookie.regisHybrid[i].day);
            hbPrint += numtoDay(cookie.regisHybrid[i].day.getDay()) + ' ' + cookie.regisHybrid[i].day.getHours() + '.00-' + (cookie.regisHybrid[i].day.getHours() + 2) + '.00 น. : ' + fullHBname(cookie.regisHybrid[i].subject) + '<br>';
            if (cookie.regisHybrid[i].day.getDay() === 6) {
                var time = cookie.regisHybrid[i].day.getHours();
                for (j = -1; j < 4; j++) {
                    var temp = (10 * time) + (j * 5);
                    if (!($("#skilltime").find("option[value=" + temp + "]").parent().is("span"))) {
                        $("#skilltime,#skilltimeEng").find("option[value=" + temp + "]").wrap("<span>");
                    }
                }
            }
        }
    }
    $('#hb').html(hbPrint);
    var skPrint = '';
    if (cookie.skillSel != '4') {
        if ($('#station').val() === '2') {
            skPrint += 'MATH : สาย 3 ' + '<br>'
        }
        else {
            if ($("#skilltime").val() !== '0') {
                skPrint += $('#skillday').val() + ' ' + $("#skilltime option:selected").html() + ' น. : MATH <br>'
            }
        }
        if ($('#stationEng').val() === '2') {
            skPrint += 'ENG : สาย 3 ' + '<br>'
        }
        else {
            if ($("#skilltimeEng").val() !== '0') {
                skPrint += $('#skilldayEng').val() + ' ' + $("#skilltimeEng option:selected").html() + ' น. : ENG <br>'
            }
        }
    }
    else {
        skPrint += 'Complete'
    }
    $('#sk').html(skPrint);
    if ($('#hb').html().length === 0) {
        $('#hb').html('ไม่ลงทะเบียนในระบบ FHB')
    }
    if ($('#sk').html().length === 0) {
        $('#sk').html('ไม่ลงทะเบียนในระบบ SKILL')
    }
});

function genTable() {
    var temp = document.getElementsByClassName('disabled');
    for (let i = 0; i < temp.length; i++) {
        var name = '';
        for (let j = 0; j < 6; j++) {
            name += temp[i].className.split(' ')[j] + ' ';
        }
        temp[i].className = name;
        temp[i].innerHTML = '&nbsp;' + '<br>' + '&nbsp;';
    }
}

function updateTable() {
    var cookie = getCookieDict();
    cookie.regisCourse = JSON.parse(cookie.regisCourse);
    cookie.regisHybrid = JSON.parse(cookie.regisHybrid);
    if (cookie.skillSel != '4') {
        cookie.regisSkill = JSON.parse(cookie.regisSkill);
        $('#skilltime').val(cookie.regisSkill.M.time)
        $('#station').val(cookie.regisSkill.M.station)
        $('#skillday').val(cookie.regisSkill.M.day)
        $('#skilltimeEng').val(cookie.regisSkill.E.time)
        $('#stationEng').val(cookie.regisSkill.E.station)
        $('#skilldayEng').val(cookie.regisSkill.E.day)
    }
    for (let i in cookie.regisCourse) {
        if (cookie.regisCourse[i] !== false) {
            cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day);
            if (cookie.regisCourse[i].tutor[0] === 99000) {
                cookie.regisCourse[i].courseName += '(HB)'
            }
            var courseClass;
            if (cookie.regisCourse[i].day.getDay() === 6 && cookie.regisCourse[i].select === true) {
                courseClass = document.getElementsByClassName('btn-sat ' + cookie.regisCourse[i].day.getHours() + '.1');
                for (let j = 0; j < courseClass.length; j++) {
                    courseClass[j].className = courseClass[j].className + ' cr';
                    courseClass[j].innerHTML = '<strong>CR :</strong>' + '<br>' + cookie.regisCourse[i].courseName;
                }
            }
            if (cookie.regisCourse[i].day.getDay() === 0 && cookie.regisCourse[i].select === true) {
                courseClass = document.getElementsByClassName('btn-sun ' + cookie.regisCourse[i].day.getHours() + '.1');
                for (let j = 0; j < courseClass.length; j++) {
                    courseClass[j].className = courseClass[j].className + ' cr';
                    courseClass[j].innerHTML = '<strong>CR :</strong>' + '<br>' + cookie.regisCourse[i].courseName;
                }
            }
        }
    }
    for (let i in cookie.regisHybrid) {
        if (cookie.regisHybrid[i] !== false) {
            cookie.regisHybrid[i].day = new Date(cookie.regisHybrid[i].day);
            var day = ['sat', 'sun', 'tue', 'thu'];
            var dayNum = [6, 0, 2, 4];
            for (let k = 0; k < 4; k++) {
                if (cookie.regisHybrid[i].day.getDay() === dayNum[k]) {
                    var hybridClass = document.getElementsByClassName('btn-' + day[k] + ' ' + cookie.regisHybrid[i].day.getHours() + '.1');
                    for (let j = 0; j < hybridClass.length; j++) {
                        hybridClass[j].className = hybridClass[j].className + ' hb';
                        hybridClass[j].innerHTML = '<strong>FHB :</strong>' + '<br>' + fullHBname(cookie.regisHybrid[i].subject);
                    }
                }
            }
        }
    }
    if ($('#station').val() == '1' && $('#skilltime').val() != '0') {
        var disTime = [8, 10, 13, 15]
        for (i = 0; i < disTime.length; i++) {
            if (Math.floor(parseInt($('#skilltime').val()) / 10) == disTime[i] || Math.floor(parseInt($('#skilltime').val()) / 10) - 1 == disTime[i]) {
                var skillClass = document.getElementsByClassName('btn-' + $('#skillday').val() + ' ' + disTime[i] + '.1');
                for (let j = 0; j < skillClass.length; j++) {
                    if (skillClass[j].className.indexOf('sk') != -1) {
                        if (parseInt($('#skilltimeEng option:selected').val()) <= parseInt($('#skilltime option:selected').val())) {
                            var x = $('#skilltimeEng option:selected').text().split('-')[0]
                        }
                        else if ($('skilltime').val() != '0') {
                            var x = $('#skilltime option:selected').text().split('-')[0]
                        }
                        else {
                            var x = $('#skilltimeEng option:selected').text().split('-')[0]
                        }
                        skillClass[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + x + ' น.';
                    }
                    else {
                        skillClass[j].className = skillClass[j].className + ' sk';
                        skillClass[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + $('#skilltime option:selected').text().split('-')[0] + ' น.';
                    }
                }
            }
        }
    }
    if ($('#stationEng').val() == '1' && $('#skilltimeEng').val() != '0') {
        var disTime = [8, 10, 13, 15]
        for (i = 0; i < disTime.length; i++) {
            if (Math.floor(parseInt($('#skilltimeEng').val()) / 10) == disTime[i] || Math.floor(parseInt($('#skilltimeEng').val()) / 10) - 1 == disTime[i]) {
                var skillClassE = document.getElementsByClassName('btn-' + $('#skilldayEng').val() + ' ' + disTime[i] + '.1');
                for (let j = 0; j < skillClassE.length; j++) {
                    if (skillClassE[j].className.indexOf('sk') != -1) {
                        if (parseInt($('#skilltimeEng option:selected').val()) <= parseInt($('#skilltime option:selected').val())) {
                            var x = $('#skilltimeEng option:selected').text().split('-')[0]
                        }
                        else if ($('skilltime').val() != '0') {
                            var x = $('#skilltime option:selected').text().split('-')[0]
                        }
                        else {
                            var x = $('#skilltimeEng option:selected').text().split('-')[0]
                        }
                        skillClassE[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + x + ' น.';
                    }
                    else {
                        skillClassE[j].className = skillClassE[j].className + ' sk';
                        skillClassE[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + $('#skilltimeEng option:selected').text().split('-')[0] + ' น.';
                    }
                }
            }
        }
    }
}

function back() {
    var cookie = getCookieDict()
    if (cookie.skillSel == '4') {
        self.location = "registrationSkill"
    }
    else {
        self.location = "registrationSkill2"
    }
}


window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

function notsubmit() {
    modal.style.display = "none";
}

function submit() {
    var cookie = getCookieDict();
    cookie.regisCourse = JSON.parse(cookie.regisCourse);
    cookie.regisHybrid = JSON.parse(cookie.regisHybrid);
    cookie.name = JSON.parse(cookie.name);
    cookie.nameE = JSON.parse(cookie.nameE);
    cookie.tel = JSON.parse(cookie.tel);
    $.post("post/editStudent", {
        studentID: parseInt(cookie.monkeyWebUser),
        firstname: decodeURIComponent(cookie.name.name),
        lastname: decodeURIComponent(cookie.name.sname),
        nickname: decodeURIComponent(cookie.name.nname),
        firstnameEn: decodeURIComponent(cookie.nameE.name),
        lastnameEn: decodeURIComponent(cookie.nameE.sname),
        nicknameEn: decodeURIComponent(cookie.nameE.nname),
        email: cookie.email,
        phone: cookie.tel.student,
        grade: parseInt(cookie.grade),
        phoneParent: cookie.tel.parent
    }, function (output1) {
        if (output1.err) {
            alert('Something went wrong! please try again')
        }
        else {
            var coursetoThrow = [];
            for (let i in cookie.regisCourse) {
                if (cookie.regisCourse[i] !== false) {
                    if (cookie.regisCourse[i].select === true) {
                        coursetoThrow.push(cookie.regisCourse[i].courseID)
                    }
                }
            }
            $.post("post/addStudentCourse", {
                studentID: parseInt(cookie.monkeyWebUser),
                courseID: coursetoThrow
            }, function (output2) {
                if (output2.err) {
                    alert('Something went wrong! please try again')
                }
                else {
                    for (let i in cookie.regisHybrid) {
                        if (cookie.regisHybrid[i] !== false) {
                            $.post("post/addHybridDay", {
                                studentID: parseInt(cookie.monkeyWebUser),
                                subject: cookie.regisHybrid[i].subject,
                                day: cookie.regisHybrid[i].day
                            }, function (output3) {
                                if (output3.err) {
                                    alert("Something went wrong! please try again")
                                }
                            })
                        }
                    }
                    if ($('#skilltime').val() !== '0') {
                        $.post("post/addSkillDay", {
                            studentID: parseInt(cookie.monkeyWebUser),
                            subject: 'M',
                            day: moment(0).day(daytoNum($('#skillday').val())).hour(Math.floor(parseInt($('#skilltime').val()) / 10)).minute((parseInt($('#skilltime').val()) % 10) * 6).valueOf()
                        }, function (output4) {
                            if (output4.err) {
                                alert("Something went wrong! please try again")
                            }
                        })
                    }
                    if ($('#skilltimeEng').val() !== '0') {
                        $.post("post/addSkillDay", {
                            studentID: parseInt(cookie.monkeyWebUser),
                            subject: 'E',
                            day: moment(0).day(daytoNum($('#skilldayEng').val())).hour(Math.floor(parseInt($('#skilltimeEng').val()) / 10)).minute((parseInt($('#skilltimeEng').val()) % 10) * 6).valueOf()
                        }, function (output4) {
                            if (output4.err) {
                                alert("Something went wrong! please try again")
                            }
                        })
                    }
                    let changeStatus = (userID, status) => $.post("post/changeStatus", {
                        userID: userID,
                        status: status
                    });
                    //noinspection JSUnresolvedVariable
                    changeStatus(parseInt(cookie.monkeyWebUser), status).then(() => {
                        alert('ลงทะเบียนเสร็จสิ้น');
                        $.post("post/changeStatus", {
                            userID: parseInt(cookie.monkeyWebUser),
                            status: "active"
                        }).then((data) => {
                            if (data.err) {
                            } else {
                                self.location = 'registrationReceipt'
                            }
                        });
                    });

                }
            })
        }
    });
}