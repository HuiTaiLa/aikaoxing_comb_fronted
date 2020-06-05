<template>
  <div class="main show_support">

    <div class="header-wrapper">
      <div class="logo-wrapper">
        <a href="/depts/exam" title="logo">
          <img class="icon-logo logo-ksx" src="/static/images/logo.jpg">
        </a>
      </div>
      <div class="exam-name ellipsis">{{resultInfo.examName}}</div>
      <div class="user ellipsis">
        <i class="icon icon-a_nav_my"></i>
        {{user.userName}}
      </div>


      <a type="button" class="btn btn-default back-icon logout" href="#" data-processid="0">
        <i class="icon icon-a_btn_return btn-icon-left"></i>
        返回
      </a>

    </div>

    <img class="exam-picture-right" src="https://s5.kaoshixing.com/static/exam/images/competition/p_img_decorate1.png" alt="">
    <div class="content">
      <div class="exam-result">

        <div class="exam-result-top clearfix">
          <div class="exam-common" style="left: 0;">

          </div>
          <div class="exam-user-info exam-common">
            <p class="exam-user-header">

              <img :src="user.avatar == 'default.png'? '/static/avatar/default.png':user.avatar" alt="">

            </p>
            <p class="exam-user-name">{{user.userName}}</p>
          </div>
          <div class="exam-packet exam-common">


          </div>
        </div>


        <div class="exam-result-score"  v-if="resultInfo.releaseWaySwitch == 1 || (resultInfo.releaseWaySwitch == 2 && resultInfo.examCorrectd)">
                                        <span class="star-big">
                                            <img src="https://s2.kaoshixing.com/static/exam/images/competition/p_img_star1.png" alt="">
                                        </span>
          <span class="score">{{Number(resultInfo.examGrade).toFixed(2)}}</span>
          <span>分</span>
          <span class="star-small">
                                            <img src="https://s3.kaoshixing.com/static/exam/images/competition/p_img_star2.png" alt="">
                                        </span>
        </div>

        <p class="exam-result-remark">
          <span>{{resultInfo.setReleaseNotice}}</span>

        </p>

        <div class="exam-result-analyze" v-if="resultInfo.releaseWaySwitch == 1 || (resultInfo.releaseWaySwitch == 2 && resultInfo.examCorrectd)">

          <div class="exam-result-analyze-common">
            <p class="exam-result-percentage">
              {{resultInfo.examGrade/resultInfo.paperTotalScore}}%
            </p>
            <p class="exam-result-percentage-icon">
              <img src="https://s0.kaoshixing.com/static/exam/images/competition/p_icon_accuracy_rate.svg" alt="">
              <span>正确率</span>
            </p>
          </div>

        </div>


      </div>
      <div class="exam-result-right">

        <div class="exam-handle-box">
          <!--

          -->

          <div class="exam-look-analye"  v-if="(resultInfo.setAllowPaper == 0) && ((resultInfo.releaseWaySwitch == 1) || (resultInfo.releaseWaySwitch == 2 && resultInfo.examCorrectd))">
            <a :href="'/depts/exam/exam_check?examInfoId=' + resultInfo.id + '&examResultsId=' + examResultsId">查看试卷</a>
          </div>

          <div class="exam-again-test" v-if="resultInfo.examTimesRestrict">
            <a :href="'/depts/exam/exam_start/#/' + resultInfo.id">再考一次</a>
          </div>

        </div>
      </div>

      <div class="ksx_support">爱考星<div>提供技术支持</div></div>

    </div>
    <img class="exam-picture-left" src="https://s4.kaoshixing.com/static/exam/images/competition/p_img_decorate2.png" alt="">
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  export default {
    name: 'InquireView',
    data(){
      return{
        resultInfo:{},
        examResultsId:""
      }
    },
    computed:{
      ...mapState({
        user: state => state.account.user
      }),
    },

    methods:{
      // 获取url中参数
      getQueryString: function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
              return unescape(r[2]);
            }
            return '';
          },
    },
    created(){
      let that = this
      this.examResultsId = this.getQueryString("examResultsId");
      this.$post("/api/exam/get_result_info",{
        account:that.user.account,
        companyId:that.user.companyId,
        examResultsId:that.examResultsId
      }).then(
        (res)=>{
          that.resultInfo = res.data.bizContent;
          // console.log(that.resultInfo)
        }
      )
    },
  }
</script>
