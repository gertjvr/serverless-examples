const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const filesize = require('filesize')
const recursive = require('recursive-readdir')
const stripAnsi = require('strip-ansi')

const removeFileNameHash = (buildFolder, fileName) =>
    fileName
        .replace(buildFolder, '')
        .replace(/\/?(.*)(\.\w+)(\.js|\.css)/, (match, p1, p2, p3) => p1 + p3)

// Input: 1024, 2048
// Output: "(+1 KB)"
const getDifferenceLabel = (currentSize, previousSize) => {
    const FIFTY_KILOBYTES = 1024 * 50
    const difference = currentSize - previousSize
    const fileSize = !Number.isNaN(difference) ? filesize(difference) : 0
    if (difference >= FIFTY_KILOBYTES) {
        return chalk.red(`+${fileSize}`)
    } else if (difference < FIFTY_KILOBYTES && difference > 0) {
        return chalk.yellow(`+${fileSize}`)
    } else if (difference < 0) {
        return chalk.green(fileSize)
    }
    return ''
}

// Prints a detailed summary of build files.
const printFileSizesAfterBuild = (webpackStats, previousSizeMap) => {
    const root = previousSizeMap.root
    const sizes = previousSizeMap.sizes
    const assets = webpackStats
    .toJson()
    .assets.filter(asset => /\.(js|css)$/.test(asset.name))
    .map((asset) => {
        const stats = fs.statSync(path.join(root, asset.name))
        const size = stats.size
        const previousSize = sizes[removeFileNameHash(root, asset.name)]
        const difference = getDifferenceLabel(size, previousSize)
        return {
            folder: path.join('build', path.dirname(asset.name)),
            name: path.basename(asset.name),
            size,
            sizeLabel: filesize(size) + (difference ? ` (${difference})` : ''),
        }
    })
    assets.sort((a, b) => b.size - a.size)
    const longestSizeLabelLength = Math.max.apply(
    null,
    assets.map(a => stripAnsi(a.sizeLabel).length)
  )
    assets.forEach((asset) => {
        let sizeLabel = asset.sizeLabel
        const sizeLength = stripAnsi(sizeLabel).length
        if (sizeLength < longestSizeLabelLength) {
            const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength)
            sizeLabel += rightPadding
        }
        console.log(
        `  ${sizeLabel}  ${chalk.dim(asset.folder + path.sep)}${chalk.cyan(asset.name)}`
        )
    })
}

const measureFileSizesBeforeBuild = buildFolder =>
    new Promise((resolve) => {
        recursive(buildFolder, (err, fileNames) => {
            let sizes
            if (!err && fileNames) {
                sizes = fileNames
          .filter(fileName => /\.(js|css)$/.test(fileName))
          .reduce((memo, fileName) => {
              const stats = fs.statSync
              const key = removeFileNameHash(buildFolder, fileName)
              memo[key] = stats.size // eslint-disable-line no-param-reassign
              return memo
          }, {})
            }
            resolve({
                root: buildFolder,
                sizes: sizes || {},
            })
        })
    })

module.exports = {
    measureFileSizesBeforeBuild,
    printFileSizesAfterBuild,
}
