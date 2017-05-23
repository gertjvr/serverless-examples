/* eslint-disable */

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err
})

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true })

const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const url = require('url')
const webpack = require('webpack')
const config = require('../config/webpack.config.prod')
const paths = require('../config/paths')
const checkRequiredFiles = require('./utils/checkRequiredFiles')
const FileSizeReporter = require('./utils/FileSizeReporter')

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild).then((previousFileSizes) => {
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuild)

  // Start the webpack build
  build(previousFileSizes)
})

// Print out errors
const printErrors = (summary, errors) => {
  console.log(chalk.red(summary))
  console.log()
  errors.forEach((err) => {
    console.log(err.message || err)
    console.log()
  })
}

// Create the production build and print the deployment instructions.
const build = (previousFileSizes) => {
  console.log('Creating an optimized production build...')

  let compiler
  try {
    compiler = webpack(config)
  } catch (err) {
    printErrors('Failed to compile.', [err])
    process.exit(1)
  }

  compiler.run((err, stats) => {
    if (err) {
      printErrors('Failed to compile.', [err])
      process.exit(1)
    }

    if (stats.compilation.errors.length) {
      printErrors('Failed to compile.', stats.compilation.errors)
      process.exit(1)
    }

    if (process.env.CI && stats.compilation.warnings.length) {
      printErrors(
        'Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.',
        stats.compilation.warnings
      )
      process.exit(1)
    }

    console.log(chalk.green('Compiled successfully.'))
    console.log()

    console.log('Lambda sizes:')
    console.log()
    printFileSizesAfterBuild(stats, previousFileSizes)
    console.log()
  })
}
