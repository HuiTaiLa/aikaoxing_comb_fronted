<template>
  <div class="wrapper">
    <div class="header-wrapper hidden-xs">
      <div class="logo-wrapper">
        <a href="/depts/exam" title="logo">
          <img class="icon-logo logo-ksx" src="/static/images/logo.jpg">
        </a>
      </div>
      <div class="user ellipsis">
        <i class="icon icon-p_top_user"></i>
        {{user.userName}}
      </div>
      <a type="button" class="btn btn-default logout" id="logoutBtn">
        <i class="icon icon-a_btn_sign_out btn-icon-left"></i>
        退出
      </a>
    </div>
    <div class="m-back-icon">
      <a class="m_logout" href="javascript:;" style="display: block;">
        <i class="icon icon-m_head_back"></i>
      </a>
    </div>
    <div class="panel-block ">
      <div class="icon-logo visible-xs">
        <img src="https://cdnoss.kaoshixing.com/ksxing_static/logo.png">
      </div>
      <div class="title">{{examInfo.examName}}</div>
      <div class="content">
        {{examInfo.beforeAnswerNotice}}
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary btn-fix btn-w-120 btn-h-40" id="startExamBtn" data-setiprange="0" :data-id="examId" data-iscapture="0">开始</button>
      </div>

      <!--<div v-if="examInfo.showRankingList == 1" class="examinee">-->
        <!--<p class="examinee-title">-->
          <!--<span class="examinee-underline"></span>-->
          <!--<span>排行榜</span>-->
          <!--<span class="examinee-underline"></span>-->
        <!--</p>-->
        <!--<p class="examinee-label">-->
          <!--<span>名次</span>-->
          <!--<span>用户名</span>-->
          <!--<span>账号</span>-->

          <!--<span>分数</span>-->
        <!--</p>-->
        <!--<div class="examinee-rank">-->
          <!--<ul>-->
            <!--<li class="examinee-rank-list active">-->
                                <!--<span class="user-rank-icon ">-->
                                        <!--<img src="https://s0.kaoshixing.com/static/exam/images/competition/p_icon_first.svg" alt="">-->
                                <!--</span>-->
              <!--<span class="user-name">-->
                                  <!--{{user.userName}}-->
                                <!--</span>-->


              <!--<span class="user-account">-->
                                          <!--18-->
                                            <!--***-->
                                          <!--81-->
                                    <!--</span>-->

              <!--<span class="user-score">-->
                                            <!--0.0-->
                                    <!--</span>-->

            <!--</li>-->

          <!--</ul>-->
        <!--</div>-->
      <!--</div>-->
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  export default {
    name: 'NoticeView',
    computed:{
      ...mapState({
        user: state => state.account.user
      }),
    },
    data(){
      return{
        examInfo:{},
        examId:""
      }
    },
    created(){
      let that = this
      this.examId = window.location.href.split("#/")[1]
      this.$post("/api/exam/get_examing_notice",{
        account:that.user.account,
        companyId:that.user.companyId,
        examId:that.examId
      }).then(
        (res)=>{
          that.examInfo = res.data.bizContent;

        }
      )
    },
  }
</script>
