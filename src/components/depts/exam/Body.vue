<template>
  <div class="viewFrameWork-body">
    <!-- loading -->
    <Loading></Loading>
    <div class="header-wrapper">
      <div class="header-title">
        <div class="header-tab active">
          <a href="/depts/exam">当前考试</a>
        </div>
        <div class="header-tab">
          <a href="/depts/exam/history">历史考试</a>
        </div>
        <!--<div class="header-tab">-->
          <!--<a href="/depts/exam/wrong_topic">错题本</a>-->
        <!--</div>-->
      </div>
      <div class="header-filter">
        <div class="filter-item" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span id="currentClassify">筛选</span>
          <i class="icon icon-a_arrow_down"></i>
        </div>

        <div class="filterContainer dropdown-menu bottom panel-classify" aria-labelledby="dLabel">
          <div class="condition examStyle">
            <div class="title">考试分类：</div>
            <div class="options">
              <a href="javascript:void(0);" data-id="0" class="menu-item active">全部</a>

            </div>
          </div>
          <div class="condition startTimeSort">
            <div class="title">时间：</div>
            <div class="options">
              <a href="javascript:void(0);" class="menu-item" data-id="asc">按开始时间正序排序</a>
              <a href="javascript:void(0);" class="menu-item" data-id="desc">按开始时间倒序排序</a>
            </div>
          </div>
          <div class="condition status">
            <div class="title">状态：</div>
            <div class="options">
              <a href="javascript:void(0);" class="menu-item" data-id="0">进行中</a>
              <a href="javascript:void(0);" class="menu-item" data-id="1">可参加</a>
              <a href="javascript:void(0);" class="menu-item" data-id="2">未开始</a>
            </div>
          </div>
          <!--<div class="condition setProcess">-->
            <!--<div class="title">关联任务：</div>-->
            <!--<div class="options">-->
              <!--<a href="javascript:void(0);" class="menu-item" data-id="1">已关联任务</a>-->
              <!--<a href="javascript:void(0);" class="menu-item" data-id="0">未关联任务</a>-->
            <!--</div>-->
          <!--</div>-->
          <div class="buttonsContainer">
            <button class="btn btn-gray resetFilterBtn">重置</button>
            <button class="btn btn-primary changeFilterBtn">确定</button>
          </div>
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
    // data(){
    //   return{
    //     examInfos:[],
    //   }
    // },
    // computed:{
    //   ...mapState({
    //     user: state => state.account.user
    //   }),
    // },
    // created(){
    //   let that = this
    //   this.$post("/api/exam/current_exam",{
    //     account:that.user.account,
    //     companyId:that.user.companyId
    //   }).then(
    //     (res)=>{
    //       that.examInfos = res.data.bizContent;
    //       // console.log(that.paperInfo)
    //     }
    //   )
    // },
  }
</script>
