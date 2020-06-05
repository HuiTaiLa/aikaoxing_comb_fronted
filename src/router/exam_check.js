import Vue from 'vue'
import Router from 'vue-router'
import db from 'utils/localstorage'
import request from 'utils/request'
import ExamCheckView from '@/components/depts/exam/exam_check/ExamCheckView'

Vue.use(Router)

let constRouter = [
  {
    path: '/',
    name: '历史试卷查看页面',
    component: ExamCheckView
  },
]

let router = new Router({
  routes: constRouter
})

let asyncRouter
let jumpView = "view:depts/exam/exam_check"
// 导航守卫，渲染动态路由
router.beforeEach((to, from, next) => {
  let token = db.get('USER_TOKEN')
  let user = db.get('USER')
  let permissions = get('PERMISSIONS')
  if (token.length && user&& permissions) {//一旦token过期，路由将重新构建
    if(!permissions.includes(jumpView)){
      next(false)
      window.location.href = '/admin/login'
    } else {
      next()
    }
  } else {
    next(false)
    window.location.href = "/admin/login"
  }
})

function go (to, next) {
  // asyncRouter = filterAsyncRouter(asyncRouter)
  // router.addRoutes(asyncRouter)
  next({...to, replace: true})
}

function save (name, data) {
  localStorage.setItem(name, JSON.stringify(data))
}

function get (name) {
  return JSON.parse(localStorage.getItem(name))
}

// function filterAsyncRouter (routes) {
//   // console.log("ok")
//   return routes.filter((route) => {
//     let component = route.component
//     if (component) {
//       switch (route.component) {
//         case 'MenuView':
//           route.component = MenuView
//           break
//         case 'PageView':
//           route.component = PageView
//           break
//         case 'EmptyPageView':
//           route.component = EmptyPageView
//           break
//         case 'HomePageView':
//           route.component = HomePageView
//           break
//         case 'HomeView':
//           route.component = HomeView
//           break
//         default:
//           route.component = view(component)
//       }
//       if (route.children && route.children.length) {
//         route.children = filterAsyncRouter(route.children)
//       }
//       return true
//     }
//   })
// }

// function view (path) {
//   return function (resolve) {
//     import(`@/views/${path}.vue`).then(mod => {
//       resolve(mod)
//     })
//   }
// }

export default router
