import {filePaths} from "../config/paths.js";
import {project} from "../config/project.js";

const server = (instance) => {
  instance.init({
    server: {
      baseDir: filePaths.buildFolder,
    },
    port: project.port ?? 3000,
    open: false,
    cors: true,
    notify: false,       // убрать "Connected" overlay в браузере
    ghostMode: false,    // не синхронизировать клики/скролл/формы между вкладками
    ui: false,           // отключить BrowserSync UI на порту 3001
    logLevel: "warn",    // только ошибки и предупреждения в консоли
    reloadOnRestart: true,
  });
};

export {server};
