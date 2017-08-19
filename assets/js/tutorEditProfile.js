$(document).ready(function () {
    $('#emailForm').submit(function (event) {
        event.preventDefault();
        let cookie = getCookieDict();
        let tutorID = cookie.monkeyWebUser;
        if (confirm("Change Email to " + $('#tutorEmail').val())) {
            $.post('post/editTutor', { tutorID: tutorID, email: $('#tutorEmail').val() }).then((data) => {
                location.reload();
            });
        }
    });
    $('#pwdForm').submit(function (event) {
        event.preventDefault();
        let cookie = getCookieDict();
        let tutorID = cookie.monkeyWebUser;
        if (confirm("Change Email to " + $('#tutorPwd').val())) {
            $.post('post/editTutor', { tutorID: tutorID, password: $('#tutorPwd').val() }).then((data) => {
                location.reload();
            });
        }
    });
});