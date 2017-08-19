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
        if (!$('i').hasClass('fa')) {
            $('.upload').prepend('<i class="fa fa-circle-o-notch fa-spin"></i>');
            formData.append('file', files[0], files[0].name);
            formData.append('studentID', ID);
            //noinspection JSUnusedLocalSymbols
            $.ajax({
                url: 'post/submitReceipt',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    $('.fa').remove();
                    showReceipt(ID);
                }
            });
        }
    }
}
function showReceipt(id) {
    //noinspection ES6ModulesDependencies
    $.post("post/getConfig").then((config) => {
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + id + '.jpg', function (data, status) {
            if (status === 'success') {
                $('#preview').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + id + '.jpg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + id + '.jpeg', function (data, status) {
            if (status === 'success') {
                $('#preview').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + id + '.jpeg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + id + '.png', function (data, status) {
            if (status === 'success') {
                $('#preview').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + id + '.png');
            }
        });
    });
}
function next() {
    self.location = '/studentProfile';
}

//noinspection ES6ModulesDependencies,JSUnresolvedFunction
const studentProf = (studentID) => $.post("post/studentProfile", {
    studentID: studentID
});

$(document).ready(function () {
    let cookie = getCookieDict();
    //noinspection JSUnresolvedVariable
    studentProf(parseInt(cookie.monkeyWebUser)).then((data) => {
        let fee = ' ' + (data.courseID.length * 7800);
        $('#fee1').html('<strong>' + 'ค่า Course(CR) :' + fee.slice(0, fee.length - 3) + ',' + fee.slice(fee.length - 3, fee.length) + ' บาท' + '</strong>');
        $('#fee2').html('<strong>' + 'ค่า Course(CR) :<br>' + fee.slice(0, fee.length - 3) + ',' + fee.slice(fee.length - 3, fee.length) + ' บาท' + '</strong>');
    })
});