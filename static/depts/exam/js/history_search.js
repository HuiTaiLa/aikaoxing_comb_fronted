var pageForFilter = 1;//页数 默认为1
var totalPage = 1;//总页数
var nameForFilter = "";
getExamInfo();
function resetFilterCondition(){ //重置筛选条件
  pageForFilter = 1;
  $(".filterContainer .condition .menu-item").removeClass("active");
}

function getExamInfo(){ //请求考试相关的信息
  var dataForm = "account=" + user.account + "&companyId=" + user.companyId + "&page=" + pageForFilter + "&name=" + nameForFilter;
  $.ajax({
    type: "POST",
    cache: false,
    headers: { "cache-control": "no-cache" },
    dataType: "json",
    url: '/api/exam/history_exam_list',
    data: dataForm,
    success: function(msg){
      optimizePagination();
      computePagination(12, msg.bizContent.total);
      $(".item-wrapper.item-exam-wrapper.clearfix .item-exam").remove();
      appendExamList(msg.bizContent.examInfoModelList);
      $(".header-filter").removeClass("open");
      $(".header-filter .filter-item").attr("aria-expanded",false);
    }
  })
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

function appendExamList(list){ //加载考试列表
  if(list.length == 0){ //考试个数为空
    $(".body-wrapper .item-exam-wrapper .macrosEmpty").removeClass("hidden");
  }else{
    $(".body-wrapper .item-exam-wrapper .macrosEmpty").addClass("hidden");
    list.forEach(function(data){
      appendExamFn(data);
    });
  }

}

function appendExamFn(data){ //加载一场考试
  var itemClass = "", statusClass = "", scoreClass = "", buttonClass = "";
  var examName = data.examName;
  var html = "";
  // if(data.paid){
  if(data.wfs == 0){//未通过
    itemClass = "item-unpass";
    statusClass = '<div class="item-status">' +
      '                        <i class="icon icon-p_card_not-through"></i>' +
      '                    </div>';
    scoreClass = '<div class="item-row item-row-score">' +
      '                        <div class="item-label">考试成绩：</div>' +
      '                        <div class="item-data">'+ data.examGrade+ '</div>' +
      '                    </div>';
    buttonClass = '<button class="btn btn-primary btn-item-exam" data-id="'+ data.id +'" data-result-id="'+ data.examResultId +'">查看</button>';
  }else if(data.wfs == 1){//批改中
    itemClass = "item-checking";
    statusClass = '<div class="item-status">' +
      '                        <i class="icon icon-p_card_checking"></i>' +
      '                    </div>'
    scoreClass = '';
    buttonClass = '<button class="btn btn-primary btn-item-exam" data-id="'+ data.id +'" data-result-id="'+ data.examResultId +'">查看</button>';
  }else if(data.wfs == 2){//未公布
    itemClass = "item-unrelease";
    statusClass = "";
    scoreClass = '';
    buttonClass = '<button class="btn btn-primary btn-item-exam" data-id="'+ data.id +'" data-result-id="'+ data.examResultId +'" disabled="">暂不公布</button>';
  }else if(data.wfs == 3){//通过
    itemClass = "item-pass";

    statusClass = '<div class="item-status">' +
      '                        <i class="icon icon-p_card_through"></i>' +
      '                    </div>';
    scoreClass = '<div class="item-row item-row-score">' +
      '                        <div class="item-label">考试成绩：</div>' +
      '                        <div class="item-data">'+ data.examGrade+ '</div>' +
      '                    </div>';
    buttonClass = '<button class="btn btn-primary btn-item-exam" data-id="'+ data.id +'" data-result-id="'+ data.examResultId +'">查看</button>';
  }

  //处理过长的考试名称，最长33个字符（两行)
  if(examName.length > 33){
    examName = examName.substring(0, 33) + '...';
  }



  html =  '<div class="item item-exam item-exam-history '+ itemClass + ' animate">'+
     statusClass +
    '<div class="item-title" data-container="body" data-toggle="popover" data-trigger="hover"'+
    'data-placement="top" data-content="' + examName + '">'+
    examName+
    '</div>'+
    '<div class="item-row item-start-time">' +
    '                    <div class="item-label">开始时间：</div>' +
    '                    <div class="item-data"> '+ data.startTime + '</div>' +
    '                </div>'+
    '<div class="item-row item-end-time">' +
    '                            <div class="item-label">结束时间：</div>' +
    '                            <div class="item-data">'+ data.endTime +'</div>' +
    '                        </div>' +
    scoreClass + buttonClass;
  $(".body-wrapper .item-exam-wrapper").append(html);
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
