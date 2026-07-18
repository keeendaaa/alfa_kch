(function () {
  "use strict";

  const DEFAULT_PRODUCTS = [
    {
      id: "p1",
      name: "Nike Air Force 1",
      price: 8990,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",
      category: "Кроссовки",
      desc: "Классические белые кроссовки. Размеры 36-45. Натуральная кожа."
    },
    {
      id: "p2",
      name: "Adidas Samba",
      price: 7990,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
      category: "Кроссовки",
      desc: "Ретро-силуэт в городском стиле. Чёрный замшевый верх."
    },
    {
      id: "p3",
      name: "New Balance 530",
      price: 9490,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=85",
      category: "Кроссовки",
      desc: "Лёгкие кроссовки для бега и прогулок. Серебристые вставки."
    },
    {
      id: "p4",
      name: "Nike Air Max 90",
      price: 10990,
      image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=900&q=85",
      category: "Кроссовки",
      desc: "Культовый силуэт с воздушной амортизацией. Для города и активного дня."
    },
    {
      id: "p5",
      name: "Nike Flyknit Racer",
      price: 11990,
      image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=85",
      category: "Кроссовки",
      desc: "Лёгкая вязаная модель с контрастной подошвой и плотной посадкой."
    }
  ];

  const AI_DESCRIPTIONS = {
    "Кроссовки": "Стильные кроссовки для повседневного образа. Удобная посадка и качественные материалы.",
    "Одежда": "Практичная вещь из качественного материала. Отлично сочетается с базовым гардеробом.",
    "Аксессуары": "Яркий аксессуар, который дополнит образ и станет отличным подарком.",
    "Другое": "Полезная вещь для дома и повседневной жизни. Достойное качество по честной цене."
  };

  function loadProducts() {
    try {
      const raw = localStorage.getItem("alfaVitrina_products");
      let products = raw ? JSON.parse(raw) : [...DEFAULT_PRODUCTS];

      if (localStorage.getItem("alfaVitrina_productsVersion") !== "2") {
        products = products.map((product) => {
          const updatedDefault = DEFAULT_PRODUCTS.find((item) => item.id === product.id);
          return updatedDefault && product.image === "👟" ? { ...product, image: updatedDefault.image } : product;
        });
        DEFAULT_PRODUCTS.forEach((product) => {
          if (!products.some((item) => item.id === product.id)) products.push(product);
        });
        localStorage.setItem("alfaVitrina_products", JSON.stringify(products));
        localStorage.setItem("alfaVitrina_productsVersion", "2");
      }

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
      return raw
        ? JSON.parse(raw)
        : { name: "Кроссовки 36-45", desc: "Оригинальные кроссовки и удобная городская обувь. Доставка по всей России." };
    } catch {
      return { name: "Кроссовки 36-45", desc: "Оригинальные кроссовки и удобная городская обувь. Доставка по всей России." };
    }
  }

  function saveShop(shop) {
    localStorage.setItem("alfaVitrina_shop", JSON.stringify(shop));
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
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
        <div class="product-card-img">${isImageUrl(p.image) ? `<img src="${p.image}" alt="${p.name}">` : p.image}</div>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(p.name)}</div>
          <div class="product-card-price">${formatPrice(p.price)}</div>
          <div class="product-card-desc">${escapeHtml(p.desc || "")}</div>
          <button class="btn btn-secondary delete-product" style="margin-top: 12px; width: 100%; padding: 10px;" data-id="${p.id}">Удалить</button>
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

    grid.innerHTML = products
      .map(
        (p) => `
      <div class="showcase-card">
        <div class="showcase-card-img">${isImageUrl(p.image) ? `<img src="${p.image}" alt="${p.name}">` : p.image}</div>
        <div class="showcase-card-body">
          <h3 class="showcase-card-title">${escapeHtml(p.name)}</h3>
          <div class="showcase-card-price">${formatPrice(p.price)}</div>
          <p class="showcase-card-desc">${escapeHtml(p.desc || "")}</p>
          <button class="btn btn-primary buy-button" style="width: 100%;" data-name="${escapeHtml(p.name)}" data-price="${p.price}">Купить</button>
        </div>
      </div>
    `
      )
      .join("");

    grid.querySelectorAll(".buy-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        alert(`Переход к оплате: ${name} — ${formatPrice(price)}\n\nВ реальном продукте здесь откроется платёжная форма Альфа-Банка.`);
      });
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
          [".features", ".feature-card"],
          [".showcase-grid", ".showcase-card"],
          [".product-list", ".product-card"],
          [".main", ".panel"]
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

  function initDashboard() {
    const form = document.getElementById("productForm");
    const aiBtn = document.getElementById("aiGenerate");
    const shopName = document.getElementById("shopName");
    const shopDesc = document.getElementById("shopDesc");
    const copyBtn = document.getElementById("copyLink");

    function showDashboardView(viewName) {
      const availableViews = ["products", "orders", "payments"];
      const nextView = availableViews.includes(viewName) ? viewName : "products";

      document.querySelectorAll("[data-dashboard-view]").forEach((view) => {
        view.hidden = view.dataset.dashboardView !== nextView;
      });
      document.querySelectorAll("[data-dashboard-link]").forEach((link) => {
        link.classList.toggle("active", link.dataset.dashboardLink === nextView);
      });

      const activeView = document.querySelector(`[data-dashboard-view="${nextView}"]`);
      if (activeView && window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.gsap.fromTo(activeView, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" });
      }
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
    showDashboardView(location.hash.slice(1));

    document.querySelectorAll("[data-order-filter]").forEach((filter) => {
      filter.addEventListener("click", () => {
        const status = filter.dataset.orderFilter;
        document.querySelectorAll("[data-order-filter]").forEach((item) => item.classList.toggle("active", item === filter));
        document.querySelectorAll("[data-order-status]").forEach((order) => {
          order.hidden = status !== "all" && order.dataset.orderStatus !== status;
        });
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
        const image = document.getElementById("productImage").value.trim() || "👟";
        const category = document.getElementById("productCategory").value;
        const desc = document.getElementById("productDesc").value.trim();

        if (!name || !price) return;

        const products = loadProducts();
        products.unshift({
          id: "p" + Date.now(),
          name,
          price,
          image,
          category,
          desc
        });
        saveProducts(products);
        renderProductList();
        form.reset();
        document.getElementById("productImage").value = "👟";
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
