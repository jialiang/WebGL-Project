"use strict";

const { src, dest, task, watch } = require("gulp");
const beeper = require("beeper");
const browserify = require("browserify");
const exorcist = require("exorcist");
const fancyLog = require("fancy-log");
const minifyStream = require("minify-stream");
const shakeify = require("common-shakeify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const watchify = require("watchify");

const watchedBrowserify = browserify({
  basedir: ".",
  debug: true,
  entries: ["src/main.ts"],
  cache: {},
  packageCache: {},
})
  .plugin(tsify)
  .plugin(watchify)
  .plugin(shakeify)
  .transform("uglifyify", { global: true })
  .transform("babelify", {
    presets: ["@babel/preset-env"],
    extensions: [".ts"],
  });

const copyStatic = () =>
  src(["src/*.html", "src/static/**/*"]).pipe(dest("dist"));

const buildJS = () =>
  watchedBrowserify
    .bundle()
    .on("error", fancyLog)
    .pipe(minifyStream())
    .pipe(exorcist("./dist/bundle.js.map"))
    .pipe(source("bundle.js"))
    .pipe(dest("dist"))
    .on("end", beeper);

task("default", () => {
  watch(
    ["src/*.html", "src/static/**/*"],
    { ignoreInitial: false },
    copyStatic
  );
  buildJS();
});

watchedBrowserify.on("update", buildJS);
watchedBrowserify.on("log", fancyLog);
