const fs = require('fs').promises
const path = require('path')

async function scanDirectory (currentDir, basePath = '') {
  const entries = []
  const items = await fs.readdir(currentDir, { withFileTypes: true })

  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('.')) {
      const itemPath = path.join(currentDir, item.name)
      const relativePath = path.join(basePath, item.name)
      const hasIndex = await checkIndexHtml(itemPath)
      const children = await scanDirectory(itemPath, relativePath)

      entries.push({
        name: item.name,
        path: relativePath.replace(/\\/g, '/'), // 统一为URL路径格式
        isLink: hasIndex,
        children: children.filter(e => e.isLink || e.children.length > 0)
      })
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

async function checkIndexHtml (dirPath) {
  try {
    await fs.access(path.join(dirPath, 'index.html'))
    return true
  }
  catch {
    return false
  }
}

function generateTree (items, level = 0) {
  return items.map(item => `
        <li class="node level-${level}">
            <div class="node-content">
                ${item.isLink ? `
                <span class="icon link-icon">📄</span>
                <a href="${item.path}/" class="demo-link">${item.name}</a>
                ` : `
                <span class="icon dir-icon">📁</span>
                <span class="dir-name">${item.name}</span>
                `}
            </div>
            ${item.children.length > 0 ? `
            <ul class="sub-tree">
                ${generateTree(item.children, level + 1)}
            </ul>` : ''}
        </li>
    `).join('\n')
}

async function generateIndex () {
  const rootDir = __dirname
  const entries = await scanDirectory(rootDir)

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>项目目录结构</title>
    <style>
        :root {
            --dir-color: #4a5568;
            --link-color: #2b6cb0;
            --line-color: #cbd5e0;
        }

        body {
            font-family: ui-sans-serif, system-ui, sans-serif;
            line-height: 1.5;
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 1rem;
        }

        h1 {
            color: #1a202c;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.8rem;
        }

        ul {
            list-style: none;
            padding-left: 1.5rem;
            position: relative;
        }

        .node {
            margin: 0.25rem 0;
            position: relative;
        }

        .node-content {
            display: flex;
            align-items: center;
            min-height: 1.8rem;
            padding: 0.2rem 0;
        }

        .icon {
            display: inline-block;
            width: 1.5em;
            margin-right: 0.5rem;
        }

        .dir-icon {
            color: var(--dir-color);
        }

        .link-icon {
            color: var(--link-color);
        }

        .dir-name {
            color: var(--dir-color);
            font-weight: 500;
        }

        .demo-link {
            color: var(--link-color);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }

        .demo-link:hover {
            color: #1a365d;
            text-decoration: underline;
        }

        /* 树状连接线 */
        .sub-tree {
            position: relative;
            margin-left: 1rem;
        }

        .sub-tree::before {
            content: "";
            position: absolute;
            left: -0.5rem;
            top: 0;
            bottom: 0;
            width: 1px;
            background: var(--line-color);
        }

        .node:not(:last-child)::after {
            content: "";
            position: absolute;
            left: -1.5rem;
            top: 1rem;
            width: 1rem;
            height: 1px;
            background: var(--line-color);
        }
    </style>
</head>
<body>
    <h1>项目目录（共${countLinks(entries)}个演示）</h1>
    <ul class="main-tree">
        ${generateTree(entries)}
    </ul>
</body>
</html>`

  await fs.writeFile(path.join(rootDir, 'index.html'), html)
  console.log('目录索引已生成')
}

function countLinks (entries) {
  return entries.reduce((acc, cur) => {
    return acc + (cur.isLink ? 1 : 0) + countLinks(cur.children)
  }, 0)
}

generateIndex().catch(err => {
  console.error('生成失败:', err)
  process.exit(1)
})