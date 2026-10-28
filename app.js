(function () {
  var PAGE = 60;
  var RARITY = { legendary: "Légendaire", epic: "Épique", rare: "Rare", common: "Commune" };
  document.querySelectorAll("a.discord").forEach(function (a) { a.href = window.DISCORD_URL; });

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // « **À l'arrivée :** ... » -> gras
  function rich(parent, text) {
    text.split("**").forEach(function (part, i) {
      if (!part) return;
      parent.appendChild(i % 2 ? el("b", null, part) : document.createTextNode(part));
    });
    return parent;
  }
  function signed(n) { return (n > 0 ? "+" : "") + n; }

  function openCard(c) {
    var info = document.querySelector("#zoom .info");
    var pic = document.querySelector("#zoom img");
    pic.hidden = !c.art;
    if (c.art) pic.src = "img/cards/" + c.key + ".webp";
    info.innerHTML = "";
    var head = el("div", "head");
    head.appendChild(el("h3", null, c.name));
    var tag = el("span", "rar " + c.rarity, RARITY[c.rarity]);
    head.appendChild(tag);
    info.appendChild(head);

    var meta = c.type + " · coût " + c.cost;
    info.appendChild(el("p", "meta", meta));
    if (c.atk != null) {
      var st = el("div", "stat");
      st.appendChild(el("span", "atk", "ATK " + c.atk));
      st.appendChild(el("span", "pv", "PV " + c.hp));
      info.appendChild(st);
    }
    if (c.traits.length) {
      var tr = el("div", "chips");
      c.traits.forEach(function (t) { tr.appendChild(el("span", "chip", t)); });
      info.appendChild(tr);
    }
    if (c.keywords.length) {
      var kw = el("div", "chips");
      c.keywords.forEach(function (k) {
        var chip = el("span", "chip kw", k.name);
        if (k.hint) chip.title = k.hint;
        kw.appendChild(chip);
      });
      info.appendChild(kw);
      var hints = c.keywords.filter(function (k) { return k.hint; });
      if (hints.length) info.appendChild(el("p", "hints", hints.map(function (k) { return k.name + " : " + k.hint; }).join(" · ")));
    }
    if (c.text) info.appendChild(rich(el("p", "effect"), c.text));
    if (c.evolution) {
      var e = c.evolution, box = el("div", "evo");
      box.appendChild(el("b", null, "Évolution" + (e.name && e.name !== c.name ? " — " + e.name : "")));
      var line = "Coût " + e.zenkai + " Point(s) Zenkai";
      if (e.atk || e.hp) line += " · " + signed(e.atk) + " ATK / " + signed(e.hp) + " PV";
      if (c.atk != null) line += " (" + (c.atk + e.atk) + "/" + (c.hp + e.hp) + ")";
      box.appendChild(el("p", null, line));
      if (e.text) box.appendChild(rich(el("p"), e.text));
      info.appendChild(box);
    }
    document.getElementById("zoom").showModal();
  }

  fetch("data/site.json").then(function (r) { return r.json(); }).then(function (data) {
    document.getElementById("n-cards").textContent = data.stats.cards;
    document.getElementById("n-fighters").textContent = data.stats.fighters;
    document.getElementById("n-traits").textContent = data.stats.traits;

    var count = document.getElementById("count"), more = document.getElementById("more");
    var box = document.getElementById("cards"), search = document.getElementById("search"), dialog = document.getElementById("zoom");
    dialog.addEventListener("click", function (ev) { if (ev.target === dialog || ev.target.classList.contains("close")) dialog.close(); });
    var all = data.cards, filter = "all", shown = PAGE;
    function render() {
      var q = search.value.trim().toLowerCase();
      box.innerHTML = "";
      var list = all.filter(function (c) {
        return (filter === "all" || c.rarity === filter) && (!q || c.name.toLowerCase().indexOf(q) >= 0 ||
          c.traits.join(" ").toLowerCase().indexOf(q) >= 0);
      });
      count.textContent = list.length + " carte" + (list.length > 1 ? "s" : "");
      more.hidden = list.length <= shown;
      list.slice(0, shown).forEach(function (c) {
        var b = document.createElement("button");
        b.className = "card"; b.dataset.r = c.rarity; b.type = "button";
        b.innerHTML = c.art ? '<img loading="lazy" alt="" src="img/cards/' + c.key + '.webp"><span></span>'
          : '<div class="noart">' + c.type + '</div><span></span>';
        b.querySelector("span").textContent = c.name;
        b.addEventListener("click", function () { openCard(c); });
        box.appendChild(b);
      });
    }
    document.querySelectorAll(".filters button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filter = btn.dataset.f; shown = PAGE;
        document.querySelectorAll(".filters button").forEach(function (o) { o.setAttribute("aria-pressed", o === btn); });
        render();
      });
    });
    search.addEventListener("input", function () { shown = PAGE; render(); });
    more.addEventListener("click", function () { shown += PAGE; render(); });
    render();
  });
})();
