# FileID System Usage Guide

## 概述

FileID系统允许在Prefab内部和跨Prefab之间引用GameObject和Component。

## 基本概念

- **fileID**: 在单个Prefab内唯一标识GameObject或Component的数字ID
- **guid**: 全局唯一标识符，用于标识Prefab文件
- **引用格式**:
  - 同一Prefab内: `{"fileID": 123}`
  - 跨Prefab引用: `{"fileID": 456, "guid": "abc123def456"}`

## 使用示例

### 示例1: 同一Prefab内引用

```json
{
  "name": "Player",
  "fileID": 100,
  "children": [
    {
      "name": "Visuals",
      "fileID": 200,
      "components": [...]
    },
    {
      "name": "Weapon",
      "fileID": 300,
      "components": [
        {
          "type": "WeaponController",
          "fileID": 301,
          "properties": {
            "visualsObject": {"fileID": 200}
          }
        }
      ]
    }
  ]
}
```

### 示例2: 跨Prefab引用

**父Prefab (Player.prefab)**
```json
{
  "name": "Player",
  "fileID": 100,
  "components": [
    {
      "type": "Player",
      "fileID": 101,
      "properties": {
        "weaponVisuals": {
          "fileID": 201,
          "guid": "weapon123abc"
        }
      }
    }
  ],
  "children": [
    {
      "prefab": "weapon123abc",
      "fileID": 102
    }
  ]
}
```

**子Prefab (Weapon.prefab, guid: weapon123abc)**
```json
{
  "name": "Weapon",
  "fileID": 200,
  "children": [
    {
      "name": "Visuals",
      "fileID": 201
    }
  ]
}
```

## FileID分配规则

建议使用以下规则分配fileID:

1. **根GameObject**: 100
2. **根的Components**: 101, 102, 103...
3. **第一个子GameObject**: 200
4. **第一个子的Components**: 201, 202, 203...
5. **第二个子GameObject**: 300
6. **第二个子的Components**: 301, 302, 303...

以此类推，每个GameObject及其Components使用连续的100个ID。

## 在代码中使用

### 组件中声明引用

```javascript
class MyComponent extends GameBehaviour {
    constructor() {
        super('MyComponent');
        this.targetObject = null;  // 将被解析为GameObject
        this.targetComponent = null;  // 将被解析为Component
    }

    onLoad(props) {
        // 引用会在这之前被自动解析
        // 这里可以直接使用
    }

    start() {
        // 引用已经被解析，可以安全使用
        if (this.targetObject) {
            console.log("Target:", this.targetObject.name);
        }
    }
}
```

### Prefab配置

```json
{
  "type": "MyComponent",
  "fileID": 101,
  "properties": {
    "targetObject": {"fileID": 200},
    "targetComponent": {"fileID": 201}
  }
}
```

## 注意事项

1. **fileID必须在Prefab内唯一**
2. **跨Prefab引用需要同时提供guid和fileID**
3. **引用解析在所有GameObject实例化完成后进行**
4. **循环引用会导致问题，应避免**
5. **修改Prefab结构时，注意更新fileID引用**

## 调试

如果引用解析失败，会在控制台看到警告:
```
Failed to resolve reference for propertyName: {fileID: 123, guid: "abc"}
```

检查:
1. fileID是否正确
2. guid是否正确
3. 被引用的对象是否存在
4. 嵌套Prefab是否正确加载
