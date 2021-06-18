var gulp = require("gulp"),
  browserSync = require("browser-sync").create(),
  rename = require("gulp-rename"),
  reload = browserSync.reload,
  ejs = require("gulp-ejs"),
  i18n = require("gulp-i18n-localize"),
  sass = require("gulp-sass"),
  cleanCSS = require("gulp-clean-css"),
  htmlmin = require("gulp-htmlmin"),
  del = require("del"),
  sitemap = require("gulp-sitemap");

var root = "./",
  locales = root + "locales/",
  dist = root + "dist/",
  styles = root + "styles/";

var styleWatchFiles = styles + "*.scss",
  jsonWatchFiles = locales + "**/*.json";

var ejsSRC = [
  "./**/*.ejs",
  "!" + "./gulpfile.ejs",
  "!" + "./parts/*.ejs",
  "!" + "./common/*.ejs",
  "!" + "./node_modules/**/*.ejs",
  "!" + "./dist/**/*.ejs",
  "!" + "./lambda/**/*.js",
];

var othereejsWatch = [
  "./**/*.ejs",
  "./common/*.ejs",
  "!" + "./gulpfile.ejs",
  "!" + "./node_modules/**/*.ejs",
  "!" + "./dist/*.ejs",
];

var otherWatchFiles = ["js/**/*.js", "pdf/**/*", "images/**/*"];
var delFiles = ["./dist/js/*", "./dist/images/**", "./dist/fonts/*"];
var otherSourceFiles = [
  "./sitemap.xml",
  "./js/**",
  "./pdf/*",
  "./images/**",
  "./fonts/*",
];

// -------------------------------
// EJS TASK
// -------------------------------
function ejsTask() {
  return gulp
    .src(ejsSRC)
    .pipe(ejs())
    .pipe(
      i18n({
        locales: ["en", "ja"],
        localeDir: locales,
      })
    )
    .pipe(
      rename({
        extname: ".html",
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("./dist"));
}

// --------------------------------
// CSS TASK
// --------------------------------
function cssTask() {
  return gulp
    .src("styles/style.scss", {
      allowEmpty: true,
    })
    .pipe(sass().on("error", sass.logError))
    .pipe(cleanCSS({ compatibility: "ie8" }))
    .pipe(rename("style.css"))
    .pipe(gulp.dest("./dist/styles/"));
}

// --------------------------------
// OTHER TASK
// --------------------------------
function otherTasks(done) {
  del(delFiles, done);
  return gulp
    .src(otherSourceFiles, {
      base: "./",
      allowEmpty: true,
    })
    .pipe(gulp.dest("./dist"));
}

// --------------------------------
// COPY TASK
// --------------------------------
function copyTask() {
  return gulp.src(["dist/en/**/*"]).pipe(gulp.dest(dist));
  gulp
    .src(["robots.txt"], {
      allowEmpty: true,
    })
    .pipe(gulp.dest(dist));
}

// --------------------------------
// SITEMAP TASK
// --------------------------------
function siteMapTask() {
  return gulp
    .src(["./dist/**/*.html"], {
      read: true,
    })
    .pipe(
      sitemap({
        siteUrl: "http://solubots.wizdom-inc.com/",
      })
    )
    .pipe(gulp.dest(dist));
}

// --------------------------------
// TASK RELOAD
// --------------------------------
function reloadTask() {
  return reload();
}

// --------------------------------
// EJS WATCH
// --------------------------------
function watchTask() {
  browserSync.init({
    port: 5000,
    startPath: "en",
    server: {
      baseDir: "./dist",
      index: "index.html",
    },
  });

  gulp.watch(othereejsWatch, gulp.series(ejsTask));
  gulp.watch(jsonWatchFiles, gulp.series(ejsTask));
  gulp.watch(styleWatchFiles, gulp.series(cssTask));
  gulp.watch(otherWatchFiles, gulp.series(otherTasks));
}

exports.start = gulp.series(ejsTask, cssTask, otherTasks, watchTask, copyTask);
exports.build = gulp.series(
  ejsTask,
  cssTask,
  otherTasks,
  copyTask,
  siteMapTask
);
