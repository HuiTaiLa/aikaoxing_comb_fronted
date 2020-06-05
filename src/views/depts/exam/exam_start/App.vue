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


    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = '/static/common/js/exam_base.js'
    document.getElementsByTagName('body')[0].appendChild(script)//

    // let script3 = document.createElement('script')
    // script3.type = 'text/javascript'
    // script3.src = '/static/depts/exam/js/exam_answer.js'
    // document.getElementsByTagName('body')[0].appendChild(script3)
  }
}
</script>

