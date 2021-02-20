"use strict";

const gulp = require("gulp");
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const source = require("vinyl-source-stream");
const sourcemaps = require("gulp-sourcemaps");
const watchify = require("watchify");
const tsify = require("tsify");
const fancyLog = require("fancy-log");

const watchedBrowserify = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/main.ts"],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);

const copyHTML = () => gulp.src("src/*.html").pipe(gulp.dest("dist"));

const bundle = () =>
  watchedBrowserify
    .transform("babelify", {
      presets: ["@babel/preset-env"],
      extensions: [".ts"],
    })
    .bundle()
    .on("error", fancyLog)
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("dist"));

gulp.task("default", () => {
  gulp.watch("./src/*.html", { ignoreInitial: false }, copyHTML);
  bundle();
});

watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", fancyLog);
