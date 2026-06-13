---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 3647496465683674_0/project_7650761275953168640-files/SereneStay/merged/DEPLOYMENT.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3647496465683674#1781364923860
    ReservedCode2: ""
---
# SereneStay.ai — 部署指南

## ✅ 已完成

### 前后端合并
- 以 `frontend` 的 `package.json` 和配置为基础
- 合并 `backend/lib/` 和 `backend/app/api/` 到统一项目
- 数据文件 `serenestay-destinations.json` 放在 `data/` 目录
- 所有 import 路径已修正
- **本地 build 验证通过** ✓

### 合并后的项目结构
```
/SereneStay/merged/
├── package.json              # 基于前端配置
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx              # 首页
│   ├── chat/page.tsx         # AI聊天页
│   ├── destinations/         # 目的地浏览
│   │   ├── page.tsx
│   │   ├── DestinationsClient.tsx
│   │   └── [slug]/page.tsx   # 目的地详情
│   ├── pricing/page.tsx      # 定价页
│   └── api/
│       ├── chat/route.ts     # AI流式聊天
│       ├── destinations/
│       │   ├── route.ts      # 目的地列表API
│       │   └── [slug]/route.ts # 目的地详情API
│       └── match/route.ts    # AI匹配API
├── lib/
│   ├── types.ts              # 合并后的类型定义
│   ├── api.ts                # 前端API调用
│   ├── deepseek.ts           # DeepSeek客户端
│   ├── destinations.ts       # 数据加载器
│   └── prompts.ts            # AI Prompt模板
├── components/               # React组件
└── data/
    ├── serenestay-destinations.json  # 56目的地数据
    └── serenestay-ai-prompts.md      # Prompt库
```

### 修复的问题
1. **类型合并** — 添加 `Message` 和 `UserPreferences` 类型供前端使用
2. **metadata冲突** — 将 `regions`/`sortOptions` 从 `page.tsx` 移到 `DestinationsClient.tsx`
3. **语法错误** — 修复 `ChatInterface.tsx` 中 `setMessages()` 缺少闭合括号
4. **类型注解** — 为 `featuredDestinations` 添加 `Destination[]` 类型
5. **事件处理** — `PricingCard` 改为使用 `Link` 组件替代 `onClick`

---

## 🚀 Vercel 部署步骤

### 方式一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **创建新项目**
   - 点击 "Add New Project"
   - 选择 "Import Git Repository" 或手动上传

3. **上传项目文件**
   - 从 Coze 项目文件系统下载 `/SereneStay/merged/` 目录
   - 或直接从本地 `serenestay-merge/project/` 目录上传

4. **配置构建设置**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

5. **设置环境变量**
   ```
   DEEPSEEK_API_KEY = sk-xxxxxxxxxxxxxxxx
   ```

6. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约2-3分钟）

### 方式二：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI（如未安装）
npm i -g vercel

# 2. 登录
vercel login

# 3. 进入项目目录
cd /path/to/merged/project

# 4. 部署
vercel

# 5. 设置环境变量
vercel env add DEEPSEEK_API_KEY

# 6. 部署到生产环境
vercel --prod
```

---

## 🔧 部署后检查

### 1. 验证 API 端点
```bash
# 测试目的地列表
curl https://your-domain.vercel.app/api/destinations

# 测试目的地详情
curl https://your-domain.vercel.app/api/destinations/chiang-mai

# 测试 AI 聊天（需要 DEEPSEEK_API_KEY）
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"stream":false}'
```

### 2. 验证页面
- 首页: https://your-domain.vercel.app/
- AI聊天: https://your-domain.vercel.app/chat
- 目的地: https://your-domain.vercel.app/destinations
- 定价: https://your-domain.vercel.app/pricing

### 3. 检查 Hard Veto 警告
访问有 Hard Veto 条件的目的地详情页，确认警告正常显示。

---

## ⚠️ 注意事项

### 1. 数据文件路径
`lib/destinations.ts` 使用 `process.cwd()` 读取数据文件：
```typescript
const dataPath = path.join(process.cwd(), 'data', 'serenestay-destinations.json');
```
确保 `data/serenestay-destinations.json` 被正确部署。

### 2. Runtime 选择
API 路由使用 Node.js runtime（非 Edge）：
```typescript
export const dynamic = 'force-dynamic';
```
这是为了支持 `fs.readFileSync` 读取本地 JSON 文件。

### 3. 成本估算
- Vercel Hobby 免费版：足够 MVP
- DeepSeek API：约 $5-10/月（1000用户）
- 域名：约 $10-15/年

### 4. 环境变量
生产环境必须设置 `DEEPSEEK_API_KEY`，否则 AI 功能不可用。

---

## 📝 下一步

1. **部署到 Vercel** — 按上述步骤操作
2. **配置域名**（可选）— 绑定自定义域名
3. **测试 AI 功能** — 确保 DEEPSEEK_API_KEY 正常工作
4. **集成 Creem 支付** — 等人字拖确定支付策略
5. **性能优化** — 考虑添加缓存策略

---

*文档生成时间: 2026-06-13*
*项目位置: /SereneStay/merged/*

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
