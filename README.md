# Vite 2.x + React 项目模板搭建

尝试使用 vite +react 创建项目模板，并接入 前端工程规范&记录搭建过程中遇到的问题

- react-router-dom 使用 v6
- cssmodules 配置类名规则
- 集成 eslint + prettier + husky 等 进行代码风格和 commit 校验

## 模板

- 地址：

[github](https://github.com/Galileo01/vite-react-template)

- 使用模板

```bash
npx degit Galileo01/My Game Land#main project_name

cd my-project

```

或者 clone 项目

## vite

## 使用 vite 初始化项目

```bash
# npm create vite project_name -- --template react
npm create vite vite-react-app -- --template react
```

**注意**：两个——

- 框架 选择 react

- 模板（variant）选择 react-ts

![](https://cdn.jsdelivr.net/gh/Galileo01/imgCloud@master/image-20220303193138839.png)

然后进入目录 安装依赖

```bash
npm i
```

尝试运行

```bash
npm run dev
```

<img src="https://cdn.jsdelivr.net/gh/Galileo01/imgCloud@master/image-20220303195002056.png" style="zoom:50%;" />

### 设置路径别名

为了能 require 和 \_\_dirname 能被 ts 正确识别，需要安装 @types/node

``` bash
npm  i @types/node -D
```

```js
// vite.config.ts
const { resolve } = require('path');
...
resolve: {
    // 配置路径 别名
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },
```

设置之后可以方便的 通过 ‘@/assets/xx’ 导入

Exp:

```tsx
import logo from '@/logo.svg'
```

### CSS Module 设置类名前缀

css module 默认对 \*.moudle.css 的文件开启

- 安装 less

  Vite 默认提供了对 `.scss`, `.sass`, `.less`, `.styl` 和 `.stylus` 文件的内置支持，不需要安装特殊插件，但是需要我们安装预处理器依赖

  ```bash
  npm i less -D
  ```

- 设置生成的 类名格式

配置:

```js
css: {
    modules: {
      // 类名 前缀
      generateScopedName: 'vite_demo__[folder]__[local]___[hash:base64:5]',
    },
}
```

Ps:这里使用[folder]-文件夹名而不是[name]-文件名 作为前缀的原因是：个人更喜欢把组件的文件分别命名为**index.module.less**和**index.tsx**

![](https://www.helloimg.com/images/2022/03/04/GhxNSR.png)

如果使用[name]-文件名的话 所有组件的类名前缀都会是“index.mudule_xxxx”，使用[folder]-文件夹名 可以很好的达到效果

具体看个人的命名爱好

更具体的配置见[postcss-modules](https://github.com/madyankin/postcss-modules)

## react-router-dom 使用 v6

### 安装 react-router-dom

```bash
npm i react-router-dom -S
```

V6 版 用 ts 重写，拥抱 react 新特性，变化比较大，API 比之前更好用，但也有部分开发者反应 不好用（对 class 组件）

具体的改动见 [react-router 官方升级指南](https://reactrouter.com/docs/en/v6/upgrading/v5) 或者阅读 [什么，React Router 已经到 V6 了 ？？](https://juejin.cn/post/7025418839454122015)

较大的改动

- Routes 代替 Switch
- Route prop ： element 代替 component
- useNavigate 代替 useHistory
- 新增 useRoutes hooks，可以以新的方式注册和渲染路由，更有利于 阅读和维护

<img src="https://cdn.jsdelivr.net/gh/Galileo01/imgCloud@master/image-20220303110302695.png" style="zoom: 33%;" />

**ps: useRoutes 有个 注意点**：useRoutes hooks 不能和 Router 组件在同一个层级中渲染，至少要高一个层级，否则就会报错

原因是：使用 useRoutes 创建 routes 需要在 Router 的上下文中

Exp:

```tsx
// App.tsx 以下是错误的写法，会报错
import * as React from 'react'

import { useRoutes, Routes } from 'react-router-dom'

import Test from './components/test'
import routes from './router'

function App() {
  const element = useRoutes(routes)
  return (
    <div className="App">
      <Test tag="666" />
      <Routes>{element}</Routes>
    </div>
  )
}

export default App
```

<span style="color:red">useRoutes() may be used only in the context of a Router component</span>:

![](https://cdn.jsdelivr.net/gh/Galileo01/imgCloud@master/image-20220303202800922.png)

[Stackoverflow 链接](https://stackoverflow.com/questions/65425884/react-router-v6-error-useroutes-may-be-used-only-in-the-context-of-a-route)

**正确的上下文结构如下**

```tsx
// file: src/router.ts
import React, { Suspense } from 'react'

import type { RouteObject } from 'react-router-dom'
import Index from './pages/index/index'

// React.lazy 配合 import() 实现懒加载
const About = React.lazy(() => import('./pages/about'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<span>loading component</span>}>
        <About />
      </Suspense>
    ),
  },
]

export default routes
```

```tsx
// file: src/App.tsx
import * as React from 'react'

import { useRoutes } from 'react-router-dom'

import Test from './components/test'
import routes from './router'

function App() {
  const element = useRoutes(routes)
  return (
    <div className="App">
      <Test tag="666" />
      {element}
    </div>
  )
}

export default App
```

```tsx
// file: src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import './index.css'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
)
// useRoutes hooks 不能和Router 组件在同一个层级中渲染
```

## 使用 eslint 检测代码规范

### 安装 eslint 并初始化

```bash
npm i eslint -D
npx eslint --init
```

npx eslint --init 命令会打开 可交互的命令行，根据选择生成**.eslintrc.js**

- How would you like to use ESLint - To check syntax and find problems (若 选择 enforce code style ，会让 eslint 进行代码格式化)

- What type of modules does your project use? -Javascript modules (import/export )
- Which framework does your project use? - React
- Does your project use TypeScript?-yes
- Where does your code run?-browser
- What format do you want your config file to be in?-JavaScript
- Would you like to install them now with npm? › Yes

这样选择后 会安装 eslint-plugin-react、 @typescript-eslint/eslint-plugin 、@typescript-eslint/parser

### 创建.eslintignore 文件

```text
*.sh 
node_modules 
*.md 
*.woff 
*.ttf 
.vscode 
.idea 
dist 
/public 
/docs 
.husky 
.local 
/bin
.eslintrc.js
*.config.js
vite.config.ts
```

### 安装 eslint-plugin-react-hooks 对 hooks 进行校验

```bash
npm i eslint-plugin-react-hooks -D
```

在.eslintrc.js 进行个性化的设置，开启对 hooks 依赖的检测

```js
// file: .eslintrc.js
{
  "plugins": [
    // ...
    "react-hooks"
  ],
  "rules": {
    // ...
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

![Ghx0Zn.png](https://www.helloimg.com/images/2022/03/04/Ghx0Zn.png)

### 使用 airbnb 的规则 对 react 进行校验

#### 安装 eslint-config-airbnb

eslint-config-airbnb 对 eslint-plugin-import、eslint-plugin-react、eslint-plugin-jsx-a11y 有依赖 ，所以一起安装

```bash
npm i eslint-config-airbnb eslint-plugin-import eslint-plugin-react eslint-plugin-jsx-a11y  -D
```

#### 安装 eslint-config-airbnb-typescript

```bash
npm i  eslint-config-airbnb-typescript -D
```

#### 配置

根据 官方文档进行配置:[文档链接](https://github.com/iamturns/eslint-config-airbnb-typescript)

```js
// file: .eslintrc.js
...
extends: [
    // react
    // - 删除  eslint:recommended
    'plugin:react/recommended',
    // airbnb + airbnb 推荐的 ts 规范
    'airbnb',
    'airbnb-typescript',
    //- 删除  ts推荐配置
    //- 删除 'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    project: './tsconfig.json', // + 新增 parserOptions 配置
  },
  rules: {
    // 覆盖 eslint-config-airbnb里的配置
    //  允许 在ts、tsx 中书写 jsx
    'react/jsx-filename-extension': [
      2,
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
      // 修改 对于 函数式组件 声明方式(箭头函数 or 函数声明)的 校验
     'react/function-component-definition': [
      'error',
      {
        namedComponents: ['arrow-function', 'function-declaration'],
        unnamedComponents: ['arrow-function'],
      },
    ],
  },
    ...
```

## 使用 prettier 对代码风格进行统一

### 安装

```bash
npm i prettier eslint-config-prettier eslint-plugin-prettier -D
```

### 创建 .prettierrc.js 文件

```js
// file: .prettierrc.js
module.exports = {
  semi: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
}
```

### 配置

eslint-config-prettier 新版本更新之后,只需要写一个 "prettier" 即可,无需多言指令

```js
// file: .eslintrc.js
...
{
  extends:[
    // 解决 eslint 和 prettier 的冲突 , 此项配置必须在最后
    'prettier',
  ]
}
```

## 使用 husky +lint-staged+commitlint，通过钩子函数，对代码和 commit message 进行校验、格式化操作

### 安装 husky 并初始化

- 安装

```bash
npm i husky -D
```

- 在 package.json 中添加脚本 prepare :

```json
"scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "prepare": "husky install",
  ...
  },
```

- 初始化 husky

```bash
npm run prepare # 初始化husky,将 git hooks 钩子交由,husky执行
```

### 使用 lint-staged 对暂存的代码进行规范校验和格式化

lint-staged 可以对暂存的文件进行操作

- 安装

```bash
npm i lint-staged -D
```

- 创建 **.lintstagedrc.js** 文件，配置不同类型的文件需要执行的操作

```js
// file: .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': ['prettier --write .', 'eslint  --fix'],
  '*.md': ['prettier --write'],
}
```

- 添加 pre-commit 钩子：执行 npx lint-staged 命令

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

### 使用 commitlint 对提交信息进行校验

- 安装

```bash
npm i commitlint @commitlint/config-conventional -D
```

- 创建 commitlint.config.js 文件

```js
// file: commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
}
```

- 添加 commit-msg 钩子：执行 “npx --no-install commitlint --edit "$1"” 命令

```bash
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

**@commitlint/config-conventional** 这是一个规范配置,标识采用什么规范来执行消息校验, 这个默认是**_Angular_**的提交规范

| **类型** | **描述**                                               |
| -------- | ------------------------------------------------------ |
| build    | 编译相关的修改，例如发布版本、对项目构建或者依赖的改动 |
| chore    | 其他修改, 比如改变构建流程、或者增加依赖库、工具等     |
| ci       | 持续集成修改                                           |
| docs     | 文档修改                                               |
| feat     | 新特性、新功能                                         |
| fix      | 修改 bug                                               |
| perf     | 优化相关，比如提升性能、体验                           |
| refactor | 代码重构                                               |
| revert   | 回滚到上一个版本                                       |
| style    | 代码格式修改, 注意不是 css 修改                        |
| test     | 测试用例修改                                           |

配置成功后，每次 git commit -m "xxx" 都会 进行响应的校验

![GhxQQz](https://www.helloimg.com/images/2022/03/04/GhxQQz.png)

## 其他

### antd 按需引入

安装 vite-plugin-imp

```bash
npm i vite-plugin-imp -D
```

vite.config.ts 中配置

```ts
//file: vite.config.ts
import vitePluginImp from 'vite-plugin-imp'
...
export default defineConfig({
plugins: [
    react(),
    // 按需 引入 antd
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style: (name) => `antd/lib/${name}/style/index.less`,
        },
      ],
    }),
  ],
  ...
	css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript ，不开启 antd 的按需引入 会报错
        javascriptEnabled: true,
      },
    },
  },
    ...
})


```

### 解决 Vite 里路径别名引用没有类型等提示

配置了路径别名后，虽然可以让 vite 正确的导入资源，但是发现在书写 路径的时候 vscode 并不能正确的提示，导入之后对应的 ts 类型也无法识别

#### 配置 tsconfig.json

需要配置 baseUrl,和 path

```json
"compilerOptions":{
  "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
}
```

#### 修复

正常情况下，这样就行不需要额外的配置。但我这里使用了 airbnb 的 代码风格，airbnb 对文件扩展有校验，在使用路径别进行导入时 ，遇到不能正确推导文件扩展名的问题，查询一番后 最简单的方法就是关闭 import/extensions 规则,希望后续有待修复(2022.03.04)

```js
rules:{
   // 关闭 对文件扩展名的 校验
    'import/extensions': 'off',
}
```
