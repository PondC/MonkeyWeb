$(document).ready(function(){
    $("[data-toggle=tooltip]").tooltip();
    $(".popup").click(function(){
        var courseID=$(this).data("course-id");
        var numberOfSub=$(this).data("number-of-sub");
        var status=$(this).data("status");
        var outerModal=$("#judgeModal");
        var modal=outerModal.find(".modal-content");
        var form=modal.find("form");

        var courseName=$(this).data("course-name");
        form.data("course-name",courseName);
        form.data("tutor-email",$(this).data("tutor-email"));
        form.data("tutor-nickname-en",$(this).data("tutor-nickname-en"));

        modal.attr("class","modal-content");
        modal.find(".no,.accepted,.rejected,.pending").addClass("hidden");
        if(status=="no")modal.addClass("grey");
        else if(status=="accepted")modal.addClass("lightgreen");
        else if(status=="rejected")modal.addClass("red");
        else if(status=="pending")modal.addClass("blue");
        modal.find("."+status).removeClass("hidden");

        modal.find(".courseName").text(" "+courseName+"#"+numberOfSub+" ");
        $("#confirmModal .courseName").text(" "+courseName+"#"+numberOfSub);
        modal.find("#localLink").val(modal.find("#localLink").data("link")+courseID+"/"+numberOfSub+"/");
        form.find("[name=courseID]").val(courseID);
        form.find("[name=numberOfSub]").val(numberOfSub);

        outerModal.modal();
    });
    $("#judgeModal [type=submit]").click(function(event){
        event.preventDefault();
        var action=$(this).val();
        $("#confirmModal .action").text(" "+action);
        $("#confirmButton").val(action);
        $("#judgeModal").modal("hide");
        $("#confirmModal").modal({backdrop:"static"});
    });
    $("#confirmButton").click(function(event){
        event.preventDefault();
        var form=$("#judgeModal form");
        var courseID=form.find("[name=courseID]").val();
        var numberOfSub=form.find("[name=numberOfSub]").val();
        var action=$(this).val();
        var tutorEmail=form.data("tutor-email");
        var tutorNicknameEn=form.data("tutor-nickname-en");
        var courseName=form.data("course-name");

        $("#confirmModal").modal("hide");
        $("#loadingModal").modal({backdrop:"static"});

        $.post(form.attr("action"),{
            courseID:courseID,
            numberOfSub:numberOfSub,
            action:action
        },function(data){
            if(data.err){
                console.log(data);
                alert("Some errors occur.\nPlease contact developer.");
            }
            else{
                if(action=="accept"||action=="reject"){
                    location.assign("mailto:"+tutorEmail+"?subject=TO%20"+tutorNicknameEn+"%20"+courseName+"#"+numberOfSub+"%20"+action.toUpperCase()+"ED");
                }
            }
            location.reload();
        });
    });
    $("#cancelButton").click(function(event){
        $("#confirmModal").modal("hide");
        $("#judgeModal").modal("show");
    });
    $("#copyLink").click(function(event){
        $("#localLink").select();
        document.execCommand("copy");
    });
    $(".course-link").click(function(){
        writeCookie("monkeyWebAdminAllcourseSelectedCourseID",$(this).data("course-id"));
        location.assign("/adminCoursedescription");
    });
});
