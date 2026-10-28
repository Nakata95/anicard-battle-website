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
  function stat(label, value, cls) {
    var s = el("div", "st " + cls);
    s.appendChild(el("small", null, label));
    s.appendChild(el("b", null, String(value)));
    return s;
  }

  var current = [], index = 0;

  function openCard(list, i) {
    current = list; index = i;
    var c = list[i], dialog = document.getElementById("zoom");
    var info = dialog.querySelector(".info"), art = dialog.querySelector(".art"), pic = art.querySelector("img");
    dialog.dataset.r = c.rarity;
    pic.hidden = !c.art;
    art.classList.toggle("empty", !c.art);
    if (c.art) pic.src = "img/cards/" + c.key + ".webp";
    var cost = art.querySelector(".cost");
    if (!cost) { cost = el("span", "cost"); art.appendChild(cost); }
    cost.textContent = c.cost;
    info.innerHTML = "";

    var head = el("div", "head");
    head.appendChild(el("h3", null, c.name));
    info.appendChild(head);
    var sub = el("div", "sub");
    sub.appendChild(el("span", "rar " + c.rarity, RARITY[c.rarity]));
    sub.appendChild(el("span", "type", c.type));
    info.appendChild(sub);

    var row = el("div", "stats-row");
    row.appendChild(stat("Coût", c.cost, "cost-st"));
    if (c.atk != null) {
      row.appendChild(stat("ATK", c.atk, "atk"));
      row.appendChild(stat("PV", c.hp, "pv"));
    }
    info.appendChild(row);

    if (c.external) info.appendChild(el("p", "note", "Carte générée hors deck : elle ne se met pas dans un deck."));
    if (c.traits.length) {
      var tr = el("div", "chips");
      c.traits.forEach(function (t) { tr.appendChild(el("span", "chip", t)); });
      info.appendChild(tr);
    }
    if (c.keywords.length) {
      var kwBox = el("div", "kws");
      c.keywords.forEach(function (k) {
        var line = el("div", "kw");
        line.appendChild(el("b", null, k.name));
        if (k.hint) line.appendChild(el("span", null, k.hint));
        kwBox.appendChild(line);
      });
      info.appendChild(kwBox);
    }
    if (c.text) info.appendChild(rich(el("p", "effect"), c.text));
    if (c.evolution) {
      var e = c.evolution, box = el("div", "evo");
      var title = el("div", "evo-head");
      title.appendChild(el("b", null, "Évolution"));
      if (e.name && e.name !== c.name) title.appendChild(el("span", null, e.name));
      box.appendChild(title);
      var flow = el("div", "evo-flow");
      if (c.atk != null) {
        flow.appendChild(el("span", "from", c.atk + " / " + c.hp));
        flow.appendChild(el("span", "arrow", "→"));
        flow.appendChild(el("span", "to", (c.atk + e.atk) + " / " + (c.hp + e.hp)));
        flow.appendChild(el("span", "delta", signed(e.atk) + " ATK · " + signed(e.hp) + " PV"));
      }
      flow.appendChild(el("span", "zenkai", e.zenkai + " Point" + (e.zenkai > 1 ? "s" : "") + " Zenkai"));
      box.appendChild(flow);
      if (e.text) box.appendChild(rich(el("p", "evo-text"), e.text));
      info.appendChild(box);
    }
    var nav = dialog.querySelector(".pos");
    nav.textContent = (i + 1) + " / " + list.length;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function step(delta) {
    if (!current.length) return;
    openCard(current, (index + delta + current.length) % current.length);
  }

  fetch("data/site.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (data) {
    document.getElementById("n-cards").textContent = data.stats.cards;
    document.getElementById("n-fighters").textContent = data.stats.fighters;
    document.getElementById("n-actions").textContent = data.stats.actions;
    document.getElementById("n-tactics").textContent = data.stats.tactics;
    document.getElementById("n-traits").textContent = data.stats.traits;

    var count = document.getElementById("count"), more = document.getElementById("more");
    var box = document.getElementById("cards"), search = document.getElementById("search"), dialog = document.getElementById("zoom");
    dialog.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t === dialog || t.classList.contains("close")) dialog.close();
      else if (t.classList.contains("prev")) step(-1);
      else if (t.classList.contains("next")) step(1);
    });
    dialog.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft") step(-1);
      else if (ev.key === "ArrowRight") step(1);
    });
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
      list.slice(0, shown).forEach(function (c, i) {
        var b = document.createElement("button");
        b.className = "card"; b.dataset.r = c.rarity; b.type = "button";
        b.innerHTML = c.art ? '<img loading="lazy" alt="" src="img/cards/' + c.key + '.webp"><span></span>'
          : '<div class="noart">' + c.type + '</div><span></span>';
        b.querySelector("span").textContent = c.name;
        b.addEventListener("click", function () { openCard(list, i); });
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
    // lien direct vers une carte : index.html#carte-<clé>
    var m = /^#carte-(.+)$/.exec(location.hash);
    if (m) {
      var at = all.findIndex(function (c) { return c.key === m[1]; });
      if (at >= 0) openCard(all, at);
    }
  });
})();
