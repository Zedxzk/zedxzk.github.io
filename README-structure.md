# 个人主页项目结构说明

## 文件结构

```
PersonalPage/
├── index.html              # 原始的单文件版本
├── index-modular.html      # 新的模块化版本
├── style.css              # 样式文件
├── script.js              # 原始JavaScript文件
├── components/            # 组件文件夹
│   ├── header.html        # 头部组件
│   ├── sidebar.html       # 侧边栏组件
│   ├── about.html         # 个人简介组件
│   ├── research.html      # 研究方向组件
│   ├── publications.html  # 发表论文组件
│   ├── teaching.html      # 教学组件
│   └── footer.html        # 页脚组件
├── js/                    # JavaScript文件夹
│   ├── language.js        # 语言切换功能
│   └── components.js      # 组件加载器
└── README-structure.md    # 本文件
```

## 使用方式

### 模块化版本 (推荐)
使用 `index-modular.html` 作为主页面：
- 各个组件被分离到 `components/` 文件夹中
- JavaScript功能被分离到 `js/` 文件夹中
- 通过异步加载方式动态加载各个组件
- 便于维护和修改

### 原始版本
`index.html` 保留了原始的单文件结构，作为备份。

## 组件说明

1. **header.html** - 页面头部，包含姓名、职位和语言切换
2. **sidebar.html** - 侧边栏，包含头像、联系方式和相关链接
3. **about.html** - 个人简介部分
4. **research.html** - 研究方向部分
5. **publications.html** - 发表论文列表
6. **teaching.html** - 教学经历
7. **footer.html** - 页脚版权信息

## 修改指南

### 修改内容
- 要修改某个部分的内容，只需编辑对应的组件文件
- 例如：修改个人介绍，编辑 `components/about.html`
- 例如：添加新论文，编辑 `components/publications.html`

### 添加新组件
1. 在 `components/` 文件夹中创建新的HTML文件
2. 在 `index-modular.html` 中添加对应的容器div
3. 在 `js/components.js` 中的 `components` 数组里添加新组件的配置

### 修改样式
- 编辑 `style.css` 文件，样式会自动应用到所有组件

## 优势

1. **模块化** - 每个部分独立，便于维护
2. **复用性** - 组件可以在其他页面中复用
3. **可读性** - 代码结构清晰，易于理解
4. **可维护性** - 修改某个部分不会影响其他部分
5. **团队协作** - 不同人员可以同时编辑不同组件

## 注意事项

- 模块化版本需要通过HTTP服务器访问（不能直接双击打开文件）
- 可以使用VS Code的Live Server扩展或其他本地服务器
- 如果需要直接打开文件查看，可以使用原始的 `index.html`

## Google Analytics 设置指南

### 1. 创建 Google Analytics 账户
1. 访问 [Google Analytics](https://analytics.google.com/)
2. 使用您的Google账户登录
3. 点击"开始测量"创建新账户
4. 选择"网站"作为平台

### 2. 获取测量ID
1. 在GA4界面中，点击"管理" → "数据流"
2. 点击您的网站数据流
3. 复制"测量ID"（格式类似：G-XXXXXXXXXX）

### 3. 配置网站
1. 打开 `index.html` 文件
2. 找到两处 `GA_MEASUREMENT_ID`
3. 将其替换为您的实际测量ID
4. 保存文件并提交到GitHub

### 4. 验证安装
1. 部署到GitHub Pages后访问网站
2. 在GA4实时报告中查看访问数据
3. 通常需要等待24-48小时才能看到完整统计数据

### 统计功能说明
- 页面访问量统计
- 用户行为分析
- 流量来源分析
- 设备和浏览器统计
- 地理位置分析

### 注意事项
- Google Analytics是免费的分析工具
- 数据存储在Google服务器上，完全符合隐私政策
- 支持实时数据查看和历史数据分析
- 可以设置自定义事件跟踪（如按钮点击、表单提交等）

## 免费计数器服务设置指南

### 推荐计数器服务

#### 1. StatCounter (推荐)
1. 访问 [StatCounter](https://statcounter.com/)
2. 免费注册账户
3. 添加新项目，输入您的网站URL
4. 选择计数器样式和位置
5. 复制生成的HTML代码
6. 替换 `footer.html` 中的计数器占位符

#### 2. HitWebCounter
1. 访问 [HitWebCounter](https://hitwebcounter.com/)
2. 免费注册账户
3. 创建新计数器
4. 自定义样式和设置
5. 获取计数器代码并替换

#### 3. 其他选项
- **Flag Counter**: 支持地理位置统计
- **RevolverMaps**: 提供访客地图
- **ClustrMaps**: 实时访客位置显示

### 配置步骤

1. **注册服务** - 选择一个免费计数器服务并注册
2. **创建计数器** - 输入您的网站信息
3. **获取代码** - 复制HTML代码并替换
4. **替换代码** - 在 `footer.html` 中替换占位符
5. **测试** - 访问网站验证计数器工作

### 当前配置状态

✅ **StatCounter 已配置完成**
- 项目ID: 13164698
- 安全码: ab250e98
- 模式: 可见计数器模式 (sc_invisible=0)
- 显示位置: 页面footer
- 状态: 实时显示访问次数

### 计数器显示说明

**可见计数器功能：**
- 显示当前页面的访问次数
- 实时更新（每次访问后更新）
- 包含StatCounter的标志和链接
- 支持中英文界面
- 响应式设计，适配移动设备

**计数器位置：**
- 位于页面底部footer区域
- 在"页面访问统计"部分下方
- 采用渐变背景和圆角设计

### 自定义选项

如果您想自定义计数器样式，可以在StatCounter网站上：
1. 登录您的账户
2. 选择项目设置
3. 调整计数器样式、颜色、大小
4. 获取新的代码并替换

### 故障排除

**如果计数器不显示：**
1. 检查浏览器是否启用了JavaScript
2. 确认网络连接正常
3. 尝试刷新页面
4. 检查浏览器控制台是否有错误

**计数器显示但不更新：**
- 计数器通常有几分钟的延迟
- 刷新页面或等待一段时间
- 检查StatCounter控制台的数据

### 隐私考虑
- 选择支持隐私保护的计数器服务
- 避免收集过多个人信息的计数器
- 考虑添加隐私政策声明
