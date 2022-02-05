
let preprocessor = 'sass', // Preprocessor (sass, less, styl); 'sass' also work with the Scss syntax in blocks/ folder.
		fileswatch   = 'html,htm,txt,json,md,woff2' // List of files extensions for watching & hard reload

/*
		const { src, dest, parallel, series, watch } = require('gulp')
const browserSync  = require('browser-sync').create()
const bssi         = require('browsersync-ssi')
const ssi          = require('ssi')
const sass         = require('gulp-sass')
const sassglob     = require('gulp-sass-glob')
const cleancss     = require('gulp-clean-css')
const autoprefixer = require('gulp-autoprefixer')
const rename       = require('gulp-rename')
const imagemin     = require('gulp-imagemin')
const newer        = require('gulp-newer')
const rsync        = require('gulp-rsync')
const del          = require('del')
*/


import pkg from 'gulp';
const {src, dest, parallel, series, watch} = pkg;
import browserSync from "browser-sync";
browserSync.create()
import * as bssi from "browsersync-ssi";
import * as ssi from "ssi";
import * as sass from "gulp-sass";
import * as sassglob from "gulp-sass-glob";
import * as cleancss from "gulp-clean-css";
import * as autoprefixer from "gulp-autoprefixer";
import * as rename from "gulp-rename";
import * as imagemin from "gulp-imagemin";
import * as newer from "gulp-newer";
import * as rsync from "gulp-rsync";
import del from "del";
//import * as exports from "exports";





function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'build/',
			middleware: bssi({ baseDir: 'build/', ext: '.html' })
		},
		ghostMode: { clicks: false },
		notify: false,
		online: true,
		// tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
	})
}

function scripts() {
	return src(['build/js/*.js', '!build/js/*.min.js'])
		.pipe(rename('script.min.js'))
		.pipe(dest('build/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src([`build/styles/*.*`, `!build/styles/_*.*`])
		.pipe(eval(`${preprocessor}glob`)())
		.pipe(eval(preprocessor)())
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } },/* format: 'beautify' */ }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(dest('build/css'))
		.pipe(browserSync.stream())
}


function images() {
	return src(['build/images/src/**/*'])
		.pipe(newer('build/images/dist'))
		.pipe(imagemin())
		.pipe(dest('build/images/dist'))
		.pipe(browserSync.stream())
}

function buildcopy() {
	return src([
		'{build/js,build/css}/*.min.*',
		'build/images/**/*.*',
		'!build/images/src/**/*',
		'build/fonts/**/*'
	], { base: 'build/' })
	.pipe(dest('result'))
}

async function buildhtml() {
	let includes = new ssi('build/', 'result/', '/**/*.html')
	includes.compile()
	del('result/parts', { force: true })
}

function cleandist() {
	return del('result/**/*', { force: true })
}

function startwatch() {
	watch(`build/styles/**/*`, { usePolling: true }, styles)
	watch(['build/js/**/*.js', '!build/js/**/*.min.js'], { usePolling: true }, scripts)
	watch('build/images/src/**/*.{jpg,jpeg,png,webp,svg,gif}', { usePolling: true }, images)
	watch(`build/**/*.{${fileswatch}}`, { usePolling: true }).on('change', browserSync.reload)
}

exports.scripts = scripts
exports.styles  = styles
exports.images  = images
exports.assets  = series(scripts, styles, images)
exports.build   = series(cleandist, scripts, styles, images, buildcopy, buildhtml)
exports.default = series(scripts, styles, images, parallel(browsersync, startwatch))