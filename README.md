# TrueUsed - 二手交易平台前端

一个基于 Vue3 + Vite + Vant 开发的二手交易平台移动端前端项目。

## 项目特性

- ✨ **Vue3 + Composition API** - 使用最新的 Vue3 语法
- 🚀 **Vite** - 快速的构建工具
- 📱 **移动端优先** - 响应式设计，适配各种移动设备
- 🎨 **Vant UI** - 轻量、可靠的移动端 Vue 组件库
- 🗂 **五大核心模块** - 首页、收藏、卖出、消息、我的

## 功能模块

### 1. 首页 (Home)

- 搜索功能
- 轮播图展示
- 快捷分类导航
- 商品瀑布流展示
- 下拉刷新和上拉加载更多

### 2. 收藏 (Favorites)

- 收藏商品列表
- 按状态筛选（在售、已售、已下架）
- 取消收藏功能
- 商品状态标识

### 3. 卖出 (Post)

- 发布商品功能
- 我的发布管理
- 统计数据展示
- 发布技巧提示

### 4. 消息 (Messages)

- 聊天会话列表
- 实时聊天功能
- 系统通知
- 商品卡片分享

### 5. 我的 (Profile)

- 用户信息展示
- 订单管理入口
- 钱包、地址等功能
- 设置和帮助中心

## 项目结构

```
src/
├── main.js              # 应用入口
├── App.vue             # 根组件
├── router/             # 路由配置
│   └── index.js
├── stores/             # Pinia 状态管理
│   ├── message.js      # 消息状态
│   └── user.js         # 用户状态
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Favorites.vue   # 收藏页
│   ├── Post.vue        # 发布主页
│   ├── PostCreate.vue  # 发布商品
│   ├── PostManage.vue  # 发布管理
│   ├── Messages.vue    # 消息列表
│   ├── MessageChat.vue # 聊天页面
│   ├── Profile.vue     # 个人中心
│   ├── Login.vue       # 登录页
│   ├── ProductDetail.vue # 商品详情
│   └── Search.vue      # 搜索页
└── styles/             # 样式文件
    └── global.css      # 全局样式
```

## 安装和运行

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看项目

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由管理器
- **Pinia** - Vue 的状态管理模式
- **Vant** - 轻量、可靠的移动端组件库
- **Axios** - Promise 基于的 HTTP 客户端

## 主要特点

### 1. 移动端体验优化

- 底部导航栏设计
- 触摸友好的交互
- 适配各种屏幕尺寸
- 下拉刷新和上拉加载

### 2. 完整的用户体验流程

- 用户注册/登录
- 商品浏览和搜索
- 收藏和发布功能
- 实时消息通讯
- 个人信息管理

### 3. 现代化开发体验

- Vue3 Composition API
- TypeScript 支持（可选）
- ESLint 代码规范
- 模块化的组件设计

## 待实现功能

由于当前只完成了界面展示部分，以下功能需要后续开发：

- [ ] 后端 API 集成
- [ ] 用户认证和授权
- [ ] 实时聊天 WebSocket 连接
- [ ] 文件上传功能
- [ ] 支付集成
- [ ] 推送通知
- [ ] 数据持久化
- [ ] 性能优化

## 注意事项

1. 当前版本仅包含前端界面展示，所有数据都是模拟数据
2. 需要配合后端 API 才能实现完整功能
3. 建议在真实设备上测试移动端体验
4. 部分功能使用 Toast 提示"功能开发中"

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

[MIT](LICENSE)
