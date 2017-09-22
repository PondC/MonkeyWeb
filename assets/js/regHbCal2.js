var cookie
const year = 2017
const quarter = 3

$(document).ready(function(){
	deleteCookie("Hybrid")
	cookie = getCookieDict()
	if(cookie.courseID){
		cookie.courseID = JSON.parse(cookie.courseID)
	}
	else{
		self.location = '/registrationCourse'
	}
	
	let allbtn = $('.sat,.sun,.thu,.tue').removeClass('disabled')
	$.post('post/allCourse',{quarter:quarter , year:year},(data)=>{
		for(let i in data.course){
			if(cookie.courseID.indexOf(data.course[i].courseID)>-1){
				fillTable(data.course[i])
			}
		}
	})
})

function btntoggle(btn){
    $(btn).blur();
    if ($(btn).hasClass('btn-success')) {
        $(btn).removeClass('btn-success').addClass('btn-default')
    }
    else{
        $('.'+($(btn).hasClass('sat')?'sat':$(btn).hasClass('sun')?'sun':$(btn).hasClass('thu')?'thu':$(btn).hasClass('tue')?'tue':'')+'[name="'+btn.name+'"]').removeClass('btn-success').addClass('btn-default')
        if(!$(btn).hasClass('disabled')){
            $(btn).removeClass('btn-default').addClass('btn-success')
        }
    }
    // $('#fee').html('Course fee : '+($('.sat.btn-success,.sun.btn-success').length*fee)+' บาท')
}

function fillTable(course){
	let time = new Date(course.day)
	let btn = $((time.getDay() == 6?'.sat':'.sun') +'[name="'+time.getHours()+'"]').addClass('course').addClass('disabled').html(course.courseName+'('+course.tutorNicknameEn[0]+')')
	$(btn[0]).removeClass('col-md-6').addClass('col-md-12')
	$(btn[1]).hide()
}

function next(){
	var all = ['tue','thu','sat','sun']
	var Hybrid = []
	var btn
	for(let i = 0 ; i < all.length ; i++){
		btn = $('.btn-success.'+all[i])
		for(let j = 0 ; j < btn.length ; j++){
			Hybrid.push(JSON.stringify({ studentID : cookie.monkeyWebUser , day : moment(0).day(daytoNum(all[i])).hour(parseInt(btn[j].name)).valueOf() , subject : $(btn[j]).hasClass('M')?'M':'PH'}))	
		}
	}
	writeCookie('Hybrid',JSON.stringify(Hybrid))
	self.location = '/registrationSkillTest'
}

function daytoNum(day) {
    switch (day) {
        case 'sun':
            return 0;
        case 'mon':
            return 1;
        case 'tue':
            return 2;
        case 'wed':
            return 3;
        case 'thu':
            return 4;
        case 'fri':
            return 5;
        case 'sat':
            return 6
    }
}