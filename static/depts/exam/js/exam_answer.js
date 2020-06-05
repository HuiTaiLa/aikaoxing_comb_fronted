
user = JSON.parse(window.localStorage.getItem("USER"));
var companyId = user.companyId; //公司id
var exam_info_id = window.location.href.split("#/")[1]; //考试ID


$.ajaxSetup({
  contentType:"application/x-www-form-urlencoded;charset=utf-8",
  headers:{
    Authentication:JSON.parse(window.localStorage.getItem("USER_TOKEN"))
  },
  statusCode: {
    404: function() {
      window.location.href="/admin/error/exam_404";
    },
    504: function() {
      window.location.href="/admin/error/exam_default";
    },
    500: function() {
      window.location.href="/admin/error/exam_default";
    },
    429:function () {
      alert("您操作过于频繁！");
    },
    401:function () {
      window.location.href="/admin/error/401";
    },
    400:function () {
      window.location.href="/admin/error/exam_400";
    },
    403:function () {
      window.location.href="/admin/error/exam_403";
    },
  }
});

var exam_results_id = $('input[name=examResultId]').val()
var set_full_screen = $('input[name=setFullScreen]').val()
var blur_count = $('input[name=blurCount]').val()
var switchScreenSecond = $('input[name=switchScreenSecond]').val()
var exitSwicthStatus = $('input[name=exitSwitchStatus]').val()
var answer_time_left = parseInt($('input[name=answerTimeLeft]').val())
var cuttingScreenCount = $('input[name=cuttingScreenCount]').val()
var examTimeRestrict = $('input[name=examTimeRestrict]').val();
var setMinExamTime = $('input[name=setMinExamTime]').val()
var minExamTime = $('input[name=minExamTime]').val()
var totalExamTime = $('input[name=examTimes]').val()
var quietSecond = $('input[name=restTime]').val()
var setQuietCheat = Number(quietSecond) > 0 ? '1' : '0'


// var exam_results_id = "31718083"; //考试关联ID

  //考试计时
  var timeDownInterval;
  //考试剩余总时长
  // var answer_time_left = parseInt(3600);//second
  //全屏防作弊参数
  // var set_full_screen = "1";
  // var exitSwicthStatus="doing"; //new-第一次考试  doing-非第一次考试，会从下列请求获取到该参数，给变量赋值后，再将其作为参数放到请求里。后端需要该参数对第一次进考试时的情况进行处理\
  // var switchScreenSecond="0"; //允许切屏时间
  //切换次数
  // var blur_count="0";
  // var cuttingScreenCount=""; //已切屏次数
  //学员id
  var examUserId = user.userId;
  //无操作防作弊静止时间
  // var quietSecond = "0";
  //设置无操作防作弊
  // var setQuietCheat = "0";
  //拍照防作弊参数
  var capture="0";
  //答题时长（是否不限时长
  // var examTimeRestrict = '1';//
  //是否显示水印 0--不显示；1--显示
  var isWatermark = '0';
  //最短答题时长
  // var setMinExamTime= '0';
  // var minExamTime= '0';
  // var totalExamTime='60';
  var drawingBoardOpen = '0'//手写板高级设置
  var device = '0' //考试设备限制，0-电脑或手机，1-仅电脑，2-仅手机


var question_Id,beforeImgSrc;

// 让IE支持es6语法，可兼容到IE8
if (!!window.ActiveXObject || "ActiveXObject" in window || window.navigator.userAgent.indexOf("MSIE")>=1) {
  $("body").append('<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>');
}

$(function () {
  var getExamEndTimeInterval; //获取考试时间的定时器，在交卷后需要清除该定时器

  // 解析latex公式
  // renderFormula(".latex", false);

  // 是否强制交卷
  var isForce;
  //答题进度
  function commitProcess(id, status) {
    //id: 试题id，status：true答题，false取消
    var commitLength, totalLength;
    if(status){
      $("#numberCardModal a .questions_"+id).parent(".box").removeClass("s1").addClass("s2");
      $(".question-content[data-id="+id+"]").attr("data-commit", "true");
    }else {
      $("#numberCardModal a .questions_"+id).parent(".box").removeClass("s2").addClass("s1");
      $(".question-content[data-id="+id+"]").attr("data-commit", "false");
    }
    commitLength = $("#numberCardModal .modal-body .box.s2").length;
    totalLength = $("#numberCardModal .modal-body .box.question_cbox").length;

    $("#commitCount").text(commitLength);
    $("#totalCount").text(totalLength);
    $("#commitProcess").css({
      width: commitLength*100/totalLength + 'px'
    });
  }

  //显示水印
  if(typeof isWatermark != 'undefined' && isWatermark == '1'){
    $.ajax({
      type: "GET",
      cache: false,
      headers: {"cache-control": "no-cache"},
      dataType: "json",
      url: "/course/get_watermark",
      success: function (msg) {
        if(msg.success){
          $(".questions-content").css({
            'background-image': 'url('+msg.bizContent+')'
          });
        }
      }
    });
  }
  //计时

  // 交卷时间
  var d = new Date();
  var initTime = parseInt(d.getTime()/1000);
  //考试结束时间点
  var endTime = initTime + answer_time_left;

  //  考试时间倒计时
  // 非"不限时长"类的考试，获取倒计时

  if(examTimeRestrict != 0){
      timeDownInterval = setInterval(timeDown, 1000);
  }

  //倒计时
  function timeDown(){

    var t = new Date();
    var nowTime = parseInt(t.getTime()/1000);
    var leftTime = endTime - nowTime;

    if(leftTime<=0){
      $("#timeDown").removeClass("warning");
      $("#timeDown").text("即将交卷");
      //填空问答强制失焦保存
      $(".keyCloze").blur();
      $(".keyFill").blur();
      alert("考试时间到！");
      saveExamFn(0);//考试时间到
    }

    answer_time_left = answer_time_left - 1;

    // if(answer_time_left==10){
    //     $("#timeDown").addClass("warning");
    // }

    $("#timeDown").text(formatTime(leftTime));
  }


  //心跳链接
  // 每30秒请求一次考试时间
  // 非"不限时长"类的考试，获取倒计时  1限时长
  if(examTimeRestrict != 0){
    getExamEndTimeInterval = setInterval(() => void (0), 30000);
  }

  // 心跳链接，请求考试时间
  function heartAjax() {
    //不显示loading
    $("#spinnerLoading").addClass("hide");

    $.ajax( {
      type:"post",
      url:"/api/exam/getExamEndTime",
      dataType:"json",
      data: "account="+user.account+"&companyId="+companyId+"&examId="+exam_info_id+"&examResultId="+exam_results_id,
      success:function(msg){
        //不显示loading
        // $("#spinnerLoading").removeClass("hide");

        if(msg.success){
          //code:0 未设置，不操作
          //code:1 重新设置时间
          //code:2 立即交卷
          //code:3 批量交卷
          if(msg.bizContent.code=='3'){
            $('.submit-notice').show();
            var endNum = 3;
            var submitExam = setInterval(function(){
              endNum--;
              if(endNum < 0){
                clearInterval(submitExam);
                $('.submit-notice').hide();
                saveExamFn(6);//立即交卷->批量交卷3秒延迟

              }
              $('.notice-time').text(endNum)

            },1000);
          }

          if(msg.bizContent.code=='1'){

            if(answer_time_left !=msg.bizContent.totalTime){
              d = new Date();
              initTime = parseInt(d.getTime()/1000);
              answer_time_left = msg.bizContent.totalTime;
              endTime = initTime + answer_time_left;

              $("#timeResetModal .delay-time").text(msg.bizContent.delayTimeStamp);
              $('#timeResetModal').modal();
            }


          }else if(msg.bizContent.code=='2'){
            saveExamFn(0);//立即交卷
          }

        }else{
          // console.log(msg.desc);
        }
      },
      error: function (msg) {
        //不显示loading
        $("#spinnerLoading").removeClass("hide");
      }

    });
  }

  // 格式化时间
  function formatTime(time) {
    var day = Math.floor(time/86400);
    var day_left=time-86400*day;
    var hour = Math.floor(day_left/3600);
    var hour_left=day_left-3600*hour;
    var minutes= Math.floor(hour_left/60);
    var seconds= hour_left-60*minutes;
    var time_show=(day==0?'':(day+'天:'))+(hour<10?'0'+hour:hour)+':'+(minutes<10?'0'+minutes:minutes)+
      ':'+(seconds<10?'0'+seconds:seconds);

    return time_show;
  }

  //**************************************答案存储**************************************
  var answered_num = 1; //已答未保存考题数量
  var answered_multi_all = []; //所以试题延时提交数据
  var answered_all = [];





    //初始化答题进度
    commitProcess();
    //处理aliyun附件url问题，进行uri编码
    $(".question-content .answers .filled .file-row a").each(function (index, element) {
      var url = aliyunEncodeURI($(this).attr("href"));
      $(this).attr("href", url).attr("download", url).attr("target", "_blank");
    });
      //生成每个编辑器,blur存储
      $('.keyCloze').each(function () {
        var keyCloze = this;
        var editor = new wangEditor(keyCloze);
        var _parent = $(keyCloze).parents('.question-content');
        var questionsId = _parent.attr('data-id');
        editor.config.uploadHeaders = {
          'Authentication' : JSON.parse(window.localStorage.getItem("USER_TOKEN"))
        };
        editor.config.uploadImgUrl = '/api/question/upload_img/?account='+user.account+'&companyId='+user.companyId;
        editor.config.uploadImgFileName = 'upfile';
        editor.config.noPaste = true;
        editor.config.menus = [
          'table',
          '|',
          'img',
          // 'upload',
          '|',
          'fullscreen'
        ];
        editor.create();
        editor.$txt.blur(function () {
          var txt = $.trim(editor.$txt.html());
          // console.log(editor.$txt.text());
          var $container = $(this).parent(".wangEditor-container");
          if (txt != '<p><br></p>') {
            var keyList = editor.$txt.html();
            $(keyCloze).parents('.wangEditor-container').next().val(keyList);
            saveQuestionsCatch(questionsId, keyList, false, true,0, editor.$txt.text());
          }

          $container.find(".save-answer").hide();
        });
        editor.$txt.focus(function () {
          var $container = $(this).parent(".wangEditor-container");

          $container.find(".save-answer").show();
        });
      });

    $('.wangEditor-menu-container').append('<div class="menu-group save-answer clearfix">保存</div>');
    $('.offImgs').html('');



  if (drawingBoardOpen == '1') {
    $('.wangEditor-menu-container').append('<div onclick="paintingFn(event)" class="menu-group painting-group clearfix">' +
      '<div class="clearfix paintingBtn">' +
      '<a href="#" tabindex="-1">' +
      '<i class="icon-m_handwriting_brush_tool"></i> 手写板' +
      '</a>' +
      '<a href="#" tabindex="-1" class="selected" style="display: none;">' +
      '<i class="icon-m_handwriting_brush_tool"></i>' +
      '</a>' +
      '<div class="menu-tip"> 手写板</div>' +
      '</div>' +
      '</div>');
  }



  var canvas = $('.canvas')[0]; // 用于涂鸦
  if (canvas != undefined) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除涂鸦画布内容
  }
  $('.changeType').removeClass('active');

  var isUploading = 0; // 1为附件正在上传中；0为附件已经上传完成（附件上传完成后，才可以交卷）
  //问答题上传附件
  $(".question-content .wang-upload-file").change(function () {
    isUploading = 1;
    var _this = $(this);

    if($(_this).value == ''){
      return false;
    }

    var question_index=$(_this).parents(".question-content").find(".question-index").text().replace('.',"");
    var question_id = $(_this).parents(".question-content").attr("data-id");
    var uploadUrl = '/exam/attachment_operate/?method=upload&platform=pc&uploadType=uploadFile';
    var formHtml = '<form id="fileupForm" class="hidden" action="'+uploadUrl+'" method="post" enctype="multipart/form-data" target="fileupIframe"></form>';
    var iframeHtml = '<iframe name="fileupIframe" id="fileupIframe" class="append"></iframe>';
    var inputHmtl = '<input type="text" class="append" name="questionId" value="'+question_id+'">'+
      '<input type="text" class="append" name="examInfoId" value="'+exam_info_id+'">'+
      '<input type="text" class="append" name="questionIndex" value="'+question_index+'">'+
      '<input type="text" class="append" name="userId" value="'+examUserId+'">'+
      '<input type="text" class="append" name="examResultId" value="'+exam_results_id+'">';

    $(_this).wrap(formHtml);
    $('#fileupForm').append(iframeHtml+inputHmtl);
    $('#fileupForm').submit();


    //上传回调
    $("#fileupIframe").load(function () {
      var msg = $(this).contents().find('body').text();
      var _parent = $(this).parents(".question-content");
      var questionId = $(_parent).attr("data-id");
      isUploading = 0;
      if(msg!=''){
        $('#fileupForm')[0].reset();
        $('#fileupForm .append').remove();
        $('#fileupForm .wang-upload-file').unwrap();

        msg = JSON.parse(msg);
        if (msg.success) {
          var file_row = '<div class="file-row">'+
            '<a class="file ellipsis" target="_blank" href="'+aliyunEncodeURI(msg.bizContent.audioUrl)+'">'+msg.bizContent.filename+'</a>'+
            '<i class="icon icon-m_exam_error2 icon-file-delete"></i>'+
            '</div>';
          $(_parent).find('.file-list').append(file_row);
          commitProcess(questionId, true);
          showSuccessTip("附件上传成功");
        } else if(msg.code == 33000) {
          showErrorTip("文件大小超限");
        } else {
          showErrorTip('上传失败，请重试');
        }
      }
    });

  });

  //问答题上传附件删除
  $("body").on("click", ".file-list .icon-file-delete", function () {
    var _parent = $(this).parents(".question-content");
    var _row = $(this).parents(".file-row");
    var fileUrl = $(_row).find(".file").attr("href");
    var questionsId = _parent.attr("data-id");
    var upload_file=[];
    _parent.find('.file-row').each(function(){
      var file;
      var url=$(this).find(".file").attr("href");
      var name=$(this).find(".file").text();
      if(fileUrl!=url) { //遍历，取出未要删除的文件列表，传给后端
        file = {
          filename: name,
          url: decodeURIComponent(url)
        };
        upload_file.push(file);
      }
    })
    var timeStamp = new Date().getTime();
    var questionsData ={
      test_id: questionsId,
      upload_file: JSON.stringify(upload_file),
      exam_results_id: exam_results_id,
      exam_id: exam_info_id,
      time_stamp: timeStamp
    };
    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/exam/alter_paper_records_file",
      data: questionsData,
      success: function(msg){
        if (msg){
          $(_row).remove();
        }else{
          showErrorTip('删除失败');
        }
      },
      error: function () {
        showErrorTip('服务器异常，稍后再试');
      }
    })
  });


  //单选，多选，判断
  //之所以将事件绑定至label而不是.select，是因为select内同时包含input和label，
  //而label又指向input，这会导致点击select，click被触发两次
  $("body").on("click", ".question-content .select label", function () {
  //   window.alert("hhh")
  // });
  // $(".question-content .select label").click(function(e) {

    var _this = $(this);
    var _parent = $(_this).parents(".question-content");
    var _select = $(_this).parents(".select");
    var questionsId = _parent.attr("data-id");
    var keyList = "";

    setTimeout(function () {
      if($(_select).hasClass("single-select") || $(_select).hasClass("judge")){

        $(_parent).find(".radioOrCheck").each(function(index, element) {
          var classStr = $(this).data("keyid");
          if($("." + classStr).is(":checked")){
            $(this).removeProp("checked");
          }
          // if($(this).is(":checked")){
          //   $(this).removeProp("checked");
          //   // keyList = $(this).attr("data-name")+",";
          // }
        });

        // 单选和判断（相同题目其中一个答题其他题同步结果）
        var classStr = _this.prev("input").data("keyid");
        $("." + classStr).prop("checked", "checked");
        keyList = $("." + classStr).attr("data-name")+",";
      }else if($(_select).hasClass("multi-select")){

        // 多选（相同题目其中一个答题其他题同步结果）
        if(_this.prev("input").is(":checked")){
          var classStr = _this.prev("input").data("keyid");
          $("." + classStr).removeProp("checked");
        }else {
          var classStr = _this.prev("input").data("keyid");
          $("." + classStr).prop("checked", "checked");
        }
        $(_parent).find(".radioOrCheck").each(function(index, element) {
          if($(this).is(":checked")){
            keyList += $(this).attr("data-name")+",";
          }
        });
      }

      saveQuestionsCatch(questionsId , keyList);
    }, 100);

  });

  $("body").on("blur",".keyFill",
  // )
  // //填空
  // $(".keyFill").blur(
  function(e) {
    var _parent = $(this).parents(".question-content");
    var questionsId = _parent.attr("data-id");
    var keyFillDom = _parent.find(".keyFill");
    var keyList = [];

    $(_parent).find(".keyFill").each(function (index, element) {
      keyList[index] = $(this).val();
    });
    saveQuestionsCatch(questionsId , keyList.join("||"));

  });

  //todo 被删除的试题当作已答？？？

  //交卷
  $("#endExamBtn").click(function (e) {
    e.preventDefault();

    //交卷提示
    var length = $("#numberCardModal .modal-body .box.s1").length;
    var html = "";

    if(length==0){
      html = "是否现在交卷？";
    }else {
      html = "有试题未完成，是否现在交卷？";
    }

    $("#endExamModal .modal-title").html(html);
    $("#endExamModal").modal("show");
  });

  var loadingProgress = 0; //进度条数值
  var loadingText = ''; //不同百分比显示内容
  var progress; //进度条定时器

  //确认交卷
  $("#confirmEndExamBtn").click(function (e) {
    e.preventDefault();

    //最短答卷时长判断
    isMinTimeLimit(setMinExamTime,minExamTime,true, checkMinExamTimeCallbackFn);
  });

  // 检测了最短学习时长的回调
  function checkMinExamTimeCallbackFn() {
    saveExamFn(0);//用户主动点击触发交卷

    //监听页面切换
    var hiddenTime;
    var statTime = 0;
    var hiddenNum = 0;
    var makeSureTime  = setInterval(function () {
      statTime++
    },1000);

    $('#endExamModal').modal("hide");
    $("#spinnerLoading").addClass('hide');

    //页面切换不可见的情况下
    document.addEventListener("visibilitychange", function() {

      if(document.visibilityState === 'hidden'){
        clearInterval(makeSureTime);
        hiddenTime = setInterval(function(){

          hiddenNum++;

          if((hiddenNum+statTime) >= 10){
            clearInterval(hiddenTime);
            //window.location.href = "/exam/result/inquire?examResultId="+exam_results_id;
          }
        },1000)

      }else if(document.visibilityState === 'visible'){

        clearInterval(hiddenTime) ;

        var totalTime = hiddenNum+statTime;

        if(loadingProgress < totalTime*10){

          loadingProgress = totalTime*10

        }
      }

    });
  }

  window.saveExamFn = saveExamFn;
  //交卷提交后台异步保存fn
  // isForce--是否强制交卷，强制交卷方式 //0--否 1--是 2--切屏防作弊 3--x秒不动自动交卷 4--闯关失败 5--答题时间或者考试时间已到 6-批量交卷3秒后交卷
  function saveExamFn(isForce){
    //如果附件正在上传中 //非强制交卷
    if(isUploading == 1){
      if(isForce == 0){
        BootstrapDialog.show({
          title: "",
          message: "附件正在上传中，请您耐心等候。上传完成后是否自动为您交卷？",
          buttons: [{
            label: "否",
            action: function(dialogItself) {
              dialogItself.close();
              $("#endExamModal").modal("hide");
              $("#spinnerLoading").addClass("hidden");
            }
          },{
            label: "是",
            cssClass: 'btn-primary',
            action: function(dialogItself) {
              dialogItself.close();
              $("#spinnerLoading").removeClass("hidden hide");
              setInterval(function () {
                if(isUploading == 0){
                  saveExamFn(isForce);
                }
              },1000);
            }
          }]
        });
      }
      return false;
    }

    $(".had-save-mark").addClass("had-confirm-save");//作为是否已经触发交卷操作的标记
    $("#spinnerLoading").addClass("hidden");
    $('.loading-box').removeClass('hidden');

    //清除考试时间
    // 非"不限时长"类的考试，获取倒计时
    if(examTimeRestrict != 0) {
      clearInterval(timeDownInterval);
    }
    // 若开启拍照防作弊功能，则在交卷之前再拍一次，确保至少有一张
    if(capture!=0){
      var questionId=$("#numberCardModal .modal-body .iconBox:last").attr("questionsId");
      $("#captureForm input[name=questionId]").val(questionId);
      captureAndSave();
    }

    //判断是否有未保存的考题
    $.each(answered_multi_all,function(index,value){
      var unsaved_answer = value;
      var has_save = false;
      $.each(answered_all,function(index,value){
        if(value.test_id==unsaved_answer.test_id){
          value.test_ans = unsaved_answer.test_ans;
          has_save = true;
          $("#spinnerLoading").addClass("hidden");
          return false;
        }
      });
      if(!has_save){
        answered_all.push(unsaved_answer);
      }
    });

    if(answered_all.length>0){
      saveQuestionsCatch("","",true,false,isForce);
      $("#spinnerLoading").addClass("hidden");

      return false;
    }else{
      commit_exam(isForce);
    }
  }

  //缓存已答未提交考题数据
  function saveQuestionsCatch(questionsId,keyList,overExam,editor_blur,isForce, rawKeyList){
    keyList = keyList.replace(/"/g,"&quot;").replace(/'/g,"&apos;");
    //问答题blur保存答案
    if(editor_blur==true){
      var questionsData = {
        "test_id":questionsId,
        "test_ans":keyList,
        "exam_results_id":exam_results_id,
        "exam_id":exam_info_id,
        "raw_test_ans": rawKeyList
      };
      answered_multi_all.push(questionsData);
      commitProcess(questionsId, true);
      saveAnswerFn_timeout(isForce, false, true);
      return;
    }
    //交卷操作时还有未保存的考题
    if(overExam==true){
      saveAnswerFn_timeout(isForce,overExam);
      return;
    }
    var hasSave = false; //是否保存过
    $.each(answered_multi_all,function(index,value){
      if(value.test_id==questionsId){
        value.test_ans = keyList;
        hasSave = true;
        return;
      }
    });
    var questionsData = {
      "test_id":questionsId,
      "test_ans":keyList,
      "exam_results_id":exam_results_id,
      "exam_id":exam_info_id,
      "raw_test_ans": rawKeyList
    };
    if(!hasSave){
      answered_multi_all.push(questionsData);
      if(questionsData.test_ans==''){
        commitProcess(questionsId, false);
      }else {
        commitProcess(questionsId, true);
      }
    }
    if(answered_multi_all.length==answered_num){
      saveAnswerFn_timeout(isForce);
    }
  }

  var saveAnswerTipClock = null;

  function saveAnswerShowTipFn() {
    if($("#saveTipAlert").css("display") == "none"){
      $("#saveTipAlert").css("display", "block").fadeIn();
    }

    if(saveAnswerTipClock){
      clearTimeout(saveAnswerTipClock);
    }

    saveAnswerTipClock = setTimeout(function() {
      $("#saveTipAlert").fadeOut();
      clearTimeout(saveAnswerTipClock);
    }, 2000);
  }

  //延时答题后提交后台异步保存fn
  function saveAnswerFn_timeout(isForce,overExam, saveTip){

    if(examTimeRestrict != 0){
      clearInterval(getExamEndTimeInterval);
    }

    var exam_test_list_json, exam_test_list;
    //答案数组
    if(overExam){
      exam_test_list_json = answered_all;
    }else{
      exam_test_list_json = answered_multi_all;
      answered_multi_all = [];
    }
    exam_test_list = JSON.stringify(exam_test_list_json);
    //将分割URI的&符号转义为十六进制序列
    exam_test_list = encodeURIComponent(exam_test_list);

    //[{"test_id":"5e919e7957aad24951280180","test_ans":"key1,","exam_results_id":"31807949","exam_id":"488064"}]
    //时间戳
    var timeStamp = new Date();
    var dataForm = "account=" + user.account + "&companyId=" + user.companyId + "&examTestList="+exam_test_list+"&timeStamp="+timeStamp.getTime();

    $("#spinnerLoading").addClass("hide");
    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/api/exam/exam_start_ing_multi",
      data: dataForm,
      processData: false,
      success: function(msg){

        $("#spinnerLoading").removeClass("hide");

        if(msg.success == "answered") {
          saveExamFn(6);
          return;
        }

        if(msg.success== true){

          // 问答题失焦保存给提示
          if(saveTip){
            saveAnswerShowTipFn();
          }

          if(overExam==true){
            answered_all = [];
            commit_exam(isForce);
          }

          if(examTimeRestrict != 0){
            if(msg.bizContent.code=='3'){
              $('.submit-notice').show();
              var endNum = 3;
              var submitExam = setInterval(function(){
                endNum--;
                if(endNum < 0){
                  clearInterval(submitExam);
                  $('.submit-notice').hide();
                  saveExamFn(6);//立即交卷->批量交卷3秒延迟
                }
                $('.notice-time').text(endNum)
              },1000);
            }
            if(msg.bizContent.code=='1'){
              if(answer_time_left !=msg.bizContent.totalTime){
                d = new Date();
                initTime = parseInt(d.getTime()/1000);
                answer_time_left = msg.bizContent.totalTime;
                endTime = initTime + answer_time_left;
                $("#timeResetModal .delay-time").text(msg.bizContent.delayTimeStamp);
                $('#timeResetModal').modal();
              }
            }else if(msg.bizContent.code=='2'){
              saveExamFn(0);//立即交卷
            }
            if(msg.bizContent.code !== '2'|| msg.bizContent.code !== '3') {
              getExamEndTimeInterval = setInterval(()=>void(0), 30000);
            }
          }

        }else if(msg.success=="answered"){
          $('.laoding-box').hide();
          alert("您已交卷，请关闭页面");

        }else{
          $('.laoding-box').hide();
          alert("操作失败，请联系管理员！");
        }
      },
      error:function(XMLHttpRequest, textStatus, errorThrown){
        // $("#spinnerLoading").removeClass("hide");
        $.each(exam_test_list_json,function(index,value){
          var fail_answer = value;
          var has_save = false;

          $.each(answered_all,function(index,value){
            if(value.test_id==fail_answer.test_id){
              value.test_ans = fail_answer.test_ans;
              has_save = true;
              return false;
            }
          });

          if(!has_save){
            answered_all.push(fail_answer);
          }
        });
        asynSubTimeoutFn(exam_test_list_json);
      }
    });
  }

  //查询成绩时间间隔
  var queryInterval;
  var resultTime = 2; //请求考试结果的间隔时间
  var examTimeOut = 0; //交卷超时计时依赖值
  var examTimeOutClock; // 交卷超时计时器

  //交卷
  function commit_exam(isForce){

    var switchScreen = 0;//切屏次数
    var noOpsAutoCommit = 0;//无操作时间
    switch(isForce) {
      case 2:
        switchScreen = parseInt(blur_count) + 1;
        break;
      case 3:
        noOpsAutoCommit = quietSecond;
        break;
      default:
        break;
    }

    clearInterval(captureSetInterval);//清除拍照
    //进度条定时器
    progress = setInterval(function(){

      var random =Math.floor(Math.random()*3+1);

      loadingProgress+=random;

      if(loadingProgress >= 100){

        loadingProgress = 100;

      }

      if(loadingProgress <= 30 ){

        loadingText = '正在提交答案...';

      }else if(loadingProgress >30 && loadingProgress <=70){

        loadingText = '正在判分中...'

      }else{
        loadingText = '正在出分中...';
      }

      $('.loading-label').text(loadingText);

      $('.loading-num span').text(loadingProgress+'%').css({
        marginLeft:loadingProgress+'%'
      });

      $('.loading-develop').width(loadingProgress+'%');

    },120);
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "/api/exam/exam_ending",
      data: "account=" + user.account + "&companyId=" + user.companyId + "&examId="+exam_info_id+"&examResultId="+exam_results_id+"&isForce="+isForce+"&switchScreen="+switchScreen+"&noOpsAutoCommit="+noOpsAutoCommit,
      success: function (msg) {
        if(msg.success){
          //清除请求考试时间的定时器
          clearInterval(getExamEndTimeInterval);

          examTimeOutClock = setInterval(function(){
            examTimeOut = examTimeOut + 1;
            if(examTimeOut>20) {
              clearTimeout(queryInterval);
              // return window.location.href = "/exam/exam_center_score?examResultId="+exam_results_id+"&userId="+examUserId+"&companyId="+companyId;
              return window.location.href = "/depts/exam/result/inquire?examResultsId="+exam_results_id;
            }
          },1000)

          resultTimeout();
        }else {
          alert("操作失败，请重试！");
          $("#resultInquireModal").modal('hide');
        }
      },
      error: function () {
        alert("操作失败，请重试！");
        $("#resultInquireModal").modal('hide');
      }
    });
  }


  // 倒计时 // time 为请求的时长
  function resultTimeout() {
    clearTimeout(queryInterval);
    // 请求考试结果以2-3-4-5-6-7-8-9-10-10-10的时间间隔请求
    queryInterval = setTimeout(resultInquire, (resultTime>11?resultTime:resultTime++)*1000);
  }

  //生成考试成绩
  function resultInquire() {

    //不显示loading
    $("#spinnerLoading").addClass("hide");
    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/api/exam/result_inquire",
      data: "account=" + user.account + "&examResultId="+exam_results_id+"&companyId="+companyId,
      ansyc: false,
      success: function (msg) {
        if(msg.success){
          clearTimeout(queryInterval);

          // 每200毫秒检测loadingProgress的值，如果到达100，清除定时
          var time = setInterval(function(){
            if(loadingProgress >= 100){
              clearInterval(progress);
              clearInterval(time);
              clearInterval(examTimeOutClock);
              window.location.href = "/depts/exam/result/inquire?examResultsId="+exam_results_id;
            }
          },120);
        }else {
          resultTimeout();
        }
      },
      error: function () {
        resultTimeout();
      }
    });
  }
  //异步提交答案超时FN
  function asynSubTimeoutFn(data){

    $.each(data,function(index,value){
      var questionsId = value.test_id;
      commitProcess(questionsId, false);

    });
    alert("网络连接不稳定，请您刷新页面重试。");
  }

  //**************************************答案存储**************************************


  //字号
  $(function () {
    //题干字号默认16
    //内容默认14（单选，多选，判断）
    var questionSize = 16;
    var answerSize = 14;

    //增加字号
    $(".fontsize-plus").click(function (e) {
      e.preventDefault();

      if(questionSize<20){
        questionSize = questionSize +1;
        answerSize = answerSize + 1;
        $(".exam-question").css({
          "font-size": questionSize+"px"
        });
        $(".answers .select").css({
          "font-size": answerSize+"px"
        });
      }
    });

    //减小字号
    $(".fontsize-minus").click(function (e) {
      e.preventDefault();

      if(questionSize>14){
        questionSize = questionSize - 1;
        answerSize = answerSize - 1;
        $(".exam-question").css({
          "font-size": questionSize+"px"
        });
        $(".answers .select").css({
          "font-size": answerSize+"px"
        });
      }

    });

  });


  //切换中英文
  $("#switchLangBtn").click(function (e) {
    switchLang('en');
  });


  //显示答题卡
  $("#numberCardBtn").click(function (e) {
    e.stopPropagation();
    e.preventDefault();

    $("#numberCardModal").modal();
  });

  //点击答题卡跳转至对应题,使用了锚点跳转
  //位置调整90（因为有顶栏），并关闭答题卡
  $("#numberCardModal .modal-body .box").click(function (e) {

    $("#numberCardModal").modal('hide');
    setTimeout(function () {
      var scrollTop = $("html").scrollTop();

      $("html").animate({scrollTop:scrollTop-90},200);
    },100);

  });


  //固定组合题
  var $body = $("body");
  var $main = $('.main');
  var parentsHeight= 0,
    fixedHeight=0,
    scrollHeight = 0,
    goBottomHeight = 0;
  var $questionList;
  $main.scroll(function(){

    //上滑时
    if($main.scrollTop() < scrollHeight ){
      $questionList.css({
        'marginTop':0
      });
      getEle();
      scrollHeight = 0;

    }
    //goBottomHeight不为0时在进行比较
    if(goBottomHeight){

      if($main.scrollTop() > goBottomHeight){
        $questionList.css({
          'marginTop':0
        });
        getEle();
        goBottomHeight = 0

      }
    }
  });
  // 右侧图标样式设定
  function getEle(){
    var tagetEle =  $('.operation-icon.icon-pushpined');
    tagetEle.parent().removeClass('isStuck').removeClass('stuckMenu ').attr('style','');

    tagetEle.find(".icon").removeClass("icon-p_exam_fix_se").addClass("icon-p_exam_fix_de");

    tagetEle.removeClass("icon-pushpined").addClass("icon-pushpin")
      .attr("title","固定题干").attr("data-original-title","固定题干");
  }

  //固定题干
  $body.on("click", ".operation-icon.icon-pushpin", function () {



    var index = $(this).parents('.questions').index();

    // //获取question-insert-list
    $questionList = $(this).parents('.questions-detail').find('.question-insert-list');

    //获取每个组合题第一个小题的高度
    var labelHeight = $questionList.find('.question-insert').eq(0).find('.exam-question').height();

    //获取questions-detail的offsetTop值
    var questionTop = $(this).parents('.questions-detail').offset().top;

    //获取main的scrollTop值
    var mainScrollTop = $main.scrollTop();

    parentsHeight = $questionList.height();

    fixedHeight = $(this).parent().height();

    //获取临界值
    if(index === 0){
      $questionList.css({
        'marginTop':fixedHeight-40
      })
    }
    //向下取整
    scrollHeight =Math.floor(mainScrollTop+questionTop-fixedHeight-labelHeight-90);

    //下滑超出高度
    goBottomHeight = Math.floor(scrollHeight+fixedHeight+parentsHeight+labelHeight-90);

    $main.scrollTop(scrollHeight);

    $(this).parent().stickUp({});

    $(this).parent().addClass('isStuck').css({
      position:'fixed',
      top:0
    });

    // $(".stuckMenu.isStuck").removeClass("isStuck").removeClass("stuckMenu").attr("style","");

    $(this).removeClass("icon-pushpin").addClass("icon-pushpined")
      .attr("title","解锁题干").attr("data-original-title","解锁题干");

    $(this).find(".icon").removeClass("icon-p_exam_fix_de").addClass("icon-p_exam_fix_se");

    // $(this).parents(".question-comb").stickUp();

  });

  //取消固定
  $body.on("click", ".operation-icon.icon-pushpined", function () {

    $questionList.css({
      'marginTop':0
    });

    $(this).parent().removeClass('isStuck').removeClass('stuckMenu ').attr('style','');

    // $(".stuckMenu.isStuck").removeClass("isStuck").removeClass("stuckMenu").attr("style","");

    $(this).removeClass("icon-pushpined").addClass("icon-pushpin")
      .attr("title","固定题干").attr("data-original-title","固定题干");

    $(this).find(".icon").removeClass("icon-p_exam_fix_se").addClass("icon-p_exam_fix_de");

    $(".question-insert-list").css("margin-top",0);
  });

  //标记试题
  $body.on("click", ".operation-icon.icon-mark", function () {
    var questionId = $(this).parents(".question-content").attr("data-id");
    sendMarkQuestionFn($(this), questionId, 1);
    // $(this).removeClass("icon-mark").addClass("icon-marked")
    //   .attr("title","取消标记").attr("data-original-title","取消标记");
    // $(this).find(".icon").removeClass("icon-p_exam_tag_de").addClass("icon-p_exam_tag_se");
    // $("#numberCardModal a .questions_"+questionId).parent(".box").addClass("marked");
    // $("#numberCardModal a .questions_"+questionId).parent(".box").find(".question_marked").show();
  });

  //取消标记
  $body.on("click", ".operation-icon.icon-marked", function () {
    var questionId = $(this).parents(".question-content").attr("data-id");
    sendMarkQuestionFn($(this), questionId, 0);
    // $(this).removeClass("icon-marked").addClass("icon-mark")
    //   .attr("title","标记本题").attr("data-original-title","标记本题");
    // $(this).find(".icon").removeClass("icon-p_exam_tag_se").addClass("icon-p_exam_tag_de");
    // $("#numberCardModal a .questions_"+questionId).parent(".box").removeClass("marked");
    // $("#numberCardModal a .questions_"+questionId).parent(".box").find(".question_marked").hide();
  });


  //删除录音
  $body.on('click',".audio-list .icon-audio-delete",function(e) {
    e.preventDefault();

    var _this = $(this);
    var _question = $(_this).parents(".question-content");
    var question_id = $(_question).attr("data-id");
    var _audio = $(_this).parents(".audio-row");
    var audio_url = $(_audio).find("audio").attr("src");

    var upload_file=[];
    _question.find('.audio-row').each(function(){
      var url=$(this).find("audio").attr("src");
      if(audio_url!=url) { //遍历，取出未要删除的文件列表，传给后端
        upload_file.push(decodeURIComponent(url));
      }
    })
    var timeStamp = new Date().getTime();
    var dataJson = {
      exam_results_id: exam_results_id,
      test_id: question_id,
      attachment:JSON.stringify(upload_file),
      exam_id: exam_info_id,
      time_stamp: timeStamp
    };
    $.ajax({
      type: "POST",
      url: "/exam/alter_paper_records_file",
      dataType:"json",
      data:dataJson,
      success:function(msg) {
        if(msg){
          $(_audio).remove();
        }else{
          showErrorTip("删除失败");
        }
      }
    });
  });




  //**************************************防作弊**************************************
  //禁止复制粘贴
  document.oncontextmenu=new Function("event.returnValue=false");
  document.oncopy=new Function("event.returnValue=false");
  document.onpaste=new Function("event.returnValue=false");

  var localStream = null
  //拍照防作弊
  $(function () {
    var webcam_json = {};
    var capture_id;

    // 开启摄像头，拍照防作弊
    if(capture!=0){
      //获取题目总数
      var question_total=$("#numberCardModal .modal-body .box").length;
      webcam_json = getRandom(1, question_total);//创建json存拍照题号和相应拍照状态
      // console.log(webcam_json);

      //视频部分采用七牛云实时音视频
      //开启本地画面预览
      QNRTC.deviceManager.getLocalStream({
        audio: {
          enabled: false,
        },
        video: {
          enabled: true,
          width: 320,
          height: 240,
        },
      })
        .then(function(stream) {
          localStream = stream
          var webcamEl = document.getElementById("webcam")
          // console.log(webcamEl)
          stream.play(webcamEl, true)
          $("#webcamAlert").addClass("hidden");
          var questionId=$("#numberCardModal .modal-body .iconBox:first").attr("questionsId");
          $("#captureForm input[name=questionId]").val(questionId);

          setTimeout(function () {
            captureAndSave()
          }, 3000);

          setTimeout(function () {
            $("#webCamBar, #webcam").addClass("folded");
          }, 10000)
        })
        .catch(function(err) {
          console.log(err);
        })

      //点击试题拍照
      $("body").on("click", ".question-content", function () {
        //组合题题干排除
        if(!$(this).hasClass("question-comb")){
          var questionId = $(this).attr("data-id");

          if(typeof(webcam_json[questionId])!='undefined' && webcam_json[questionId]==0) {
            webcam_json[questionId] = 1;
            $("#captureForm input[name=questionId]").val(questionId);
            captureAndSave()
          }
        }
      });
    }

    //显示摄像头
    $("body").on("click","#webCamBar",
    //   )
    // $("#webCamBar").click(
      function(e) {
      $("#webCamBar, #webcam").removeClass("folded");
    });
    //隐藏摄像头
    $("body").on("click","#webCamFold",
    // $("#webCamFold").click(
      function(e) {
      $("#webCamBar, #webcam").addClass("folded");
    });

    //获取随机试题
    function getRandom(min, max) {
      //获取试题数目，按照1/10的比例，至少一题
      var random_num = Math.ceil((max-min+1)/10);
      var random_arr = [];
      var random_json = {};
      var question_id;

      while (random_arr.length<random_num){
        var random_int = Math.floor(Math.random() * (max - min + 1)) + min - 1;

        if(random_arr.indexOf(random_int)==-1){
          question_id = $("#numberCardModal .modal-body .iconBox").eq(random_int).attr("questionsId");
          random_json[question_id]= 0;
          random_arr.push(random_int);
        }
      }
      return random_json;
    }

    function saveImg(data) {
      var pos = 0, ctx = null, saveCB, image = [];
      var canvas = document.createElement("canvas");
      canvas.setAttribute('width', 320);
      canvas.setAttribute('height', 240);
      if (canvas.toDataURL) {
        ctx = canvas.getContext("2d");
        image = ctx.getImageData(0, 0, 320, 240);
        saveCB = function(data) {
          var col = data.split(";");
          var img = image;
          for(var i = 0; i < 320; i++) {
            var tmp = parseInt(col[i]);
            img.data[pos + 0] = (tmp >> 16) & 0xff;
            img.data[pos + 1] = (tmp >> 8) & 0xff;
            img.data[pos + 2] = tmp & 0xff;
            img.data[pos + 3] = 0xff;
            pos+= 4;
          }
          if (pos >= 4 * 320 * 240) {
            ctx.putImageData(img, 0, 0);
            $("#captureForm").append("<textarea name='file'>"+canvas.toDataURL("image/png")+"</textarea>");
            $("#captureForm").submit();
            $("#captureForm textarea").remove();
            pos = 0;
          }
        };
      }
      return saveCB;
    }

  });

  // 拍照并保存到服务
  function captureAndSave() {
    if (capture == 0) {
      return
    }
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 240;

    ctx.drawImage(localStream.video, 0, 0, 320, 240);
    $("#captureForm").append("<textarea name='file'>"+canvas.toDataURL("image/png")+"</textarea>");
    $("#captureForm").submit();
    $("#captureForm textarea").remove();
  }


  function randRange(min,max) {
    var newTime = Math.ceil(Math.floor(Math.random()*(max-min+1)+min));
    return newTime;
  }

  var captureSetInterval,randTime,oneRandTime;
  var timePZ = capture*60;
  // 第一次随机拍
  oneRandTime = randRange(60,timePZ-10);
  setTimeout(function () {
    // console.log('ok拍照');
    captureAndSave();
  },oneRandTime*1000);
  // 第二次之后随机拍
  captureSetInterval = setInterval(function () {
    randTime = randRange(60,timePZ-10);
    // console.log(randTime)
    setTimeout(function () {
      // console.log('ok拍照');
      captureAndSave();
    },randTime*1000);
  },timePZ*1000);

  //切屏防作弊
  //若干次切换后自动交卷
  $(function(){
    // 切屏计时器
    var screenLimitInterval;
    if(set_full_screen==0) {
      checkSwitchScreenCookie();//检查cookie关于切屏的储存状态，cookie过期了视为切屏有效，用于检验退出考试等情况
      setInterval("setSwitchScreenCookie()",1000); //定时设置cookie有效
      $('#alertModal .modal-title').html('本场考试已开启防切屏限制，<br> 切换页面' + blur_count + '次后将进行强制交卷，<br>请勿切屏及刷新页面！');
      $('#alertModal').modal("show");
      //若开启全屏防作弊，则点击页面触发全屏
      //screenfull.js?v=201801101413:93
      // Failed to execute 'requestFullscreen' on 'Element':
      // API can only be initiated by a user gesture.
      //必须手动触发
      $("body").on("click", function (e) {
        $('#alertModal').modal("hide");
        //拍照防作弊的刷新按钮不绑定该事件
        if(!$(e.target).hasClass("webcam-refresh")){
          //当且仅当页面处于非全屏状态时再次触发全屏请求，否则，每次点击页面都会回到页面顶部
          if(!screenfull.isFullscreen&&screenfull.isEnabled){
            screenfull.request();
            return false;
          }
        }
      });

      //窗口失去焦点
      $(window).blur(function () {
        // if (screenfull.isFullscreen) {
        setTimeout(function () {
          blurCount();
        }, 50);
        // }
      });

      // 窗口获得焦点
      $(window).focus(function () {
        // if (screenfull.isFullscreen) {
        setTimeout(function () {
          clearInterval(screenLimitInterval);
        }, 60);
        // }
      });

      //退出全屏记一次切屏
      if (screenfull.isEnabled) {
        document.addEventListener(screenfull.raw.fullscreenchange, function () {
          if (!screenfull.isFullscreen) {
            setTimeout(function () {
              blurCount();
            }, 50);
          }else {
            setTimeout(function () {
              clearInterval(screenLimitInterval);
            }, 60);
          }
        });
      }
    }


    //切换
    function blurCount(){
      clearInterval(screenLimitInterval);

      //如果已经点击了交卷，不做切屏防作弊
      if($(".had-save-mark").hasClass("had-confirm-save")){
        return false;
      }

      //预留时间
      var maxTime = parseInt(switchScreenSecond);
      var d = new Date();
      //剩余时间截止时间
      var restTime = parseInt(d.getTime()/1000) + maxTime;

      screenLimitInterval=setInterval(function(){
        var d = new Date();
        var restTimeLeft = restTime - parseInt(d.getTime()/1000);

        //当且仅当时间超出设定才计入次数
        if(restTimeLeft<= 0) {
          clearInterval(screenLimitInterval);
          cuttingScreenCount++;
          sendCuttingScreenCount(cuttingScreenCount);

          if (cuttingScreenCount > parseInt(blur_count)) {
            saveExamFn(2);
          } else {
            $("#blurCount").text(cuttingScreenCount);
            $("#blurCountModal").modal();
          }
          clearInterval(screenLimitInterval);
        }
      },1000);


    }

    //通过cookie检查切屏
    function checkSwitchScreenCookie(){
      var status=getCookie('switch_screen_status'+exam_results_id)=='1'?true:false;
      if(!status && exitSwicthStatus!="new") {
        cuttingScreenCount++;
        sendCuttingScreenCount(cuttingScreenCount);

        if (cuttingScreenCount > parseInt(blur_count)) {
          setTimeout("saveExamFn(2)",3000); //需要延迟1s以上，等待timeDown函数执行了再交卷
        } else {
          $("#blurCount").text(cuttingScreenCount);
          $("#blurCountModal").modal();
        }
      }
    }

  });

  //最短答题时长  返回一个判断值，如果返回值为true，则允许调用commit_exam交卷，否则在调用前return false终止调用commit_exam
  function isMinTimeLimit(setMinExamTime,minExamTime,isShowAlert,callbackFn){
    $.ajax({
      type:"post",
      url:"/api/exam/get_remian_time",
      dataType:"json",
      data: "account=" + user.account + "&companyId=" + user.companyId + "&examResultId="+exam_results_id,
      success:function(msg){
        var consume_time = Math.abs(msg.bizContent);

        $("#limitMinTimeCount").text(Math.ceil((minExamTime*60-consume_time)/60));

        //若设置了最短答题时长，且答题时间小于该时长，返回一个false
        if(setMinExamTime && consume_time < (minExamTime*60)){
          if(isShowAlert){ //是否要显示提示
            showMinTimeLimitAlert();
          }
          $('#endExamModal').modal("hide");
          $("#spinnerLoading").addClass('hide');

        }else if(callbackFn){
          callbackFn();
        }
      }
    });
  }
  //显示'最短答题时长'提示
  function showMinTimeLimitAlert(){
    $('#minTimeLimitAlert').removeClass('hidden');
    var minTimeLimitTimeout=setTimeout(function(){
      $('#minTimeLimitAlert').addClass('hidden');
      clearTimeout(minTimeLimitTimeout);
    },3000);
  }

  //无操作防作弊
  $(function () {
    //若干秒无操作提示，自动交卷
    setTimeout(function () {
      if (setQuietCheat == 1) {
        //预留10秒提示时间
        var maxTime = parseInt(quietSecond) + 10;
        var d = new Date();
        //剩余时间截止时间
        var restTime = parseInt(d.getTime() / 1000) + maxTime;

        var timeLimitInterval = setInterval(function () {
          //如果已经点击了交卷，取消倒计时
          if ($(".had-save-mark").hasClass("had-confirm-save")) {
            clearInterval(timeLimitInterval);
            return false;
          }
          var d = new Date();
          var restTimeLeft = restTime - parseInt(d.getTime() / 1000);

          if (restTimeLeft <= 0) {
            $("#timeLimitAlert").text("交卷中...");
            clearInterval(timeLimitInterval);
            saveExamFn(3);
          } else if (restTimeLeft <= 10) {
            $("#limitTimeCount").text(restTimeLeft);
            $("#timeLimitAlert").removeClass("hidden");
          }
          // restTime--;
        }, 1000);

        $("body").on('keydown click mousemove scroll', function (e) {
          $("#timeLimitAlert").addClass("hidden");
          var d = new Date();
          // reset
          restTime = parseInt(d.getTime() / 1000) + maxTime;
        });
      }
    },500);
  })

  //**************************************防作弊**************************************

});

//提示弹窗
function showSuccessTip(text){
  $(".ksx-success .text label").text(text);
  $(".ksx-success").show();
  $(".ksx-success").fadeOut(3000);
}
function showErrorTip(text){
  $(".ksx-error .text label").text(text);
  $(".ksx-error").show();
  $(".ksx-error").fadeOut(3000);
}
function showWarnTip(text){
  $(".ksx-warn .text label").text(text);
  $(".ksx-warn").show();
  $(".ksx-warn").fadeOut(3000);
}


function editImgFn(e){
  var editBtn = e.target;
  var editImg = $(editBtn).parents('.txt-toolbar').prev().find('.answersImg.clicked');
  question_Id = $(editBtn).parents('.question-content').attr('data-id');

  // 标记当前编辑图片
  $("p.is-edit-img").removeClass("is-edit-img");
  editImg.parents("p").addClass("is-edit-img");
  editImg.detach();

  var _thisImgSrc = editImg[0].currentSrc;
  var canvas = $('.canvas')[0]; // 用于涂鸦
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除涂鸦画布内容

  $('#paintingBox').show();
  setTimeout(function () {
    $('#paintingBox').animate({marginTop: 0}, 800);
  },10);
  setTimeout(function () {
    $('#numberCardModal').hide();
    $('body').addClass('show-handwriting');
    $('.main').addClass('show-handwriting');
    $('.main .header-wrapper').hide();
    $('.main .body-wrapper').hide();
    $('.main .nav-wrapper').hide();
  },100)

  var img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
  };
  img.src = _thisImgSrc;
  beforeImgSrc = _thisImgSrc;
}

//手写板
function paintingFn(e){
  question_Id = $(e.target).parents('.question-content').attr('data-id');
  $('#paintingBox').show();
  // $('.sizeButton').click();//画笔被选中
  setTimeout(function () {
    $('#paintingBox').animate({marginTop: 0}, 800);
  },10);
  setTimeout(function () {
    $('#numberCardModal').hide();
    $('body').addClass('show-handwriting');
    $('.main').addClass('show-handwriting');
    $('.main .header-wrapper').hide();
    $('.main .body-wrapper').hide();
    $('.main .nav-wrapper').hide();
  },100)
}

$("body").on("click",'.painting-top .hidePainting',
//   )
// $('.painting-top .hidePainting').click(
  function () {
  $('#paintingBox').animate({marginTop: 700}, 800);
  $('.changeType').removeClass('active');
  setTimeout(function () {
    $('#numberCardModal').show();
    $('body').removeClass('show-handwriting');
    $('.main').removeClass('show-handwriting');
    $('.main .header-wrapper').show();
    $('.main .body-wrapper').show();
    $('.main .nav-wrapper').show();
  },600);
  $('#paintingBox').hide();
  if (beforeImgSrc!=''){
    $('.is-edit-img').append('<img class="answersImg" style="width: 259px;" src="'+beforeImgSrc+'">')
  }
  beforeImgSrc = '';
});

//*******************************************答题卡优化********************************************

//新答题卡-收起
$("body").on("click","#answercardFoldBtn",
// )
// $("#answercardFoldBtn").click(
  function(){
  $("#answercardOpenBtn").show();
  $(this).hide();
  $("#numberCardModal .card-content").hide();
  $("#numberCardModal .modal-footer").hide();
  $("#numberCardModal .title_border").css({
    width: '18px',
    height: '4px',
    top: '-6px',
    margin: '0',
  });
  $("#numberCardModal .title").css("padding-top","4px");
  $("#numberCardModal .title_content").css("margin-left","unset").css("width","12px");
  $("#numberCardModal").css("width","66px");
});
//新答题卡-展开
$("body").on("click","#answercardOpenBtn",
// $("#answercardOpenBtn").click(
  function(){
  $("#answercardFoldBtn").show();
  $(this).hide();
  $("#numberCardModal .card-content").show();
  $("#numberCardModal .modal-footer").show();
  $("#numberCardModal .title_border").css({
    width: '4px',
    height: '18px',
    top: '0px',
    margin: 'auto',
  });
  $("#numberCardModal .title").css("padding-top","0px");
  $("#numberCardModal .title_content").css("margin-left","10px").css("width","unset");
  $("#numberCardModal").css("width","240px");
});
//打开监控的时候
$(function(){
  if($("#webcam").length!=0) {
    $("#numberCardModal").css("height", "calc(100% - " + (110 + 173).toString() + "px)").css("top", (90 + 173).toString() + "px"); //答题卡的高度和位置调整
  }
})

// 解析latex公式
function renderFormula(selector, flag){ //flag预留，以备用于区分不同处理
  $(selector).each(function (index, element) {
    if(!$(element).hasClass("rendered")){
      var text = $(element).text();

      katex.render(text, element, {
        throwOnError: false
      });

      $(element).addClass("rendered");
    }
  });
}

//*******************************************切屏优化********************************************
//切屏次数发给后端
function sendCuttingScreenCount(count){
  $.ajax({
    type:"POST",
    cache:false,
    dataType:"json",
    headers:{ "cache-control": "no-cache" },
    url:'/api/exam/update_cutting_count',
    data: "account=" + user.account + "&companyId=" + user.companyId + "&switchScreen="+count+"&examResultId="+exam_results_id,
  });
}

//设置cookie保存切屏状态
function setSwitchScreenCookie(){
  setCookieByMaxAge('switch_screen_status'+exam_results_id,'1',switchScreenSecond.toString(),'/');
}

// 标记试题请求 //isMark 0--取消标记；1--标记
function sendMarkQuestionFn($this, testId, isMark) {
  var timeStamp = new Date().getTime();
  var $this = $this;

  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/api/exam/exam_question_mark",
    data: {
      account:user.account,
      companyId: user.companyId,
      questionId: testId,
      examResultId: exam_results_id,
      examId: exam_info_id,
      isMark: isMark,
      timeStamp: timeStamp
    },
    success: function (msg) {
      if(isMark == 1){
        $this.removeClass("icon-mark").addClass("icon-marked")
          .attr("title","取消标记").attr("data-original-title","取消标记");
        $this.find(".icon").removeClass("icon-p_exam_tag_de").addClass("icon-p_exam_tag_se");
        $("#numberCardModal a .questions_"+testId).parent(".box").addClass("marked");
        $("#numberCardModal a .questions_"+testId).parent(".box").find(".question_marked").show();
      }else {
        $this.removeClass("icon-marked").addClass("icon-mark")
          .attr("title","标记本题").attr("data-original-title","标记本题");
        $this.find(".icon").removeClass("icon-p_exam_tag_se").addClass("icon-p_exam_tag_de");
        $("#numberCardModal a .questions_"+testId).parent(".box").removeClass("marked");
        $("#numberCardModal a .questions_"+testId).parent(".box").find(".question_marked").hide();
      }
    }
  });
}
