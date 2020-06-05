<template>
      <router-view/>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
    }
  },

  created () {

    let _this = this

    let script0 = document.createElement('script')
    script0.type = 'text/javascript'
    script0.src = '/static/depts/exam/js/initial_ExamData.js'
    document.getElementsByTagName('body')[0].appendChild(script0)

    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = '/static/common/js/exam_base.js'
    document.getElementsByTagName('body')[0].appendChild(script)

    let script1 = document.createElement('script')
    script1.type = 'text/javascript'
    script1.src = '/static/common/js/user.js'
    document.getElementsByTagName('body')[0].appendChild(script1)

    let script2 = document.createElement('script')
    script2.type = 'text/javascript'
    script2.src = '/static/depts/exam/js/initial_judge.js'
    document.getElementsByTagName('body')[0].appendChild(script2)

    let script3 = document.createElement('script')
    script3.type = 'text/javascript'
    script3.src = '/static/depts/exam/js/exam_Show.js'
    document.getElementsByTagName('body')[0].appendChild(script3)
  }
}
</script>

