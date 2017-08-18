var config = '';
$(document).ready(function () {
    $.post("post/getConfig").then((cf) => {
        config = cf;
        log(config);
        showSlide();
    })
});
// function for show slide
function slideShow(type, mode, autoPlay) {
    let finish = function (n) {
        const gal = $('.galleria');
        for (let i = 1; i < n; i++)gal.append("<img src='" + config.studentSlideshowPath.slice(config.studentSlideshowPath.search("MonkeyWebData") + 14) + type + i + ".png'>");
        Galleria.loadTheme('galleria/themes/' + mode + '/galleria.' + mode + '.min.js');
        Galleria.run(gal, {
            extend: function () {
                this.setOptions('transition', 'fade');
                if (autoPlay) {
                    this.play(5000);
                }
            }
        });
    };
    let recur = function (i) {
        //noinspection ES6ModulesDependencies,JSUnusedLocalSymbols,JSUnresolvedFunction
        $.get(config.studentSlideshowPath.slice(config.studentSlideshowPath.search("MonkeyWebData") + 14) + type + i + ".png").done(function (result) {
            console.log("success" + i);
            recur(i + 1);
        }).fail(function () {
            console.log("end at " + i);
            finish(i);
        });
    };
    recur(1);
}
// function for adminHome
function uploadSlide() {
    $("#uploadModal").modal();
}
function showSlide() {
    $('body').dblclick(function () {
        writeCookie("slideType", "nclassic");
        location.reload();
    });
    let cookie = getCookieDict();
    if (cookie.slideType !== undefined) {
        let txt = cookie.slideType;
        let type = txt.slice(0, 1);
        let style = txt.slice(1);
        slideShow(type, style, true);
    } else {
        writeCookie("slideType", "nclassic");
        location.reload();
    }
}
function portrait() {
    writeCookie("slideType", "pclassic");
    location.reload();
}
function landscape() {
    writeCookie("slideType", "lclassic");
    location.reload();
}
function news() {
    writeCookie("slideType", "nclassic");
    location.reload();
}
function full() {
    writeCookie("slideType", "nfullscreen");
    location.reload();
}
function upNews() {
    //noinspection JSUnresolvedVariable
    let ufile = $('#file-1');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        if (files.length > 0) {
            let formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                formData.append('file[]', file, file.name);
            }
            $.ajax({
                url: 'post/updateStudentSlideshow',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    $('#uploadModal').modal('hide');
                }
            });
        }
    }
}