import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcRoot = path.join(__dirname, '..', 'src')

function walk(dir, ext, fn) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = ent.name
    const full = path.join(dir, name)
    if (name === 'node_modules') continue
    if (name.startsWith('.')) continue
    if (name.endsWith(' - 복사본.vue')) continue
    if (ent.isFile() && name.endsWith(ext)) fn(full)
    else if (ent.isDirectory()) walk(full, ext, fn)
  }
}

let updated = 0
for (const ext of ['.vue', '.ts']) {
  walk(srcRoot, ext, (file) => {
    let s = fs.readFileSync(file, 'utf8')
    const before = s
    s = s.replace(/(from\s+['"])([^'"]+?)\.js(['"])/g, '$1$2$3')
    if (s !== before) {
      fs.writeFileSync(file, s, 'utf8')
      updated++
    }
  })
}
console.log('Updated', updated, 'files')
