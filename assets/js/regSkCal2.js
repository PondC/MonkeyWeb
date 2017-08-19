$(document).ready(function () {
    genTable();
    updateTable();
    var cookie = getCookieDict();
    cookie.regisCourse = JSON.parse(cookie.regisCourse);
    cookie.regisHybrid = JSON.parse(cookie.regisHybrid);
    switch (parseInt(cookie.skillSel)) {
        case 1:
            $('#math,#eng').show();
            break;
        case 2:
            $('#math').show();
            $('#eng').hide();
            $('#skilltimeEng').val('0');
            break;
        case 3:
            $('#math').hide();
            $('#eng').show();
            $('#skilltime').val('0');
            break;
        case 4:
            $('#math,#eng').hide();
            $('#skilltimeEng').val('0');
            $('#skilltime').val('0');
            break;
        }
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
            if (cookie.regisCourse[i].day.getDay() === 6 && cookie.regisCourse[i].select === true) {
                var time = cookie.regisCourse[i].day.getHours();
                for (j = -1; j < 4; j++) {
                    var temp = (10 * time) + (j * 5);
                    if (!($("#skilltime").find("option[value=" + temp + "]").parent().is("span"))){
                    	$("#skilltime,#skilltimeEng").find("option[value=" + temp + "]").wrap("<span>");
                    }
                }
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
                    if (!($("#skilltime").find("option[value=" + temp + "]").parent().is("span"))){
                    	$("#skilltime,#skilltimeEng").find("option[value=" + temp + "]").wrap("<span>");
                    }
                }
            }
        }
    }
    $('#hb').html(hbPrint);
    $('#skillday').change(function () {
        var time = ['90', '95', '100', '105', '110', '130', '135', '140', '145', '150'];
        for (let i = 0; i < time.length; i++) {
            if ($("#skilltime").find("option[value=" + time[i] + "]").parent().is("span")) {
                $("#skilltime").find("option[value=" + time[i] + "]").unwrap();
            }
        }
        var cookie = getCookieDict();
        cookie.regisCourse = JSON.parse(cookie.regisCourse);
        cookie.regisHybrid = JSON.parse(cookie.regisHybrid);
        for (let i in cookie.regisCourse) {
            if (cookie.regisCourse[i] !== false) {
                cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day);
                if (cookie.regisCourse[i].day.getDay() === daytoNum($('#skillday').val()) && cookie.regisCourse[i].select === true) {
                    var time = cookie.regisCourse[i].day.getHours();
                    for (let j = -1; j < 4; j++) {
                        var temp = (10 * time) + (j * 5);
                        if (!($("#skilltime").find("option[value=" + temp + "]").parent().is("span"))){
                        	$("#skilltime").find("option[value=" + temp + "]").wrap("<span>");
                        }
                    }
                }
            }
        }
        for (let i in cookie.regisHybrid) {
            if (cookie.regisHybrid[i] !== false) {
                cookie.regisHybrid[i].day = new Date(cookie.regisHybrid[i].day);
                if (cookie.regisHybrid[i].day.getDay() === daytoNum($('#skillday').val())) {
                    var time = cookie.regisHybrid[i].day.getHours();
                    for (let j = -1; j < 4; j++) {
                        var temp = (10 * time) + (j * 5);
                        if (!($("#skilltime").find("option[value=" + temp + "]").parent().is("span"))){
                        	$("#skilltime").find("option[value=" + temp + "]").wrap("<span>");
                        }
                    }
                }
            }
        }
    });

    $('#skilldayEng').change(function () {
        var time = ['90', '95', '100', '105', '110', '130', '135', '140', '145', '150'];
        for (let i = 0; i < time.length; i++) {
            if ($("#skilltimeEng").find("option[value=" + time[i] + "]").parent().is("span")) {
                $("#skilltimeEng").find("option[value=" + time[i] + "]").unwrap();
            }
        }
        var cookie = getCookieDict();
        cookie.regisCourse = JSON.parse(cookie.regisCourse);
        cookie.regisHybrid = JSON.parse(cookie.regisHybrid);
        for (let i in cookie.regisCourse) {
            if (cookie.regisCourse[i] !== false) {
                cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day);
                if (cookie.regisCourse[i].day.getDay() === daytoNum($('#skilldayEng').val()) && cookie.regisCourse[i].select === true) {
                    var time = cookie.regisCourse[i].day.getHours();
                    for (let j = -1; j < 4; j++) {
                        var temp = (10 * time) + (j * 5);
                        if (!($("#skilltimeEng").find("option[value=" + temp + "]").parent().is("span"))){
                        	$("#skilltimeEng").find("option[value=" + temp + "]").wrap("<span>");
                        }
                    }
                }
            }
        }
        for (let i in cookie.regisHybrid) {
            if (cookie.regisHybrid[i] !== false) {
                cookie.regisHybrid[i].day = new Date(cookie.regisHybrid[i].day);
                if (cookie.regisHybrid[i].day.getDay() === daytoNum($('#skilldayEng').val())) {
                    var time = cookie.regisHybrid[i].day.getHours();
                    for (let j = -1; j < 4; j++) {
                        var temp = (10 * time) + (j * 5);
                        if (!($("#skilltimeEng").find("option[value=" + temp + "]").parent().is("span"))){
                        	$("#skilltimeEng").find("option[value=" + temp + "]").wrap("<span>");
                        }
                    }
                }
            }
        }
    });

    $("#station").change(function () {
    	genTable();
    	updateTable();
        if ($(this).val() === "2") {
            $('#skilltime').val('0');
            document.getElementById('skillday').disabled = true;
            document.getElementById('skillday').style = "visibility:hidden";
            document.getElementById('skilltime').disabled = true;
            document.getElementById('skilltime').style = "visibility:hidden";
            document.getElementById('skilltime').value = "0"

        }
        else {
            document.getElementById('skillday').disabled = false;
            document.getElementById('skillday').style = "";
            document.getElementById('skilltime').disabled = false;
            document.getElementById('skilltime').style = ""
        }
    });
    $("#stationEng").change(function () {
    	genTable();
    	updateTable();
        if ($(this).val() === "2") {
            $('#skilltime').val('0');
            document.getElementById('skilldayEng').disabled = true;
            document.getElementById('skilldayEng').style = "visibility:hidden";
            document.getElementById('skilltimeEng').disabled = true;
            document.getElementById('skilltimeEng').style = "visibility:hidden";
            document.getElementById('skilltimeEng').value = "0"

        }
        else {
            document.getElementById('skilldayEng').disabled = false;
            document.getElementById('skilldayEng').style = "";
            document.getElementById('skilltimeEng').disabled = false;
            document.getElementById('skilltimeEng').style = ""
        }
    });

    $('#skilltime,#skilltimeEng,#skillday,#skilldayEng').change(function () {
        genTable();
        updateTable();
    })
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
    if($('#station').val()=='1' && $('#skilltime').val()!='0'){
		var disTime = [8,10,13,15]
		for(i=0;i<disTime.length;i++){
			if(Math.floor(parseInt($('#skilltime').val())/10) == disTime[i] || Math.floor(parseInt($('#skilltime').val())/10)-1 == disTime[i]){
				var skillClass = document.getElementsByClassName('btn-' + $('#skillday').val() + ' ' + disTime[i] + '.1');
                for (let j = 0; j < skillClass.length; j++) {
                    if(skillClass[j].className.indexOf('sk')!=-1){
                		if(parseInt($('#skilltimeEng option:selected').val())<=parseInt($('#skilltime option:selected').val())){
                			var x = $('#skilltimeEng option:selected').text().split('-')[0]
                		}
                		else if($('skilltime').val()!='0'){
                            var x = $('#skilltime option:selected').text().split('-')[0]    
                        }
                        else{
                            var x = $('#skilltimeEng option:selected').text().split('-')[0]   
                        }
                		skillClass[j].innerHTM = '<strong>SKILL :</strong>' + '<br>' + x + ' น.';
                	}
                	else{
	                    skillClass[j].className = skillClass[j].className + ' sk';
	                    skillClass[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + $('#skilltime option:selected').text().split('-')[0]+' น.';
	                }
                }
			}
		}
    }
    if($('#stationEng').val()=='1' && $('#skilltimeEng').val()!='0'){
		var disTime = [8,10,13,15]
		for(i=0;i<disTime.length;i++){
			if(Math.floor(parseInt($('#skilltimeEng').val())/10) == disTime[i] || Math.floor(parseInt($('#skilltimeEng').val())/10)-1 == disTime[i]){
				var skillClassE = document.getElementsByClassName('btn-' + $('#skilldayEng').val() + ' ' + disTime[i] + '.1');
                for (let j = 0; j < skillClassE.length; j++) {
                	if(skillClassE[j].className.indexOf('sk')!=-1){
                		if(parseInt($('#skilltimeEng option:selected').val())<=parseInt($('#skilltime option:selected').val())){
                			var x = $('#skilltimeEng option:selected').text().split('-')[0]
                		}
                		else if($('skilltime').val()!='0'){
                			var x = $('#skilltime option:selected').text().split('-')[0]	
                		}
                        else{
                            var x = $('#skilltimeEng option:selected').text().split('-')[0]   
                        }
                		skillClassE[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + x + ' น.';
                	}
                	else{
	                    skillClassE[j].className = skillClassE[j].className + ' sk';
	                    skillClassE[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + $('#skilltimeEng option:selected').text().split('-')[0]+' น.';
	                }
	            }
			}
		}
    }
}

function back() {
    self.location = "registrationSkill"
}

function next() {
    if(document.readyState === "complete"){
        var cookie = getCookieDict()
        if(($('#skilltime').val()!='0'||$('#station').val()=='2'||cookie.skillSel=='3')&&($('#skilltimeEng').val()!='0'||$('#stationEng').val()=='2'||cookie.skillSel=='2')){
            var selectSkill = {}
            selectSkill['M'] = {
                station : $('#station').val(),
                day : $('#skillday').val(),
                time : $('#skilltime').val()
            }
            selectSkill['E'] = {
                station : $('#stationEng').val(),
                day : $('#skilldayEng').val(),
                time : $('#skilltimeEng').val()
            }
            writeCookie('regisSkill', JSON.stringify(selectSkill));
            self.location = "submit"
        }
        else if ((cookie.skillSel == '1' || cookie.skillSel == '2')&& $('#station').val()=='1' && $('#skilltime').val()=='0'){
            alert('กรุณาเลือกเวลาเรียนสกิลเลข')
        }
        else if ((cookie.skillSel == '1' || cookie.skillSel == '3')&& $('#stationEng').val()=='1' ){
            alert('กรุณาเลือกเวลาเรียนสกิลอังกฤษ')
        }
    }
    else{
        alert('การเชื่อมต่อมีปัญหา กรุณาลองใหม่อีกครั้ง หรือทำการรีเฟรช')
    }
}