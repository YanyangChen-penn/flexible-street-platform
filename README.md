# Flexible Street Platform - Philadelphia Pilot

一个现代化的交互式城市规划平台,用于可视化和分析费城的灵活街道适宜性。

## 🎨 设计参考

本项目参考了 [Felt](https://felt.com/) 的现代化设计理念：
- 简洁直观的UI
- 流畅的地图交互
- 实时数据可视化
- 协作式工作流程

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置Mapbox Token

在 `src/components/MapComponent.tsx` 中替换 Mapbox token：

```typescript
const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';
```

获取免费token: https://account.mapbox.com/

### 3. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── MapComponent.tsx        # 地图核心组件
│   ├── Sidebar.tsx            # 侧边栏控制面板
│   └── AnchorDetailPanel.tsx  # 锚点详情面板
├── data/               # 数据文件
│   └── mockData.ts     # 示例数据
├── types/              # TypeScript类型定义
│   └── index.ts
└── utils/              # 工具函数
```

## ✨ 核心功能

### 1. 交互式地图
- 基于Mapbox GL JS的高性能地图
- 平滑缩放和平移
- 自定义标记和弹出窗口

### 2. 锚点图层管理
- **教育设施** 🎓 - 学校、大学
- **餐饮** 🍴 - 餐厅、咖啡馆
- **文化机构** 🎨 - 博物馆、图书馆
- **社区服务** 🏘️ - 社区中心
- **公园娱乐** 🌳 - 公园、广场
- **交通枢纽** 🚇 - 地铁、火车站
- **娱乐旅游** 🎭 - 景点、体育场

### 3. 时间维度分析
- 早晨 (6-12)
- 下午 (12-18)
- 傍晚 (18-24)
- 夜晚 (0-6)

### 4. 锚点详情面板
- 点击标记查看详细信息
- FSI分数可视化
- 坐标和类型信息

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **地图引擎**: Mapbox GL JS
- **样式**: Tailwind CSS
- **图标**: Lucide React

## 🎯 下一步计划

### Phase 1: 数据集成 (Week 2-3)
- [ ] 连接真实的OpenDataPhilly API
- [ ] 集成Yelp Fusion API
- [ ] 加载街道中心线数据

### Phase 2: FSI计算 (Week 5-6)
- [ ] 实现FSI评分算法
- [ ] 添加时间序列图表
- [ ] 街道路段高亮显示

### Phase 3: 高级功能 (Week 7-8)
- [ ] 热力图可视化
- [ ] 路径规划
- [ ] 导出功能
- [ ] 用户反馈系统

## 📝 使用说明

1. **查看锚点**: 在左侧边栏选择要显示的锚点类型
2. **切换时间**: 选择不同时间段查看数据
3. **点击标记**: 查看详细信息和FSI分数
4. **折叠侧边栏**: 点击筛选按钮获得更大的地图视图

## 📄 许可证

MIT License
