import gulp from "gulp";
import {existsSync, promises as fsPromises} from "node:fs";
import Fontmin from "fontmin";

import {filePaths} from "../config/paths.js";
import {logger} from "../config/logger.js";

const {fontFacesFile} = filePaths.src;
const italicRegex = /italic/i;
const cleanSeparator = /(?:_|__|-|\s)?(italic)/i;

const fontWeights = {
  thin: 100,
  hairline: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
  extrablack: 950,
  ultrablack: 950,
};

const fontFaceTemplate = (name, file, weight, style) => `@font-face {
	font-family: '${name}';
	font-display: swap;
	src: url("../fonts/${file}.woff2") format("woff2");
	font-weight: ${weight};
	font-style: ${style};
}\n\n`;

const otfToTtf = (done) => {
  if (existsSync(fontFacesFile)) return done();

  const fontmin = new Fontmin().src(`${filePaths.src.fonts}/*.otf`).use(Fontmin.otf2ttf()).dest(filePaths.src.fonts);

  fontmin.run(function (err) {
    if (err) throw err;
    return done();
  });
};

const ttfToWoff = (done) => {
  if (existsSync(fontFacesFile)) {
    // Шрифты уже конвертированы — просто копируем woff2 в dist
    gulp.src(`${filePaths.src.fonts}/*.{woff,woff2}`, {}).pipe(logger.handleError("FONTS [ttfToWoff]")).pipe(gulp.dest(filePaths.build.fonts)).on("end", done);
    return;
  }

  const fontmin = new Fontmin()
    .src(`${filePaths.src.fonts}/*.ttf`)
    .use(Fontmin.ttf2woff2())
    .dest(filePaths.src.fonts);

  fontmin.run(function (err) {
    if (err) throw err;

    gulp
      .src(`${filePaths.src.fonts}/*.{woff,woff2}`, {})
      .pipe(logger.handleError("FONTS [ttfToWoff]"))
      .pipe(gulp.dest(filePaths.build.fonts))
      .on("end", done);
  });
};

const fontStyle = async () => {
  try {
    if (existsSync(fontFacesFile)) {
      logger.warning("Файл scss/config/fonts.scss уже существует.\nДля обновления файла его нужно удалить!");
      return;
    }

    const fontFiles = await fsPromises.readdir(filePaths.build.fonts);

    if (!fontFiles || fontFiles.length === 0) {
      logger.error("Нет сконвертированных шрифтов");
      return;
    }

    await fsPromises.writeFile(fontFacesFile, "");
    let newFileOnly;

    for (const file of fontFiles) {
      const [fileName] = file.split(".");

      if (newFileOnly !== fileName) {
        const parts = fileName.split("-");
        const name = parts[0];
        // Суффикс: всё после первого дефиса (например "BoldItalic", "Italic", "Regular")
        const suffix = parts.slice(1).join("-") || "regular";

        // Убираем "italic" из суффикса чтобы получить чистый вес
        const weightPart = suffix.replace(cleanSeparator, "").trim().toLowerCase() || "regular";
        const weightString = fontWeights[weightPart] ?? 400;
        const style = italicRegex.test(fileName) ? "italic" : "normal";

        await fsPromises.appendFile(fontFacesFile, fontFaceTemplate(name, fileName, weightString, style));
        newFileOnly = fileName;
      }
    }
  } catch (err) {
    logger.error("Ошибка при обработке шрифтов:\n", err);
  }
};

// ── Сабсеттинг шрифтов ───────────────────────────────────────────────────────
//
// Geologica идёт с полным Unicode, по 60+ КБ на начертание, а их шесть.
// Страница русско-английская, остальные письменности лежат мёртвым грузом.
//
// Задача пересобирает woff2 из .ttf, оставляя кириллицу, латиницу, цифры и
// типографику. Исходные .ttf не трогаются, они остаются полными, и задачу
// всегда можно прогнать заново или откатить.
//
// Запуск вручную: npm run fonts:subset (в общую сборку не входит, шрифты
// меняются редко, гонять сабсеттинг на каждый build незачем).

const subsetCharset = () => {
  const ranges = [
    [0x20, 0x7e],   // базовая латиница, цифры, знаки препинания
    [0x0410, 0x044f], // кириллица А–я
  ];

  let chars = "";
  for (const [from, to] of ranges) {
    for (let code = from; code <= to; code++) chars += String.fromCharCode(code);
  }

  // Ё/ё стоят вне основного диапазона, плюс типографика, валюты и стрелки,
  // которые встречаются в текстах и интерфейсе.
  chars += "ЁёЄєІіЇїҐґ";
  chars += " «»„“”‘’–—…•·№₽€₴$¥£©®™°±×÷≈≤≥→←↑↓✓✔✕−";

  return chars;
};

const fontsSubset = (done) => {
  const charset = subsetCharset();
  // Пишем во временную папку, а обратно забираем ТОЛЬКО woff2. Иначе fontmin
  // кладёт рядом и урезанный .ttf, затирая полный исходник, — на это я уже
  // наступил: исходники пришлось доставать из git.
  const tmpDir = `${filePaths.src.fonts}/.subset-tmp`;

  const fontmin = new Fontmin()
    .src(`${filePaths.src.fonts}/*.ttf`)
    .use(Fontmin.glyph({text: charset, hinting: false}))
    .use(Fontmin.ttf2woff2())
    .dest(tmpDir);

  fontmin.run(async (err) => {
    if (err) throw err;

    try {
      const produced = (await fsPromises.readdir(tmpDir)).filter((f) => f.endsWith(".woff2"));
      for (const file of produced) {
        await fsPromises.copyFile(`${tmpDir}/${file}`, `${filePaths.src.fonts}/${file}`);
      }
      await fsPromises.rm(tmpDir, {recursive: true, force: true});
      logger.warning(`Шрифты урезаны до кириллицы и латиницы, пересобрано начертаний: ${produced.length}.`);
    } catch (copyErr) {
      logger.error("Не удалось перенести урезанные шрифты:\n", copyErr);
    }

    return done();
  });
};

export {otfToTtf, ttfToWoff, fontStyle, fontsSubset};
