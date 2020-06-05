<template>
  <div class="viewFrameWork-body">
    <!-- loading -->
    <Loading></Loading>
    <div class="header-wrapper">
      <div class="header-title">
        <div class="header-tab">
          <a href="/depts/exam">当前考试</a>
        </div>
        <div class="header-tab active">
          <a href="/depts/exam/history">历史考试</a>
        </div>
      </div>
      <div class="header-filter">
        <div class="filter-item">
          <a href="/depts/exam/question/favorite">我的收藏</a>
        </div>
      </div>
    </div>
    <div class="split"></div>

    <div class="body-wrapper">
      <div class="item-wrapper item-exam-wrapper clearfix">
        <div class="macrosEmpty">

          <div class="content-empty">
            <div class="empty-header">
              <img class="img" src="https://s1.kaoshixing.com/static/base/images/empty-page.png">
            </div>
            <div class="empty-title">空空荡荡的～</div>
          </div>
        </div>
      </div>
      <nav class="pagination-middle">
        <ul class="pagination pagination">
          <li class="opt toFirstPage"><a class="first" href="javascript:void(0);"><i class="icon icon-a_first_page"></i></a></li>
          <li class="opt toPrevPage active"><a class="prev" href="javascript:void(0);"><i class="icon icon-a_previous_page"></i></a></li>

          <li class="opt toNextPage active disabled"><a class="next" href="javascript:void(0);"><i class="icon icon-a_next_page"></i></a></li>
          <li class="opt toLastPage disabled"><a class="last" href="javascript:void(0);"><i class="icon icon-a_last_page"></i></a></li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
  import Loading from './Loading'
  import {mapState} from 'vuex'
  export default {
    name: 'Body',
    components:{
      Loading,
    },

  }
</script>
