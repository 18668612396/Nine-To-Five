# 办公室法师猫 RPG

## 如何运行

由于本项目使用了现代 JavaScript 模块化 (ES Modules)，直接双击 `index.html` 可能会因为浏览器的安全策略（CORS）而无法加载脚本。

### 推荐方式：使用 VS Code Live Server

1. 在 VS Code 中打开本项目文件夹。
2. 安装扩展 **Live Server** (ID: ritwickdey.LiveServer)。
3. 右键点击 `index.html`，选择 **"Open with Live Server"**。

### 替代方式：本地服务器

如果你安装了 Python，也可以在终端运行：

```bash
# Python 3
python -m http.server
```

然后访问 `http://localhost:8000`。

## 项目结构

- `index.html`: 游戏入口
- `css/`: 样式文件
- `js/`: JavaScript 源代码
  - `main.js`: 脚本入口
  - `core/`: 核心逻辑 (Game, Utils)
  - `entities/`: 游戏实体 (Player, Enemy, Bullet, Loot)
  - `ui/`: 界面管理
