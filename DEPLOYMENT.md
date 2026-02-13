# 部署指南

## 🚀 本地开发

### 前置要求
- Node.js 18+
- npm 或 yarn

### 步骤
1. 克隆项目
2. 安装依赖: `npm install`
3. 复制 `.env.example` 为 `.env`
4. 添加你的Mapbox token
5. 运行: `npm run dev`

## 📦 生产构建

```bash
npm run build
```

构建产物位于 `dist/` 目录。

## ☁️ 部署选项

### 1. Vercel (推荐)

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

**配置环境变量**:
在Vercel仪表板中添加 `VITE_MAPBOX_TOKEN`

### 2. Netlify

```bash
# 安装Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod
```

**配置**:
- Build command: `npm run build`
- Publish directory: `dist`
- 环境变量: 添加 `VITE_MAPBOX_TOKEN`

### 3. GitHub Pages

1. 修改 `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

2. 构建并部署:
```bash
npm run build
# 将 dist/ 推送到 gh-pages 分支
```

### 4. Docker

创建 `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建和运行:
```bash
docker build -t flexible-street-platform .
docker run -p 80:80 flexible-street-platform
```

## 🔐 环境变量

生产环境需要配置:

| 变量名 | 说明 | 必需 |
|-------|------|------|
| `VITE_MAPBOX_TOKEN` | Mapbox访问令牌 | ✅ |

## 🎯 性能优化建议

1. **图片优化**: 使用WebP格式
2. **代码分割**: Vite自动处理
3. **CDN**: 部署到全球CDN
4. **缓存**: 配置合理的缓存策略

## 📊 监控

推荐使用:
- Vercel Analytics
- Google Analytics
- Sentry (错误追踪)

## 🔧 故障排查

### 地图不显示
- 检查Mapbox token是否正确
- 检查浏览器控制台错误
- 确认网络可以访问Mapbox API

### 构建失败
- 清除node_modules: `rm -rf node_modules && npm install`
- 检查Node版本: `node --version`
- 查看构建日志

## 📱 移动端优化

项目已包含响应式设计，但可以进一步优化:
- 触摸手势支持
- 移动端菜单
- PWA支持（添加service worker）
