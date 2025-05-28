1.基础环境要求：
- Node.js (推荐v18或更高版本)
- npm (Node.js包管理器)
- Git
2.克隆项目：
git clone https://github.com/Marin764/Narraid.git
cd Narraid
3.安装依赖：
npm install
4.环境变量配置：
需要创建 .env.local 文件，包含以下配置：

# 语言模型 API Key
YUNBAILIAN_API_KEY=sk-da390b1956d74eccb74b5deea342f102

# 生图模型 API Key
YUNBAILIAN_IMAGE_API_KEY=sk-ebfd58b0491245e4917eecaa2099cb07 

6.启动开发服务器
npm run dev
7.项目结构说明
narraid/
├── app/                    # Next.js 应用主目录
│   ├── api/               # API 路由
│   │   ├── speech/       # 语音识别相关API
│   │   ├── generate-image/# 图片生成相关API
│   │   └── chat/         # 聊天相关API
│   ├── exercise/         # 练习页面
│   │   └── naming/       # 命名练习页面
│   ├── profile/          # 用户资料页面
│   ├── test/             # 测试相关页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 全局布局组件
│   └── page.tsx          # 根页面（已改为重定向到练习页面）
│
├── components/            # 可复用组件
├── hooks/                # 自定义React Hooks
├── lib/                  # 工具函数和库
├── public/              # 静态资源
├── styles/              # 样式文件
│
├── scripts/             # 脚本文件
├── .venv/               # Python虚拟环境
│
├── package.json         # 项目依赖配置
├── next.config.mjs      # Next.js配置
├── tailwind.config.ts   # Tailwind CSS配置
├── tsconfig.json        # TypeScript配置
└── requirements.txt     # Python依赖

8.开发注意事项：
代码使用TypeScript，确保编辑器支持TS
使用Tailwind CSS进行样式开发
API路由在 app/api 目录下
页面组件在 app/exercise 目录下
9.常见问题解决：
如果遇到依赖安装问题，可以删除 node_modules 文件夹和 package-lock.json，然后重新运行 npm install
如果遇到环境变量问题，确保 .env.local 文件中的值都正确填写
如