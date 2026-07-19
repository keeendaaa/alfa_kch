(function () {
  "use strict";

  const DEFAULT_PRODUCTS = [
    {
      id: "p1",
      name: "Макияж для события",
      price: 3500,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
      category: "Услуга",
      type: "service",
      desc: "Образ для события с подготовкой кожи и стойким макияжем. Длительность — 90 минут."
    },
    {
      id: "p2",
      name: "Набор домашнего ухода",
      price: 1900,
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=85",
      category: "Уход",
      type: "product",
      desc: "Базовый набор для подготовки и восстановления кожи. Можно забрать в студии или заказать доставку."
    },
    {
      id: "p3",
      name: "Мастер-класс по макияжу",
      price: 4900,
      image: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=85",
      category: "Мастер-класс",
      type: "event",
      desc: "Камерная группа до восьми человек. Практика, разбор косметички и материалы включены."
    }
  ];

  const AI_DESCRIPTIONS = {
    "Услуга": "Персональная услуга по предварительной записи. Укажи длительность, подготовку и ожидаемый результат.",
    "Уход": "Набор домашнего ухода с понятным составом и рекомендациями по использованию.",
    "Мастер-класс": "Практический мастер-класс в небольшой группе. Материалы и обратная связь включены.",
    "Абонемент": "Пакет регулярных посещений с понятным сроком действия и условиями переноса.",
    "Предзаказ": "Ограниченный предзаказ с датой готовности, условиями оплаты и получения.",
    "Другое": "Полезная вещь для дома и повседневной жизни. Достойное качество по честной цене."
  };

  const DEFAULT_SHOP = {
    name: "Студия Леры",
    desc: "Макияж, домашний уход и камерные мастер-классы в Екатеринбурге."
  };

  const BUNDLE_PRODUCT = {
    id: "bundle-care",
    name: "Макияж + набор ухода",
    price: 4900,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85",
    category: "Комплект",
    type: "bundle",
    desc: "Макияж для события и набор домашнего ухода в одном заказе. Экономия 500 ₽."
  };

  function loadProducts() {
    try {
      const raw = localStorage.getItem("alfaVitrina_products");
      let products = raw ? JSON.parse(raw) : [...DEFAULT_PRODUCTS];

      if (localStorage.getItem("alfaVitrina_productsVersion") !== "3") {
        const isOldDemo = products.some((product) => /Nike|Adidas|New Balance/i.test(product.name));
        if (isOldDemo) products = [...DEFAULT_PRODUCTS];
        localStorage.setItem("alfaVitrina_products", JSON.stringify(products));
        localStorage.setItem("alfaVitrina_productsVersion", "3");
      }

      products = products.map((product) => ({
        ...product,
        type: product.type || (product.category === "Услуга" ? "service" : product.category === "Мастер-класс" ? "event" : product.category === "Абонемент" ? "subscription" : product.category === "Предзаказ" ? "preorder" : "product")
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
      return /Кроссовки/i.test(shop.name) ? DEFAULT_SHOP : shop;
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
        location: { mode: "В студии", city: "Екатеринбург", area: "Центр, Втузгородок" },
        orders: [],
        events: [],
        ...JSON.parse(localStorage.getItem("alfaVitrina_demoState") || "{}")
      };
    } catch {
      return {
        prepaymentEnabled: false,
        onboardingComplete: false,
        bundleEnabled: false,
        location: { mode: "В студии", city: "Екатеринбург", area: "Центр, Втузгородок" },
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
          <span class="showcase-card-type">${productTypeLabel(p)}</span>${demoState.prepaymentEnabled && p.type === "service" ? '<span class="showcase-prepayment">Предоплата 20%</span>' : ""}
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
      metaOneLabel.textContent = isService ? "Формат" : "Получение";
      metaOneValue.textContent = product.type === "event" ? "Группа до 8 человек" : isService ? "По записи" : "Доставка / самовывоз";
      metaTwoLabel.textContent = isService ? "Место" : "Срок";
      const location = loadDemoState().location;
      metaTwoValue.textContent = isService
        ? (location.mode === "Только онлайн" ? "Онлайн" : `${location.mode} · ${location.city}`)
        : "1–3 дня";
      dialogPaymentValue.textContent = loadDemoState().prepaymentEnabled && product.type === "service" ? "Предоплата 20%" : "Карта или СБП";
      dialogBuyButton.textContent = isService ? "Выбрать время и оплатить" : "Оформить заказ";
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
      const usesPrepayment = state.prepaymentEnabled && product.type === "service";
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
      document.getElementById("checkoutSuccessText").textContent = selectedProduct.type === "product"
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
    const orderCount = 10 + state.orders.length;
    const revenue = 84360 + addedRevenue;
    if (document.getElementById("ordersRevenue")) document.getElementById("ordersRevenue").textContent = formatPrice(revenue);
    if (document.getElementById("ordersChartTotal")) document.getElementById("ordersChartTotal").textContent = formatPrice(revenue);
    if (document.getElementById("newOrdersCount")) document.getElementById("newOrdersCount").textContent = String(8 + state.orders.length);
    if (document.getElementById("averageOrderValue")) document.getElementById("averageOrderValue").textContent = formatPrice(Math.round(revenue / orderCount));
    if (document.getElementById("paidOrdersCount")) document.getElementById("paidOrdersCount").textContent = `${orderCount} оплаченных заказов`;
    if (document.getElementById("paymentsReceived")) document.getElementById("paymentsReceived").textContent = formatPrice(revenue);
    if (document.getElementById("paymentsCount")) document.getElementById("paymentsCount").textContent = `${12 + state.orders.length} платежей`;
    const revenueTab = document.querySelector('[data-payment-metric="revenue"] strong');
    if (revenueTab) revenueTab.textContent = formatPrice(24755 + addedRevenue);
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

        if (window.gsap && !reduceMotion && previousHeading && previousPanel) {
          const nextHeading = setupHeading.getBoundingClientRect();
          const nextPanel = setupPanel.getBoundingClientRect();
          const draftItems = aiBusinessDraft.querySelectorAll(".draft-head, .draft-grid article, .ai-question, .geo-question, .confirm-row, .ai-business-draft > .btn");
          window.gsap.timeline({ defaults: { ease: "power3.out" } })
            .fromTo(setupHeading, { x: previousHeading.left - nextHeading.left }, { x: 0, duration: 0.75 }, 0)
            .fromTo(setupPanel, { x: previousPanel.left - nextPanel.left }, { x: 0, duration: 0.75 }, 0)
            .fromTo(aiBusinessDraft, { x: 56, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, 0.08)
            .from(draftItems, { y: 22, autoAlpha: 0, stagger: 0.06, duration: 0.42 }, 0.22);
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
        title: "Напомни клиенту на 26-й день",
        text: "Интервал повторной записи у твоих клиентов — 24–32 дня. Персональное напоминание на 26-й день точнее массовой скидки и не уменьшает оплаченную выручку.",
        note: "Сигнал найден в повторных заказах за последние три месяца."
      },
      bundle: {
        title: "Добавь набор ухода после макияжа",
        text: "Макияж и набор ухода покупают вместе чаще случайного, но допродажа появляется только в 12% заказов. Создай комплект без скидки и проверь attach rate.",
        note: "ML использует состав заказов, а не только сумму платежа."
      },
      cancel: {
        title: "Основная потеря — запись без предоплаты",
        text: "Большинство отмен происходит менее чем за 12 часов до визита. Предоплата 20% — приоритетный эксперимент; его можно включить в разделе «Рост».",
        note: "Сравнение выполнено с обезличенной когортой похожих мастеров."
      },
      fees: {
        title: "Покажи СБП первым на мобильных",
        text: "58% покупателей уже выбирают СБП. Если сделать его первым способом на мобильных, доля может вырасти ещё на 9–13% без ухудшения конверсии.",
        note: "Прогноз касается комиссии и оплаченной выручки, а не прибыли."
      },
      refunds: {
        title: "Возвраты связаны с одним мастер-классом",
        text: "72% суммы возвратов пришлись на перенос группового занятия. Добавь выбор новой даты перед возвратом — это сохранит заказ без принуждения клиента.",
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
      response.querySelector("p").textContent = "Макияж и набор ухода объединены в одну карточку за 4 900 ₽. Теперь можно измерять attach rate и оплаченную выручку комплекта.";
      response.querySelector("small").textContent = "Изменение можно отменить удалением карточки в каталоге.";
    });

    const growthStages = {
      start: ["Первая витрина опубликована", "Подключены только необходимые способы оплаты: СБП, карты и AlfaPay. Следующий продукт появится после подтверждённого сигнала роста."],
      regular: ["Покупатели возвращаются через одинаковый интервал", "AI предложит абонемент или рекуррентный платёж, когда регулярность подтвердится данными повторных заказов."],
      offline: ["Появилась постоянная офлайн-точка", "AlfaPOS, mPOS и Альфа-Касса объединят оплату в студии с заказами Витрины и общей аналитикой."],
      team: ["В бизнесе появились исполнители", "Массовые выплаты и чаевые раскроются после настройки ролей и корректной договорной модели."],
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

    const orderChartData = {
      7: {
        total: "84 360 ₽",
        delta: "+18% к прошлой неделе",
        line: "M45 210 C100 190 125 175 160 180 S235 205 275 145 S350 55 390 82 S445 175 505 160 S585 120 620 135 S690 80 735 48",
        area: "M45 210 C100 190 125 175 160 180 S235 205 275 145 S350 55 390 82 S445 175 505 160 S585 120 620 135 S690 80 735 48 L735 220 L45 220 Z"
      },
      30: {
        total: "312 480 ₽",
        delta: "+24% к прошлому месяцу",
        line: "M45 190 C100 155 135 175 180 142 S260 115 310 132 S390 65 445 92 S525 145 570 105 S665 75 735 55",
        area: "M45 190 C100 155 135 175 180 142 S260 115 310 132 S390 65 445 92 S525 145 570 105 S665 75 735 55 L735 220 L45 220 Z"
      }
    };

    document.querySelectorAll("[data-chart-period]").forEach((button) => {
      button.addEventListener("click", () => {
        const data = orderChartData[button.dataset.chartPeriod];
        button.parentElement.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
        document.getElementById("ordersChartTotal").textContent = data.total;
        document.getElementById("ordersChartDelta").textContent = data.delta;
        const line = document.querySelector('[data-chart="orders"] .chart-line');
        const area = document.querySelector('[data-chart="orders"] .chart-area');
        if (window.gsap && !reduceMotion) {
          window.gsap.to(line, { attr: { d: data.line }, duration: 0.55, ease: "power2.inOut" });
          window.gsap.to(area, { attr: { d: data.area }, duration: 0.55, ease: "power2.inOut" });
        } else {
          line.setAttribute("d", data.line);
          area.setAttribute("d", data.area);
        }
      });
    });

    const PAYMENT_CHART_XS = [45, 160, 275, 390, 505, 620, 735];
    const PAYMENT_BASELINE_Y = 220;

    function buildPaymentLine(values) {
      const n = values.length;
      if (n === 0) return "";
      let d = `M${PAYMENT_CHART_XS[0]} ${values[0]}`;
      for (let i = 0; i < n - 1; i++) {
        const x0 = PAYMENT_CHART_XS[Math.max(0, i - 1)];
        const y0 = values[Math.max(0, i - 1)];
        const x1 = PAYMENT_CHART_XS[i];
        const y1 = values[i];
        const x2 = PAYMENT_CHART_XS[i + 1];
        const y2 = values[i + 1];
        const x3 = PAYMENT_CHART_XS[Math.min(n - 1, i + 2)];
        const y3 = values[Math.min(n - 1, i + 2)];
        const cp1x = x1 + (x2 - x0) / 6;
        const cp1y = y1 + (y2 - y0) / 6;
        const cp2x = x2 - (x3 - x1) / 6;
        const cp2y = y2 - (y3 - y1) / 6;
        d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${x2} ${y2}`;
      }
      return d;
    }

    function buildCollapsedPaymentLine(values) {
      const n = values.length;
      if (n === 0) return "";
      let d = `M${PAYMENT_CHART_XS[0]} ${values[0]}`;
      for (let i = 0; i < n - 1; i++) {
        const y0 = values[Math.max(0, i - 1)];
        const y1 = values[i];
        const y2 = values[i + 1];
        const y3 = values[Math.min(n - 1, i + 2)];
        const cp1y = y1 + (y2 - y0) / 6;
        const cp2y = y2 - (y3 - y1) / 6;
        d += ` C${PAYMENT_CHART_XS[0]} ${cp1y.toFixed(1)} ${PAYMENT_CHART_XS[0]} ${cp2y.toFixed(1)} ${PAYMENT_CHART_XS[0]} ${y2}`;
      }
      return d;
    }

    function buildPaymentArea(lineD) {
      return `${lineD} L735 ${PAYMENT_BASELINE_Y} L45 ${PAYMENT_BASELINE_Y} Z`;
    }

    const paymentChartData = {
      revenue: { values: [180, 200, 205, 80, 190, 195, 82] },
      refunds: { values: [212, 212, 210, 120, 210, 212, 212] },
      fees: { values: [195, 205, 195, 145, 188, 170, 128] },
      average: { values: [170, 150, 135, 115, 128, 110, 120] }
    };

    Object.values(paymentChartData).forEach((metric) => {
      metric.line = buildPaymentLine(metric.values);
      metric.area = buildPaymentArea(metric.line);
      metric.collapsed = buildCollapsedPaymentLine(metric.values);
    });

    const paymentChartLine = document.getElementById("paymentChartLine");
    const paymentChartArea = document.getElementById("paymentChartArea");
    const paymentChartPoints = document.getElementById("paymentChartPoints");
    const paymentCircles = paymentChartPoints ? Array.from(paymentChartPoints.querySelectorAll("circle")) : [];

    function initPaymentChart() {
      if (!paymentChartLine || !paymentChartArea) return;
      const revenue = paymentChartData.revenue;
      paymentChartLine.setAttribute("d", revenue.line);
      paymentChartArea.setAttribute("d", revenue.area);
      paymentCircles.forEach((circle, i) => {
        if (revenue.values[i] !== undefined) {
          circle.setAttribute("cx", PAYMENT_CHART_XS[i]);
          circle.setAttribute("cy", revenue.values[i]);
          circle.removeAttribute("hidden");
        }
      });
    }
    initPaymentChart();

    document.querySelectorAll("[data-payment-metric]").forEach((button) => {
      button.addEventListener("click", () => {
        const metric = button.dataset.paymentMetric;
        const to = paymentChartData[metric];
        if (!to) return;
        const fromButton = button.parentElement.querySelector("button.active");
        if (fromButton?.dataset.paymentMetric === metric) return;
        const from = paymentChartData[fromButton?.dataset.paymentMetric] || paymentChartData.revenue;

        button.parentElement.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));

        if (window.gsap && !reduceMotion && paymentChartLine && paymentChartArea) {
          const tl = window.gsap.timeline();
          window.gsap.killTweensOf([paymentChartLine, paymentChartArea, ...paymentCircles]);

          // Phase 1 — сворачиваем текущий график к левому краю (обратная траектория)
          tl.to(paymentChartLine, { attr: { d: from.collapsed }, duration: 0.4, ease: "power2.inOut" }, 0);
          tl.to(paymentChartArea, { attr: { d: buildPaymentArea(from.collapsed) }, duration: 0.4, ease: "power2.inOut" }, 0);
          tl.to(paymentCircles, { autoAlpha: 0, scale: 0.6, duration: 0.25, ease: "power2.in", stagger: { amount: 0.1, from: "end" }, transformOrigin: "center" }, 0.08);

          // Phase 2 — меняем набор данных, оставаясь в свёрнутом состоянии
          tl.call(() => {
            paymentChartLine.setAttribute("d", to.collapsed);
            paymentChartArea.setAttribute("d", buildPaymentArea(to.collapsed));
            paymentCircles.forEach((circle, i) => {
              circle.setAttribute("cx", PAYMENT_CHART_XS[i]);
              circle.setAttribute("cy", to.values[i]);
              window.gsap.set(circle, { autoAlpha: 0, scale: 0.6 });
            });
          });

          // Phase 3 — рисуем новый график слева направо
          tl.to(paymentChartLine, { attr: { d: to.line }, duration: 0.55, ease: "power2.out" });
          tl.to(paymentChartArea, { attr: { d: to.area }, duration: 0.55, ease: "power2.out" }, "<");

          // Phase 4 — после отрисовки линии точки появляются на графике
          tl.to(paymentCircles, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(1.8)", stagger: { amount: 0.22, from: "start" }, transformOrigin: "center" });
        } else {
          paymentChartLine?.setAttribute("d", to.line);
          paymentChartArea?.setAttribute("d", to.area);
          paymentCircles.forEach((circle, i) => {
            circle.setAttribute("cx", PAYMENT_CHART_XS[i]);
            circle.setAttribute("cy", to.values[i]);
          });
        }
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
        const type = category === "Услуга" ? "service" : category === "Мастер-класс" ? "event" : category === "Абонемент" ? "subscription" : category === "Предзаказ" ? "preorder" : "product";

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
