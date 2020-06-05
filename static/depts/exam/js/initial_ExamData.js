
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
  // these are global constant
  var companyId = user.companyId; //公司id
  //微信绑定url
  var weBindUrl = 'https://open.weixin.qq.com/connect/qrconnect?appid=wx3dbf3a23e8456f1a&redirect_uri=https://www.kaoshixing.com/login/account/personal_center_wechat_bind/11564550&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect';
  var userId = user.userId;

  $.ajax({
  url:'/api/exam/number_hint',
  type:'POST',
    dataType:"json",
    data:{
      account:user.account,
      companyId:user.companyId
    },
  success:function(data){
  // var data = JSON.parse(res);
  var exam = data.bizContent.exam > 9 ? '9+' : data.bizContent.exam;
  var course = data.bizContent.course > 9 ? '9+' : data.bizContent.course;
  var live = data.bizContent.live > 9 ? '9+' : data.bizContent.live;
  var process = data.bizContent.process > 9 ? '9+' : data.bizContent.process;

  common(exam,'exam')
  common(course,'course')
  common(process,'process')
  common(live,'live')


}
});

  // 学员积分
//   $.ajax({
//   url:'/public/get_user_info/'+userId,
//   type:'GET',
//   dataType: "json",
//   success:function(res){
//   $('.exam-point-score-top span').text(res.bizContent.userPoint);//学员积分
//   $('#scorePointTxt').text(res.bizContent.userPoint);//学员积分
// }
// });


  function common(target,name) {

  if(target === 0){

  $('.'+name+'-num-box').hide()
}else{

  $('.'+name+'-num-box').text(target).show();
}
}

  $('.sidebar-nav .nav-item').each(function() { //根据导航菜单名的字数调整消息数字的位置
  var font_size=$(this).find('a').attr('title').length;//字数
  var left_px=38+18*font_size; //每个字数大约偏移18px，最初偏移为38px;
  $(this).find('.show-num').css('left',left_px.toString()+'px');
});

  //请求部门
//   $("#userInfoBtn").click(function (e) {
//   e.stopPropagation();
//   e.preventDefault();
//   var dep=$("#userInfoForm .item-data.item_dept");
//   if(!dep.hasClass('has_got'))
//   $.ajax({
//   type:'GET',
//   url:'/api/dept/get_department_name?account=' + user.account + "&companyId=" + user.companyId,
//   success:function(mesg){
//   $("#userInfoForm .item-data.item_dept").text(mesg.replace(/"/g,''));
//   dep.addClass('has_got');
// },
// });
// })
