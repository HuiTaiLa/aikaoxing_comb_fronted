$(function () {
  var queryInterval;
  var payTimer; //支付状态定时查询

  $("#payModal").on("hide.bs.modal",function(e){
    //模态框隐藏时，清除定时器
    clearInterval(payTimer);
  });

  //标记当前分类
  $(function () {
      var classify_id = getQueryString("id");
      var current_name = '筛选';

      if(classify_id!=''){
          var current_item = $(".panel-classify .menu-item[data-id="+classify_id+"]");
          current_name = $(current_item).text();

          $(".panel-classify .menu-item").removeClass("menu-item-active");
          $(current_item).addClass("menu-item-active");
      }
      $("#currentClassify").text(current_name);
  });


  //进入考试
  $("body").on("click", ".item-normal .btn-item-exam", function (e) {
    e.stopPropagation();
    e.preventDefault();

    var _this = $(this);
    var _parent = $(_this).parents(".item-normal");
    var exam_id = $(_this).attr("data-id");
    var set_ip = $(_this).attr("data-set-ip");
    var skiplogin = $(_this).attr("data-skiplogin");

    //手机号白名单
    if (skiplogin == 3){
      window.location.href = "/login/exam/exam_phone_skip_login/" + exam_id+'/'+companyId;
      return;
    }

    //有考前说明或有考试密码或排行榜均进入考前说明页
    if($(_parent).hasClass("item-notice") || $(_parent).hasClass("item-password") || $(_parent).hasClass("item-ranking-list")){
      window.location.href = "/depts/exam/before_answer_notice/#/" + exam_id;
      return;
    }else if($(_parent).hasClass("item-verify")){
      //考前身份认证直接进考试url，后端校验
      window.location.href = "/depts/exam/exam_start/#/" + exam_id;
      return;
    }
    return window.location.href = "/depts/exam/exam_start/#/" + exam_id;
    $.ajax({
      type: "POST",
      data: {"examId": exam_id, "setIpRange": set_ip},
      url: "/exam/check_hard_over_count",
      dataType: 'json',
      success: function (msg) {
        if (msg.success) {
          //success表示检查不通过
          $("#ipModal .modal-body .modal-title").text(msg.desc);
          $("#ipModal").modal();
        } else {
          $("#tipModal").modal({
            backdrop: "static",
            keyboard: false
          });
          var url;
          if(msg.bizContent){
            url = msg.bizContent;
          }
          //定时
          queryInterval = setInterval(function () {
            checkOrgnization(exam_id,url)
          }, 2000);
          //立即执行一次
          checkOrgnization(exam_id,url);
        }
      }
    });

  });

  //进入考试(继续考试)
  $("body").on("click", ".item-ongoing .btn-item-exam", function (e) {
    e.stopPropagation();
    e.preventDefault();

    var exam_id = $(this).attr("data-id");

    $("#spinnerLoading").removeClass("hidden");
    window.location.href = "/depts/exam/exam_start/#/" + exam_id;
  });

  //考试付费-modal
  $("body").on("click", ".item-unpaid .btn-item-exam", function (e) {
    e.stopPropagation();
    e.preventDefault();
    var exam_id = $(this).attr("data-id");
    window.location.href = "/exam/enter_exam/" + companyId+"/"+exam_id;
  });

  //考试付费-支付
  $("#examPayBtn").click(function (e) {
    e.stopPropagation();
    e.preventDefault();

    var exam_id = $(this).attr("data-id");

    $.ajax({
      type: "POST",
      cache : false,
      headers: { "cache-control": "no-cache" },
      dataType: "json",
      url: "/exam/pay/",
      data: {"examInfoId": exam_id},
      error: function (msg) {
        if (msg.responseText == 'yiji_state_error') {
          alert('收款账户状态错误，请联系管理员');
          return 0;
        }else if (msg.responseText == 'dont_need_pay') {
          alert('管理员没有打开支付功能');
          return 1;
        }
        $("#payModal").modal('hide').removeClass("modal-payment");
      },
      success: function(msg) {
        if(msg.success) {
          var yijifu = document.createElement("form");
          yijifu.id = "hahahaha";
          yijifu.method = "post";
          yijifu.name = "yijifu";
          yijifu.action = "https://api.yiji.com";
          document.body.appendChild(yijifu);
          //处理错误信息
          var content = msg.bizContent;
          if(content.payInfo){
            var payInfo = JSON.parse(content.payInfo);
            if(payInfo.errMsg){
              $("#payModal").modal('hide');
              alert(payInfo.errMsg);
              return false;
            }
            $("#payModal").addClass("modal-payment");
            $("#payCode .code-img").html("").qrcode({
              width: 150,
              height: 150,
              text: payInfo.codeUrl,
              background: "#FFF"
            });
            setTimeout(function(){
              clearInterval(payTimer);
              $("#spinnerLoading").hide();
              payTimer = setInterval(function(){
                $.ajax({
                  type: "POST",
                  cache : false,
                  headers: { "cache-control": "no-cache" },
                  dataType: "text",
                  url: "/exam/wechat/pay_result",
                  data: {"examInfoId": exam_id},
                  success: function(msg){
                    if(msg == "SUCCESS"){
                      clearInterval(payTimer);
                      alert("支付成功！");
                      window.location.reload();
                    }
                  },
                  error: function (err) {
                    if(err.responseText == "SUCCESS"){
                      clearInterval(payTimer);
                      alert("支付成功！");
                      window.location.reload();
                    }
                  }
                });
              },2000);
            },5000);
            return false;
          }
          for (x in content){
            var input = document.createElement("input");
            input.type = "text";
            input.name = x;
            input.value = content[x];
            yijifu.appendChild(input);
          }
          $("#hahahaha").css('display','none');
          yijifu.submit();
        } else {
          alert(msg.desc);
          $("#payModal").modal('hide').removeClass("modal-payment");
        }
      }
    });
  });

  //检查组卷是否完成
  function checkOrgnization(exam_id,url) {
    $("#spinnerLoading").addClass("hide");
    $.ajax({
      type: "POST",
      data: {"examId": exam_id},
      url: "/exam/test_complete",
      async: false,
      success: function (msg) {
        if (msg=='true') {
          clearInterval(queryInterval);
          if(typeof url != "undefined"){
            window.location.href = url;
          }else {
            window.location.href = "/depts/exam/exam_start/#/" + exam_id;
          }
        }
      },
      error: function () {
        $("#spinnerLoading").removeClass("hide");
        clearInterval(queryInterval);
        $("#tipModal").modal('hide');
      }
    });
  }

  /*异步请求考试信息*/
  //筛选参数
  var examStyleForFilter = 0; //考试分类
  var startTimeSortForFilter = "";//开始时间排序规则  正序：asc  逆序：desc  空值不作处理
  var statusForFilter = "";//String status 0 进行中，1可参加，2未开考  空值不作处理
  var setProcessForFilter = -1;//默认-1   setProcess 已经关联任务 '1'  未关联任务 '0'
  var pageForFilter = 1;//页数 默认为1
  var totalPage = 1;//总页数
  var nameForFilter = "";

  getExamInfo();


  $("body").on("click",".filterContainer .condition .menu-item",function (e) { //筛选选项
    e.preventDefault();
    if($(this).hasClass("active")){
      $(this).removeClass("active");
    }else{
      $(this).parents('.condition').find(".menu-item").removeClass("active");
      $(this).addClass("active");
    }
  })

  $(".changeFilterBtn").click(function (e) { //确定筛选按钮
    e.preventDefault();
    changeFilterCondition();
    getExamInfo();
  })

  $(".resetFilterBtn").click(function (e) { //重置筛选按钮
    e.preventDefault();
    resetFilterCondition();
  })

  function changeFilterCondition(){ //修改筛选条件
    examStyleForFilter = $(".filterContainer .condition.examStyle .menu-item.active").attr("data-id") || 0;
    startTimeSortForFilter = $(".filterContainer .condition.startTimeSort .menu-item.active").attr("data-id") || "";
    statusForFilter = $(".filterContainer .condition.status .menu-item.active").attr("data-id") || "";
    setProcessForFilter = $(".filterContainer .condition.setProcess .menu-item.active").attr("data-id") || -1;
    pageForFilter = 1;
  }

  function resetFilterCondition(){ //重置筛选条件
    examStyleForFilter = 0;
    startTimeSortForFilter = "";
    statusForFilter = "";
    setProcessForFilter = -1;
    pageForFilter = 1;
    $(".filterContainer .condition .menu-item").removeClass("active");
  }

  function getExamInfo(){ //请求考试相关的信息
    var dataForm = "account=" + user.account + "&companyId=" + user.companyId + "&examStyle=" + examStyleForFilter + "&timeSort=" + startTimeSortForFilter + "&status=" + statusForFilter + "&setProcess=" + setProcessForFilter + "&page=" + pageForFilter + "&firstVisit=" + firstVisit + "&name=" + nameForFilter;
    $.ajax({
      type: "POST",
      cache: false,
      headers: { "cache-control": "no-cache" },
      dataType: "json",
      url: '/api/exam/current_exam_list',
      data: dataForm,
      success: function(msg){
        if(firstVisit){
          appendExamStyle(msg.bizContent.styles);
          firstVisit = false; //之后该参数就置为false
        }
        optimizePagination();
        computePagination(12, msg.bizContent.total);
        $(".item-wrapper.item-exam-wrapper.clearfix .item-exam").remove();
        appendExamList(msg.bizContent.examInfoModelList);
        $(".header-filter").removeClass("open");
        $(".header-filter .filter-item").attr("aria-expanded",false);
      }
    })
  }

  function appendExamStyle(list){ //加载考试分类
    list.forEach(function(ele){
      var html = '<a class="menu-item" data-id="' + ele.id + '"'+ 'href="javascript:void(0);">' + ele.name + '</a>';
      $(".condition.examStyle .options").append(html);
    })

  }

  function appendExamList(list){ //加载考试列表
    if(list.length == 0){ //考试个数为空
      $(".body-wrapper .item-exam-wrapper .macrosEmpty").removeClass("hidden");
    }else{
      $(".body-wrapper .item-exam-wrapper .macrosEmpty").addClass("hidden");
      list.forEach(function(data){
        appendExamFn(data);
      });
    }
    $(".item-waitting").each(function(index,element) { //  开考前15分钟显示倒计时
      var _this = $(this);
      var verifyCount = $(_this).attr("data-verifyCount");
      if (verifyCount != 1) {
        var time_obj = $(_this).find(".btn-item-exam");
        var start_time = $(_this).attr("data-time");
        var start_time_left = Date.parse(start_time);//返回距1970年1月1日到指定时间的毫秒数
        var time_left = parseInt((start_time_left - now_time_left)/1000);//剩余时间秒为单位

        if(0< time_left && time_left < 15*60){
          $(time_obj).show();

          var time_count = setInterval(function() {
            if(time_left>0){
              var minutes= Math.floor(time_left/60);
              var seconds= time_left%60;

              $(time_obj).text((minutes<10?'0'+minutes:minutes)+':'+(seconds<10?'0'+seconds:seconds));
            }else {
              // 清除倒计时，并开始考试
              clearInterval(time_count);
              $(_this).removeClass("item-waitting").addClass("item-normal");
              $(time_obj).text("开始");
            }
            time_left--;
          },1000)
        }
      }

    });
  }

  function appendExamFn(data){ //加载一场考试
    var itemClass, itemTitle, itemPrice;
    var examName = data.examName;
    var html = "";
    var pay_html = "";
    var time_html = "";
    var process_html = "";
    var timeRestrictClass;
    // if(data.paid){
      if(data.wfs == 0){
        itemClass = "item-ongoing";
        itemTitle = "继续";

      }else if(data.wfs == 1){
        itemClass = "item-normal";
        itemTitle = "开始";
      }else if(data.wfs == 2){
        itemClass = "item-waitting";
        itemTitle = "未开始";
      }
      // if(data.price != 0){
      //   itemClass += ' item-paid';
      // }
    // }else{
    //   itemClass = "item-unpaid";
    //   itemTitle = "付费";
    //   itemPrice = data.price;
    // }
    if(data.beforeAnswerNotice != ''){
      itemClass += " item-notice";
    }
    if(data.setExamPwd == 1){
      itemClass += " item-password";
    }
    if(data.showRankingList == 1){
      itemClass += " item-ranking-list";
    }
    if(data.verifyCount == 1){
      itemClass += " item-verify";
    }
    //处理过长的考试名称，最长33个字符（两行)
    if(examName.length > 33){
      examName = examName.substring(0, 33) + '...';
    }

    //付费状态
    // if(data.paid && data.price!=0){
    //   pay_html = '<div class="item-status">'+
    //     '<i class="icon icon-p_card_paid"></i>'+
    //     '</div>';
    // }
    // if(!data.paid){
    //   pay_html = '<div class="item-status">'+
    //     '<i class="icon icon-p_card_pay"></i>'+
    //     '</div>';
    // }

    //examTimeRestrict=0 不限时长 隐藏考试时长
    timeRestrictClass = data.examTimeRestrict==0 || data.perTimeRestrict==1 ? "hidden" : "";

    //剩余分钟
    if(data.wfs == 0){
      time_html = '<span class="item-time-left">'+
        '<i class="icon icon-p_card_time"></i>'+
        (data.answerTimeLeft < 0 ?  '已过考试时间！' :  '剩余' + data.answerTimeLeft + '分钟') +
        '</span>';
    }

    //关联任务
    if(data.setProcess == 1){
      process_html = '<div class="item-row">'+
        '<div class="item-label">已关联任务：</div>'+
        '<div class="item-data">'+
        '<a href="' + getStaticUrlPrefix + '/exam/pc/customprocess/#/detail/'+ data.processId + '" id="jumpProess" process-id="' + data.processId + '">' + data.processName + '</a>'+
        '</div>'+
        '</div>';
    }

    html =  '<div class="item item-exam '+ itemClass + ' animate" data-time="'+ data.startTime + '" data-verifyCount="' + data.verifyCount + '">'+
      pay_html+
      '<div class="item-title" data-container="body" data-toggle="popover" data-trigger="hover"'+
      'data-placement="top" data-content="' + examName + '">'+
      examName+
      '</div>'+
      '<div class="item-row item-end-time">'+
      '<div class="item-label">考试时间：</div>'+
      '<div class="item-data">' + data.startTime + '～' + data.endTime + '</div>'+
      '</div>'+
      '<div class="item-row item-row-time '+ timeRestrictClass +'">' +
      '<div class="item-label">考试时长：</div>'+
      '<div class="item-data">' + data.examTime + '分钟'+
      time_html+
      '</div>'+
      '</div>'+
      process_html+
      '<button class="btn btn-primary btn-item-exam" data-id="' + data.id + '"'+ 'data-skiplogin="'+data.skipLogin+'"' +
      'data-set-ip="'+ data.setIpRange + '" data-price="' + itemPrice + '">' + itemTitle + '</button>'+
      '</div>';
    $(".body-wrapper .item-exam-wrapper").append(html);
  }

  function computePagination(per, total){ //计算和显示分页器
    totalPage = Math.ceil(total/per);
    $(".pagination.pagination li:not('.opt')").remove();
    for(var i = 0;i <totalPage;i++){
      var html = '<li><a href="javascript:void(0);">' + (i+1) + '</a></li>';
      $(".pagination.pagination li.toNextPage").before(html);
    }
    $(".pagination.pagination li").eq(parseInt(pageForFilter)+1).addClass("active");
    // if(totalPage == 1){
    //     $(".pagination.pagination li.toNextPage").addClass("disabled");
    //     $(".pagination.pagination li.toLastPage").addClass("disabled");
    // }else{
    //     $(".pagination.pagination li.toNextPage").removeClass("disabled");
    //     $(".pagination.pagination li.toLastPage").removeClass("disabled");
    // }
    if(pageForFilter == 1){
      $(".pagination.pagination li.toFirstPage").addClass("disabled");
      $(".pagination.pagination li.toPrevPage").addClass("disabled");
    }else{
      $(".pagination.pagination li.toFirstPage").removeClass("disabled");
      $(".pagination.pagination li.toPrevPage").removeClass("disabled");
    }
    if(pageForFilter == totalPage){
      $(".pagination.pagination li.toNextPage").addClass("disabled");
      $(".pagination.pagination li.toLastPage").addClass("disabled");
    }else{
      $(".pagination.pagination li.toNextPage").removeClass("disabled");
      $(".pagination.pagination li.toLastPage").removeClass("disabled");
    }
  }

  function optimizePagination(){ //分页器优化，使其能发送新加的异步请求
    $(".pagination.pagination a").attr("href","javascript:void(0);");
    $(".pagination.pagination li").eq(0).addClass("opt toFirstPage");
    $(".pagination.pagination li").eq(1).addClass("opt toPrevPage");
    $(".pagination.pagination li").eq(-2).addClass("opt toNextPage");
    $(".pagination.pagination li").eq(-1).addClass("opt toLastPage");
  }

  $("body").on("click",".pagination.pagination a",function(e){
    e.preventDefault();
    if($(this).parents("li").hasClass("disabled")){
      return;
    }
    var current_page = parseInt($(".pagination.pagination li.active a").text());
    $(".pagination.pagination li:not('.opt')").removeClass("active");
    var _this = $(this);
    if(!_this.parents("li").hasClass("opt")){
      _this.parents("li").addClass("active");
    }
    var jump_page = _this.text();
    var prev_page = current_page - 1;
    prev_page = prev_page > 0 ? prev_page : 1;
    var next_page = current_page + 1;
    next_page = next_page > totalPage ? totalPage : next_page;
    var page;
    if(_this.parents("li").hasClass("toFirstPage")){
      page = 1;
    }else if(_this.parents("li").hasClass("toPrevPage")){
      page = prev_page;
    }else if(_this.parents("li").hasClass("toNextPage")){
      page = next_page;
    }else if(_this.parents("li").hasClass("toLastPage")){
      page = totalPage;
    }else{
      page = jump_page;
    }
    pageForFilter = page;
    getExamInfo();
  });

  $("#searchBtn").unbind('click').click(function(){ //搜索  先移除旧的点击事件，再绑定新的
    nameForFilter = $(".item-input.item-key-input[name=name]").val();
    resetFilterCondition();
    getExamInfo();
  });

  $("#searchForm").keydown(function(event){ //回车搜索
    if(event.keyCode==13){
      event.preventDefault();
      nameForFilter = $(".item-input.item-key-input[name=name]").val();
      resetFilterCondition();
      getExamInfo();
    }
  })

  $("#searchForm .item-key-input").unbind(); //解除公共模块里的搜索回车事件绑定 （原来的绑定为跳转页面）


});
