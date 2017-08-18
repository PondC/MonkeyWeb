$(document).ready(function () {
    let cookie = getCookieDict();
    if (cookie.name !== undefined && cookie.nameE !== undefined) {
        cookie.name = JSON.parse(cookie.name);
        cookie.nameE = JSON.parse(cookie.nameE);
        cookie.tel = JSON.parse(cookie.tel);
        $('#nname').val(decodeURIComponent(cookie.name.nname));
        $('#name').val(decodeURIComponent(cookie.name.name));
        $('#sname').val(decodeURIComponent(cookie.name.sname));
        $('#nnameE').val(cookie.nameE.nname);
        $('#nameE').val(cookie.nameE.name);
        $('#snameE').val(cookie.nameE.sname);
        $('#grade').val(cookie.grade);
        $('#email').val(cookie.email);
        $('#parentNum').val(cookie.tel.parent);
        $('#studentNum').val(cookie.tel.student)
    }
});
const thai = /^[ภถุึคตจขชๆไำพะัีรนยบลฃฟหกดเ้่าสวงผปแอิืทมใฝๅูฎฑธํ๊ณฯญฐฤฆฏโฌ็๋ษศซฅฉฮ์ฒฬฦฺ]+$/;
const english = /^[a-zA-Z-]+$/;
let isNotThai = function (str) {
    return !thai.test(str)
};
let isNotEnglish = function (str) {
    return !english.test(str)
};
let isNotAllNumber = function (str) {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) < 48 || str.charCodeAt(i) > 57) {
            log(str.charCodeAt(i));
            return true;
        }
    }
    return false;
};
function next() {
    let nname = $('#nname').val();
    let name = $('#name').val();
    let sname = $('#sname').val();
    let nnameE = $('#nnameE').val().trim();
    let nameE = $('#nameE').val().trim();
    let snameE = $('#snameE').val().trim();
    let email = $('#email').val();
    let parentNum = $('#parentNum').val();
    let studentNum = $('#studentNum').val();
    if(isNotThai(nname)||isNotThai(name)||isNotThai(sname)){
        alert('กรุณากรอกชื่อภาษาไทยให้ถูกต้อง เช่น ณัฐพงษ์ โดยไม่มี spacebar หรืออักขระพิเศษ')
    } else if (isNotEnglish(nnameE) || isNotEnglish(nameE) || isNotEnglish(snameE)) {
        alert('กรุณากรอกชื่อภาษาอังกฤษให้ถูกต้อง เช่น Nuttapong โดยไม่มี spacebar หรืออักขระพิเศษ');
    } else if (email.indexOf('@') < 0) {
        alert("กรุณากรอก E-Mail ให้ถูกต้อง");
    } else {
        let grade = $('#grade').val();
        if (parentNum.length !== 10 || studentNum.length !== 10 || isNotAllNumber(parentNum) || isNotAllNumber(studentNum)) {
                alert("เบอร์โทรศัพท์ต้องมี 10 ตัวและประกอบด้วยตัวเลข 0-9 เท่านั้น")
            } else if (name !== '' && nname !== '' && sname !== '' && grade !== '0' && nameE !== '' && nnameE !== '' && snameE !== '' && email !== '' && parentNum !== '' && studentNum !== '') {
                writeCookie('name', JSON.stringify({
                    nname: encodeURIComponent(nname),
                    name: encodeURIComponent(name),
                    sname: encodeURIComponent(sname)
                }));
                writeCookie('nameE', JSON.stringify({
                    nname: nnameE,
                    name: nameE,
                    sname: snameE
                }));
                writeCookie('email', email);
                writeCookie('grade', grade);
                writeCookie('tel', JSON.stringify({parent: parentNum, student: studentNum}));
                self.location = "registrationCourse"
            } else {
                alert("กรุณาเลือกชั้นเรียน")
            }
    }
}