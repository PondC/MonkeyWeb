$(document).ready(function () {
    // show datepicker
    $('#datetimepicker1').datetimepicker({
        format: 'DD/MM/YYYY H:00',
        daysOfWeekDisabled: [1, 3, 5]
    });
    // add event when pick date
    $('#datetimepicker1').on("dp.change", function (e) {
        genTable();
    })
    genTable();
});
function genTable() {
    let date = $('.datePicker').data('DateTimePicker').date();
    $.post('post/listStudentAttendanceModifierByDay', { day: date.valueOf() }).then((data) => {
        $('#absentTable').empty();
        $('#presentTable').empty();
        if (data.absence.length > 0) {
            $('#absentTable').append('<h3><kbd>ลา</kbd></h3>');
            $('#absentTable').append("<table class='table table-hover'><thead><tr>"
                + "<th class='col-sm-1'>Id</th>"
                + "<th class='col-sm-3'>Name</th>"
                + "<th class='col-sm-1'>Subject</th>"
                + "<th class='col-sm-4'>Reason</th>"
                + "<th class='col-sm-1'>Sender</th>"
                + "<th class='col-sm-2'>Date</th>"
                + "</tr></thead><tbody id='absent'></tbody></table>");
            genAbsentTable(data, 0);
        }
        if (data.presence.length > 0) {
            $('#presentTable').append('<h3><kbd>เพิ่ม</kbd></h3>');
            $('#presentTable').append("<table class='table table-hover'><thead><tr>"
                + "<th class='col-sm-1'>Id</th>"
                + "<th class='col-sm-3'>Name</th>"
                + "<th class='col-sm-5'>Subject</th>"
                + "<th class='col-sm-1'>Sender</th>"
                + "<th class='col-sm-2'>Date</th>"
                + "</tr></thead><tbody id='present'></tbody></table>");
            genPresentTable(data, 0);
        }
        if (data.presence.length <= 0 && data.absence.length <= 0) {
            $('#absentTable').append("<h1>No activity today</h1>");
        }
    })
}
function genAbsentTable(data, i) {
    if (i < data.absence.length) {
        let ID = data.absence[i].studentID;
        let time = moment(data.absence[i].timestamp);
        if (chkEmergency(time)) {
            $("#absent").append("<tr class='danger'></tr>");
        } else $("#absent").append("<tr></tr>");
        $("#absent tr:last-child").append("<td>" + ID + "</td>");
        $.post('post/name', { userID: ID }).then((dt) => {
            let name = dt.nickname + " " + dt.firstname + " " + dt.lastname;
            $("#absent tr:last-child").append("<td>" + name + "</td>");
            if (data.absence[i].subject.slice(0, 3) === "FHB") {
                $("#absent tr:last-child").append("<td>" + data.absence[i].subject + "</td>");
                $("#absent tr:last-child").append("<td>" + data.absence[i].reason + "</td>");
                $("#absent tr:last-child").append("<td>" + data.absence[i].sender + "</td>");
                $("#absent tr:last-child").append("<td>" + time.format('DD/MM/YY H:mm') + "</td>");
                genAbsentTable(data, i + 1);
            } else {
                $.post('post/courseInfo', { courseID: data.absence[i].subject }).then((cr) => {
                    $("#absent tr:last-child").append("<td>" + cr.courseName + "</td>");
                    $("#absent tr:last-child").append("<td>" + data.absence[i].reason + "</td>");
                    $("#absent tr:last-child").append("<td>" + data.absence[i].sender + "</td>");
                    $("#absent tr:last-child").append("<td>" + time.format('DD/MM/YY H:mm') + "</td>");
                    genAbsentTable(data, i + 1);
                })
            }

        })
    }
}
function genPresentTable(data, i) {
    if (i < data.presence.length) {
        let ID = data.presence[i].studentID;
        let time = moment(data.presence[i].timestamp);
        let subject = data.presence[i].subjectToAdd.slice(0, 3) + ": " + data.presence[i].subjectToAdd.slice(3, 4);
        $("#present").append("<tr></tr>");
        $("#present tr:last-child").append("<td>" + ID + "</td>");
        $.post('post/name', { userID: ID }).then((dt) => {
            let name = dt.nickname + " " + dt.firstname + " " + dt.lastname;
            $("#present tr:last-child").append("<td>" + name + "</td>");
            $("#present tr:last-child").append("<td>" + subject + "</td>");
            $("#present tr:last-child").append("<td>" + data.presence[i].sender + "</td>");
            $("#present tr:last-child").append("<td>" + time.format('DD/MM/YY H:mm') + "</td>");
            genPresentTable(data, i + 1);
        })
    }
}
function chkEmergency(moment) {
    let pickDate = $('.datePicker').data('DateTimePicker').date();
    if (pickDate.day() === 2 || pickDate.day() === 4) {
        if (moment.year() <= pickDate.year()) {
            if (moment.month() <= pickDate.month()) {
                if (moment.date() < pickDate.date()) {
                    return false
                }
            }
        }
    } else if (pickDate.day() === 6) {
        if (moment.year() <= pickDate.year()) {
            if (moment.month() <= pickDate.month()) {
                if (moment.date() < pickDate.date()) {
                    return false
                }
            }
        }
    } else if (pickDate.day() === 0) {
        if (moment.year() <= pickDate.year()) {
            if (moment.month() <= pickDate.month()) {
                if (moment.date() < pickDate.date() - 1) {
                    return false
                }
            }
        }
    }
    return true
}