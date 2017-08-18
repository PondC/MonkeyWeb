$(document).ready(function () {
    let cookie = getCookieDict();
    // add time picker
    $('#datetimepicker1').datetimepicker({
        format: 'DD/MM/YYYY',
        daysOfWeekDisabled: [1, 3, 5]
    });
    // show name
    $.post('post/name', { userID: cookie.monkeyWebUser }, function (data, status) {
        $('#name').append(' ' + data.nickname + ' ' + data.firstname + ' ' + data.lastname);
    })
    // add event when pick day
    $('#datetimepicker1').on("dp.change", function (e) {
        let inTable = [];
        let timeLabel = [];
        let today = $('.datePicker').data('DateTimePicker').date();
        $.post('post/studentProfile', { studentID: cookie.monkeyWebUser }).then((cr) => {
            for (let i = 0; i < cr.hybridDay.length; i++) {
                let hbday = moment(cr.hybridDay[i].day);
                if (hbday.day() === today.day()) {
                    inTable.push("FHB: " + cr.hybridDay[i].subject);
                    timeLabel.push(hbday.format('H:mm'));
                }
            }
            for (let i = 0; i < cr.courseID.length; i++) {
                $.post('post/courseInfo', { courseID: cr.courseID[i] }).then((info) => {
                    let crday = moment(info.day);
                    if (crday.day() === today.day()) {
                        inTable.push(info.courseName);
                        timeLabel.push(crday.format('H:mm'));
                        updateBtn(inTable, timeLabel);
                    }
                })
            }
            updateBtn(inTable, timeLabel);
        })

    })
    // btn click function
    $(".btn").click(function () {
        let cls = this.className;
        if (cls.indexOf('disabled') < 0) {
            if (cls.indexOf('btn-default') >= 0) {
                for (let i = 0; i < 4; i++) {
                    if ($(".btn" + (i + 1)).attr('class').indexOf('disabled') < 0 && $(".btn" + (i + 1)).attr('class').indexOf('btn-success') > 0) {
                        $(".btn" + (i + 1)).attr('class', $(".btn" + (i + 1)).attr('class').replace('btn-success', 'btn-default'))
                    }
                }
                this.className = cls.replace('btn-default', 'btn-success');
            } else this.className = cls.replace('btn-success', 'btn-default');
        }
    });
    // btn submit click
    $("#submit").click(function () {
        let boo = true;
        for (let i = 0; i < 4; i++) {
            let btn = $(".btn" + (i + 1));
            if (btn.attr('class').indexOf('btn-success') >= 0) {
                boo = false;
            }
        }
        if (boo) {
            alert("กรุณาเลือกวันที่และเวลา");
        } else if ($('#contact').val().length <= 0) {
            alert("กรุณาใส่ชื่อผู้แจ้ง")
        } else {
            $(".modal-body").append("<p>ต้องการเพิ่มตามนี้ใช่หรือไม่?</p>");
            let subj = $('#subj').val().slice(0, 3) + ":" + $('#subj').val().slice(3);
            for (let i = 0; i < 4; i++) {
                let btn = $(".btn" + (i + 1));
                if (btn.attr('class').indexOf('btn-success') >= 0) {
                    $(".modal-body").append("<p>" + subj + " (" + btn.text() + ")</p>");
                }
            }
            $("#confirmModal").modal();
        }
    });
})
function updateBtn(table, timeLabel) {
    let pickday = $('.datePicker').data('DateTimePicker').date();
    let time1 = ["8:00", "10:00", "13:00", "15:00"];
    let time2 = ["", "", "", "17:00"];
    let day1 = ["8:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00"];
    let day2 = ["-", "-", "-", "17:00-19:00"];
    let time = moment(0);
    time.date(pickday.date()).month(pickday.month()).year(pickday.year());
    // gen default button
    if (pickday.day() === 2 || pickday.day() === 4) {
        for (let i = 0; i < 4; i++) {
            $(".btn" + (i + 1)).html(day2[i]);
            if (i < 3) {
                $(".btn" + (i + 1)).attr('class', 'btn btn-default col-xs-12 disabled btn' + (i + 1));
                $(".btn" + (i + 1)).attr('id', '');
            } else {
                time.hour(time2[i].slice(0, -3)).minute('0');
                $(".btn" + (i + 1)).attr('class', 'btn btn-default col-xs-12 btn' + (i + 1));
                $(".btn" + (i + 1)).attr('id', time);
            }
            $(".modal-body").empty();
        }
    } else {
        for (let i = 0; i < 4; i++) {
            time.hour(time1[i].slice(0, -3)).minute('0');
            $(".btn" + (i + 1)).html(day1[i]);
            $(".btn" + (i + 1)).attr('class', 'btn btn-default col-xs-12 btn' + (i + 1));
            $(".btn" + (i + 1)).attr('id', time);
            $(".modal-body").empty();
        }
    }
    // add cr&fhb to button
    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < 4; j++) {
            if (pickday.day() === 2 || pickday.day() === 4) {
                if (timeLabel[i] === time2[j]) {
                    $(".btn" + (j + 1)).html(table[i] + " (" + timeLabel[i] + ")");
                    $(".btn" + (j + 1)).attr('class', 'btn btn-warning col-xs-12 disabled btn' + (j + 1));
                    $(".btn" + (j + 1)).attr('id', "");
                }
            } else if (timeLabel[i] === time1[j]) {
                $(".btn" + (j + 1)).html(table[i] + " (" + timeLabel[i] + ")");
                $(".btn" + (j + 1)).attr('class', 'btn btn-warning col-xs-12 disabled btn' + (j + 1));
                $(".btn" + (j + 1)).attr('id', "");
            }
            $(".modal-body").empty();
        }
    }
}
function sendData(i) {
    if (i < 4) {
        let btn = $(".btn" + (i + 1));
        if (btn.attr('class').indexOf('btn-success') >= 0) {
            let cookie = getCookieDict();
            let daytime = btn.attr('id');
            $.post('post/addStudentPresenceModifier', { studentID: cookie.monkeyWebUser, day: daytime, subjectToAdd: $('#subj').val(), sender: $('#contact').val() }).then((data) => {
                sendData(i + 1);
            })
        } else sendData(i + 1);
        if (i === 3) {
            $("#confirmModal").modal("hide");
            location.reload();
        }
    }
}