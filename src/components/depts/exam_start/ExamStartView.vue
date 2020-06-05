<template>
  <div>
  <div class="main exam-mode">
    <Header></Header>
    <Body :paper-info="paperInfo"></Body>
    <Box></Box>
    <Nav></Nav>
    <Painting></Painting>
    <input type="hidden" class="had-save-mark">
  </div>
    <div class="left-side">
  <div class="numberCardModal" id="numberCardModal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-number-card" role="document">
      <div class="fold_btn" id="answercardFoldBtn"><i class="icon icons8-icon" data-toggle="tooltip" data-placement="top" data-container="body" title="收起" data-original-title="收起"></i></div>
      <div class="open_btn" id="answercardOpenBtn"><i class="icon icons8-icon-3" data-toggle="tooltip" data-placement="top" data-container="body" title="展开" data-original-title="展开"></i></div>
      <div class="modal-content">
        <div class="modal-header">
        </div>
        <div class="modal-body">
          <div class="title">
            <div class="title_border"></div>
            <div class="title_content">答题卡</div>
          </div>
          <div class="card-content-list">
            <div v-for="(testItem,testIndex) in (paperInfo == null? [] : paperInfo.children)" class="card-content" :key="testIndex">
              <div class="card-content-title">{{testItem.title + "(共" + testItem.questionNum + "题，合计" + testItem.totalScore + "分" + (testItem.lessChoiceConfirm?")":"，漏选错选不得分)")}}</div>
              <div class="box-list">
                  <a v-for="(qItem,qIndex) in testItem.children" :href="'#'+qItem.id" :key="qIndex">
                    <div  class="box normal-box question_cbox" :class="[qItem.userAnswer ? 's2' : 's1',qItem.marked? 'marked' : '']">
                      <span :class="['iconBox', 'currentThemeBackgroundColor', 'questions_' + qItem.id]" :questionsid="qItem.id" :num=" 'questions_' + qItem.id" :perscore="qItem.qscore">
                        {{qIndex + 1}}
                      </span>
                      <span class="icon-box question_marked icon-p_exam_tag_se"></span>
                    </div>
                  </a>
                  <!--<span class="box icon-box question_marked"></span>-->
              </div>
              <div class="split"></div>
            </div>

          </div>

        </div>
        <div class="modal-footer">
          <span class="box currentThemeBackgroundColor icon-box s2"></span>
          <span class="icon-label">已答</span>
          <span class="box icon-box s1"></span>
          <span class="icon-label">未答</span>
          <span class="box icon-box marked icon-p_exam_tag_se"></span>
          <span class="icon-label">标记</span>
        </div>
        <div v-if="examInfo != null">
          <input type="hidden" name="examResultId" :value="examInfo.examResultId">
          <input type="hidden" name="setFullScreen" :value="!(examInfo.blurCount && examInfo.switchScreenSecond) ? '1' : '0'">
          <input type="hidden" name="blurCount" :value="examInfo.blurCount">
          <input type="hidden" name="switchScreenSecond" :value="examInfo.switchScreenSecond">
          <input type="hidden" name="exitSwitchStatus" :value="examInfo.exitSwitchStatus">
          <input type="hidden" name="answerTimeLeft" :value="examInfo.answerTimeLeft">
          <input type="hidden" name="cuttingScreenCount" :value="examInfo.cuttingScreenCount">
          <input type="hidden" name="examTimeRestrict" :value="examInfo.examTimeRestrict">
          <input type="hidden" name="setMinExamTime" :value="examInfo.setMinExamTime">
          <input type="hidden" name="minExamTime" :value="examInfo.minExamTime">
          <input type="hidden" name="examTimes" :value="examInfo.examTimes">
          <input type="hidden" name="restTime" :value="examInfo.restTime">
        </div>
      </div>
    </div>
  </div>
    </div>
  </div>
</template>

<script>
  import Header from './Header'
  import Side from './Side'
  import Body from './Body'
  import Box from './Box'
  import Nav from './Nav'
  import Painting from './Painting'
  import {mapState} from 'vuex'
  export default {
    name: 'ExamStartView',
    components:{Header,Side,Body,Box,Nav,Painting},
    data(){
      return{
        paperInfo:null,
        examInfo:null,
        examId:""
      }
    },
    computed:{
      ...mapState({
        user: state => state.account.user
      }),
    },
    methods:{
      getQueryString:function(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
          return unescape(r[2]);
        }
        return '';
      },
    },
    async created(){
      let that = this
      this.examId = window.location.href.split("#/")[1]
      console.log(1)
      await this.$post("/api/exam/get_paper_info",{
        account:that.user.account,
        companyId:that.user.companyId,
        examId:that.examId
      }).then(
        (res)=>{
          that.paperInfo = res.data.bizContent;
          // console.log(that.paperInfo)
          if(res.data.success){
            if(res.data.code == '233'){
              window.location.href="/admin/error/examLimit";
            }
          }else{
            window.location.href="/admin/error/examPerm";
          }
        }
      )
      console.log(2)
      await this.$post("/api/exam/get_examing_info",{
        account:that.user.account,
        companyId:that.user.companyId,
        examId:that.examId
      }).then(
        (res)=>{
          that.examInfo = res.data.bizContent;
          // console.log(that.paperInfo)
          if(res.data.success){
            if(res.data.code == '233'){
              window.location.href="/admin/error/examLimit";
            }
          }else{
            window.location.href="/admin/error/examPerm";
          }
        }
      )
      console.log(3)
      this.$nextTick(function () {
        console.log(4)
        let script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = '/static/depts/exam/js/exam_answer.js'
        document.getElementsByTagName('body')[0].appendChild(script)
      })
    },
  }
</script>
