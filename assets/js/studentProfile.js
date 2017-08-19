// const studentProf = (studentID) => $.post("post/studentProfile", {
//     studentID: studentID
// });

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const courseInf = (courseID) => $.post("post/courseInfo", {
    courseID: courseID
});
$(document).ready(function () {
    genTable();
    let cookie = getCookieDict();
    //noinspection JSUnresolvedVariable
    $('#id').html(cookie.monkeyWebUser);
    //noinspection JSUnresolvedVariable
    showProfilePic(cookie.monkeyWebUser);
    $('.profilePic').click(function () {
        $('#profileModal').modal();
    });
    //noinspection JSUnresolvedVariable
    studentProfile(parseInt(cookie.monkeyWebUser)).then((data) => {
        let temp;
        let time;
        let status = $('#status');
        switch (data.registrationState) {
            case 'untransferred':
                status.html('รอใบโอน');
                break;
            case 'transferred':
                status.html('โอนเงินแล้ว');
                break;
            case 'pending':
                status.html('อยู่ระหว่างพิจารณา');
                break;
            case 'registered':
                status.html('ลงทะเบียนเสร็จสมบูรณ์');
                break;
        }
        $('#name').html(data.nickname + ' ' + data.firstname + ' ' + data.lastname);
        $('#nameE').html(data.nicknameEn + ' ' + data.firstnameEn + ' ' + data.lastnameEn);
        $('#studentTel').html(data.phone);
        $('#parentTel').html(data.phoneParent);
        $('#email').html(data.email);
        $('#grade').html(() => {
            if (parseInt(data.grade) > 6) {
                return 'มัธยม ' + (parseInt(data.grade) - 6)
            }
            else {
                return 'ประถม ' + data.grade
            }
        });
        for (let i in data.hybridDay) {
            let hybrid = document.getElementsByClassName('btn-' + (numtoDay((new Date(parseInt(data.hybridDay[i].day))).getDay())) + ' ' + (new Date(parseInt(data.hybridDay[i].day))).getHours() + '.1');
            for (let j = 0; j < hybrid.length; j++) {
                hybrid[j].className = hybrid[j].className + ' hb';
                hybrid[j].innerHTML = '<strong>FHB :</strong>' + '<br>' + fullHBname(data.hybridDay[i].subject)
            }
        }
        for (let i in data.skillDay) {
            switch ((new Date(parseInt(data.skillDay[i].day))).getHours()) {
                case 9:
                    time = '8';
                    break;
                case 10:
                case 11:
                    time = '10';
                    break;
                case 13:
                case 14:
                    time = '13';
                    break;
                case 15:
                    time = '15';
                    break;
                default:
                    break;
            }
            let skill = document.getElementsByClassName('btn-' + (numtoDay((new Date(parseInt(data.skillDay[i].day))).getDay())) + ' ' + time + '.1');
            for (let j = 0; j < skill.length; j++) {
                if (!(skill[j].className.indexOf('sk') !== -1)) {
                    skill[j].className = skill[j].className + ' sk';
                    if ((new Date(parseInt(data.skillDay[i].day))).getMinutes() === 0) {
                        temp = (new Date(parseInt(data.skillDay[i].day))).getHours() + '.00 น.';
                    }
                    else {
                        temp = (new Date(parseInt(data.skillDay[i].day))).getHours() + '.30 น.';
                    }
                    skill[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + temp
                }
                else {
                    if (skill[j].innerHTML.split('<br>')[1].split(' ')[0] <= (new Date(parseInt(data.skillDay[i].day))).getHours() + '.' + (new Date(parseInt(data.skillDay[i].day))).getMinutes() / 100) {
                        temp = skill[j].innerHTML.split('<br>')[1].split(' ')[0] + '0 น.';
                    }
                    else {
                        temp = (new Date(parseInt(data.skillDay[i].day))).getHours() + '.' + parseInt((new Date(parseInt(data.skillDay[i].day))).getMinutes() / 100) + '0 น.';
                    }
                    skill[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + temp
                }
            }
        }
        for (let i in data.courseID) {
            //noinspection JSUnfilteredForInLoop
            courseInf(data.courseID[i]).then((cr) => {
                let course = document.getElementsByClassName('btn-' + (numtoDay((new Date(parseInt(cr.day))).getDay())) + ' ' + (new Date(parseInt(cr.day))).getHours() + '.1');
                for (let j = 0; j < course.length; j++) {
                    course[j].className = course[j].className + ' cr';
                    course[j].innerHTML = '<strong>CR :</strong>' + '<br>' + cr.courseName
                }
            })
        }
    });
    // const sDate = new Date("July 1, 2017 0:00:00");
    const sDate = moment("07-01-2017","MM-DD-YYYY")
    document.getElementById("startCr").innerHTML = sDate.format("DD MMM YYYY");
    let nDate = new Date().getTime();
    let diff = Math.round((nDate - sDate) / 604800000);
    if (diff <= 0) {
        document.getElementById("nowCr").innerHTML = "ยังไม่เริ่ม CR60Q3";
    } else document.getElementById("nowCr").innerHTML = "ครั้งที่ " + diff + "/14";
    // const eDate = new Date("October 1, 2017 23:59:59");
    const eDate = moment("10-01-2017","MM-DD-YYYY");
    document.getElementById("endCr").innerHTML = eDate.format("DD MMM YYYY");
});

function genTable() {
    let temp = document.getElementsByClassName('disabled');
    for (let i = 0; i < temp.length; i++) {
        let name = '';
        for (let j = 0; j < 6; j++) {
            name += temp[i].className.split(' ')[j] + ' ';
        }
        temp[i].className = name;
        temp[i].innerHTML = '&nbsp;' + '<br>' + '&nbsp;';
    }
}
function showProfilePic(id) {
    //noinspection ES6ModulesDependencies
    $.post("post/getConfig").then((config) => {
        //noinspection ES6ModulesDependencies
        $.get(config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.jpg', function (data, status) {
            if (status === 'success') {
                $('.profilePic').attr("src", config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.jpg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.jpeg', function (data, status) {
            if (status === 'success') {
                $('.profilePic').attr("src", config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.jpeg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.png', function (data, status) {
            if (status === 'success') {
                $('.profilePic').attr("src", config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.png');
            }
        });
    });
}
function upPic() {
    let cookie = getCookieDict();
    //noinspection JSUnresolvedVariable
    let ID = cookie.monkeyWebUser;
    let ufile = $('#file-1');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        formData.append('file', files[0], files[0].name);
        formData.append('userID', ID);
        //noinspection JSUnusedLocalSymbols
        $.ajax({
            url: 'post/updateProfilePicture',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                showProfilePic(ID);
                $('#profileModal').modal('hide');
            }
        });
    }

}