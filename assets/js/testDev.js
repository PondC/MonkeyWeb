$(document).ready(function(){
    refresh();
    $.post("post/getConfig",function(data){
        for(var prop in data){
            if(data.hasOwnProperty(prop)){
                if(Array.isArray(data[prop])){
                    $("[action=\"post/editConfig\"] [name=\""+prop+"\"]").each(function(i){
                        $(this).val(data[prop][i]);
                    });
                }
                else $("[action=\"post/editConfig\"] [name=\""+prop+"\"]").val(data[prop]);
            }
        }
    });
    // $("[action=\"editStudent\"] [type=\"reset\"]").click(function(){
    //     event.preventDefault();
    //     $.post($(this).attr("action"),$(this).find("[name]"),function(data,status){
    //         $("#message").empty();
    //         if(data.err){
    //             $("#message").append("<div id=\"danger\"></div>");
    //             $("#danger").addClass("alert alert-danger").append("Error : "+data.err);
    //         }
    //         else{
    //             $("#message").append("<div id=\"success\"></div>");
    //             $("#success").addClass("alert alert-success");
    //             if($.isEmptyObject(data))$("#success").append("Successful");
    //             else $("#success").html(JSON.stringify(data));
    //         }
    //         refresh();
    //     });
    // })
    $("[type=submit]").click(function(event){
        var button=$(this);
        var form=button.closest("form");
        if(button.attr("name")){
            if(form.find("temp").length==0)form.append("<temp></temp>");
            form.find("temp").html('<input name="'+button.attr("name")+'" val="'+button.val()+'" type="hidden">');
        }
    });
    $("form").submit(function(event){
        event.preventDefault();
        var form=$(this);
        if(form.attr("enctype")=="multipart/form-data"){
            return true;
        }
        var input={};
        var getValue=function(x){
            if($(x).attr("type")=="checkbox"){
                if($(x).prop("checked")){
                    if($(x).hasClass("input-int"))return parseInt($(x).val());
                    return $(x).val();
                }
            }
            if($(x).attr("type")=="password")return CryptoJS.SHA3($(x).val()).toString();
            else if($(x).hasClass("input-day")){
                if(input[$(x).attr("name")]==undefined)input[$(x).attr("name")]=moment(0).valueOf();
                return moment(input[$(x).attr("name")]).day(moment(parseInt($(x).val())).day()).valueOf();
            }
            else if($(x).hasClass("input-time")){
                if(input[$(x).attr("name")]==undefined)input[$(x).attr("name")]=moment(0).valueOf();
                return moment(input[$(x).attr("name")]).hour(moment(parseInt($(x).val())).hour()).minute(moment(parseInt($(x).val())).minute()).valueOf();
            }
            else if($(x).attr("type")=="number"||$(x).hasClass("input-int"))return parseInt($(x).val());
            return $(x).val();
        };
        form.find("[name]").filter(function(){return $(this).val()!=""&&$(this).val()!=null;}).each(function(){
            if($(this).attr("type")=="checkbox"&&!$(this).prop("checked"))return;
            if($(this).hasClass("input-array")){
                if(input[$(this).attr("name")]==undefined)input[$(this).attr("name")]=[];
                input[$(this).attr("name")].push(getValue(this));
            }
            else input[$(this).attr("name")]=getValue(this);
        });
        form.find("temp").remove();
        console.log("===>",form.attr("action"));
        console.log(input);
        $.post(form.attr("action"),input,function(data,status){
            console.log(data);
            $("#message").empty();
            if(data.err){
                $("#message").append("<div id=\"danger\"></div>");
                $("#danger").addClass("alert alert-danger").append("Error : "+data.err);
            }
            else{
                $("#message").append("<div id=\"success\"></div>");
                $("#success").addClass("alert alert-success");
                if($.isEmptyObject(data))$("#success").append("Successful");
                else $("#success").html(JSON.stringify(data,null,2));
            }
            refresh();
        });
    });
    $(".addTut").click(function(event){
        event.preventDefault();
        // $(this).before('<div class="col-sm-11"><select class="form-control input-array" name="tutor" type="number" required><option disabled="" selected="">Select Tutor</option><option value="99001">Tutor#99001</option><option value="99002">Tutor#99002</option></select></div>');
        $(this).before('<div class="col-sm-11"><input class="form-control input-array" type="number" name="tutor" placeholder="tutor" required></div>');
        $(this).before('<button class="btn btn-default col-sm-1 removeField">-</button>');
    });
    $(".addCr").click(function(event){
        event.preventDefault();
        $(this).before('<div class="col-sm-11"><input class="form-control input-array col-sm-11" name="courseID" type="text" placeHolder="courseID" required></div>');
        $(this).before('<button class="btn btn-default col-sm-1 removeField">-</button>');
    });
    $("form").on("click",".removeField",function(event){
        event.preventDefault();
        $(this).prev().remove();
        $(this).remove();
    });
});
var refresh=function(){
    $("#listUser").empty();
    $.post("debug/listUser",function(data,status){
        for(var i=0;i<data.length;i++){
            $("#listUser").append(JSON.stringify(data[i],null,2)+"<br><br>");
        }
    });
    $("#listCourse").empty();
    $.post("debug/listCourse",function(data,status){
        for(var i=0;i<data.length;i++){
            $("#listCourse").append(JSON.stringify(data[i],null,2)+"<br>");
            $("#listCourse").append(new Date(data[i].day).toString()+"<br><br>");
        }
    });
    $("#listFullHybrid").empty();
    $.post("debug/listFullHybrid",function(data,status){
        for(var i=0;i<data.length;i++){
            $("#listFullHybrid").append(JSON.stringify(data[i],null,2)+"<br>");
            $("#listFullHybrid").append(new Date(data[i].day).toString()+"<br><br>");
        }
    });
    $("#listCourseSuggestion").empty();
    $.post("debug/listCourseSuggestion",function(data,status){
        for(var i=0;i<data.length;i++){
            $("#listCourseSuggestion").append(JSON.stringify(data[i],null,2)+"<br>");
        }
    });
};
