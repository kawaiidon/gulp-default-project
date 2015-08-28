var gulp = require('gulp'), // Сообственно Gulp JS
    plumber = require('gulp-plumber'), // От остановки из за ошибок в css
    minifyCss = require('gulp-minify-css'), // Минификация CSS
    imagemin = require('gulp-imagemin'), // Минификация изображений, пока не используется
    uglify = require('gulp-uglify'), // Минификация JS
    concat = require('gulp-concat'), // Склейка файлов
    less = require('gulp-less'), // Обработка LESS
    autoprefixer = require('gulp-autoprefixer'), // Подставляет префиксы для браузеров
    watch = require('gulp-watch'), // Отслеживание измненения  файлов
    browserSync = require('browser-sync'), // Отображение в браузере в реальном времени
    notify = require("gulp-notify"), // Выводит ошибки при сборке проектов
    rename = require("gulp-rename"), // Переименование 
    handlebars = require('gulp-compile-handlebars'), // Шаблонизатор на вырост
    templateData = require('./assets/data/data.json'); // Данные для переменных в шаблоне handlebars


// Работа над проектом

gulp.task('default', [
	'copyAssets',
	'browser-sync',
	'handlebars',
    'imagemin',
	'jsConcat',
	'less',
	'watch'
]);

// Сборка проекта

gulp.task('build', [
	'copyAssets',
	'handlebars',
    'imagemin',
	'jsConcat',
	'less'
]);

// Сборщик HTML

gulp.task('handlebars', function () {
	gulp.src('assets/templates/*.handlebars')
        .pipe(handlebars(templateData, {
			ignorePartials: true, //ignores the unknown partials
			partials: {
				footer: '<footer>the end</footer>'
			},
			batch: ['./assets/templates/partials'],
			helpers: {
				capitals: function (str) {
					return str.fn(this).toUpperCase();
				}
			}
		}))
        .pipe(rename(function(path) {
            path.extname = '.html';
    }))
		.pipe(gulp.dest('./public'));
});

// Копируем ASSETS в PUBLIC

gulp.task('copyAssets', function () {
	'use strict';
	gulp.src([
		'assets/**/*.*',
		'!assets/**/*.less', //Исключения. Пока такой костыль, потом для этих файлов будет отдельная папка
        '!assets/data/**/*.json',
        '!assets/templates/**/*.handlebars',
        '!assets/js/**/*.js'
	])
		.pipe(gulp.dest('public'));
});

// Конвертируем JS

gulp.task('jsConcat', function () {
	gulp.src(['assets/js/**/*.js'])
		.pipe(plumber())
		.pipe(concat('app.js'))
		.pipe(uglify())
		.on('error', notify.onError(function (error) {
			return '\nAn error occurred while uglifying js.\nLook in the console for details.\n' + error;
		}))
		.pipe(gulp.dest('public/js'));
});

// Отображение изменений в файлах

gulp.task('browser-sync', function () {
	var files = [
		'public/**/*.html',
		'public/js/**/*.js',
		'public/css/**/*.css'
	];

	browserSync.init(files, {
		server: {
			baseDir: './public'
		},
		open: false
	});
});

// Мониторим изменения в файлах

gulp.task('watch', function () {
	gulp.watch('assets/less/*.less', ['less']);
	gulp.watch('assets/js/**/*.js', ['jsConcat']);
    gulp.watch('assets/img/**/*.*', ['imagemin']);
	gulp.watch('assets/templates/**/*.handlebars', ['handlebars']);
});

// Копируем и минимизируем изображения

gulp.task('images', function() {
    gulp.src('./assets/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./public/img'))

});

// Конвертируем LESS

gulp.task('less', function () {
	gulp.src('assets/less/*.less')
		.pipe(plumber())
		.pipe(less())
		.on('error', notify.onError(function (error) {
			return '\nAn error occurred while compiling css.\nLook in the console for details.\n' + error;
		}))
		.pipe(autoprefixer({
			browsers: ['last 5 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('public/css'));
});

// Минимизация LESS

gulp.task('less-min', function () {
	gulp.src('assets/less/*.less')
		.pipe(plumber())
		.pipe(less())
		.on('error', notify.onError(function (error) {
			return '\nAn error occurred while compiling css.\nLook in the console for details.\n' + error;
		}))
		.pipe(autoprefixer({
			browsers: ['last 5 versions'],
			cascade: false
		}))
		.pipe(minifyCSS({
			keepBreaks: false,
			keepSpecialComments: true,
			benchmark: false,
			debug: true
		}))
		.pipe(gulp.dest('public/css'));
});

// Сообщения об ошибках

gulp.src("assets/test.ext")
  .pipe(notify("Hello Gulp!"));