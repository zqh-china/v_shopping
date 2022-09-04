import Vue from 'vue'
// 按需导入时用到的组件 el-form el-input
import { Button, Form, FormItem, Input, Message } from 'element-ui'

// 将组件注册为全局可用的组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 全局挂在Message
Vue.prototype.$message = Message
