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
│   ├── about.html         # 关于我组件
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
3. **about.html** - 关于我部分
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
