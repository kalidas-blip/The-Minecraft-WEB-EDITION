class Game {
  constructor() {
    this.events = new EventBus();
    this.renderer = new Renderer(document.getElementById("gameRoot"));
    this.registry = new BlockRegistry();
    this.graphics = new GraphicsSystem(this.registry);
    this.renderer.setTextureAtlas(this.graphics.texture);
    this.itemRegistry = new ItemRegistry(this.registry);
    this.inventory = new Inventory(this.itemRegistry);
    this.crafting = new CraftingEngine(this.inventory);
    this.audio = new AudioManager();
    this.sky = new SkyRenderer(this.renderer, this.events);
    this.water = new WaterRenderer(this.renderer);
    this.world = null;
    this.player = null;
    this.entities = null;
    this.hud = new HUD(this);
    this.inventoryUI = new InventoryUI(this);
    this.minimap = new Minimap(this);
    this.chat = new ChatUI(this);
    this.menu = new MenuUI(this);
    this.running = false;
    this.paused = false;
    this.lastTime = performance.now();
    this.toastTimer = 0;
    this.loadingWorld = false;
    this.loadingScreen = document.getElementById("worldLoading");
    this.loadingFill = document.getElementById("loadingFill");
    this.loadingTip = document.getElementById("loadingTip");
    this.keysReady = true;

    this.bindEvents();
    this.loop();
  }

  bindEvents() {
    document.addEventListener("keydown", (event) => this.keyDown(event));

    this.events.on("player:died", (data) => {
      this.running = false;
      this.menu.showDeath(data.score);
    });

    this.events.on("weather:lightning", () => {
      this.audio.beep(80, 0.5, "sawtooth", 0.06);
    });
  }

  makeWorld(seed) {
    if (this.world) {
      for (let chunk of this.world.chunks.values()) {
        chunk.dispose(this.renderer.scene);
      }
    }

    this.world = new World(seed, this.registry, this.renderer.scene, this.renderer.materials, this.events);
    this.entities = new EntityManager(this.renderer.scene, this.world, this.events);
    this.inventory = new Inventory(this.itemRegistry);
    this.crafting = new CraftingEngine(this.inventory);
    this.inventoryUI = new InventoryUI(this);
    this.hud = new HUD(this);
    this.minimap = new Minimap(this);
    this.chat = new ChatUI(this);
    this.player = new Player(this.renderer, this.world, this.registry, this.inventory, this.events, this.audio);
    this.player.setSpawn(this.world.getSpawnPoint());
  }

  startNew(mode) {
    if (this.loadingWorld) return;

    let wantedMode = mode || "survival";
    this.loadingWorld = true;
    this.audio.start();
    this.showWorldLoading(wantedMode === "creative" ? "Preparing creative inventory..." : "Preparing spawn area...");

    setTimeout(() => {
      this.setLoadingProgress(38, "Building terrain chunks...");

      setTimeout(() => {
        this.makeWorld(Math.floor(Math.random() * 9999999));
        if (wantedMode === "creative") {
          this.setupCreativeWorld();
        }
        this.setLoadingProgress(100, "Done");
        this.running = true;
        this.paused = false;
        this.menu.hideMain();
        this.menu.hidePause();
        this.hud.show();
        this.chat.add(wantedMode === "creative" ? "Creative world created. Fly, build, and use the Creative menu." : (this.player.controls.isMobile ? "New world created. Use the joystick and buttons to play." : "New world created. Click the game to lock mouse."));
        this.showMessage(wantedMode === "creative" ? "Creative mode enabled" : "World loaded");

        setTimeout(() => {
          this.hideWorldLoading();
          this.loadingWorld = false;
        }, 260);
      }, 80);
    }, 80);
  }

  toTitle() {
    this.running = false;
    this.paused = false;
    this.loadingWorld = false;
    this.hideWorldLoading();
    this.hud.hide();
    this.menu.showMain();
    this.menu.hidePause();
  }

  resume() {
    this.paused = false;
    this.menu.hidePause();
    this.showMessage("Click to lock mouse.");
  }

  respawn() {
    this.player.respawn();
    this.running = true;
    this.paused = false;
    this.menu.deathScreen.classList.add("hidden");
    this.showMessage("Respawned.");
  }

  setupCreativeWorld() {
    if (!this.player) return;
    this.player.gamemode = "creative";
    this.player.health = 20;
    this.player.hunger = 20;
    this.player.armor = 20;
    this.player.score = 0;
    this.fillCreativeHotbar();
    this.sky.setTime("day");
    this.sky.setWeather("clear");
  }

  fillCreativeHotbar() {
    if (!this.inventory || !this.itemRegistry) return;

    let items = [
      "block_" + BLOCK.GRASS,
      "block_" + BLOCK.STONE,
      "block_" + BLOCK.OAK_PLANKS,
      "block_" + BLOCK.GLASS,
      "block_" + BLOCK.TORCH,
      "block_" + BLOCK.TNT,
      "diamond_pickaxe",
      "diamond_sword",
      "bread"
    ];

    for (let i = 0; i < items.length; i++) {
      let item = this.itemRegistry.get(items[i]);
      if (item) {
        this.inventory.slots[i] = {
          id: item.id,
          count: item.stack === 1 ? 1 : item.stack,
          durability: item.durability || null
        };
      }
    }

    this.showMessage("Creative hotbar filled");
  }

  giveCreativeItem(itemId) {
    if (!this.inventory || !this.itemRegistry) {
      this.showMessage("Start a world first");
      return;
    }

    let item = this.itemRegistry.get(itemId);
    if (!item) return;

    this.inventory.give(itemId, item.stack === 1 ? 1 : item.stack);
    this.showMessage("Added " + item.name);
  }

  clearMobs() {
    if (!this.entities) {
      this.showMessage("Start a world first");
      return;
    }

    for (let i = this.entities.mobs.length - 1; i >= 0; i--) {
      this.entities.remove(this.entities.mobs[i]);
    }

    this.showMessage("Mobs cleared");
  }

  spawnCreativeMob(name) {
    if (!this.entities || !this.player) {
      this.showMessage("Start a world first");
      return;
    }

    let forward = new THREE.Vector3(-Math.sin(this.player.yaw), 0, -Math.cos(this.player.yaw));
    let pos = this.player.position.clone().add(forward.multiplyScalar(4));
    let y = this.world.getSurfaceHeight(Math.floor(pos.x), Math.floor(pos.z)) + 1;
    pos.y = y;
    this.entities.spawn(name, pos);
    this.showMessage("Spawned " + name);
  }

  setCreativeTime(value) {
    if (!this.sky) return;
    this.sky.setTime(value);
    this.showMessage("Time set to " + value);
  }

  setCreativeWeather(value) {
    if (!this.sky) return;
    this.sky.setWeather(value);
    this.showMessage("Weather set to " + value);
  }

  keyDown(event) {
    if (this.chat.open) return;

    if (this.menu.creative.isOpen()) {
      if (event.code === "Escape" || event.code === "KeyE") {
        event.preventDefault();
        this.menu.creative.close();
      }
      return;
    }

    if (event.code === "Escape" && this.running) {
      this.paused = !this.paused;
      if (this.paused) this.menu.showPause();
      else this.menu.hidePause();
    }

    if (!this.running || this.paused) return;

    if (event.code === "KeyE") {
      if (this.player && this.player.gamemode === "creative") {
        this.menu.creative.open();
      } else {
        this.inventoryUI.toggle();
      }
    }

    if (event.code === "KeyT") {
      event.preventDefault();
      this.chat.show();
    }
  }

  update(delta) {
    if (!this.running || this.paused || !this.world || !this.player) return;

    this.world.updateAround(this.player.position);
    this.player.update(delta);
    this.entities.update(delta, this);
    this.sky.update(delta, this.player.position);
    this.water.update(delta);
    this.renderer.updateParticles(delta);
    this.audio.update(delta, this.sky);
    this.hud.update();
    this.minimap.update();
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    let now = performance.now();
    let delta = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.update(delta);
    this.renderer.render();
  }

  showMessage(text) {
    let toast = document.getElementById("messageToast");
    toast.textContent = text;
    toast.classList.remove("hidden");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.add("hidden"), 1800);
  }

  showWorldLoading(tip) {
    if (!this.loadingScreen) return;
    this.loadingScreen.classList.remove("hidden");
    this.setLoadingProgress(8, tip);
  }

  setLoadingProgress(percent, tip) {
    if (this.loadingFill) {
      this.loadingFill.style.width = percent + "%";
    }

    if (this.loadingTip) {
      this.loadingTip.textContent = tip;
    }
  }

  hideWorldLoading() {
    if (!this.loadingScreen) return;
    this.loadingScreen.classList.add("hidden");
  }
}

window.game = new Game();
