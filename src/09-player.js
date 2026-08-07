class Physics {
  constructor(world, registry) {
    this.world = world;
    this.registry = registry;
    this.width = 0.62;
    this.height = 1.75;
  }

  move(position, velocity, delta) {
    let result = {
      position: position.clone(),
      velocity: velocity.clone(),
      onGround: false
    };

    result.position.x = this.moveAxis(result.position, "x", velocity.x * delta, result.velocity);
    result.position.z = this.moveAxis(result.position, "z", velocity.z * delta, result.velocity);
    let newY = this.moveAxis(result.position, "y", velocity.y * delta, result.velocity);

    if (velocity.y < 0 && newY === result.position.y) {
      result.onGround = true;
    }

    result.position.y = newY;
    return result;
  }

  moveAxis(pos, axis, amount, velocity) {
    if (amount === 0) return pos[axis];
    let next = pos.clone();
    next[axis] += amount;

    if (!this.collides(next)) {
      return next[axis];
    }

    velocity[axis] = 0;
    return pos[axis];
  }

  collides(pos) {
    let half = this.width / 2;
    let minX = Math.floor(pos.x - half);
    let maxX = Math.floor(pos.x + half);
    let minY = Math.floor(pos.y);
    let maxY = Math.floor(pos.y + this.height);
    let minZ = Math.floor(pos.z - half);
    let maxZ = Math.floor(pos.z + half);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          let id = this.world.getBlock(x, y, z);
          if (this.registry.isSolid(id)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  isInWater(pos) {
    let id = this.world.getBlock(Math.floor(pos.x), Math.floor(pos.y + 0.8), Math.floor(pos.z));
    return id === BLOCK.WATER;
  }
}

window.Physics = Physics;





class Controls {
  constructor(renderer) {
    this.renderer = renderer;
    this.keys = {};
    this.mouseLocked = false;
    this.leftDown = false;
    this.rightPressed = false;
    this.sensitivity = 0.003;
    this.onLook = null;
    this.onHotbar = null;

    document.addEventListener("keydown", (event) => this.keyDown(event));
    document.addEventListener("keyup", (event) => this.keyUp(event));
    document.addEventListener("mousemove", (event) => this.mouseMove(event));
    document.addEventListener("mousedown", (event) => this.mouseDown(event));
    document.addEventListener("mouseup", (event) => this.mouseUp(event));
    document.addEventListener("wheel", (event) => this.mouseWheel(event), { passive: false });
    document.addEventListener("pointerlockchange", () => this.lockChanged());
    this.renderer.renderer.domElement.addEventListener("click", () => this.lock());
  }

  lock() {
    if (document.pointerLockElement !== this.renderer.renderer.domElement) {
      this.renderer.renderer.domElement.requestPointerLock();
    }
  }

  lockChanged() {
    this.mouseLocked = document.pointerLockElement === this.renderer.renderer.domElement;
  }

  keyDown(event) {
    this.keys[event.code] = true;
  }

  keyUp(event) {
    this.keys[event.code] = false;
  }

  mouseMove(event) {
    if (!this.mouseLocked || !this.onLook) return;
    this.onLook(event.movementX * this.sensitivity, event.movementY * this.sensitivity);
  }

  mouseDown(event) {
    if (!this.mouseLocked) return;
    if (event.button === 0) this.leftDown = true;
    if (event.button === 2) this.rightPressed = true;
  }

  mouseUp(event) {
    if (event.button === 0) this.leftDown = false;
  }

  mouseWheel(event) {
    if (!this.onHotbar) return;
    event.preventDefault();
    this.onHotbar(event.deltaY > 0 ? 1 : -1);
  }

  consumeRightClick() {
    let did = this.rightPressed;
    this.rightPressed = false;
    return did;
  }
}

window.Controls = Controls;





class Player {
  constructor(renderer, world, registry, inventory, events, audio) {
    this.renderer = renderer;
    this.world = world;
    this.registry = registry;
    this.inventory = inventory;
    this.events = events;
    this.audio = audio;
    this.physics = new Physics(world, registry);
    this.controls = new Controls(renderer);
    this.position = new THREE.Vector3(0, 35, 0);
    this.velocity = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = false;
    this.health = 20;
    this.hunger = 20;
    this.armor = 0;
    this.xp = 0;
    this.score = 0;
    this.target = null;
    this.breaking = null;
    this.breakProgress = 0;
    this.drowning = 12;
    this.gamemode = "survival";

    this.controls.onLook = (dx, dy) => this.look(dx, dy);
    this.controls.onHotbar = (move) => this.changeHotbar(move);
    document.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  look(dx, dy) {
    this.yaw -= dx;
    this.pitch -= dy;
    this.pitch = MathUtils.clamp(this.pitch, -Math.PI / 2 + 0.02, Math.PI / 2 - 0.02);
  }

  changeHotbar(move) {
    let next = this.inventory.selected + move;
    if (next < 0) next = 8;
    if (next > 8) next = 0;
    this.inventory.select(next);
    this.audio.ui();
  }

  setSpawn(position) {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
  }

  update(delta) {
    this.handleNumberKeys();
    this.updateCamera();
    this.move(delta);
    this.updateTarget();
    this.updateBreak(delta);
    this.placeBlock();
    this.updateVitals(delta);
  }

  handleNumberKeys() {
    for (let i = 1; i <= 9; i++) {
      if (this.controls.keys["Digit" + i]) {
        this.inventory.select(i - 1);
      }
    }
  }

  move(delta) {
    let speed = 4.2;
    let inWater = this.physics.isInWater(this.position);
    if (this.controls.keys.ShiftLeft || this.controls.keys.ShiftRight) speed *= 0.45;
    if (this.controls.keys.ControlLeft || this.controls.keys.ControlRight) speed *= 1.55;
    if (inWater) speed *= 0.45;

    let forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    let right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    let wish = new THREE.Vector3();

    if (this.controls.keys.KeyW) wish.add(forward);
    if (this.controls.keys.KeyS) wish.sub(forward);
    if (this.controls.keys.KeyD) wish.add(right);
    if (this.controls.keys.KeyA) wish.sub(right);

    if (wish.lengthSq() > 0) {
      wish.normalize().multiplyScalar(speed);
      this.velocity.x = wish.x;
      this.velocity.z = wish.z;
    } else {
      this.velocity.x *= 0.72;
      this.velocity.z *= 0.72;
    }

    if (this.gamemode === "creative") {
      this.velocity.y = 0;
      if (this.controls.keys.Space) this.velocity.y = speed;
      if (this.controls.keys.ShiftLeft || this.controls.keys.ShiftRight) this.velocity.y = -speed;
    } else {
      this.velocity.y -= (inWater ? 6 : 20) * delta;
      if (this.controls.keys.Space && (this.onGround || inWater)) {
        this.velocity.y = inWater ? 3.2 : 8.2;
        this.onGround = false;
      }
    }

    let result = this.physics.move(this.position, this.velocity, delta);
    this.position.copy(result.position);
    this.velocity.copy(result.velocity);
    this.onGround = result.onGround;

    if (this.position.y < -10) {
      this.damage(20);
    }
  }

  updateCamera() {
    let camera = this.renderer.camera;
    camera.position.set(this.position.x, this.position.y + 1.62, this.position.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = this.yaw;
    camera.rotation.x = this.pitch;
  }

  updateTarget() {
    let dir = new THREE.Vector3();
    this.renderer.camera.getWorldDirection(dir);
    this.target = this.world.raycast(this.renderer.camera.position, dir, 5);
    this.renderer.setHighlight(this.target);
  }

  updateBreak(delta) {
    let barWrap = document.getElementById("breakBarWrap");
    let bar = document.getElementById("breakBar");

    if (!this.controls.leftDown || !this.target) {
      this.breaking = null;
      this.breakProgress = 0;
      barWrap.classList.add("hidden");
      return;
    }

    let key = this.target.x + "," + this.target.y + "," + this.target.z;
    if (this.breaking !== key) {
      this.breaking = key;
      this.breakProgress = 0;
    }

    let block = this.registry.get(this.target.id);
    let slot = this.inventory.current();
    let item = slot ? window.game.itemRegistry.get(slot.id) : null;
    let speed = item && item.type === "tool" ? item.speed : 1;
    if (this.gamemode === "creative") speed = 999;

    this.breakProgress += delta * speed / Math.max(0.1, block.hardness);
    barWrap.classList.remove("hidden");
    bar.style.width = Math.min(100, this.breakProgress * 100) + "%";

    if (this.breakProgress >= 1) {
      this.breakBlock();
      this.breakProgress = 0;
      this.breaking = null;
    }
  }

  breakBlock() {
    if (!this.target) return;
    let id = this.target.id;
    if (id === BLOCK.BEDROCK && this.gamemode !== "creative") return;

    let block = this.registry.get(id);
    this.world.setBlock(this.target.x, this.target.y, this.target.z, BLOCK.AIR);
    this.renderer.addBreakParticles(this.target.x, this.target.y, this.target.z, block.color);
    this.audio.blockSound(block.name.toLowerCase().includes("stone") ? "stone" : block.name.toLowerCase().includes("wood") ? "wood" : "dirt");

    if (this.gamemode !== "creative") {
      let drop = window.game.itemRegistry.itemForBlock(id);
      if (drop) this.inventory.give(drop, 1);
      this.inventory.damageSelected(1);
      this.xp = MathUtils.clamp(this.xp + 0.03, 0, 1);
      this.score += 1;
    }

    this.events.emit("block:broken", this.target);
  }

  placeBlock() {
    if (!this.controls.consumeRightClick() || !this.target) return;
    let slot = this.inventory.current();
    if (!slot) return;
    let item = window.game.itemRegistry.get(slot.id);

    if (item && item.food) {
      this.hunger = MathUtils.clamp(this.hunger + item.food, 0, 20);
      this.inventory.useSelectedOne();
      this.audio.ui();
      return;
    }

    if (!item || item.type !== "block") return;
    let place = this.target.place;

    if (this.physics.collides(new THREE.Vector3(place.x + 0.5, place.y, place.z + 0.5))) {
      return;
    }

    this.world.setBlock(place.x, place.y, place.z, item.blockId);
    this.audio.blockSound("place");
    if (this.gamemode !== "creative") this.inventory.useSelectedOne();
  }

  updateVitals(delta) {
    if (this.gamemode === "creative") return;

    if (this.controls.keys.ControlLeft || this.controls.keys.ControlRight) {
      this.hunger -= delta * 0.08;
    } else {
      this.hunger -= delta * 0.012;
    }

    this.hunger = MathUtils.clamp(this.hunger, 0, 20);

    if (this.hunger <= 0) {
      this.damage(delta * 0.55);
    }

    if (this.physics.isInWater(this.position)) {
      this.drowning -= delta;
      if (this.drowning <= 0) {
        this.damage(delta * 2);
      }
    } else {
      this.drowning = 12;
    }
  }

  damage(amount) {
    if (this.gamemode === "creative") return;
    let reduced = amount * (1 - this.armor * 0.04);
    this.health -= reduced;
    this.audio.hurt();
    if (this.health <= 0) {
      this.health = 0;
      this.events.emit("player:died", { score: this.score });
    }
  }

  respawn() {
    this.health = 20;
    this.hunger = 20;
    this.setSpawn(this.world.getSpawnPoint());
  }
}

window.Player = Player;
