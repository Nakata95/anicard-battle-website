(function () {
  var RARITY = { legendary: "Légendaire", epic: "Épique", rare: "Rare", common: "Commune" };
  document.querySelectorAll("a.discord").forEach(function (a) { a.href = window.DISCORD_URL; });

  fetch("data/site.json").then(function (r) { return r.json(); }).then(function (data) {
    document.getElementById("n-cards").textContent = data.stats.cards;
    document.getElementById("n-fighters").textContent = data.stats.fighters;
    document.getElementById("n-traits").textContent = data.stats.traits;

    var box = document.getElementById("cards"), search = document.getElementById("search"), dialog = document.getElementById("zoom");
    var filter = "all";
    function render() {
      var q = search.value.trim().toLowerCase();
      box.innerHTML = "";
      data.featured.filter(function (c) {
        return (filter === "all" || c.rarity === filter) && (!q || c.name.toLowerCase().indexOf(q) >= 0);
      }).forEach(function (c) {
        var b = document.createElement("button");
        b.className = "card"; b.dataset.r = c.rarity; b.type = "button";
        b.innerHTML = '<img loading="lazy" alt="" src="img/cards/' + c.key + '.webp"><span></span>';
        b.querySelector("span").textContent = c.name;
        b.addEventListener("click", function () {
          dialog.querySelector("img").src = "img/cards/" + c.key + ".webp";
          dialog.querySelector("b").textContent = c.name;
          var stats = c.atk != null ? " · " + c.atk + "/" + c.hp : "";
          dialog.querySelector("span").textContent = RARITY[c.rarity] + " · " + c.type + " · coût " + c.cost + stats;
          dialog.showModal();
        });
        box.appendChild(b);
      });
    }
    document.querySelectorAll(".filters button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filter = btn.dataset.f;
        document.querySelectorAll(".filters button").forEach(function (o) { o.setAttribute("aria-pressed", o === btn); });
        render();
      });
    });
    search.addEventListener("input", render);
    dialog.addEventListener("click", function () { dialog.close(); });
    render();
  });
})();
