class HUD {
  constructor(game) {
    this.game = game;
    this.root = document.getElementById("hud");
    this.healthBar = document.getElementById("healthBar");
    this.hungerBar = document.getElementById("hungerBar");
    this.armorBar = document.getElementById("armorBar");
    this.xpWrap = document.getElementById("xpWrap");
    this.xpBar = document.getElementById("xpBar");
    this.hotbar = document.getElementById("hotbar");
    this.tooltip = document.getElementById("blockTooltip");
    this.status = document.getElementById("statusText");
    this.topLeft = document.getElementById("topLeft");
  }

  show() {
    this.root.classList.remove("hidden");
    this.topLeft.classList.remove("hidden");
    document.getElementById("crosshair").classList.remove("hidden");
    document.getElementById("minimap").classList.remove("hidden");
  }

  hide() {
    this.root.classList.add("hidden");
    this.topLeft.classList.add("hidden");
    document.getElementById("crosshair").classList.add("hidden");
    document.getElementById("minimap").classList.add("hidden");
  }

  update() {
    let player = this.game.player;

    if (player.gamemode === "creative") {
      this.healthBar.innerHTML = "";
      this.hungerBar.innerHTML = "";
      this.armorBar.innerHTML = "";
      this.xpWrap.classList.add("hidden");
      this.renderHotbar();
      this.renderTooltip();
      return;
    }

    this.xpWrap.classList.remove("hidden");
    this.renderIconBar(this.healthBar, "heartIcon", player.health, 20);
    this.renderIconBar(this.hungerBar, "foodIcon", player.hunger, 20);

    if (player.armor > 0) {
      this.renderIconBar(this.armorBar, "armorIcon", player.armor, 20);
    } else {
      this.armorBar.innerHTML = "";
    }

    this.xpBar.style.width = (player.xp * 100) + "%";
    this.renderHotbar();
    this.renderTooltip();
  }

  renderIconBar(box, className, value, max) {
    let count = Math.ceil(value / 2);
    let total = max / 2;
    box.innerHTML = "";
    box.classList.add("hudIcons");

    for (let i = 0; i < total; i++) {
      let icon = document.createElement("span");
      icon.className = "hudIcon " + className + (i < count ? "" : " empty");
      box.appendChild(icon);
    }
  }

  renderHotbar() {
    this.hotbar.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      let slot = this.game.inventory.slots[i];
      let div = document.createElement("div");
      div.className = "slot" + (i === this.game.inventory.selected ? " active" : "");

      if (slot) {
        let item = this.game.itemRegistry.get(slot.id);
        let icon = document.createElement("div");
        icon.className = "slotIcon";
        icon.style.background = this.makeIconBackground(item);
        div.title = item.name;
        div.appendChild(icon);

        if (slot.count > 1) {
          let count = document.createElement("div");
          count.className = "slotCount";
          count.textContent = slot.count;
          div.appendChild(count);
        }
      }

      this.hotbar.appendChild(div);
    }
  }

  makeIconBackground(item) {
    let color = item ? item.color : "#111827";
    return "linear-gradient(135deg, " + color + ", rgba(0,0,0,0.4))";
  }

  renderTooltip() {
    if (this.game.player.target) {
      let block = this.game.registry.get(this.game.player.target.id);
      this.tooltip.textContent = block.name;
    } else {
      this.tooltip.textContent = "No block";
    }

    let pos = this.game.player.position;
    this.status.textContent =
      "XYZ " + pos.x.toFixed(1) + " / " + pos.y.toFixed(1) + " / " + pos.z.toFixed(1) +
      " - Seed " + this.game.world.seed +
      " - " + this.game.sky.weather;
  }
}

window.HUD = HUD;





class InventoryUI {
  constructor(game) {
    this.game = game;
    this.panel = document.getElementById("inventoryPanel");
    this.grid = document.getElementById("inventoryGrid");
    this.craftGrid = document.getElementById("craftGrid");
    this.result = document.getElementById("craftResult");
    this.open = false;
    this.dragIndex = null;
  }

  toggle() {
    this.open = !this.open;
    this.panel.classList.toggle("hidden", !this.open);
    if (this.open) {
      document.exitPointerLock?.();
      this.render();
    }
  }

  close() {
    this.open = false;
    this.panel.classList.add("hidden");
  }

  render() {
    this.grid.innerHTML = "";

    for (let i = 0; i < this.game.inventory.slots.length; i++) {
      let slot = this.game.inventory.slots[i];
      let div = document.createElement("div");
      div.className = "invSlot";
      div.dataset.index = i;

      if (slot) {
        let item = this.game.itemRegistry.get(slot.id);
        let icon = document.createElement("div");
        icon.className = "slotIcon";
        icon.style.background = "linear-gradient(135deg, " + item.color + ", rgba(0,0,0,0.45))";
        div.appendChild(icon);
        let count = document.createElement("div");
        count.className = "slotCount";
        count.textContent = slot.count > 1 ? slot.count : "";
        div.appendChild(count);
        div.title = item.name;
      }

      div.addEventListener("click", () => this.clickSlot(i));
      this.grid.appendChild(div);
    }

    this.renderRecipes();
  }

  clickSlot(index) {
    if (this.dragIndex === null) {
      this.dragIndex = index;
      this.game.showMessage("Pick another slot to swap.");
      return;
    }

    this.game.inventory.swap(this.dragIndex, index);
    this.dragIndex = null;
    this.render();
  }

  renderRecipes() {
    this.craftGrid.innerHTML = "";
    this.result.innerHTML = "<b>Recipes</b><br>";

    for (let i = 0; i < 4; i++) {
      let fake = document.createElement("div");
      fake.className = "invSlot";
      fake.textContent = i + 1;
      fake.style.color = "#94a3b8";
      this.craftGrid.appendChild(fake);
    }

    for (let i = 0; i < this.game.crafting.recipes.length; i++) {
      let recipe = this.game.crafting.recipes[i];
      let button = document.createElement("button");
      button.className = "smallButton";
      button.style.margin = "5px";
      button.textContent = recipe.name;
      button.disabled = !this.game.crafting.canCraft(recipe);
      button.addEventListener("click", () => {
        let made = this.game.crafting.craft(i);
        this.game.showMessage(made ? "Crafted " + made.name : "Missing items.");
        this.render();
      });
      this.result.appendChild(button);
    }
  }
}

window.InventoryUI = InventoryUI;





class Minimap {
  constructor(game) {
    this.game = game;
    this.canvas = document.getElementById("minimap");
    this.ctx = this.canvas.getContext("2d");
  }

  update() {
    let ctx = this.ctx;
    let w = this.canvas.width;
    let h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(2, 6, 23, 0.82)";
    ctx.fillRect(0, 0, w, h);

    let scale = 4;
    let centerX = Math.floor(this.game.player.position.x);
    let centerZ = Math.floor(this.game.player.position.z);

    for (let px = 0; px < w; px += scale) {
      for (let pz = 0; pz < h; pz += scale) {
        let wx = centerX + Math.floor((px - w / 2) / scale);
        let wz = centerZ + Math.floor((pz - h / 2) / scale);
        let y = this.game.world.getSurfaceHeight(wx, wz);
        let id = this.game.world.getBlock(wx, y, wz);
        ctx.fillStyle = this.colorFor(id);
        ctx.fillRect(px, pz, scale, scale);
      }
    }

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.strokeRect(1, 1, w - 2, h - 2);
  }

  colorFor(id) {
    if (id === BLOCK.WATER) return "#2563eb";
    if (id === BLOCK.SAND) return "#d9c27c";
    if (id === BLOCK.SNOW) return "#f8fafc";
    if (id === BLOCK.STONE) return "#64748b";
    if (id === BLOCK.GRASS) return "#3f8f38";
    if (id === BLOCK.OAK_LEAVES || id === BLOCK.SPRUCE_LEAVES || id === BLOCK.BIRCH_LEAVES) return "#166534";
    return "#334155";
  }
}

window.Minimap = Minimap;





class ChatUI {
  constructor(game) {
    this.game = game;
    this.log = document.getElementById("chatLog");
    this.input = document.getElementById("chatInput");
    this.open = false;
    this.input.addEventListener("keydown", (event) => this.key(event));
  }

  show() {
    this.open = true;
    this.input.classList.remove("hidden");
    this.input.value = "";
    this.input.focus();
    document.exitPointerLock?.();
  }

  hide() {
    this.open = false;
    this.input.classList.add("hidden");
  }

  key(event) {
    if (event.key === "Escape") {
      this.hide();
      return;
    }

    if (event.key === "Enter") {
      let text = this.input.value.trim();
      if (text) this.send(text);
      this.hide();
    }
  }

  send(text) {
    this.add("You: " + text);
    if (text.startsWith("/")) {
      this.command(text);
    }
  }

  add(text) {
    let div = document.createElement("div");
    div.className = "chatLine";
    div.textContent = text;
    this.log.appendChild(div);
    while (this.log.children.length > 8) {
      this.log.removeChild(this.log.firstChild);
    }
    setTimeout(() => div.style.opacity = "0.35", 7000);
  }

  command(text) {
    let parts = text.split(/\s+/);
    let cmd = parts[0].toLowerCase();

    if (cmd === "/gamemode") {
      this.game.player.gamemode = parts[1] === "creative" ? "creative" : "survival";
      this.add("Game mode set to " + this.game.player.gamemode);
    } else if (cmd === "/give") {
      let name = parts[1] || "grass";
      let count = Number(parts[2] || 64);
      let itemId = this.findItem(name);
      if (itemId) {
        this.game.inventory.give(itemId, count);
        this.add("Gave " + count + " " + this.game.itemRegistry.get(itemId).name);
      } else {
        this.add("Unknown item: " + name);
      }
    } else if (cmd === "/tp") {
      let x = Number(parts[1]);
      let y = Number(parts[2]);
      let z = Number(parts[3]);
      if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
        this.game.player.position.set(x, y, z);
        this.add("Teleported.");
      }
    } else if (cmd === "/time") {
      this.game.sky.setTime(parts[2] || parts[1] || "day");
      this.add("Time changed.");
    } else if (cmd === "/weather") {
      this.game.sky.setWeather(parts[1] || "clear");
      this.add("Weather changed.");
    } else if (cmd === "/seed") {
      this.add("Seed: " + this.game.world.seed);
    } else {
      this.add("Commands: /gamemode /give /tp /time set /weather /seed");
    }
  }

  findItem(name) {
    name = name.toLowerCase();
    if (this.game.itemRegistry.items[name]) return name;
    for (let id in this.game.itemRegistry.items) {
      let item = this.game.itemRegistry.items[id];
      if (item.name.toLowerCase().replaceAll(" ", "_").includes(name)) {
        return id;
      }
    }
    return null;
  }
}

window.ChatUI = ChatUI;





class CreativeUI {
  constructor(game) {
    this.game = game;
    this.panel = document.getElementById("creativePanel");
    this.searchInput = document.getElementById("creativeSearchInput");
    this.itemGrid = document.getElementById("creativeItemGrid");
    this.tabs = document.getElementById("creativeTabs");
    this.activeTab = "search";

    this.tabItems = {
      search: [],
      building: ["grass", "dirt", "stone", "cobble", "sand", "oak_log", "oak_planks", "glass"],
      colored: ["glass"],
      natural: ["grass", "dirt", "sand", "cow_spawn", "pig_spawn"],
      functional: ["torch", "chest", "crafting_table", "furnace"],
      redstone: ["redstone", "piston", "tnt"],
      tools: ["diamond_pickaxe"],
      combat: ["diamond_sword", "bow"],
      food: ["apple", "bread"],
      ingredients: ["diamond"],
      spawn: ["cow_spawn", "pig_spawn", "zombie_spawn", "creeper_spawn"],
      survival: ["grass", "stone", "oak_planks", "torch", "diamond_pickaxe", "diamond_sword", "bread"]
    };

    this.itemMap = {};
    this.makeItemMap();
    this.bind();
  }

  makeItemMap() {
    this.itemMap = {
      grass: "block_" + BLOCK.GRASS,
      dirt: "block_" + BLOCK.DIRT,
      stone: "block_" + BLOCK.STONE,
      cobble: "block_" + BLOCK.COBBLE,
      sand: "block_" + BLOCK.SAND,
      oak_log: "block_" + BLOCK.OAK_LOG,
      oak_planks: "block_" + BLOCK.OAK_PLANKS,
      glass: "block_" + BLOCK.GLASS,
      torch: "block_" + BLOCK.TORCH,
      chest: "block_" + BLOCK.CHEST,
      crafting_table: "block_" + BLOCK.CRAFTING_TABLE,
      furnace: "block_" + BLOCK.FURNACE,
      redstone: "block_" + BLOCK.REDSTONE_DUST,
      piston: "block_" + BLOCK.PISTON,
      tnt: "block_" + BLOCK.TNT,
      diamond_pickaxe: "diamond_pickaxe",
      diamond_sword: "diamond_sword",
      bow: "bow",
      apple: "apple",
      bread: "bread",
      diamond: "diamond"
    };
  }

  bind() {
    this.bindClick("creativeBtn", () => this.startCreativeWorld());
    this.bindClick("creativeCloseBtn", () => this.close());
    this.bindClick("creativeStartBtn", () => this.close());
    this.bindClick("creativeFillHotbarBtn", () => this.game.fillCreativeHotbar());
    this.bindClick("creativeClearMobsBtn", () => this.game.clearMobs());
    this.bindClick("creativeDayBtn", () => this.game.setCreativeTime("day"));
    this.bindClick("creativeNightBtn", () => this.game.setCreativeTime("night"));
    this.bindClick("creativeWeatherBtn", () => this.game.setCreativeWeather("clear"));
    this.bindClick("creativeSearchBtn", () => this.filterItems());

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => this.filterItems());
    }

    if (this.tabs) {
      this.tabs.addEventListener("click", (event) => this.chooseTab(event));
    }

    if (this.itemGrid) {
      this.itemGrid.addEventListener("click", (event) => this.pickItem(event));
    }
  }

  bindClick(id, callBack) {
    let element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", callBack);
    }
  }

  open() {
    if (!this.panel) return;
    this.panel.classList.remove("hidden");
    this.panel.setAttribute("aria-hidden", "false");
    document.exitPointerLock?.();
    this.filterItems();
  }

  close() {
    if (!this.panel) return;
    this.panel.classList.add("hidden");
    this.panel.setAttribute("aria-hidden", "true");
  }

  isOpen() {
    return this.panel && !this.panel.classList.contains("hidden");
  }

  startCreativeWorld() {
    this.close();
    this.game.startNew("creative");
  }

  chooseTab(event) {
    let button = event.target.closest(".creativeTab");
    if (!button) return;

    this.activeTab = button.dataset.tab || "search";

    let buttons = this.tabs.querySelectorAll(".creativeTab");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle("active", buttons[i] === button);
    }

    this.filterItems();
  }

  filterItems() {
    if (!this.itemGrid) return;

    let text = this.searchInput ? this.searchInput.value.trim().toLowerCase() : "";
    let allowed = this.tabItems[this.activeTab] || [];
    let buttons = this.itemGrid.querySelectorAll(".creativeItem");

    for (let i = 0; i < buttons.length; i++) {
      let button = buttons[i];
      let itemName = button.dataset.item || "";
      let label = button.textContent.toLowerCase();
      let tabOk = this.activeTab === "search" || allowed.length === 0 || allowed.includes(itemName);
      let searchOk = text === "" || itemName.includes(text) || label.includes(text);
      button.classList.toggle("hidden", !tabOk || !searchOk);
    }
  }

  pickItem(event) {
    let button = event.target.closest(".creativeItem");
    if (!button || !button.dataset.item) return;

    let key = button.dataset.item;
    if (key.endsWith("_spawn")) {
      this.spawnMobFromKey(key);
      return;
    }

    let itemId = this.itemMap[key];
    if (!itemId) return;
    this.game.giveCreativeItem(itemId);
  }

  spawnMobFromKey(key) {
    let mobName = key.replace("_spawn", "");
    this.game.spawnCreativeMob(mobName);
  }
}

window.CreativeUI = CreativeUI;




class MenuUI {
  constructor(game) {
    this.game = game;
    this.mainMenu = document.getElementById("mainMenu");
    this.pauseMenu = document.getElementById("pauseMenu");
    this.optionsPanel = document.getElementById("optionsPanel");
    this.deathScreen = document.getElementById("deathScreen");
    this.quitOverlay = document.getElementById("quitOverlay");
    this.creative = new CreativeUI(game);
    this.splashText = document.querySelector(".splashText");
    this.splashes = [
      "Now in your browser!",
      "Fresh chunks daily!",
      "Handmade blocks!",
      "Caves included!",
      "Click Singleplayer!",
      "No install needed!",
      "Custom textures!"
    ];
    this.pickSplash();
    this.bind();
  }

  bind() {
    document.getElementById("playBtn").addEventListener("click", () => this.game.startNew());
    document.getElementById("optionsBtn").addEventListener("click", () => this.showOptions());
    document.getElementById("quitGameBtn").addEventListener("click", () => this.quitGame());
    document.getElementById("backFromQuitBtn").addEventListener("click", () => this.backFromQuit());
    document.getElementById("pauseOptionsBtn").addEventListener("click", () => this.showOptions());
    document.getElementById("closeOptionsBtn").addEventListener("click", () => this.hideOptions());
    document.getElementById("resumeBtn").addEventListener("click", () => this.game.resume());
    document.getElementById("titleBtn").addEventListener("click", () => this.game.toTitle());
    document.getElementById("respawnBtn").addEventListener("click", () => this.game.respawn());
    document.getElementById("deathTitleBtn").addEventListener("click", () => this.game.toTitle());
    document.getElementById("fullscreenBtn").addEventListener("click", () => document.documentElement.requestFullscreen?.());
    document.getElementById("renderDistanceInput").addEventListener("input", (event) => this.game.world?.setRenderDistance(event.target.value));
    document.getElementById("fovInput").addEventListener("input", (event) => {
      this.game.renderer.camera.fov = Number(event.target.value);
      this.game.renderer.camera.updateProjectionMatrix();
    });
    document.getElementById("sensitivityInput").addEventListener("input", (event) => {
      if (this.game.player) this.game.player.controls.sensitivity = Number(event.target.value);
    });
  }

  showMain() {
    this.pickSplash();
    this.mainMenu.classList.remove("hidden");
    this.pauseMenu.classList.add("hidden");
    this.deathScreen.classList.add("hidden");
    this.quitOverlay.classList.add("hidden");
    this.creative.close();
  }

  hideMain() {
    this.mainMenu.classList.add("hidden");
    this.creative.close();
  }

  showPause() {
    this.pauseMenu.classList.remove("hidden");
    document.exitPointerLock?.();
  }

  hidePause() {
    this.pauseMenu.classList.add("hidden");
  }

  showOptions() {
    this.optionsPanel.classList.remove("hidden");
  }

  hideOptions() {
    this.optionsPanel.classList.add("hidden");
  }

  showDeath(score) {
    document.getElementById("deathText").textContent = "Score: " + score;
    this.deathScreen.classList.remove("hidden");
    document.exitPointerLock?.();
  }

  quitGame() {
    this.mainMenu.classList.add("hidden");
    this.pauseMenu.classList.add("hidden");
    this.deathScreen.classList.add("hidden");
    this.optionsPanel.classList.add("hidden");
    this.creative.close();
    this.quitOverlay.classList.remove("hidden");
    window.close();
  }

  backFromQuit() {
    this.quitOverlay.classList.add("hidden");
    this.mainMenu.classList.remove("hidden");
  }

  pickSplash() {
    if (!this.splashText) return;
    let index = Math.floor(Math.random() * this.splashes.length);
    this.splashText.textContent = this.splashes[index];
  }
}

window.MenuUI = MenuUI;
