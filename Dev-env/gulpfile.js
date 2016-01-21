/*eslint-env node */
var curProj = 'MeetUp';
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var guppy = require('git-guppy')(gulp);
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var imageminPngquant = require('imagemin-pngquant');

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'lint', 'scripts'], function() {
	gulp.watch('./sass/**/*.scss', ['styles']);
	gulp.watch('./js/**/*.js', ['lint']);
	gulp.watch('./projects/**/*.html', ['copy-html']);
	gulp.watch('./dist/projects/**/*').on('change', browserSync.reload);
  gulp.watch('./.git', ['pre-commit']);
	browserSync.init({
		server: './dist/projects/'+ curProj+'/'
	});
});

gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'lint',
	'scripts-dist',
	'compress'
]);

gulp.task('scripts', function() {
	gulp.src('projects/**/js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
	gulp.src('projects/**/js/**/*.js')
	  .pipe(sourcemaps.init())
	  .pipe(babel())
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
	gulp.src('projects/**/*.html')
		.pipe(gulp.dest('./dist/projects'));
});

gulp.task('copy-images', function() {
	gulp.src('projects/**/img/*')
		.pipe(imageminPngquant({quality: '65-80', speed: 4})())
		.pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	gulp.src('projects/**/sass/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

gulp.task('lint', function () {
	return gulp.src(['projects/**/js/**/*.js'])
		// eslint() attaches the lint output to the eslint property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failOnError last.
		.pipe(eslint.failOnError());
});

gulp.task('tests', function () {
	gulp.src('projects/**/tests/spec/extraSpec.js')
		.pipe(jasmine({
			integration: true,
			vendor: 'js/**/*.js'
		}));
});

gulp.task('pre-commit', function () {
  return gulp.stream('pre-commit')
    .pipe(gulpFilter(['*.js']))
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('compress', function() {
    gulp.src('projects/**/*')
    .pipe(gzip())
    .pipe(gulp.dest('./dist/gzip'));
});
