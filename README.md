# NarrAid

NarrAid是一个基于Next.js和讯飞语音识别API的语音交互应用。

## 功能特点

- 实时语音识别
- 语音转文字
- 智能对话
- 图片生成

## 技术栈

- Next.js 15.2.4
- TypeScript
- Tailwind CSS
- 讯飞开放平台API

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/Marin764/Narraid.git
cd Narraid
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建`.env.local`文件并添加以下配置：
```
OPENAI_API_KEY=你的OpenAI API密钥
XFYUN_APPID=你的讯飞APPID
XFYUN_API_KEY=你的讯飞API Key
XFYUN_API_SECRET=你的讯飞API Secret
```

4. 启动开发服务器
```bash
npm run dev
```

## 项目结构

```
narraid/
├── app/                # Next.js应用目录
│   ├── api/           # API路由
│   └── exercise/      # 练习页面
├── components/        # React组件
├── public/           # 静态资源
└── styles/           # 样式文件
```

## 贡献指南

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

## 许可证

MIT License 