$(function () {
    // 卡片可移動
    // $("#orderBtn").on('click', function () {
    //     vt.success("您可以透過移動分類裡面的圖片進行排序", {
    //         title: "提醒",
    //         position: "top-center",
    //         duration: 3000,
    //     })

    //     $(".categoryGroups>div").addClass('xyrotate');
    //     $(".categoryGroups").sortable();
    //     $(".categoryGroups").disableSelection();
    //     $("#orderBtn").text('完成').removeClass('btn-info').addClass("btn-warning").attr("id", "finishBtn")

    // })
    // $("#finishBtn").on('click', function () {
    //     $(".categoryGroups>div").removeClass('xyrotate');
    //     $("#finishBtn").text('排序').removeClass('btn-warning').addClass("btn-info").attr("id", "orderBtn")
    // })
    //排序
    $("#orderBtn").on('click', function () {
        vt.success("您可以移動圖片進行排序", {
            title: "提醒",
            position: "top-center",
            duration: 3000,
        })

        $(".categoryGroups>div").addClass('xyrotate');
        $(".categoryGroups").sortable({
            disabled: false,
            connectWith: ".categoryGroups"
          }).disableSelection();
        $("#finishBtn").removeClass("d-none");
        $("#orderBtn").addClass("d-none");

    })
    //排序完成
    $("#finishBtn").on('click', function () {
        $(".categoryGroups>div").removeClass('xyrotate');
        $("#finishBtn").addClass('d-none');
        $("#orderBtn").removeClass("d-none");
        $( ".categoryGroups" ).sortable({
            disabled: true
          });
    })



    // 新增分類 打開對話框
    $('#addBtn').on('click', function () {
        $('.module_all').css('display', 'flex');
    })
    //新增分類
    $('#addNew').on('click', function () {
        var x = $('#addNew').detach();
        var newInput = $("<input id='categoryName' class=' float-left' type='text' placeholder='新的分類'>");
        var newBtn = $('<button type="button" id="cxlBtn" class="float-right btn btn-light btn-sm"">取消</button><button type="button" id="newBtn" class="float-right btn btn-light btn-sm mx-2">新增</button>')
        $('.plus_pic').after(newBtn).after(newInput);
        $('#newBtn').on('click', function () {
            if (!$('#categoryName').val()) {
                $('#categoryName').val('請輸入文字').css('color', 'red')
            } else {
                var newDiv = $(`<div style="clear:both"></div>`)
                var txt1 = $('<span class="float-left categoryItem"></span>').text($('#categoryName').val());
                var txt2 = '<span class="float-right "><button type="button" class="edit btn btn-sm btn-outline-info">編輯</button></span>'
                $('.textSpan').after(txt2);
                newDiv.append(txt1, txt2);
                $('.module_body').append(newDiv);
                $('.plus_pic').after(x);
                newInput.remove();
                newBtn.remove();
            }

        })
        $('#cxlBtn').on('click', function () {
            $('.module_body>div:first-of-type :not(img)').remove();
            $('.module_body>div:first-of-type').append(x);

        })
    })
    $('.edit').each(function (ind, elm) {
        $(elm).on('click', function clickBind() {
            // 點擊編輯按鈕 原先的文字變成輸入框 先刪除原有元素 加上輸入框 再把他附加回去?
            var click_div = $(`.module_body>div:nth-of-type(${ind + 2})`);
            var confirmBtn = $(`<span class="float-right confirm"><button type="button" class=" btn btn-sm btn-outline-info">確認</button></span>`);
            var editBtn = click_div.find('.edit').detach();
            var deleteBtn = click_div.find('.delete').detach()
            var editValue = click_div.find('.categoryItem').text();
            // 新增輸入框加上原有內容
            var editInput = $(`<input type="text" id="editInput" value="${editValue}">`);
            //把輸入框加上去
            click_div.append(editInput);
            //確認按鈕
            click_div.append(confirmBtn);
            //刪除原來文字
            click_div.find('.categoryItem').remove();
            // 點下確認後
            confirmBtn.on('click', function () {
                confirmBtn.remove();
                click_div.append(`<span class="float-left categoryItem">${editInput.val()}</span>`);
                click_div.append(deleteBtn, editBtn)
                click_div.find('input').remove();

            })

        })

    })
    // 點選對話框確認按鈕後  去更改網頁的標題
    $('.module_cfm').on('click', function () {
        //編輯後沒有按下確認
        if ($('.edit').length != $('.module_body>div').length - 1) {
            $('#remind').text('請確認修改內容').css({
                "color": "red",
                "text-align": "center"
            })
        } else {
            for (i = 0; i < $('.myCategory').length; i++) {
                var x = $('.module_body>div>.categoryItem').eq(i).text();
                $('.myCategory').eq(i).find('b').text(x);
            }
            // 有新增選項
            for (i = $('.myCategory').length; i < $('.categoryItem').length; i++) {
                var y = $('.module_body>div>.categoryItem').eq(i).text();
                var newCategory = `<div class="d-flex flex-wrap my-3"><h5 class="col-md-12 myCategory"><b>${y}</b></h5></div>`
                $('#home').append(newCategory);
            }
            $('.module_all').css('display', 'none');
        }
    })
    // 取消 關閉對話框
    $('.module_cxl').on('click', function () {
        $('.module_all').css('display', 'none');
    })

})