<template>
  <div class="viewFrameWork" :class="setFullOrMini" id="viewFrameWork">
    <Header></Header>
    <div class="viewFrameWork-main">
      <Side @fold="onClickFold"></Side>
      <Body></Body>
    </div>

    <div class="modal fade" id="userInfoModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-user-info" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">

            <div class="user-header">
              <div class="character">
                <div class="img-wrapper">

                  <img class="img character-img" :src="user.avatar == 'default.png'? '/static/avatar/default.png':user.avatar">
                </div>
                <div class="icon-capture" data-toggle="tooltip" data-placement="right" data-container="body" title="" data-original-title="150*200,小于100KB,png/jpg/jpeg/bmp">
                  <form id="characterForm" enctype="multipart/form-data" method="post" target="characterIframe" action="/account/user/upload_picture">
                    <i class="icon icon-p_personal_camera"></i>
                    <input type="file" name="picture" id="characterUpload">
                    <input type="hidden" name="account" :value="user.account">
                    <input type="hidden" name="companyId" :value="user.companyId">
                    <iframe name="characterIframe" id="characterIframe" class="hidden"></iframe>
                  </form>
                </div>
              </div>

              <div class="icon-operation icon-edit" id="userEditBtn">
                <i class="icon icon-p_personal_edit"></i>
              </div>

              <div class="icon-operation icon-cancel" id="cancelEditBtn">
                <i class="icon icon-p_personal_cancel"></i>
              </div>
              <div class="icon-operation icon-save" id="saveEditBtn">
                <i class="icon icon-p_personal_determine"></i>
              </div>

            </div>

            <div class="items">
              <form id="userInfoForm" class="user_info_form">
                <div class="item item-static">
                  <div class="item-label">账号：</div>
                  <div class="item-data">{{user.account}}</div>
                </div>
                <div class="item item-static">
                  <div class="item-label">部门：</div>
                  <div class="item-data">
                    <span class="item-data item_dept has_got">{{user.deptName}}</span>
                  </div>
                </div>
                <div class="item">
                  <div class="item-label">姓名：</div>
                  <div class="item-data">
                    <span class="item-value">{{user.userName}}</span>
                  </div>
                  <input class="item-input" type="text" name="user" :value="user.userName" placeholder="请输入姓名">
                  <i class="icon item-icon icon-m_exam_error"></i>
                </div>
                <div class="item">
                  <div class="item-label">性别：</div>
                  <div class="item-data" id="userSex">{{user.sex}}</div>
                  <div class="item-radio">
                    <label class="radio-inline">
                      <input type="radio" name="sex" value="1" :checked="user.sex == '男'? 1 : !1"> 男
                    </label>
                    <label class="radio-inline">
                      <input type="radio" name="sex" value="0" :checked="user.sex == '女'? 1 : !1"> 女
                    </label>
                  </div>
                </div>
                <div class="item">
                  <div class="item-label">手机：</div>
                  <div class="item-data">
                    <span class="item-value">{{user.phone}}</span>
                  </div>

                  <input class="item-input" type="text" name="tel" readonly="" :value="user.phone" placeholder="请输入手机号">
                  <i class="icon item-icon icon-m_exam_error"></i>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Header from '@/components/common/comthree/Header'
  import Side from '@/components/common/comthree/Side'
  import Body from './Body'
  import {mapState} from 'vuex'
  export default {
    name: 'ExamHistoryView',
    data(){
      return{
        flag:false
      }
    },
    methods:{
      onClickFold(){
        this.flag = !this.flag
      },
    },
    components:{Header,Side,Body},
    computed:{
      ...mapState({
        user: state => state.account.user
      }),
      setFullOrMini(){
        return this.flag? "sidebar-min":"sidebar-full"
      }
    },
  }
</script>
