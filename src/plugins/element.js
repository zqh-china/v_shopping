import Vue from 'vue'
// 按需导入时用到的组件 el-form el-input
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  Submenu,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Table,
  TableColumn,
  Row,
  Col,
  Tag,
  Tooltip,
  Pagination,
  Switch,
  Dialog
} from 'element-ui'

// 将组件注册为全局可用的组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Row)
Vue.use(Col)
Vue.use(Tag)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Switch)
Vue.use(Dialog)
// 全局挂在Message
Vue.prototype.$message = Message
