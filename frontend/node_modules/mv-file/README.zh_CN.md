# mv-file

[![version](https://img.shields.io/npm/v/mv-file?style=flat-square&logo=npm)](https://www.npmjs.com/package/mv-file)
[![codecov](https://codecov.io/gh/Marinerer/accjs/branch/main/graph/badge.svg?token=6JYTSTKYM9)](https://codecov.io/gh/Marinerer/accjs)
[![release](https://img.shields.io/github/actions/workflow/status/Marinerer/accjs/release.yml?style=flat-square)](https://github.com/Marinerer/accjs/releases)
[![node.js](https://img.shields.io/node/v/mv-file?style=flat-square&logo=nodedotjs)](https://nodejs.org/en/about/releases/)
[![license](https://img.shields.io/github/license/Marinerer/accjs?style=flat-square)](https://github.com/Marinerer/accjs)

[English](./README.md) | [中文](./README.zh_CN.md)

简单灵活的 文件/目录 移动工具，支持 `glob` 模式匹配、并发操作和事件处理。

## Features

- 🎯 支持 `Glob` 模式匹配
- 📂 设定目录结构
- 🚀 并发文件操作
- 🎭 监听操作事件
- 🧹 支持清理空目录

## Installation

```bash
npm install mv-file
```

## Usage

### moveFile

```js
import { moveFile } from 'mv-file'

// 移动文件
await moveFile(
	{
		'src/html/': 'dist'
		'src/file.txt': 'dist/file.txt',
		'src/**/*.js': 'dist/js',
	},
	{
		force: true,
		clean: true,
	}
)
```

### createFileMover

```js
import { createFileMover } from 'mv-file'

// 创建操作实例
const mover = createFileMover({
	force: true, // 强制覆盖已存在的文件
	clean: true, // 清理空目录
	base: 'src',
	dest: 'dist',
})

// 移动文件
await mover.move({
	'src/js/**/*.js': 'dist/',
})
// => dist/js/**/*.js

// 监听事件
mover.on('copy:start', (source, target) => {
	console.log(`开始复制: ${source} -> ${target}`)
})

mover.on('copy:done', (source, target) => {
	console.log(`复制完成: ${source} -> ${target}`)
})

mover.on('error', (error) => {
	console.error('操作失败:', error.message)
})
```

## API

```typescript
import { moveFile, createFileMover } from 'mv-file'

// 移动文件
moveFile(pathMap: PathMapping, options?: MoveOptions): Promise<void>
```

```typescript
// 创建操作实例
const mover = createFileMover(options?: MoveOptions): FileMover

// 移动文件
mover.move(pathMap: PathMapping): Promise<void>
```

### `PathMapping`

路径映射表

- 键：源文件路径
- 值：目标文件路径

```typescript
interface PathMapping {
	[source: string]: string
}
```

### `MoveOptions`

配置选项

| 属性          | 类型      | 默认值          | 说明                     |
| ------------- | --------- | --------------- | ------------------------ |
| `cwd`         | `string`  | `process.cwd()` | 当前工作目录             |
| `base`        | `string`  |                 | 源基础目录               |
| `dest`        | `string`  |                 | 目标基础目录             |
| `force`       | `boolean` | `false`         | 是否强制覆盖已存在的文件 |
| `clean`       | `boolean` | `false`         | 是否清理空目录           |
| `verbose`     | `boolean` | `false`         | 启用详细日志             |
| `concurrency` | `number`  | `4`             | 最大并发操作数           |

### `FileMover 类`

#### Methods

##### `move(pathMap: PathMapping): Promise<void>`

根据提供的路径映射移动文件。

#### Event

FileOperator 继承自 EventEmitter，提供以下事件：

| 事件          | 参数                               | 说明           |
| ------------- | ---------------------------------- | -------------- |
| `copy:start`  | `(source: string, target: string)` | 开始copy时触发 |
| `copy:done`   | `(source: string, target: string)` | 完成copy时触发 |
| `clean:start` | `(path: string)`                   | 开始清理时触发 |
| `clean:done`  | `(path: string)`                   | 完成清理时触发 |
| `error`       | `(error: FileMoverError)`          | 发生错误时触发 |

#### FileMoverError

使用自定义的 `FileMoverError` 类进行错误处理：

```typescript
class FileMoverError extends Error {
	code: string
	source?: string
	target?: string
	originalError?: Error
}
```

## License

MIT

## 贡献

欢迎提交 [Pull Request](https://github.com/Marinerer/accjs/pulls) 来改进这个工具！
