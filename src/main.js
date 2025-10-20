import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vant UI
import {
  Badge,
  Button,
  Card,
  Cell,
  CellGroup,
  Collapse,
  CollapseItem,
  Dialog,
  Divider,
  Empty,
  Field,
  Form,
  Grid,
  GridItem,
  Icon,
  List,
  Loading,
  NavBar,
  NoticeBar,
  Picker,
  Popup,
  PullRefresh,
  Search,
  Skeleton,
  Swipe,
  SwipeCell,
  SwipeItem,
  Switch,
  Tab,
  Tabbar,
  TabbarItem,
  Tabs,
  Tag,
  Toast,
  Uploader,
  Image as VanImage,
} from 'vant'
import 'vant/lib/index.css'

// 全局样式
import './styles/global.css'
// UnoCSS runtime (virtual CSS)
import 'virtual:uno.css'

const app = createApp(App)
const pinia = createPinia()

// 注册Vant组件
app.use(Tabbar)
app.use(TabbarItem)
app.use(NavBar)
app.use(Search)
app.use(Swipe)
app.use(SwipeItem)
app.use(Grid)
app.use(GridItem)
app.use(Card)
app.use(Button)
app.use(Icon)
app.use(Badge)
app.use(Cell)
app.use(CellGroup)
app.use(List)
app.use(PullRefresh)
app.use(VanImage)
app.use(Form)
app.use(Field)
app.use(Uploader)
app.use(Picker)
app.use(Popup)
app.use(Dialog)
app.use(Toast)
app.use(Loading)
app.use(Empty)
app.use(Divider)
app.use(Tab)
app.use(Tabs)
app.use(NoticeBar)
app.use(Skeleton)
app.use(Tag)
app.use(Switch)
app.use(SwipeCell)
app.use(Collapse)
app.use(CollapseItem)

app.use(pinia)
app.use(router)

app.mount('#app')
