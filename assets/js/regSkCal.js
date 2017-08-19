$(document).ready(function () {
    genTable();
    updateTable();
    var cookie = getCookieDict();
    $('#skillSel').change(function(){
    	console.log($('#skillSel').val())
    })
    if(cookie.regisSkill != undefined){
    	deleteCookie('regisSkill')
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
        temp[i].innerHTML = '&nbsp;'+'<br>'+'&nbsp;';
    }
}

function updateTable() {
    var cookie = getCookieDict();
    cookie.regisCourse = JSON.parse(cookie.regisCourse);
    cookie.regisHybrid = JSON.parse(cookie.regisHybrid);
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
}

function back() {
    self.location = "registrationHybrid"
}

function nextbtn() {
	console.log($('#skillSel').val())
    switch($('#skillSel').val()){
    	case '0':
    		alert('กรุณาเลือกวิชาที่ต้องการเรียนในระบบสกิล')
    		break
		case '4':
			writeCookie('skillSel',$('#skillSel').val())
			self.location = 'submit'
			break
    	default:
    		writeCookie('skillSel',$('#skillSel').val())
    		self.location = 'registrationSkill2'
    }
}
	