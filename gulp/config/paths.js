// Получаем имя папки проекта
import path from "path";

const projectDirName = path.basename(path.resolve());
const buildFolder = `./dist`;
const srcFolder = `./src`;

const filePaths = {
  build: {
    js: `${buildFolder}/js/`,
    css: `${buildFolder}/css/`,
    html: `${buildFolder}/`,
    images: `${buildFolder}/img/`,
    fonts: `${buildFolder}/fonts/`,
    static: `${buildFolder}/static/`,
    favicon: `${buildFolder}/favicon/`,
  },
  src: {
    js: `${srcFolder}/js/*.js`,
    images: `${srcFolder}/img/**/*.{jpg,JPG,jpeg,JPEG,png}`,
    imagesHtml: `${srcFolder}/img/**/*.{jpg,JPG,jpeg,JPEG,png,webp,avif}`,
    video: `${srcFolder}/img/**/*.{mp4,webm,ogg,ogv,mov,avi}`,
    svg: `${srcFolder}/img/**/*.svg`,
    scss: `${srcFolder}/scss/*.scss`,
    html: [`${srcFolder}/tmp/index.pug`, `${srcFolder}/tmp/pages/*.pug`],
    static: `${srcFolder}/static/**/*.*`,
    favicon: `${srcFolder}/favicon/**/*.*`,
    svgIcons: `${srcFolder}/icons/*.svg`,
    fontFacesFile: `${srcFolder}/scss/config/fonts.scss`,
    fonts: `${srcFolder}/fonts/`,
  },
  watch: {
    js: `${srcFolder}/js/**/*.js`,
    scss: `${srcFolder}/scss/**/*.scss`,
    html: `${srcFolder}/tmp/**/*.pug`,
    images: `${srcFolder}/**/*.{jpg,JPG,jpeg,JPEG,png,webp,avif,gif,ico}`,
    svg: `${srcFolder}/img/**/*.svg`,
    video: `${srcFolder}/**/*.{mp4,webm,ogg,ogv,mov,avi}`,
    static: `${srcFolder}/static/**/*.*`,
    favicon: `${srcFolder}/favicon/**/*.*`,
    icons: `${srcFolder}/icons/*.svg`,
  },
  clean: buildFolder,
  buildFolder: buildFolder,
  srcFolder: srcFolder,
  projectDirName,
  // ftp: ``, // Путь к нужной папке на удаленном сервере. Gulp добавит имя папки проекта автоматически
};

export {filePaths};
