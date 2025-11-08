# mv-file

[![version](https://img.shields.io/npm/v/mv-file?style=flat-square&logo=npm)](https://www.npmjs.com/package/mv-file)
[![codecov](https://codecov.io/gh/Marinerer/accjs/branch/main/graph/badge.svg?token=6JYTSTKYM9)](https://codecov.io/gh/Marinerer/accjs)
[![release](https://img.shields.io/github/actions/workflow/status/Marinerer/accjs/release.yml?style=flat-square)](https://github.com/Marinerer/accjs/releases)
[![node.js](https://img.shields.io/node/v/mv-file?style=flat-square&logo=nodedotjs)](https://nodejs.org/en/about/releases/)
[![license](https://img.shields.io/github/license/Marinerer/accjs?style=flat-square)](https://github.com/Marinerer/accjs)

[English](./README.md) | [中文](./README.zh_CN.md)

A simple and flexible utility for moving files and directories with support for `glob` patterns, concurrent operations, and event handling.

## Features

- 🎯 Glob pattern support
- 📂 Setting directory structure
- 🚀 Concurrent file operations
- 🎭 Listening to operation events
- 🧹 Optional cleanup of empty directories

## Installation

```bash
npm install mv-file
```

## Usage

### 1. moveFile

```js
import { moveFile } from 'mv-file'

// Move files
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

### 2. createFileMover

```js
import { createFileMover } from 'mv-file'

// // Create an operator instance
const mover = createFileMover({
	force: true,
	clean: true,
	base: 'src',
	dest: 'dist',
})

// Move files
await mover.move({
	'src/js/**/*.js': 'dist/',
})
// => dist/js/**/*.js

// Listen to events
operator.on('copy:start', (source, target) => {
	console.log(`Starting copy: ${source} -> ${target}`)
})

operator.on('copy:done', (source, target) => {
	console.log(`Completed copy: ${source} -> ${target}`)
})

operator.on('error', (error) => {
	console.error('Operation failed:', error.message)
})
```

## API

```typescript
import { moveFile, createFileMover } from 'mv-file'
```

`moveFile`

```typescript
// Moves files
moveFile(pathMap: PathMapping, options?: MoveOptions): Promise<void>
```

`createFileMover`

```typescript
// Create operator instance
const mover = createFileMover(options?: MoveOptions): FileMover

// Moves files
mover.move(pathMap: PathMapping): Promise<void>
```

### `PathMapping`

path mapping table.

- `key`: source path
- `value`: target path

```typescript
interface PathMapping {
	[source: string]: string
}
```

### `MoveOptions`

| Property      | Type      | Default         | Description                                   |
| ------------- | --------- | --------------- | --------------------------------------------- |
| `cwd`         | `string`  | `process.cwd()` | Current working directory                     |
| `base`        | `string`  |                 | Source base directory                         |
| `dest`        | `string`  |                 | Target base directory                         |
| `force`       | `boolean` | `false`         | Whether to force overwrite existing files     |
| `clean`       | `boolean` | `false`         | Whether to clean empty directories after move |
| `verbose`     | `boolean` | `false`         | Enable verbose logging                        |
| `concurrency` | `number`  | `4`             | Maximum number of concurrent operations       |

### `FileMover Class`

#### Methods

##### `move(pathMap: PathMapping): Promise<void>`

Moves files according to the provided path mapping.

#### Events

The FileOperator extends EventEmitter and provides the following events:

| Event         | Parameters                         | Description                             |
| ------------- | ---------------------------------- | --------------------------------------- |
| `copy:start`  | `(source: string, target: string)` | Emitted when a copy operation starts    |
| `copy:done`   | `(source: string, target: string)` | Emitted when a copy operation completes |
| `clean:start` | `(path: string)`                   | Emitted when cleanup starts             |
| `clean:done`  | `(path: string)`                   | Emitted when cleanup completes          |
| `error`       | `(error: FileMoverError)`          | Emitted when an error occurs            |

#### FileMoverError

Use a custom `FileMoverError` class for error handling:

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

## Contributing

Contributions are welcome! Please feel free to submit a [Pull Request](https://github.com/Marinerer/accjs/pulls).
