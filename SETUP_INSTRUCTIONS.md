# GitHub Action访问计数器设置说明

## 🔐 第一步：创建GitHub Personal Access Token (PAT)

1. 进入您的GitHub账户设置：https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Tokens (classic)"
3. 填写描述：`Profile-views-action-trigger`
4. 选择权限：**只勾选 `repo` 权限**
5. 点击生成并复制token

## 🏠 第二步：在仓库中设置Secret

1. 打开您的仓库：https://github.com/Zedxzk/zedxzk.github.io
2. 点击 Settings -> Secrets and variables -> Actions
3. 点击 "New repository secret"
4. Name: `GH_ACTION_TRIGGER_TOKEN`
5. Secret: 粘贴您刚刚生成的token

## 💻 第三步：在浏览器中设置前端token

打开浏览器控制台，运行以下命令：

```javascript
localStorage.setItem("gh_action_trigger_token", "your_repo_token_here");
```

**注意：** 请将 `your_repo_token_here` 替换为您的实际token。

## ✅ 完成！

设置完成后，每次访问网站都会自动触发GitHub Action来更新Gist统计数据。

## 🔍 验证方法

1. 刷新网站页面
2. 查看浏览器控制台，应该看到：`✅ GitHub Action触发成功 (PAT方法)！`
3. 1-2分钟后检查您的Gist，访问数据应该已更新

## 🛡️ 安全说明

- 这个token只有repo权限，无法访问您的个人信息
- token存储在localStorage中，只在您的浏览器中可见
- GitHub Action在服务器端运行，使用Secrets中的安全token更新Gist
