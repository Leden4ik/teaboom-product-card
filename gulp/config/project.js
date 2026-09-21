// Конфигурация проекта + хелпер замены префикса классов («классовая уникальность»).
import {plugins} from "./plugins.js";
import {project} from "../../project.config.js";

export {project};

// Нужна ли замена префикса (выключается, когда целевой префикс совпадает с исходным).
const needsReprefix = project.prefix && project.prefix !== project.basePrefix;

// Регэксп ищет именно `<basePrefix>__` (двойное подчёркивание) — это исключает
// случайные совпадения со словами вроде "console" и т.п.
const prefixRegExp = new RegExp(`\\b${project.basePrefix}__`, "g");

/**
 * Возвращает новый gulp-стрим, заменяющий префикс классов в проходящих файлах.
 * Вызывать в каждом .pipe() отдельно (стрим одноразовый):
 *   .pipe(reprefix())
 * Работает для CSS, HTML и JS — заменяет вхождения `<basePrefix>__` на `<prefix>__`.
 */
export const reprefix = () =>
  plugins.if(needsReprefix, plugins.replace(prefixRegExp, `${project.prefix}__`));
