
  var getStaticUrlPrefix = 'https://127.0.0.1:8081';
  var now_time_left = '';//返回距 1970年1月1日之间的毫秒数
  var firstVisit = true; //是否第一次进来
  var companyId = 180731;

  function checkBroswerWebKit(){
  var u = navigator.userAgent, app = navigator.appVersion;
  return u.indexOf('AppleWebKit') > -1;
}

  if(!checkBroswerWebKit()) {
  $(".viewFrameWork").addClass("active");
  $(".viewFrameWork .viewFrameWork-statusbar").addClass("active");
  $(".browserHint").slideToggle();
}
