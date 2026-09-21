import gulp from "gulp";
import {build} from "esbuild";
import {resolve} from "node:path";
import {readdirSync} from "node:fs";

import {filePaths} from "../config/paths.js";
import {logger} from "../config/logger.js";
import {reprefix} from "../config/project.js";

const jsSrcDir = resolve("src/js");

// Точки входа — все .js прямо в src/js/ (scripts.js + опциональные module__*.js).
// Файлы из src/js/modules/ не входят: они подключаются через import в scripts.js.
const getEntryPoints = () =>
  readdirSync(jsSrcDir)
    .filter((f) => f.endsWith(".js"))
    .map((f) => resolve(jsSrcDir, f));

/**
 * Сборка JS через esbuild: чистый IIFE без рантайм-обёртки.
 * dev   → без минификации, инлайн source-map
 * build → минификация, без source-map
 * npm-пакеты, если появятся, вшиваются в бандл (tree-shaking).
 */
const javascript = async (isDev, serverInstance) => {
  await build({
    entryPoints: getEntryPoints(),
    outdir: filePaths.build.js,
    entryNames: "[name].min",
    bundle: true,
    format: "iife",
    target: "es2015",
    charset: "utf8",
    minify: !isDev,
    sourcemap: isDev ? "inline" : false,
    legalComments: "none",
    logLevel: "warning",
  });

  // Постобработка: классовая уникальность (<basePrefix>__ → <prefix>__) + рестрим в browserSync.
  return gulp
    .src(`${filePaths.build.js}*.min.js`)
    .pipe(logger.handleError("JS"))
    .pipe(reprefix())
    .pipe(gulp.dest(filePaths.build.js))
    .pipe(serverInstance.stream());
};

export {javascript};
