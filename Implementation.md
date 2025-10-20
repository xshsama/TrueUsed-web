# 功能页面落实记录（占位页 → 实际页）

本文档记录从占位页面到可用基础页面的实现进度、交互说明与后续接入建议。

更新时间：2025-10-18

## 已完成

1. Orders 订单列表（`src/views/Orders.vue`）

- 功能：Tabs 状态筛选（all/unpaid/toship/toreceive/afterSale）、下拉刷新、分页加载、骨架屏、空态。
- 交互：支持从路由 query.status 初始化选中状态（例如 /orders?status=unpaid）。提供支付/取消/确认收货/查看等按钮（占位交互）。
- 数据：本地 mock。

1. Address 地址管理（`src/views/Address.vue`）

- 功能：列表展示、设为默认、编辑/新增弹窗、删除（含右滑删除）。
- 数据：localStorage 持久化（键：tu.address.list）。

1. Settings 系统设置（`src/views/Settings.vue`）

- 功能：常见开关（消息通知、营销推送、个性化推荐）持久化；深色模式占位；退出登录确认。
- 数据：localStorage 持久化（键：tu.settings）。

1. Help 帮助中心（`src/views/Help.vue`）

- 功能：搜索 + FAQ 折叠展示；无结果空态。

1. Verification 实名认证（`src/views/Verification.vue`）

- 功能：姓名、身份证号校验、身份证正反面上传（大小 5MB 限制）、提交后进入“审核中”；支持展示“已通过”占位。
- 数据：localStorage 持久化状态（键：tu.verification）。

1. ServiceCenter 客服中心（`src/views/ServiceCenter.vue`）

- 功能：客服入口宫格（客服消息/客服电话/在线客服），FAQ 分类折叠；跳转客服消息页。

1. Feedback 意见反馈（`src/views/Feedback.vue`）

- 功能：问题类型选择、描述、联系方式、图片上传（<=5MB，最多 4 张）；提交提示并返回。

1. About 关于（`src/views/About.vue`）

- 功能：应用信息、版本、项目主页、协议、反馈入口。

1. MyProducts 我的发布（`src/views/MyProducts.vue`）

- 功能：列表展示、上/下架、编辑、删除，占位交互；下拉刷新/分页加载。

1. SoldProducts 已售出（`src/views/SoldProducts.vue`）

- 功能：已售记录展示、售后中标识、查看占位；分页加载。

1. ProductManageCenter 商品管理中心（`src/views/ProductManageCenter.vue`）

- 功能：仪表卡片，快捷入口到 发布商品/我的发布/订单管理。

1. OrderManage 卖家订单管理（`src/views/OrderManage.vue`）

- 功能：Tabs 筛选（全部/待发货/售后）、分页加载、发货和售后处理占位。

1. Settlement 资金结算（`src/views/Settlement.vue`）

- 功能：余额展示、资金明细/结算记录 Tab、分页加载；提现弹窗校验与余额更新；支持 /settlement?action=withdraw 直达弹窗。

1. ServiceMessages 客服消息（`src/views/ServiceMessages.vue`）

- 功能：客服会话列表、未读角标、点击跳转消息页。

## 组件注册补充

- 在 `src/main.js` 注册了 Switch、SwipeCell、Collapse、CollapseItem 以支撑新页面 UI。

## 路由连通

- `src/views/Profile.vue` 和 `src/components/SellerCenter.vue` 的入口已切换为实际 `router.push`，与路由表一致。

## 后续接入建议（API 阶段）

- 将本地 mock 改为接口：统一在 `src/api` 目录下新增对应模块。
- 订单与卖家订单列表：支持分页与状态过滤的 API；按钮操作（取消、发货、确认收货）接入接口。
- 地址管理：提供增删改查接口，默认地址唯一性由后端校验。
- 实名认证：上传走对象存储，后端走 OCR/风控；状态轮询或回调。
- 资金结算：对接钱包/账务服务；提现走工单或第三方支付；增加失败重试提示。
- 客服消息：接入会话与消息列表接口，未读计数走轮询或 WebSocket。

## 运行与验证

- 开发运行：npm run dev 后在移动端模拟器中逐页验证交互、刷新与分页。
- 路由直达：
  - 订单状态直达：/orders?status=toreceive
  - 结算提现直达：/settlement?action=withdraw

## 备注

- 当前实现均为“无后端占位逻辑”，确保 UI/交互闭环与路由联通；后续只需替换数据源与操作即可。
