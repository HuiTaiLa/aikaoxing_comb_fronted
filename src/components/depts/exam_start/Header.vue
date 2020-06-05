<template>
  <div class="header-wrapper">
    <div class="logo-wrapper">
      <a href="/depts/exam" title="logo">
        <img class="icon-logo logo-ksx" src="/static/images/logo.jpg">
      </a>
    </div>
    <div class="exam-name ellipsis">{{user.account}}</div>
    <div class="user ellipsis">
      <i class="icon icon-a_nav_my"></i>
      {{user.userName}}
    </div>

    <a type="button" class="btn btn-default logout" id="logoutBtn">
      <i class="icon icon-a_btn_sign_out btn-icon-left"></i>
      退出
    </a>

  </div>
</template>
<script>
  import {mapState} from 'vuex'
  export default {
    name: 'Header',
    computed:{
      ...mapState({
        user: state => state.account.user
      }),
    },
  }
</script>
