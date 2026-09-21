// Карточка товара: смена фасовки, «В корзину» без реальной корзины, избранное.
// Данные фасовок лежат в data-атрибутах радиокнопок — их рендерит pug
// из src/tmp/_config/product-data.pug, js только читает.

const NBSP = String.fromCharCode(160);

// Та же логика, что formatPrice в src/tmp/_config/format.pug:
// копейки показываем, только если они есть (326,40 ₽, но 1 432 ₽)
const formatPrice = (value) => {
  const hasKopecks = Math.round(value * 100) % 100 !== 0;
  const number = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: hasKopecks ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${number}${NBSP}₽`;
};

const product = document.querySelector(".tb__product");
const form = product && product.querySelector(".js--product-form");

if (form) {
  const $ = (selector) => product.querySelector(selector);
  const fields = {
    sku: $(".js--sku"),
    price: $(".js--price"),
    oldPrice: $(".js--old-price"),
    saving: $(".js--saving"),
    unit: $(".js--unit"),
    discount: $(".js--discount"),
  };
  const cartButton = $(".js--cart");
  const cartLabel = $(".js--cart-label");
  const status = $(".js--status");
  const title = $(".tb__product--title").textContent.trim();

  const readVariant = (input) => ({
    sku: input.value,
    weight: Number(input.dataset.weight),
    price: Number(input.dataset.price),
    oldPrice: Number(input.dataset.oldPrice),
  });

  const render = ({sku, weight, price, oldPrice}) => {
    fields.sku.textContent = sku;
    fields.price.textContent = formatPrice(price);
    fields.oldPrice.textContent = formatPrice(oldPrice);
    fields.saving.textContent = formatPrice(oldPrice - price);
    fields.unit.textContent = formatPrice((price / weight) * 100);
    fields.discount.textContent = `−${Math.round((1 - price / oldPrice) * 100)}%`;
  };

  let resetTimer;
  const resetCartButton = () => {
    clearTimeout(resetTimer);
    cartButton.classList.remove("is-added");
    cartLabel.textContent = "В корзину";
  };

  form.addEventListener("change", (e) => {
    if (e.target.name !== "variant") return;
    render(readVariant(e.target));
    resetCartButton();
  });

  // Реальной корзины нет — показываем отклик и сообщаем скринридеру
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const {sku, weight} = readVariant(form.querySelector("[name='variant']:checked"));

    cartButton.classList.add("is-added");
    cartLabel.textContent = "Добавлено";
    status.textContent = `${title}, ${weight} г (арт. ${sku}) добавлен в корзину`;

    clearTimeout(resetTimer);
    resetTimer = setTimeout(resetCartButton, 2500);
  });

  // Браузер может восстановить выбранную радиокнопку при «назад» — синхронизируем цену
  window.addEventListener("pageshow", () => {
    const checked = form.querySelector("[name='variant']:checked");
    if (checked) render(readVariant(checked));
  });

  const fav = $(".js--fav");
  if (fav) {
    fav.addEventListener("click", () => {
      const pressed = fav.getAttribute("aria-pressed") !== "true";
      fav.setAttribute("aria-pressed", String(pressed));
      fav.setAttribute("aria-label", pressed ? "Убрать из избранного" : "Добавить в избранное");
    });
  }
}
