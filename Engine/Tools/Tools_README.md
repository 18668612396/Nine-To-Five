# 🛠️ 引擎工具使用说明 (Engine Tools Documentation)

本文档介绍了位于 `Engine/Tools` 及项目根目录下的自动化脚本工具的使用方法。

## 1. 资源数据库刷新工具 (Asset Database Refresher)

**脚本位置**: `Engine/Tools/AssetDatabase.js`  
**快捷方式**: `RefreshAssets.bat` (位于项目根目录)

### 功能
扫描 `Assets` 和 `Packages` 目录，为所有新文件生成 `.meta` 文件（包含唯一 GUID），并更新 `Library/AssetMap.json` 映射表。

### 何时使用
*   当你添加了新图片、音频、脚本或预制体后。
*   当你移动了文件位置后。
*   当你发现游戏里加载资源报错（找不到 GUID）时。

### 使用方法
双击根目录下的 `RefreshAssets.bat`，或者在终端运行：
```bash
node Engine/Tools/AssetDatabase.js
```

---

## 2. 动画序列生成器 (Animation Generator)

**脚本位置**: `GenerateAnim.ps1` (位于项目根目录)

### 功能
自动扫描指定文件夹下的所有图片序列（.png, .jpg），生成一个 `.anim` 动画剪辑文件。

### 参数
*   `-Directory`: **(必填)** 图片序列所在的文件夹路径。
*   `-Name`: (可选) 动画名称。如果不填，默认使用文件夹名字（首字母大写）。
*   `-FrameRate`: (可选) 帧率，默认 10。
*   `-Loop`: (可选) 是否循环播放，默认 `$true`。

### 使用方法
在 PowerShell 终端中运行：

**基本用法:**
```powershell
.\GenerateAnim.ps1 -Directory "Project/NineToFive/Assets/Art/Textures/Player/Run"
```

**自定义参数:**
```powershell
.\GenerateAnim.ps1 -Directory "Project/NineToFive/Assets/Art/Textures/Player/Attack" -Name "Attack01" -FrameRate 15 -Loop $false
```

> **注意**: 生成动画后，请务必运行一次 `GenAssetMap.ps1` 或 `RefreshAssets.bat` 来注册新生成的 `.anim` 文件。

---

## 3. 资源映射生成器 (Asset Map Generator - PowerShell版)

**脚本位置**: `GenAssetMap.ps1` (位于项目根目录)

### 功能
这是 `AssetDatabase.js` 的 PowerShell 版本替代品。它功能更强大，支持递归扫描和更智能的路径处理。

### 使用方法
在 PowerShell 终端中运行：
```powershell
.\GenAssetMap.ps1
```

---

## 4. 简易服务器 (Simple Server)

**脚本位置**: `Engine/Tools/SimpleServer.py` 或 `SimpleServer.ps1`

### 功能
启动一个本地 HTTP 服务器，用于在浏览器中运行游戏。直接打开 `index.html` 可能会因为浏览器安全策略（CORS）导致无法加载图片或脚本。

### 使用方法
**Python 版本:**
```bash
python Engine/Tools/SimpleServer.py
```
然后访问: `http://localhost:8000`

**PowerShell 版本:**
```powershell
.\Engine\Tools\SimpleServer.ps1
```
