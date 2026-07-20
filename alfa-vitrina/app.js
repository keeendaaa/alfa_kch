(function () {
  "use strict";

  const DEFAULT_PRODUCTS = [
    {
      id: "p1",
      name: "Пакет из 4 роликов",
      price: 12000,
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=900&q=85",
      category: "Видео-пакет",
      type: "service",
      desc: "Съёмка и монтаж 4 коротких роликов для Reels / Shorts / TikTok. Бриф, сценарий, монтаж и цветокоррекция включены. Срок — 7–10 дней."
    },
    {
      id: "p2",
      name: "Пакет из 8 роликов",
      price: 22000,
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=85",
      category: "Видео-пакет",
      type: "service",
      desc: "8 готовых роликов с единым стилем. Подходит для месячного контент-плана. Скидка по сравнению с покупкой поштучно."
    },
    {
      id: "p3",
      name: "Пакет из 12 роликов",
      price: 30000,
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=85",
      category: "Видео-пакет",
      type: "service",
      desc: "Полный комплект контента на месяц: 12 роликов, обложки, хуки и рекомендации по публикации. Срок — до 14 дней."
    },
    {
      id: "p4",
      name: "Монтаж одного ролика",
      price: 3500,
      image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=900&q=85",
      category: "Видео-пакет",
      type: "service",
      desc: "Монтаж и цветокоррекция одного ролика по твоему материалу. До 2 раундов правок. Срок — 2–3 дня."
    },
    {
      id: "p5",
      name: "UGC-ролик для рекламы",
      price: 8000,
      image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=900&q=85",
      category: "Видео-пакет",
      type: "service",
      desc: "Нативный ролик от первого лица для таргета. Съёмка, монтаж, хуки и рекомендации по креативам. Срок — 3–5 дней."
    },
    {
      id: "p6",
      name: "Сторис-пакет (10 шт.)",
      price: 5000,
      image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=900&q=85",
      category: "Видео-пакет",
      type: "service",
      desc: "10 вертикальных сторис под фирменный стиль бренда. Подходят для ленты и закрепов. Срок — 2–4 дня."
    },
    {
      id: "p7",
      name: "Обложки и хуки",
      price: 3000,
      image: "https://images.unsplash.com/photo-1626785774573-4b799314346d?auto=format&fit=crop&w=900&q=85",
      category: "Видео-пакет",
      type: "service",
      desc: "Набор обложек и текстовых хуков к готовым роликам. Помогает поднять CTR и узнаваемость."
    }
  ];

  const AI_DESCRIPTIONS = {
    "Видео-пакет": "Пакет из нескольких коротких роликов. Укажи количество, формат (Reels / Shorts / TikTok), срок сдачи и что входит в монтаж.",
    "Услуга": "Персональная услуга по предварительной записи. Укажи длительность, подготовку и ожидаемый результат.",
    "Уход": "Набор домашнего ухода с понятным составом и рекомендациями по использованию.",
    "Мастер-класс": "Практический мастер-класс в небольшой группе. Материалы и обратная связь включены.",
    "Абонемент": "Пакет регулярных посещений с понятным сроком действия и условиями переноса.",
    "Предзаказ": "Ограниченный предзаказ с датой готовности, условиями оплаты и получения.",
    "Другое": "Полезная вещь для дома и повседневной жизни. Достойное качество по честной цене."
  };

  const DEFAULT_SHOP = {
    name: "Reels для брендов",
    desc: "Съёмка и монтаж коротких видео для локальных брендов: Reels, Shorts и TikTok."
  };

  const BUNDLE_PRODUCT = {
    id: "bundle-video",
    name: "Пакет 8 + обложки",
    price: 24000,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=85",
    category: "Комплект",
    type: "bundle",
    desc: "8 роликов плюс обложки и хуки для каждого. Экономия 2 000 ₽ по сравнению с заказом по отдельности."
  };

  function loadProducts() {
    try {
      const raw = localStorage.getItem("alfaVitrina_products");
      let products = raw ? JSON.parse(raw) : [...DEFAULT_PRODUCTS];

      if (localStorage.getItem("alfaVitrina_productsVersion") !== "5") {
        const isOldDemo = products.some((product) => /Nike|Adidas|New Balance|Макияж|Набор домашнего ухода|Мастер-класс по макияжу/i.test(product.name));
        if (isOldDemo || products.length < DEFAULT_PRODUCTS.length) products = [...DEFAULT_PRODUCTS];
        localStorage.setItem("alfaVitrina_products", JSON.stringify(products));
        localStorage.setItem("alfaVitrina_productsVersion", "5");
      }

      products = products.map((product) => ({
        ...product,
        type: product.type || (product.category === "Видео-пакет" ? "service" : product.category === "Услуга" ? "service" : product.category === "Мастер-класс" ? "event" : product.category === "Абонемент" ? "subscription" : product.category === "Предзаказ" ? "preorder" : "product")
      }));

      return products;
    } catch {
      return [...DEFAULT_PRODUCTS];
    }
  }

  function saveProducts(products) {
    localStorage.setItem("alfaVitrina_products", JSON.stringify(products));
  }

  function loadShop() {
    try {
      const raw = localStorage.getItem("alfaVitrina_shop");
      const shop = raw ? JSON.parse(raw) : DEFAULT_SHOP;
      return /Кроссовки|Студия Леры/i.test(shop.name) ? DEFAULT_SHOP : shop;
    } catch {
      return DEFAULT_SHOP;
    }
  }

  function saveShop(shop) {
    localStorage.setItem("alfaVitrina_shop", JSON.stringify(shop));
  }

  function loadDemoState() {
    try {
      return {
        prepaymentEnabled: false,
        onboardingComplete: false,
        bundleEnabled: false,
        location: { mode: "Только онлайн", city: "Россия", area: "Работаю удалённо" },
        orders: [],
        events: [],
        ...JSON.parse(localStorage.getItem("alfaVitrina_demoState") || "{}")
      };
    } catch {
      return {
        prepaymentEnabled: false,
        onboardingComplete: false,
        bundleEnabled: false,
        location: { mode: "Только онлайн", city: "Россия", area: "Работаю удалённо" },
        orders: [],
        events: []
      };
    }
  }

  function saveDemoState(state) {
    localStorage.setItem("alfaVitrina_demoState", JSON.stringify(state));
  }

  function trackEvent(name, details = {}) {
    const state = loadDemoState();
    state.events.push({ name, timestamp: Date.now(), ...details });
    saveDemoState(state);
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  }

  function productTypeLabel(product) {
    if (product.category === "Видео-пакет") return "Видео-пакет";
    if (product.type === "service") return "Услуга";
    if (product.type === "event") return "Мастер-класс";
    if (product.type === "bundle") return "Комплект";
    if (product.type === "subscription") return "Абонемент";
    if (product.type === "preorder") return "Предзаказ";
    return "Товар";
  }

  function renderProductList() {
    const list = document.getElementById("productList");
    if (!list) return;

    const products = loadProducts();
    if (products.length === 0) {
      list.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🛍️</div>
          <p>Пока нет товаров. Добавь первый выше.</p>
        </div>`;
      return;
    }

    list.innerHTML = products
      .map(
        (p) => `
      <div class="product-card" data-id="${p.id}">
        <div class="product-card-img">${isImageUrl(p.image) ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">` : escapeHtml(p.image)}</div>
        <button class="delete-product" type="button" data-id="${p.id}">Удалить</button>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(p.name)}</div>
          <div class="product-card-price">${formatPrice(p.price)}</div>
        </div>
      </div>
    `
      )
      .join("");

    list.querySelectorAll(".delete-product").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const products = loadProducts().filter((p) => p.id !== id);
        saveProducts(products);
        renderProductList();
      });
    });
  }

  function renderShowcase() {
    const grid = document.getElementById("showcaseGrid");
    const titleEl = document.getElementById("showcaseTitle");
    const descEl = document.getElementById("showcaseDesc");
    if (!grid) return;

    const shop = loadShop();
    if (titleEl) titleEl.textContent = shop.name;
    if (descEl) descEl.textContent = shop.desc;

    const products = loadProducts();
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🛍️</div>
          <p>В этой витрине пока нет товаров.</p>
        </div>`;
      return;
    }

    const demoState = loadDemoState();
    const locationBadge = document.getElementById("showcaseLocation");
    if (locationBadge) {
      locationBadge.textContent = demoState.location.mode === "Только онлайн"
        ? "Онлайн"
        : `${demoState.location.city} · ${demoState.location.area}`;
    }
    grid.innerHTML = products
      .map(
        (p) => `
      <article class="showcase-card" data-product-id="${p.id}" tabindex="0" role="button" aria-label="Открыть ${escapeHtml(p.name)}">
        <div class="showcase-card-img">${isImageUrl(p.image) ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">` : escapeHtml(p.image)}</div>
        <div class="showcase-card-body">
          <span class="showcase-card-type">${productTypeLabel(p)}</span>${demoState.prepaymentEnabled && p.type === "service" && p.category !== "Видео-пакет" ? '<span class="showcase-prepayment">Предоплата 20%</span>' : ""}
          <h3 class="showcase-card-title">${escapeHtml(p.name)}</h3>
          <div class="showcase-card-price">${formatPrice(p.price)}</div>
        </div>
      </article>
    `
      )
      .join("");

    const dialog = document.getElementById("productDialog");
    const dialogImage = document.getElementById("dialogProductImage");
    const dialogTitle = document.getElementById("dialogProductTitle");
    const dialogPrice = document.getElementById("dialogProductPrice");
    const dialogDesc = document.getElementById("dialogProductDesc");
    const dialogCategory = document.getElementById("dialogProductCategory");
    const dialogBuyButton = document.getElementById("dialogBuyButton");
    const metaOneLabel = document.getElementById("dialogMetaOneLabel");
    const metaOneValue = document.getElementById("dialogMetaOneValue");
    const metaTwoLabel = document.getElementById("dialogMetaTwoLabel");
    const metaTwoValue = document.getElementById("dialogMetaTwoValue");
    const dialogPaymentValue = document.getElementById("dialogPaymentValue");
    const checkoutDialog = document.getElementById("checkoutDialog");
    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutFields = document.getElementById("checkoutFields");
    const checkoutSuccess = document.getElementById("checkoutSuccess");
    const bookingSlotGroup = document.getElementById("bookingSlotGroup");
    const fulfillmentGroup = document.getElementById("fulfillmentGroup");
    const fulfillmentMethod = document.getElementById("fulfillmentMethod");
    const deliveryAddressGroup = document.getElementById("deliveryAddressGroup");
    const prepaymentNotice = document.getElementById("prepaymentNotice");
    let selectedProduct = null;
    let checkoutAmount = 0;

    function openProduct(product) {
      if (!dialog) return;
      selectedProduct = product;
      dialogImage.innerHTML = isImageUrl(product.image)
        ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">`
        : `<span>${escapeHtml(product.image)}</span>`;
      dialogTitle.textContent = product.name;
      dialogPrice.textContent = formatPrice(product.price);
      dialogDesc.textContent = product.desc || "Подробное описание появится позже.";
      dialogCategory.textContent = product.category || "Товар";
      const isService = product.type === "service" || product.type === "event" || product.type === "subscription";
      const isVideo = product.category === "Видео-пакет";
      metaOneLabel.textContent = isService ? "Формат" : "Получение";
      metaOneValue.textContent = isVideo ? "Пакет роликов" : product.type === "event" ? "Группа до 8 человек" : isService ? "По записи" : "Доставка / самовывоз";
      metaTwoLabel.textContent = isService ? (isVideo ? "Срок" : "Место") : "Срок";
      const location = loadDemoState().location;
      metaTwoValue.textContent = isVideo
        ? "7–14 дней"
        : isService
        ? (location.mode === "Только онлайн" ? "Онлайн" : `${location.mode} · ${location.city}`)
        : "1–3 дня";
      dialogPaymentValue.textContent = loadDemoState().prepaymentEnabled && product.type === "service" && !isVideo ? "Предоплата 20%" : "Карта или СБП";
      dialogBuyButton.textContent = isService ? (isVideo ? "Выбрать срок и оплатить" : "Выбрать время и оплатить") : "Оформить заказ";
      trackEvent("view_product", { productId: product.id });
      dialog.showModal();

      if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.gsap.fromTo(".product-dialog-layout", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out" });
      }
    }

    grid.querySelectorAll(".showcase-card").forEach((card) => {
      const open = () => openProduct(products.find((product) => product.id === card.dataset.productId));
      card.addEventListener("click", open);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });

    document.getElementById("closeProductDialog")?.addEventListener("click", () => dialog.close());
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    function openCheckout(product) {
      const state = loadDemoState();
      const isVideo = product.category === "Видео-пакет";
      const usesPrepayment = state.prepaymentEnabled && product.type === "service" && !isVideo;
      checkoutAmount = usesPrepayment ? Math.round(product.price * 0.2) : product.price;
      document.getElementById("checkoutProductCategory").textContent = productTypeLabel(product);
      document.getElementById("checkoutProductName").textContent = product.name;
      document.getElementById("checkoutProductPrice").textContent = formatPrice(product.price);
      document.getElementById("checkoutTotalLabel").textContent = usesPrepayment ? "Предоплата 20%" : "К оплате";
      document.getElementById("checkoutTotal").textContent = formatPrice(checkoutAmount);
      const requiresFulfillment = product.type === "product" || product.type === "bundle" || product.type === "preorder";
      bookingSlotGroup.hidden = requiresFulfillment;
      fulfillmentGroup.hidden = !requiresFulfillment;
      deliveryAddressGroup.hidden = !requiresFulfillment || fulfillmentMethod.value !== "Доставка";
      prepaymentNotice.hidden = !usesPrepayment;

      const bookingLabel = bookingSlotGroup.querySelector("label");
      const bookingSelect = bookingSlotGroup.querySelector("select");
      if (isVideo && bookingLabel && bookingSelect) {
        bookingLabel.textContent = "Срок старта проекта";
        bookingSelect.innerHTML = `
          <option>В течение недели</option>
          <option>Через 2 недели</option>
          <option>Через месяц</option>
        `;
      } else if (bookingLabel && bookingSelect) {
        bookingLabel.textContent = "Время записи";
        bookingSelect.innerHTML = `
          <option>22 июля, 12:00</option>
          <option>22 июля, 16:30</option>
          <option>23 июля, 11:00</option>
        `;
      }

      checkoutFields.hidden = false;
      checkoutSuccess.hidden = true;
      dialog.close();
      checkoutDialog.showModal();
      trackEvent("begin_checkout", { productId: product.id });
    }

    fulfillmentMethod?.addEventListener("change", () => {
      deliveryAddressGroup.hidden = fulfillmentMethod.value !== "Доставка";
      trackEvent("choose_fulfillment", { method: fulfillmentMethod.value, productId: selectedProduct?.id });
    });

    dialogBuyButton?.addEventListener("click", () => {
      if (!selectedProduct) return;
      openCheckout(selectedProduct);
    });

    document.getElementById("closeCheckoutDialog")?.addEventListener("click", () => checkoutDialog.close());
    checkoutDialog?.addEventListener("click", (event) => {
      if (event.target === checkoutDialog) checkoutDialog.close();
    });
    checkoutForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!selectedProduct) return;

      const formData = new FormData(checkoutForm);
      const state = loadDemoState();
      const orderNumber = 1049 + state.orders.length;
      const paymentMethod = formData.get("paymentMethod") || "СБП";
      const order = {
        id: orderNumber,
        customer: String(formData.get("customerName") || "Клиент"),
        productName: selectedProduct.name,
        productId: selectedProduct.id,
        amount: checkoutAmount,
        fullPrice: selectedProduct.price,
        paymentMethod,
        slot: selectedProduct.type === "product" || selectedProduct.type === "bundle" || selectedProduct.type === "preorder"
          ? (formData.get("fulfillmentMethod") === "Доставка" ? `Доставка · ${formData.get("deliveryAddress")}` : "Самовывоз из студии")
          : String(formData.get("bookingSlot") || "По записи"),
        status: "new",
        createdAt: new Date().toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
      };
      state.orders.unshift(order);
      state.events.push({ name: "payment_success", timestamp: Date.now(), productId: selectedProduct.id, amount: checkoutAmount });
      saveDemoState(state);

      document.getElementById("receiptNumber").textContent = `№ ${orderNumber}`;
      document.getElementById("receiptAmount").textContent = `${formatPrice(checkoutAmount)} · ${paymentMethod}`;
      document.getElementById("checkoutSuccessText").textContent = selectedProduct.category === "Видео-пакет"
        ? `Проект стартует ${order.slot.toLowerCase()}. Демонстрационный чек отправлен на телефон.`
        : selectedProduct.type === "product"
        ? "Заказ подтверждён. Демонстрационный чек отправлен на телефон."
        : `Запись на ${order.slot} подтверждена. Демонстрационный чек отправлен на телефон.`;
      checkoutFields.hidden = true;
      checkoutSuccess.hidden = false;
      checkoutSuccess.focus();
    });
  }

  function isImageUrl(str) {
    return typeof str === "string" && /^https?:\/\//.test(str);
  }

  function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMotion() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 721px)"
      },
      (context) => {
        const { reduceMotion, desktop } = context.conditions;
        if (reduceMotion) return;

        const distance = desktop ? 52 : 24;
        if (document.querySelector(".hero")) {
          gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(".header", { y: -24, autoAlpha: 0, duration: 0.65 })
            .from(".hero-title > span", { y: distance, autoAlpha: 0, stagger: 0.09, duration: 0.85 }, "-=0.25")
            .from(".hero-subtitle, .hero-actions", { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, "-=0.45")
            .from(".hero-future-image", { scale: 1.08, autoAlpha: 0, duration: 1.1 }, "-=0.95")
            .from(".hero-card", { y: 45, rotation: 1, autoAlpha: 0, duration: 0.85 }, "-=0.65");
        }

        if (document.querySelector(".showcase-header")) {
          gsap.timeline({ defaults: { ease: "power3.out" } })
            .from(".showcase-header h1, .showcase-header p", { y: distance, autoAlpha: 0, stagger: 0.1, duration: 0.8 })
            .from(".showcase-future-art", { x: 60, rotation: 3, autoAlpha: 0, duration: 0.9 }, "-=0.65");
        }

        gsap.utils.toArray(".section-title, .panel-title").forEach((title) => {
          gsap.from(title, {
            y: distance,
            autoAlpha: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: title, start: "top 88%", once: true }
          });
        });

        [
          [".steps", ".step-card"],
          [".features", ".feature-card"]
        ].forEach(([triggerSelector, itemSelector]) => {
          const trigger = document.querySelector(triggerSelector);
          const items = document.querySelectorAll(itemSelector);
          if (!trigger || !items.length) return;

          gsap.from(items, {
            y: distance,
            autoAlpha: 0,
            stagger: desktop ? 0.1 : 0.05,
            duration: 0.72,
            ease: "power3.out",
            scrollTrigger: { trigger, start: "top 86%", once: true }
          });
        });

        const bannerImage = document.querySelector(".future-banner > img");
        if (bannerImage) {
          gsap.fromTo(
            bannerImage,
            { yPercent: desktop ? -7 : -3, scale: 1.06 },
            {
              yPercent: desktop ? 7 : 3,
              ease: "none",
              scrollTrigger: { trigger: ".future-banner", start: "top bottom", end: "bottom top", scrub: 0.8 }
            }
          );
        }

        const heroVisual = document.querySelector(".hero-visual");
        const heroCard = document.querySelector(".hero-card");
        if (!desktop || !heroVisual || !heroCard) return;

        const moveX = gsap.quickTo(heroCard, "x", { duration: 0.55, ease: "power3.out" });
        const moveY = gsap.quickTo(heroCard, "y", { duration: 0.55, ease: "power3.out" });
        const onPointerMove = (event) => {
          const bounds = heroVisual.getBoundingClientRect();
          moveX(((event.clientX - bounds.left) / bounds.width - 0.5) * 22);
          moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * 18);
        };
        const onPointerLeave = () => {
          moveX(0);
          moveY(0);
        };

        heroVisual.addEventListener("pointermove", onPointerMove);
        heroVisual.addEventListener("pointerleave", onPointerLeave);
        return () => {
          heroVisual.removeEventListener("pointermove", onPointerMove);
          heroVisual.removeEventListener("pointerleave", onPointerLeave);
        };
      }
    );

    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }

  function renderDemoOrders() {
    const state = loadDemoState();
    document.querySelectorAll(".demo-order, .demo-payment").forEach((item) => item.remove());

    const ordersTable = document.getElementById("ordersTable");
    const paymentsTable = document.getElementById("paymentsTable");
    const ordersHead = ordersTable?.querySelector(".crm-table-head");
    const paymentsHead = paymentsTable?.querySelector(".crm-table-head");

    state.orders.forEach((order) => {
      const orderRow = document.createElement("article");
      orderRow.className = "crm-row demo-order";
      orderRow.dataset.orderStatus = "new";
      orderRow.innerHTML = `
        <div data-label="Заказ"><strong>#${order.id}</strong><small>${escapeHtml(order.createdAt)}</small></div>
        <div data-label="Клиент"><strong>${escapeHtml(order.customer)}</strong><small>Витрина</small></div>
        <div data-label="Состав"><strong>${escapeHtml(order.productName)}</strong><small>${escapeHtml(order.slot)}</small></div>
        <div data-label="Статус"><span class="status status-new">Новый</span></div>
        <div data-label="Сумма"><strong>${formatPrice(order.fullPrice)}</strong><small class="paid">${order.amount < order.fullPrice ? `Предоплата ${formatPrice(order.amount)}` : "Оплачен"}</small></div>
        <button type="button" class="row-action">Открыть</button>`;
      ordersHead?.insertAdjacentElement("afterend", orderRow);

      const paymentRow = document.createElement("article");
      paymentRow.className = "crm-row demo-payment";
      paymentRow.innerHTML = `
        <div data-label="Операция"><strong>Оплата</strong><small>${escapeHtml(order.createdAt)}</small></div>
        <div data-label="Заказ"><strong>#${order.id}</strong><small>${escapeHtml(order.customer)}</small></div>
        <div data-label="Способ"><strong>${escapeHtml(order.paymentMethod)}</strong><small>Демо-платёж</small></div>
        <div data-label="Статус"><span class="status status-done">Зачислен</span></div>
        <div data-label="Сумма"><strong class="amount-positive">+${formatPrice(order.amount)}</strong><small>Комиссия рассчитана условно</small></div>`;
      paymentsHead?.insertAdjacentElement("afterend", paymentRow);
    });

    const addedRevenue = state.orders.reduce((sum, order) => sum + order.amount, 0);
    const orderCount = 14 + state.orders.length;
    const revenue = 160360 + addedRevenue;
    if (document.getElementById("ordersRevenue")) document.getElementById("ordersRevenue").textContent = formatPrice(revenue);
    if (document.getElementById("ordersChartTotal")) document.getElementById("ordersChartTotal").textContent = formatPrice(revenue);
    if (document.getElementById("newOrdersCount")) document.getElementById("newOrdersCount").textContent = String(8 + state.orders.length);
    if (document.getElementById("averageOrderValue")) document.getElementById("averageOrderValue").textContent = formatPrice(Math.round(revenue / orderCount));
    if (document.getElementById("paidOrdersCount")) document.getElementById("paidOrdersCount").textContent = `${orderCount} оплаченных заказов`;
    if (document.getElementById("paymentsReceived")) document.getElementById("paymentsReceived").textContent = formatPrice(revenue);
    if (document.getElementById("paymentsCount")) document.getElementById("paymentsCount").textContent = `${16 + state.orders.length} платежей`;
    const revenueTab = document.querySelector('[data-payment-metric="revenue"] strong');
    if (revenueTab) revenueTab.textContent = formatPrice(86200 + addedRevenue);
  }

  function renderGrowth() {
    const state = loadDemoState();
    const eventCount = (name) => state.events.filter((event) => event.name === name).length;
    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value);
    };
    setText("funnelViews", 426 + eventCount("view_product"));
    setText("funnelStarts", 96 + eventCount("begin_checkout"));
    setText("funnelBookings", 61 + eventCount("payment_success"));

    const enableButton = document.getElementById("enablePrepayment");
    const disableButton = document.getElementById("disablePrepayment");
    const result = document.querySelector(".experiment-result");
    const uplift = document.querySelector(".experiment-uplift");
    const disclaimer = document.querySelector(".experiment-disclaimer");
    if (!enableButton) return;

    enableButton.disabled = state.prepaymentEnabled;
    enableButton.textContent = state.prepaymentEnabled ? "Предоплата включена" : "Включить предоплату 20%";
    disableButton.hidden = !state.prepaymentEnabled;
    result.hidden = !state.prepaymentEnabled;
    uplift.hidden = !state.prepaymentEnabled;
    disclaimer.hidden = !state.prepaymentEnabled;
    setText("experimentTitle", state.prepaymentEnabled ? "Отмен стало меньше" : "Ждёт запуска");
    setText("experimentDescription", state.prepaymentEnabled
      ? "Механика активна на витрине. Ниже показан симулированный результат интерфейса после 14 дней."
      : "После включения предоплаты здесь появится сравнение с предыдущим периодом.");
  }

  function initDashboard() {
    const form = document.getElementById("productForm");
    const aiBtn = document.getElementById("aiGenerate");
    const shopName = document.getElementById("shopName");
    const shopDesc = document.getElementById("shopDesc");
    const copyBtn = document.getElementById("copyLink");
    const analyzeBusiness = document.getElementById("analyzeBusiness");
    const aiBusinessDraft = document.getElementById("aiBusinessDraft");
    const confirmDraft = document.getElementById("confirmDraft");
    const publishAiDraft = document.getElementById("publishAiDraft");
    const enablePrepayment = document.getElementById("enablePrepayment");
    const disablePrepayment = document.getElementById("disablePrepayment");
    const setupView = document.querySelector('[data-dashboard-view="setup"]');
    const setupLayout = setupView?.querySelector(".setup-layout");
    const setupHeading = setupView?.querySelector(".setup-heading");
    const setupPanel = setupView?.querySelector(".ai-setup-panel");
    const serviceMode = document.getElementById("serviceMode");
    const businessCity = document.getElementById("businessCity");
    const serviceArea = document.getElementById("serviceArea");
    const ordersCopilotAction = document.getElementById("ordersCopilotAction");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animateAnalyticsView(view) {
      if (!window.gsap || reduceMotion || !view.matches('[data-dashboard-view="orders"], [data-dashboard-view="payments"]')) return;
      const blocks = view.querySelectorAll(".crm-metric, .payment-metrics article, .analytics-card, .crm-panel");
      const paths = view.querySelectorAll(".chart-line");
      const bars = view.querySelectorAll(".horizontal-bars b");
      const donuts = view.querySelectorAll(".donut");
      window.gsap.killTweensOf([blocks, paths, bars, donuts]);
      window.gsap.set(blocks, { clearProps: "transform,opacity,visibility" });
      window.gsap.fromTo(
        blocks,
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.48, stagger: 0.045, ease: "power3.out", clearProps: "transform,opacity,visibility" }
      );
      paths.forEach((path) => {
        const length = path.getTotalLength();
        window.gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1, ease: "power2.out", clearProps: "stroke-dasharray,stroke-dashoffset" });
      });
      window.gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.08, ease: "power3.out", clearProps: "transform" });
      window.gsap.fromTo(donuts, { rotation: -24, scale: 0.9, autoAlpha: 0 }, { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.65, ease: "back.out(1.4)", clearProps: "transform,opacity,visibility" });
    }

    function showDashboardView(viewName) {
      const availableViews = ["setup", "products", "orders", "growth", "payments"];
      const nextView = availableViews.includes(viewName) ? viewName : "products";

      document.querySelectorAll("[data-dashboard-view]").forEach((view) => {
        if (window.gsap) {
          const animated = view.querySelectorAll(".crm-metric, .payment-metrics article, .analytics-card, .crm-panel");
          window.gsap.killTweensOf(animated);
          window.gsap.set(animated, { clearProps: "transform,opacity,visibility" });
        }
        view.hidden = view.dataset.dashboardView !== nextView;
      });
      document.querySelectorAll("[data-dashboard-link]").forEach((link) => {
        link.classList.toggle("active", link.dataset.dashboardLink === nextView);
      });

      const activeView = document.querySelector(`[data-dashboard-view="${nextView}"]`);
      if (activeView && window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.gsap.killTweensOf(activeView);
        window.gsap.fromTo(activeView, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", clearProps: "transform,opacity,visibility" });
      }
      requestAnimationFrame(() => animateAnalyticsView(activeView));
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    document.querySelectorAll("[data-dashboard-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const nextView = link.dataset.dashboardLink;
        history.pushState(null, "", `#${nextView}`);
        showDashboardView(nextView);
      });
    });

    window.addEventListener("popstate", () => showDashboardView(location.hash.slice(1)));
    const initialView = location.hash.slice(1) || (loadDemoState().onboardingComplete ? "products" : "setup");
    showDashboardView(initialView);

    if (initialView === "setup" && window.gsap && !reduceMotion) {
      window.gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".setup-heading > *", { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.55 })
        .from(setupPanel, { y: 30, autoAlpha: 0, duration: 0.65 }, "-=0.32");
    }

    analyzeBusiness?.addEventListener("click", () => {
      analyzeBusiness.disabled = true;
      analyzeBusiness.textContent = "AI выделяет сценарии…";
      setTimeout(() => {
        const previousHeading = setupHeading?.getBoundingClientRect();
        const previousPanel = setupPanel?.getBoundingClientRect();
        setupView?.classList.add("is-analyzed");
        setupLayout?.classList.add("is-analyzed");
        aiBusinessDraft.hidden = false;
        analyzeBusiness.textContent = "Черновик собран";
        updateDraftConfirmation();

        if (window.gsap && !reduceMotion && previousHeading && previousPanel) {
          const nextHeading = setupHeading.getBoundingClientRect();
          const nextPanel = setupPanel.getBoundingClientRect();
          const draftItems = aiBusinessDraft.querySelectorAll(".draft-head, .draft-grid article, .ai-question, .geo-question, .confirm-row, .ai-business-draft > .btn");
          window.gsap.timeline({ defaults: { ease: "power3.out" } })
            .fromTo(setupHeading, { x: previousHeading.left - nextHeading.left }, { x: 0, duration: 0.75 }, 0)
            .fromTo(setupPanel, { x: previousPanel.left - nextPanel.left }, { x: 0, duration: 0.75 }, 0)
            .fromTo(aiBusinessDraft, { x: 56, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, clearProps: "transform,opacity,visibility" }, 0.08)
            .fromTo(draftItems, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.42, clearProps: "transform,opacity,visibility" }, 0.22);
        }

        if (window.matchMedia("(max-width: 1000px)").matches) {
          aiBusinessDraft.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start", inline: "nearest" });
        }
      }, 550);
    });

    function updateDraftConfirmation() {
      const needsLocation = serviceMode.value !== "Только онлайн";
      const hasLocation = !needsLocation || (businessCity.value.trim() && serviceArea.value.trim());
      publishAiDraft.disabled = !confirmDraft.checked || !hasLocation;
    }

    confirmDraft?.addEventListener("change", updateDraftConfirmation);
    serviceMode?.addEventListener("change", updateDraftConfirmation);
    businessCity?.addEventListener("input", updateDraftConfirmation);
    serviceArea?.addEventListener("input", updateDraftConfirmation);

    publishAiDraft?.addEventListener("click", () => {
      saveShop(DEFAULT_SHOP);
      saveProducts([...DEFAULT_PRODUCTS]);
      const state = loadDemoState();
      state.onboardingComplete = true;
      state.prepaymentEnabled = false;
      state.bundleEnabled = false;
      state.orders = [];
      state.events = [];
      state.location = {
        mode: serviceMode.value,
        city: businessCity.value.trim(),
        area: serviceArea.value.trim()
      };
      saveDemoState(state);
      shopName.value = DEFAULT_SHOP.name;
      shopDesc.value = DEFAULT_SHOP.desc;
      renderProductList();
      publishAiDraft.textContent = "Витрина опубликована";
      history.pushState(null, "", "#products");
      showDashboardView("products");
    });

    enablePrepayment?.addEventListener("click", () => {
      const state = loadDemoState();
      state.prepaymentEnabled = true;
      state.events.push({ name: "recommendation_enabled", timestamp: Date.now(), recommendation: "prepayment_20" });
      saveDemoState(state);
      renderGrowth();
    });

    disablePrepayment?.addEventListener("click", () => {
      const state = loadDemoState();
      state.prepaymentEnabled = false;
      saveDemoState(state);
      renderGrowth();
    });

    document.querySelectorAll("[data-order-filter]").forEach((filter) => {
      filter.addEventListener("click", () => {
        const status = filter.dataset.orderFilter;
        document.querySelectorAll("[data-order-filter]").forEach((item) => item.classList.toggle("active", item === filter));
        document.querySelectorAll("[data-order-status]").forEach((order) => {
          order.hidden = status !== "all" && order.dataset.orderStatus !== status;
        });
      });
    });

    const copilotAnswers = {
      repeat: {
        title: "Напомни клиенту перед окончанием пакета",
        text: "Клиенты заказывают следующий пакет в среднем за 5–7 дней до финальной сдачи. Персональное предложение продления точнее скидки и не снижает маржу.",
        note: "Сигнал найден в повторных заказах за последние три месяца."
      },
      bundle: {
        title: "Добавь обложки и хуки к пакету",
        text: "Ролики с обложками и текстовыми хуками собирают больше просмотров, но клиенты часто не заказывают их отдельно. Создай комплект «ролики + обложки» и проверь attach rate.",
        note: "ML использует состав заказов, а не только сумму платежа."
      },
      cancel: {
        title: "Основная потеря — непроработанный бриф",
        text: "Большинство отмен и переносов случается, когда сроки или формат роликов не зафиксированы в брифе. Предоплата 30% и утверждённый бриф — приоритетный эксперимент.",
        note: "Сравнение выполнено с обезличенной когортой видео-мейкеров."
      },
      fees: {
        title: "Покажи СБП первым на мобильных",
        text: "58% покупателей уже выбирают СБП. Если сделать его первым способом на мобильных, доля может вырасти ещё на 9–13% без ухудшения конверсии.",
        note: "Прогноз касается комиссии и оплаченной выручки, а не прибыли."
      },
      refunds: {
        title: "Возвраты связаны с неутверждёнными правками",
        text: "72% суммы возвратов пришлось на заказы, где клиент не утвердил финальную версию в срок. Добавь лимит правок и чёткий дедлайн — это сохранит заказ.",
        note: "Вывод построен по статусам заказов и возвратам эквайринга."
      },
      payout: {
        title: "Следующее зачисление — сегодня до 21:00",
        text: "7 939,20 ₽ находятся в обработке. Задержек не обнаружено; все операции укладываются в текущий график выплат.",
        note: "Copilot объясняет статусы платежей, но не меняет график выплат."
      }
    };

    document.querySelectorAll("[data-copilot-prompt]").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest("[data-copilot]");
        const response = card.querySelector(".copilot-response");
        const answer = copilotAnswers[button.dataset.copilotPrompt];
        card.querySelectorAll("[data-copilot-prompt]").forEach((item) => item.classList.toggle("active", item === button));
        response.querySelector("strong").textContent = answer.title;
        response.querySelector("p").textContent = answer.text;
        response.querySelector("small").textContent = answer.note;
        if (card.dataset.copilot === "orders") {
          const bundleEnabled = loadProducts().some((product) => product.id === BUNDLE_PRODUCT.id);
          ordersCopilotAction.hidden = button.dataset.copilotPrompt !== "bundle";
          ordersCopilotAction.disabled = bundleEnabled;
          ordersCopilotAction.textContent = bundleEnabled ? "Комплект уже на витрине" : "Создать комплект в один клик";
        }
        if (window.gsap && !reduceMotion) {
          const content = response.children;
          window.gsap.fromTo(content, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.05, ease: "power2.out", clearProps: "transform,opacity,visibility" });
        }
      });
    });

    ordersCopilotAction?.addEventListener("click", () => {
      const products = loadProducts();
      if (!products.some((product) => product.id === BUNDLE_PRODUCT.id)) {
        products.push(BUNDLE_PRODUCT);
        saveProducts(products);
      }
      const state = loadDemoState();
      state.bundleEnabled = true;
      state.events.push({ name: "recommendation_enabled", timestamp: Date.now(), recommendation: "makeup_care_bundle" });
      saveDemoState(state);
      ordersCopilotAction.disabled = true;
      ordersCopilotAction.textContent = "Комплект добавлен на витрину";
      const response = document.getElementById("ordersCopilotResponse");
      response.querySelector("strong").textContent = "Комплект опубликован";
      response.querySelector("p").textContent = "8 роликов и обложки объединены в одну карточку за 24 000 ₽. Теперь можно измерять attach rate и оплаченную выручку комплекта.";
      response.querySelector("small").textContent = "Изменение можно отменить удалением карточки в каталоге.";
    });

    const growthStages = {
      start: ["Первая витрина опубликована", "Подключены только необходимые способы оплаты: СБП, карты и AlfaPay. Следующий продукт появится после подтверждённого сигнала роста."],
      regular: ["Клиенты возвращаются за следующим пакетом", "AI предложит абонемент на ежемесячный контент или рекуррентный платёж, когда регулярность подтвердится данными повторных заказов."],
      offline: ["Появилась съёмочная студия или точка", "AlfaPOS, mPOS и Альфа-Касса объединят офлайн-оплату с заказами Витрины и общей аналитикой."],
      team: ["В бизнесе появились исполнители", "Массовые выплаты монтажёрам, операторам и чаевые раскроются после настройки ролей и корректной договорной модели."],
      business: ["Самозанятости становится недостаточно", "Правила, а не LLM, проверят ограничения и предложат переход на ИП, РКО и подходящий налоговый контур."],
      checkout: ["Каталог переезжает на собственный сайт", "Alfa Checkout + Analytics SDK сохранят ID товаров, историю, воронку, когорты, эксперименты и связи между товарами. При внешней CRM подключится отраслевая интеграция."]
    };

    document.querySelectorAll("[data-growth-stage]").forEach((button) => {
      button.addEventListener("click", () => {
        const detail = document.getElementById("growthStageDetail");
        const [title, text] = growthStages[button.dataset.growthStage];
        button.parentElement.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
        detail.querySelector("strong").textContent = title;
        detail.querySelector("p").textContent = text;
        if (window.gsap && !reduceMotion) {
          window.gsap.fromTo(detail.children, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.05, ease: "power2.out", clearProps: "transform,opacity,visibility" });
        }
      });
    });

    const CHART_XS = [45, 160, 275, 390, 505, 620, 735];
    const CHART_BASELINE_Y = 220;

    function buildChartLine(values) {
      const n = values.length;
      if (n === 0) return "";
      let d = `M${CHART_XS[0]} ${values[0]}`;
      for (let i = 0; i < n - 1; i++) {
        const x0 = CHART_XS[Math.max(0, i - 1)];
        const y0 = values[Math.max(0, i - 1)];
        const x1 = CHART_XS[i];
        const y1 = values[i];
        const x2 = CHART_XS[i + 1];
        const y2 = values[i + 1];
        const x3 = CHART_XS[Math.min(n - 1, i + 2)];
        const y3 = values[Math.min(n - 1, i + 2)];
        const cp1x = x1 + (x2 - x0) / 6;
        const cp1y = y1 + (y2 - y0) / 6;
        const cp2x = x2 - (x3 - x1) / 6;
        const cp2y = y2 - (y3 - y1) / 6;
        d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${x2} ${y2}`;
      }
      return d;
    }

    function buildCollapsedChartLine(values) {
      const n = values.length;
      if (n === 0) return "";
      let d = `M${CHART_XS[0]} ${values[0]}`;
      for (let i = 0; i < n - 1; i++) {
        const y0 = values[Math.max(0, i - 1)];
        const y1 = values[i];
        const y2 = values[i + 1];
        const y3 = values[Math.min(n - 1, i + 2)];
        const cp1y = y1 + (y2 - y0) / 6;
        const cp2y = y2 - (y3 - y1) / 6;
        d += ` C${CHART_XS[0]} ${cp1y.toFixed(1)} ${CHART_XS[0]} ${cp2y.toFixed(1)} ${CHART_XS[0]} ${y2}`;
      }
      return d;
    }

    function buildChartArea(lineD) {
      return `${lineD} L735 ${CHART_BASELINE_Y} L45 ${CHART_BASELINE_Y} Z`;
    }

    function prepChartData(dataMap) {
      Object.values(dataMap).forEach((metric) => {
        metric.line = buildChartLine(metric.values);
        metric.area = buildChartArea(metric.line);
        metric.collapsed = buildCollapsedChartLine(metric.values);
      });
    }

    function resetCircleStyle(circle) {
      circle.removeAttribute("transform");
      circle.style.transform = "";
      circle.style.transformOrigin = "";
      circle.style.opacity = "";
      circle.style.visibility = "";
    }

    function initChart(lineEl, areaEl, pointsEl, metric) {
      if (!lineEl || !areaEl) return;
      lineEl.setAttribute("d", metric.line);
      areaEl.setAttribute("d", metric.area);
      const circles = pointsEl ? Array.from(pointsEl.querySelectorAll("circle")) : [];
      circles.forEach((circle, i) => {
        if (metric.values[i] !== undefined) {
          resetCircleStyle(circle);
          circle.setAttribute("cx", CHART_XS[i]);
          circle.setAttribute("cy", metric.values[i]);
          circle.setAttribute("r", 5);
          circle.setAttribute("opacity", 1);
        }
      });
    }

    function switchChart(lineEl, areaEl, pointsEl, from, to) {
      const circles = pointsEl ? Array.from(pointsEl.querySelectorAll("circle")) : [];
      if (window.gsap && !reduceMotion && lineEl && areaEl) {
        const tl = window.gsap.timeline();
        window.gsap.killTweensOf([lineEl, areaEl, ...circles]);
        circles.forEach(resetCircleStyle);

        // Phase 1 — сворачиваем текущий график к левому краю (обратная траектория)
        tl.to(lineEl, { attr: { d: from.collapsed }, duration: 0.4, ease: "power2.inOut" }, 0);
        tl.to(areaEl, { attr: { d: buildChartArea(from.collapsed) }, duration: 0.4, ease: "power2.inOut" }, 0);
        circles.forEach((circle, i) => {
          const staggerOut = (circles.length - 1 - i) * 0.02;
          tl.to(circle, { attr: { cx: CHART_XS[0], r: 0, opacity: 0 }, duration: 0.35, ease: "power2.inOut" }, 0 + staggerOut);
        });

        // Phase 2 — меняем набор данных, оставаясь в свёрнутом состоянии
        tl.call(() => {
          lineEl.setAttribute("d", to.collapsed);
          areaEl.setAttribute("d", buildChartArea(to.collapsed));
          circles.forEach((circle, i) => {
            resetCircleStyle(circle);
            circle.setAttribute("cx", CHART_XS[0]);
            circle.setAttribute("cy", to.values[i]);
            circle.setAttribute("r", 0);
            circle.setAttribute("opacity", 0);
          });
        });

        // Phase 3 — рисуем новый график слева направо, точки движутся вместе с линией
        tl.to(lineEl, { attr: { d: to.line }, duration: 0.55, ease: "power2.out" });
        tl.to(areaEl, { attr: { d: to.area }, duration: 0.55, ease: "power2.out" }, "<");
        circles.forEach((circle, i) => {
          const staggerIn = i * 0.02;
          tl.to(circle, { attr: { cx: CHART_XS[i], cy: to.values[i], r: 5, opacity: 1 }, duration: 0.55, ease: "power2.out" }, "<" + staggerIn);
        });
      } else {
        lineEl?.setAttribute("d", to.line);
        areaEl?.setAttribute("d", to.area);
        circles.forEach((circle, i) => {
          resetCircleStyle(circle);
          circle.setAttribute("cx", CHART_XS[i]);
          circle.setAttribute("cy", to.values[i]);
          circle.setAttribute("r", 5);
          circle.setAttribute("opacity", 1);
        });
      }
    }

    const orderChartData = {
      7: { total: "86 200 ₽", delta: "+24% к прошлой неделе", values: [210, 180, 145, 82, 160, 135, 48] },
      30: { total: "160 360 ₽", delta: "+24% к прошлому месяцу", values: [190, 165, 145, 120, 100, 78, 55] }
    };
    prepChartData(orderChartData);

    const ordersChartLine = document.getElementById("ordersChartLine");
    const ordersChartArea = document.getElementById("ordersChartArea");
    const ordersChartPoints = document.getElementById("ordersChartPoints");
    initChart(ordersChartLine, ordersChartArea, ordersChartPoints, orderChartData["7"]);

    document.querySelectorAll("[data-chart-period]").forEach((button) => {
      button.addEventListener("click", () => {
        const period = button.dataset.chartPeriod;
        const to = orderChartData[period];
        if (!to) return;
        const fromButton = button.parentElement.querySelector("button.active");
        if (fromButton?.dataset.chartPeriod === period) return;
        const from = orderChartData[fromButton?.dataset.chartPeriod] || orderChartData["7"];
        button.parentElement.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
        document.getElementById("ordersChartTotal").textContent = to.total;
        document.getElementById("ordersChartDelta").textContent = to.delta;
        switchChart(ordersChartLine, ordersChartArea, ordersChartPoints, from, to);
      });
    });

    const paymentChartData = {
      revenue: { values: [180, 200, 205, 80, 190, 195, 82] },
      refunds: { values: [212, 212, 210, 120, 210, 212, 212] },
      fees: { values: [195, 205, 195, 145, 188, 170, 128] },
      average: { values: [170, 150, 135, 115, 128, 110, 120] }
    };
    prepChartData(paymentChartData);

    const paymentChartLine = document.getElementById("paymentChartLine");
    const paymentChartArea = document.getElementById("paymentChartArea");
    const paymentChartPoints = document.getElementById("paymentChartPoints");
    initChart(paymentChartLine, paymentChartArea, paymentChartPoints, paymentChartData.revenue);

    document.querySelectorAll("[data-payment-metric]").forEach((button) => {
      button.addEventListener("click", () => {
        const metric = button.dataset.paymentMetric;
        const to = paymentChartData[metric];
        if (!to) return;
        const fromButton = button.parentElement.querySelector("button.active");
        if (fromButton?.dataset.paymentMetric === metric) return;
        const from = paymentChartData[fromButton?.dataset.paymentMetric] || paymentChartData.revenue;
        button.parentElement.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
        switchChart(paymentChartLine, paymentChartArea, paymentChartPoints, from, to);
      });
    });

    const shop = loadShop();
    if (shopName) shopName.value = shop.name;
    if (shopDesc) shopDesc.value = shop.desc;

    function updateShop() {
      saveShop({ name: shopName.value, desc: shopDesc.value });
    }

    if (shopName) shopName.addEventListener("input", updateShop);
    if (shopDesc) shopDesc.addEventListener("input", updateShop);

    if (aiBtn) {
      aiBtn.addEventListener("click", () => {
        const category = document.getElementById("productCategory").value;
        const descField = document.getElementById("productDesc");
        descField.value = AI_DESCRIPTIONS[category] || AI_DESCRIPTIONS["Другое"];
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("productName").value.trim();
        const price = parseInt(document.getElementById("productPrice").value, 10);
        const image = document.getElementById("productImage").value.trim() || "✨";
        const category = document.getElementById("productCategory").value;
        const desc = document.getElementById("productDesc").value.trim();
        const type = category === "Видео-пакет" ? "service" : category === "Услуга" ? "service" : category === "Мастер-класс" ? "event" : category === "Абонемент" ? "subscription" : category === "Предзаказ" ? "preorder" : "product";

        if (!name || !price) return;

        const products = loadProducts();
        products.unshift({
          id: "p" + Date.now(),
          name,
          price,
          image,
          category,
          type,
          desc
        });
        saveProducts(products);
        renderProductList();
        form.reset();
        document.getElementById("productImage").value = "✨";
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const input = document.getElementById("showcaseLink");
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
          const original = copyBtn.textContent;
          copyBtn.textContent = "Скопировано!";
          setTimeout(() => (copyBtn.textContent = original), 1500);
        });
      });
    }

    renderProductList();
    renderDemoOrders();
    renderGrowth();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("productList")) {
      initDashboard();
    }
    if (document.getElementById("showcaseGrid")) {
      renderShowcase();
    }
    initMotion();
  });
})();
