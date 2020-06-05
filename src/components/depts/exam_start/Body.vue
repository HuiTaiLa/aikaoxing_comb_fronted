<template>
  <div class="body-wrapper">
    <div class="body paper">

      <div v-for="(testItem,testIndex) in  paperInfo == null ? [] : paperInfo.children" class="questions" :key="testIndex">
        <div class="questions-title">{{testItem.title + "(共" + testItem.questionNum + "题，合计" + testItem.totalScore + "分" + (testItem.lessChoiceConfirm?")":"，漏选错选不得分)")}}</div>
        <div class="questions-content">
          <div :id="qItem.id" :data-id="qItem.id" data-commit="false" v-for="(qItem,qIndex) in testItem.children" class="question-content" :key="qIndex">
            <div class="question-operation operation-icon icon-mark" data-toggle="tooltip" data-placement="top" data-container="body" :title="qItem.marked? '取消标记' : '标记本题'" :data-original-title="qItem.marked? '取消标记' : '标记本题'">
              <i class="icon" :class="qItem.marked? 'icon-p_exam_tag_se' : 'icon-p_exam_tag_de'"></i>
            </div>
            <div class="exam-question">
              <span class="question-index ellipsis">{{qIndex + 1 + "."}}</span>
              <div v-html="qItem.question + '(' + qItem.qscore + '分)'"></div>
            </div>
            <div v-if="qItem.type == 1" class="answers">
              <div v-for="(option,key) in Array.from({length:qItem.tab_num},(x,y)=>y) " :class="['select', 'single-select',  String.fromCharCode('a'.charCodeAt()+option) + '.' ]" :key="key">
                <input :id="String(qItem.id) + (key + 1)" type="radio" class="radioOrCheck hidden" :checked="String.fromCharCode('A'.charCodeAt()+option) == qItem.userAnswer? 1 : !1" :class="[ String(qItem.id) + (key + 1)]" :data-name="'key' + (key + 1)" :data-keyid="String(qItem.id) + (key + 1)">
                <label>
                  <span class="select-icon"><i class="icon icon-m_exam_correct"></i></span>
                  <span class="words"><span class="words-option">{{String.fromCharCode('A'.charCodeAt()+option) + '.'}}</span><div v-html="qItem['answer' + (option + 1)]"></div></span>
                </label>
              </div>
            </div>
            <div v-else-if="qItem.type == 2" class="answers">
              <div v-for="(option,key) in Array.from({length:qItem.tab_num},(x,y)=>y) " :class="['select', 'multi-select',  String.fromCharCode('a'.charCodeAt()+option) + '.' ]" :key="key">
                <input :id="String(qItem.id) + (key + 1)" type="checkbox" class="radioOrCheck hidden" :checked="qItem.userAnswer && qItem.userAnswer.indexOf(String.fromCharCode('A'.charCodeAt()+option)) != -1? 1 : !1" :class="[ String(qItem.id) + (key + 1)]" :data-name="'key' + (key + 1)" :data-keyid="String(qItem.id) + (key + 1)">
                <label>
                  <span class="select-icon"><i class="icon icon-m_exam_correct2"></i></span>
                  <span class="words"><span class="words-option">{{String.fromCharCode('A'.charCodeAt()+option) + '.'}}</span><div v-html="qItem['answer' + (option + 1)]"></div></span>
                </label>
              </div>
            </div>
            <div v-else-if="qItem.type == 3" class="answers">
              <div class="select judge rt">
                <input :id="String(qItem.id) + 1" type="radio" class="radioOrCheck hidden" :checked="'正确' == qItem.userAnswer? 1:!1" :class="[ String(qItem.id) + 1]" value="1" data-name="key1" :data-keyid="String(qItem.id) + 1">
                <label>
                  <span class="select-icon"><i class="icon icon-m_exam_correct"></i></span>
                  <span class="words">正确</span>
                </label>
              </div>
              <div class="select judge wg">
                <input :id="String(qItem.id) + 2" type="radio" class="radioOrCheck hidden" :checked="'错误' == qItem.userAnswer? 1:!1" :class="[ String(qItem.id) + 2]" value="0" data-name="key2" :data-keyid="String(qItem.id) + 2">
                <label>
                  <span class="select-icon"><i class="icon icon-m_exam_error"></i></span>
                  <span class="words">错误</span>
                </label>
              </div>
            </div>
            <div v-else-if="qItem.type == 4" class="answers">
              <dd v-for="(option,key) in Array.from({length:qItem.tab_num},(x,y)=>y) " class="filled" :key="key">
                <div class="input-group">
                  <span class="input-group-addon">{{option + 1}}</span>
                  <div class="expanding-wrapper" style="position:relative">
                    <textarea  :name=" 'key' + (key + 1)" data-type="4"
                     class="keyFill form-control expanding"
                     onpaste="return false"
                     oncopy="return false"
                     style="margin: 0px; box-sizing: border-box; width: 100%; position: absolute; top: 0px; left: 0px; height: 100%; resize: none; overflow: auto;">{{(qItem.userAnswer && (option < qItem.userAnswer.split("|").length)) ? qItem.userAnswer.split("|")[option] : ''}}</textarea>
                    <pre class="expanding-clone"
                         style="margin: 0px; box-sizing: border-box; width: 100%; display: block; border: 1px solid; visibility: hidden; min-height: 28px; white-space: pre-wrap; line-height: 20px; text-decoration: none solid rgb(144, 144, 164); font-size: 14px; font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; word-break: normal; padding: 4px 10px;"><span></span><br>
                    </pre>
                  </div>

                </div>
              </dd>
            </div>
            <div v-else-if="qItem.type == 5" class="answers">
              <div class="filled">

                  <div class="keyCloze wangEditor-txt" data-type="5" :id="'keyCloze_' + qItem.id"
                       style="min-height: 300px; height: 269px;" contenteditable="true" v-html="qItem.userAnswer">
                  </div>
                <input type="hidden" name="key1">
                <input type="file" name="uploadFile" class="wang-upload-file hidden">
                <div class="file-list">
                </div>
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
</template>

<script>
  import {mapState} from 'vuex'
  export default {
    name: 'Body',
    props: ['paperInfo'],
    computed:{
      ...mapState({
        user: state => state.account.user
      }),
    },

  }
</script>
