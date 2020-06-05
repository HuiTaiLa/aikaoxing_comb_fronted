<template>
<div>
  <div class="main">
    <div class="header-wrapper">

      <div class="logo-wrapper">
        <a href="/depts/exam/" title="logo" id="companyLogo"><img class="icon-logo logo-ksx" src="/static/images/logo.jpg"></a>
      </div>


      <div class="exam-name ellipsis">我的收藏</div>
      <div class="user ellipsis">
        <i class="icon icon-a_nav_my"></i>
        {{user.userName}}
      </div>

      <a type="button" class="btn btn-default logout" id="logoutBtn">
        <i class="icon icon-a_btn_sign_out btn-icon-left"></i>
        退出
      </a>
    </div>

    <div class="body-wrapper">
      <div class="body paper">

        <div v-if="resultInfo == null || resultInfo.length == 0" class="content-empty">
          <div class="empty-header">
            <img class="img" src="https://s1.kaoshixing.com/static/base/images/empty-page.png">
          </div>
          <div class="empty-title">空空荡荡的～</div>
        </div>

        <div class="questions">
          <div class="questions-content">
            <div :id="qItem.id" :data-id="qItem.id" data-commit="true" v-for="(qItem,qIndex) in resultInfo" class="question-content" :key="qIndex">
              <div class="question-operation operation-icon icon-collected" data-type="1" data-toggle="tooltip" data-placement="top" data-container="body" title="取消收藏" data-original-title="取消收藏">
                <i class="icon icon-a_btn_delete"></i>
              </div>
              <div class="exam-question">
                <span class="question-index ellipsis">{{qIndex + 1 + "."}}</span>
                <div v-html="qItem.question + '(' + qItem.qscore + '分)'"></div>
              </div>
              <div v-if="qItem.type == 1" class="answers">
                <div v-for="(option,key) in Array.from({length:qItem.tab_num},(x,y)=>y) " :class="['select', 'single-select',  String.fromCharCode('a'.charCodeAt()+option) + '.' ]" :key="key">
                  <input :id="String(qItem.id) + (key + 1)" type="radio" :disabled="String.fromCharCode('A'.charCodeAt()+option) == qItem.userAnswer? !1 : 1"  class="radioOrCheck hidden" :class="[String(qItem.id) + (key + 1)]" :data-name="'key' + (key + 1)"
                         :data-keyid="String(qItem.id) + (key + 1)" data-type="1" :name="'keyChk_questions_' + qItem.id + '_'">
                  <label :for="String(qItem.id) + (key + 1)">
                    <span class="select-icon"><i class="icon icon-m_exam_correct"></i></span>
                    <span class="words"><span class="words-option">{{String.fromCharCode('A'.charCodeAt()+option) + '.'}}</span><div v-html="qItem['answer' + (option + 1)]"></div></span>
                  </label>
                </div>
              </div>
              <div v-else-if="qItem.type == 2" class="answers">
                <div v-for="(option,key) in Array.from({length:qItem.tab_num},(x,y)=>y) " :class="['select', 'multi-select',  String.fromCharCode('a'.charCodeAt()+option) + '.' ]" :key="key">
                  <input :id="String(qItem.id) + (key + 1)" type="checkbox" :disabled=" qItem.userAnswer && qItem.userAnswer.indexOf(String.fromCharCode('A'.charCodeAt()+option)) != -1? !1 : 1" class="radioOrCheck hidden" :class="[ String(qItem.id) + (key + 1)]" :data-name="'key' + (key + 1)"
                         :data-type="2" :name="'keyChk_questions_' + qItem.id + '_'"
                         :data-keyid="String(qItem.id) + (key + 1)">
                  <label :for="String(qItem.id) + (key + 1)">
                    <span class="select-icon"><i class="icon icon-m_exam_correct2"></i></span>
                    <span class="words"><span class="words-option">{{String.fromCharCode('A'.charCodeAt()+option) + '.'}}</span><div v-html="qItem['answer' + (option + 1)]"></div></span>
                  </label>
                </div>
              </div>
              <div v-else-if="qItem.type == 3" class="answers">
                <div class="select judge rt">
                  <input :id="String(qItem.id) + 1" type="radio" :disabled="'正确' == qItem.userAnswer? !1 : 1" class="radioOrCheck hidden" :class="[ String(qItem.id) + 1]" value="1" data-name="key1"
                         :data-keyid="String(qItem.id) + 1" data-type="3" :name="'keyJudge_questions_'+qItem.id + '_'">
                  <label :for="String(qItem.id) + 1">
                    <span class="select-icon"><i class="icon icon-m_exam_correct"></i></span>
                    <span class="words">正确</span>
                  </label>
                </div>
                <div class="select judge wg">
                  <input :id="String(qItem.id) + 2" type="radio" :disabled="'错误' == qItem.userAnswer? !1 : 1" class="radioOrCheck hidden" :class="[String(qItem.id) + 2]" value="0" data-name="key2"
                         :data-keyid="String(qItem.id) + 2" :name="'keyJudge_questions_'+qItem.id + '_'">
                  <label :for="String(qItem.id) + 2">
                    <span class="select-icon"><i class="icon icon-m_exam_error"></i></span>
                    <span class="words">错误</span>
                  </label>
                </div>
              </div>
              <div v-else-if="qItem.type == 4" class="answers">
                <dd v-for="(option,key) in Array.from({length:qItem.tab_num},(x,y)=>y) " class="filled" :key="key">
                  <div class="input-group">
                    <span class="input-group-addon">{{option + 1}}</span>
                    <textarea :name=" 'key' + (key + 1)" disabled data-type="4" class="keyFill form-control expanding" onpaste="return false" oncopy="return false">
                      {{ qItem.userAnswer && (option < qItem.userAnswer.split("|").length ? qItem.userAnswer.split("|")[option] : '')}}
                    </textarea>
                  </div>
                </dd>
              </div>
              <div v-else-if="qItem.type == 5" class="answers">
                <div class="filled">
                  <div class="keyCloze wangEditor-txt" data-type="5" :id="'keyCloze_' + qItem.id"
                       style="min-height: 300px" v-html="qItem.userAnswer">
                  </div>
                  <input type="hidden" name="key1">
                  <input type="file" name="uploadFile" class="wang-upload-file hidden">
                  <div class="file-list">
                  </div>
                </div>
              </div>
              <div class="analysis">
                <div class="analysis-row" v-if="qItem.type == 1 || qItem.type == 2 || qItem.type == 3">
                  <div class="analysis-title">学员答案：</div>
                  <div class="analysis-content question-com-answer" :class="qItem.rightStatus == 1?'right':'error'">{{qItem.type == 4?qItem.userAnswer.replace(/[&]+/g, '或').replace(/[\|]+/g, '，') : qItem.userAnswer}}</div>
                </div>
                <div class="analysis-row">
                  <div class="analysis-title">正确答案：</div>
                  <div class="analysis-content question-ans-right" v-html="qItem.type == 4?qItem.key.replace(/[&]+/g, '或').replace(/[\|]+/g, '，') : qItem.key"></div>
                </div>
                <div class="analysis-row">
                  <div class="analysis-title">解释说明：</div>
                  <div class="analysis-content question-analysis textalign-justify display-block" v-html="qItem.analysis"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>


      <div class="tech-support">
        <span class="company-name">爱考星</span>
        提供技术支持
      </div>

    </div>

    <div class="nav-wrapper">

      <a href="/depts/exam/history" class="btn btn-primary btn-nav">返回</a>
    </div>

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
            <div class="card-content">
              <div class="card-content-title">收藏题信息</div>
              <div class="box-list">
                <div v-for="(qItem,qIndex) in resultInfo" class="box normal-box s1" :key="qIndex">
                  <a  :href="'#'+qItem.id" class="iconBox" :class="'questions_' + qItem.id" :questionsid="qItem.id">
                    {{qIndex + 1}}
                  </a>
                </div>
              </div>
              <div class="split"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</div>
</template>

<script>
  import {mapState} from 'vuex'
  export default {
    name: 'FavoriteView',
    data(){
      return{
        resultInfo:null,
      }
    },
    computed:{
      ...mapState({
        user: state => state.account.user
      }),
    },
    created(){
      let that = this;
      this.$post("/api/exam/get_favorite_info",{
        account:that.user.account,
        companyId:that.user.companyId
      }).then(
        (res)=>{
          that.resultInfo = res.data.bizContent;
        }
      )
    },
  }
</script>
