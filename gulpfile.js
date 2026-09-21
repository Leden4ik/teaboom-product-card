import gulp from "gulp";
import {filePaths} from "./gulp/config/paths.js";
import browserSync from "browser-sync";

// Импорт задач
import {copy} from "./gulp/tasks/copy.js";
import {favicon} from "./gulp/tasks/favicon.js";
import {copyRootFiles} from "./gulp/tasks/copyRootFiles.js";
import {reset} from "./gulp/tasks/reset.js";
import {html} from "./gulp/tasks/html.js";
import {server} from "./gulp/tasks/server.js";
import {scss} from "./gulp/tasks/scss.js";
import {javascript} from "./gulp/tasks/js.js";
import {images} from "./gulp/tasks/images.js";
import {imagesvgo} from "./gulp/tasks/svgo.js";
import {videocopy} from "./gulp/tasks/videocopy.js";
import {otfToTtf, ttfToWoff, fontStyle, fontsSubset} from "./gulp/tasks/fonts.js";
import {createSvgSprite} from "./gulp/tasks/createSvgSprite.js";
import {splitScss} from "./gulp/tasks/split-scss.js";
import {zip} from "./gulp/tasks/zip.js";

const isBuild = process.argv.includes("--build");
const browserSyncInstance = browserSync.create();

const handleServer = server.bind(null, browserSyncInstance);
const handleHTML = html.bind(null, isBuild, browserSyncInstance);
const handleSCSS = scss.bind(null, isBuild, browserSyncInstance);
const handleJS = javascript.bind(null, !isBuild, browserSyncInstance);
const handleSCSSSplit = splitScss.bind(null, isBuild, browserSyncInstance);
const handleImages = images.bind(null, isBuild, browserSyncInstance);
const handleSVGO = imagesvgo.bind(null, isBuild, browserSyncInstance);
const handleVideo = videocopy.bind(null, isBuild, browserSyncInstance);

// Наблюдатель за изменениями в файлах
function watcher() {
  gulp.watch(filePaths.watch.static, copy);
  gulp.watch(filePaths.watch.favicon, favicon);
  gulp.watch(filePaths.watch.html, handleHTML);
  gulp.watch(filePaths.watch.scss, gulp.parallel(handleSCSS, handleSCSSSplit));
  gulp.watch(filePaths.watch.js, handleJS);
  gulp.watch(filePaths.watch.images, handleImages);
  gulp.watch(filePaths.watch.svg, handleSVGO);
  gulp.watch(filePaths.watch.video, handleVideo);
  gulp.watch(filePaths.watch.icons, createSvgSprite);
}

// Последовательная обработка шрифтов
const fonts = gulp.series(otfToTtf, ttfToWoff, fontStyle);

/**
 * Параллельные задачи в режиме разработки.
 * HTML собирается последним: img-to-picture смотрит, какие webp/avif уже лежат
 * в dist/img, и при чистой сборке без этого <picture> остаётся без <source>.
 */
const devTasks = gulp.series(
  gulp.parallel(copy, copyRootFiles, createSvgSprite, favicon, handleSCSS, handleSCSSSplit, handleJS, handleImages, handleSVGO, handleVideo),
  handleHTML
);

/**
 * Основные задачи
 */
const mainTasks = gulp.series(fonts, devTasks);

/**
 * Построение сценариев выполнения задач
 */
const dev = gulp.series(mainTasks, gulp.parallel(watcher, handleServer));
const build = gulp.series(reset, mainTasks);
const deployZIP = gulp.series(reset, mainTasks, zip);
const fontBuld = gulp.series(fonts);

// Выполнение сценария по умолчанию
gulp.task("default", dev);

// Экспорт сценариев
export {dev, fontBuld, fontsSubset, build, deployZIP, handleSVGO, createSvgSprite};
