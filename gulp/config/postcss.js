// Общие PostCSS-процессоры для scss.js и split-scss.js (единая точка правки).
import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import flexbugs from "postcss-flexbugs-fixes";
import easings from "postcss-easings";
import cssnano from "cssnano";
import mediaqueries from "postcss-sort-media-queries";
import pxtorem from "postcss-pxtorem";
import momentum from "postcss-momentum-scrolling";
import postcss100vhfix from "postcss-100vh-fix";
import willchange from "postcss-will-change";
import willchangeAdd from "postcss-will-change-transition";

import {project} from "./project.js";

// Базовые процессоры — применяются всегда (dev + build).
// Порядок важен: import → трансформы → autoprefixer (перед минификацией).
const baseProcessors = [
  postcssImport(),
  easings(),
  momentum(),
  postcss100vhfix(),
  flexbugs(),
  willchange(),
  willchangeAdd(),
  mediaqueries({sort: "desktop-first"}),
  pxtorem({
    selectorBlackList: ["html"],
    replace: false,
    rootValue: project.rootValue ?? 16,
    propList: [
      "font", "font-size", "line-height", "letter-spacing",
      "*grid*", "*height*", "*width*", "*left*", "*top*", "*right*", "*bottom*", "*padding*", "*border*",
    ],
  }),
  // Целевые браузеры берутся из .browserslistrc (единый источник).
  autoprefixer({
    remove: true,
    cascade: true,
  }),
];

// Минификация — только в build (тяжёлый advanced-пресет не гоняем на dev-ребилдах).
const minifyProcessor = cssnano({
  preset: ["cssnano-preset-advanced", {zindex: false, reduceIdents: false}],
});

/**
 * Возвращает массив PostCSS-процессоров под режим.
 * dev   → только base (быстрый ребилд, читаемый CSS для отладки)
 * build → base + минификация
 */
export const getProcessors = (isBuild) =>
  isBuild ? [...baseProcessors, minifyProcessor] : baseProcessors;
