class Mob {
  constructor(type, position, registry) {
    this.type = type;
    this.position = position.clone();
    this.velocity = new THREE.Vector3();
    this.registry = registry;
    this.health = type.health || (type.hostile ? 18 : 10);
    this.maxHealth = this.health;
    this.timer = 0;
    this.walkTime = 0;
    this.attackTimer = 0;
    this.hurtTimer = 0;
    this.fuse = 0;
    this.parts = {};
    this.mesh = this.makeMesh(type);
  }

  makeMesh(type) {
    let group = new THREE.Group();
    group.userData.mob = this;

    if (type.name === "Cow") this.makeCow(group);
    else if (type.name === "Sheep") this.makeSheep(group);
    else if (type.name === "Pig") this.makePig(group);
    else if (type.name === "Chicken") this.makeChicken(group);
    else if (type.name === "Horse") this.makeHorse(group);
    else if (type.name === "Zombie") this.makeZombie(group);
    else if (type.name === "Skeleton") this.makeSkeleton(group);
    else if (type.name === "Spider") this.makeSpider(group);
    else if (type.name === "Creeper") this.makeCreeper(group);
    else if (type.name === "Enderman") this.makeEnderman(group);
    else this.makeSimpleAnimal(group);

    this.makeHealthBar(group);
    group.position.copy(this.position);
    return group;
  }

  makeMaterial(color) {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(color),
      flatShading: true
    });
  }

  box(group, name, size, pos, color) {
    let geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    let mesh = new THREE.Mesh(geo, this.makeMaterial(color));
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    if (name) {
      this.parts[name] = mesh;
    }

    return mesh;
  }

  makeFace(group, z, y, color) {
    this.box(group, "eyeLeft", { x: 0.08, y: 0.08, z: 0.025 }, { x: -0.16, y, z }, color);
    this.box(group, "eyeRight", { x: 0.08, y: 0.08, z: 0.025 }, { x: 0.16, y, z }, color);
  }

  makeFourLegs(group, color, y, xSize, zSize, height, spreadX, spreadZ) {
    this.parts.legs = [];
    let spots = [
      [-spreadX, -spreadZ],
      [spreadX, -spreadZ],
      [-spreadX, spreadZ],
      [spreadX, spreadZ]
    ];

    for (let i = 0; i < spots.length; i++) {
      let leg = this.box(group, "leg" + i, { x: xSize, y: height, z: zSize }, { x: spots[i][0], y: y, z: spots[i][1] }, color);
      this.parts.legs.push(leg);
    }
  }

  makeCow(group) {
    this.box(group, "body", { x: 1.15, y: 0.82, z: 1.55 }, { x: 0, y: 0.92, z: 0.1 }, "#6b4428");
    this.box(group, "belly", { x: 1.05, y: 0.18, z: 1.35 }, { x: 0, y: 0.54, z: 0.1 }, "#f2e8d5");
    this.box(group, "head", { x: 0.65, y: 0.55, z: 0.62 }, { x: 0, y: 1.18, z: -0.88 }, "#7a4a2a");
    this.box(group, "snout", { x: 0.46, y: 0.18, z: 0.18 }, { x: 0, y: 1.05, z: -1.24 }, "#d9b08c");
    this.box(group, "hornLeft", { x: 0.12, y: 0.12, z: 0.22 }, { x: -0.28, y: 1.48, z: -0.94 }, "#f8fafc");
    this.box(group, "hornRight", { x: 0.12, y: 0.12, z: 0.22 }, { x: 0.28, y: 1.48, z: -0.94 }, "#f8fafc");
    this.makeFace(group, -1.205, 1.26, "#111827");
    this.makeFourLegs(group, "#3f2718", 0.28, 0.22, 0.22, 0.58, 0.38, 0.48);
  }

  makeSheep(group) {
    this.box(group, "body", { x: 1.25, y: 0.95, z: 1.38 }, { x: 0, y: 0.94, z: 0.12 }, "#f1f5f9");
    this.box(group, "woolTop", { x: 1.05, y: 0.2, z: 1.15 }, { x: 0, y: 1.5, z: 0.12 }, "#ffffff");
    this.box(group, "head", { x: 0.52, y: 0.48, z: 0.5 }, { x: 0, y: 1.08, z: -0.85 }, "#cbd5e1");
    this.box(group, "nose", { x: 0.34, y: 0.14, z: 0.12 }, { x: 0, y: 0.98, z: -1.14 }, "#94a3b8");
    this.makeFace(group, -1.115, 1.15, "#111827");
    this.makeFourLegs(group, "#475569", 0.25, 0.2, 0.2, 0.5, 0.38, 0.42);
  }

  makePig(group) {
    this.box(group, "body", { x: 1.05, y: 0.72, z: 1.25 }, { x: 0, y: 0.68, z: 0.1 }, "#f7a8b8");
    this.box(group, "head", { x: 0.58, y: 0.5, z: 0.55 }, { x: 0, y: 0.85, z: -0.78 }, "#f9b3c2");
    this.box(group, "snout", { x: 0.36, y: 0.2, z: 0.16 }, { x: 0, y: 0.78, z: -1.13 }, "#ef8fa4");
    this.box(group, "earLeft", { x: 0.14, y: 0.18, z: 0.08 }, { x: -0.27, y: 1.13, z: -0.82 }, "#f9b3c2");
    this.box(group, "earRight", { x: 0.14, y: 0.18, z: 0.08 }, { x: 0.27, y: 1.13, z: -0.82 }, "#f9b3c2");
    this.makeFace(group, -1.09, 0.92, "#111827");
    this.makeFourLegs(group, "#e87993", 0.24, 0.18, 0.18, 0.45, 0.34, 0.38);
  }

  makeChicken(group) {
    this.box(group, "body", { x: 0.55, y: 0.72, z: 0.52 }, { x: 0, y: 0.62, z: 0.05 }, "#f8fafc");
    this.box(group, "head", { x: 0.34, y: 0.34, z: 0.34 }, { x: 0, y: 1.08, z: -0.27 }, "#ffffff");
    this.box(group, "beak", { x: 0.18, y: 0.1, z: 0.18 }, { x: 0, y: 1.04, z: -0.56 }, "#f59e0b");
    this.box(group, "wattle", { x: 0.12, y: 0.18, z: 0.08 }, { x: 0, y: 0.88, z: -0.5 }, "#ef4444");
    this.box(group, "wingLeft", { x: 0.1, y: 0.44, z: 0.38 }, { x: -0.34, y: 0.63, z: 0.08 }, "#e5e7eb");
    this.box(group, "wingRight", { x: 0.1, y: 0.44, z: 0.38 }, { x: 0.34, y: 0.63, z: 0.08 }, "#e5e7eb");
    this.makeFace(group, -0.455, 1.13, "#111827");
    this.parts.legs = [];
    this.parts.legs.push(this.box(group, "leg0", { x: 0.08, y: 0.36, z: 0.08 }, { x: -0.14, y: 0.18, z: 0 }, "#f59e0b"));
    this.parts.legs.push(this.box(group, "leg1", { x: 0.08, y: 0.36, z: 0.08 }, { x: 0.14, y: 0.18, z: 0 }, "#f59e0b"));
  }

  makeHorse(group) {
    this.box(group, "body", { x: 0.9, y: 0.95, z: 1.75 }, { x: 0, y: 1.05, z: 0.18 }, "#8b5a2b");
    this.box(group, "neck", { x: 0.38, y: 0.85, z: 0.38 }, { x: 0, y: 1.46, z: -0.52 }, "#7a4a28");
    this.parts.neck.rotation.x = -0.28;
    this.box(group, "head", { x: 0.48, y: 0.48, z: 0.72 }, { x: 0, y: 1.62, z: -1.02 }, "#70411f");
    this.box(group, "snout", { x: 0.36, y: 0.22, z: 0.24 }, { x: 0, y: 1.52, z: -1.5 }, "#5a341c");
    this.box(group, "mane", { x: 0.16, y: 0.8, z: 0.1 }, { x: 0, y: 1.62, z: -0.35 }, "#1f130b");
    this.box(group, "earLeft", { x: 0.1, y: 0.22, z: 0.1 }, { x: -0.18, y: 1.94, z: -1.08 }, "#70411f");
    this.box(group, "earRight", { x: 0.1, y: 0.22, z: 0.1 }, { x: 0.18, y: 1.94, z: -1.08 }, "#70411f");
    this.box(group, "tail", { x: 0.14, y: 0.7, z: 0.16 }, { x: 0, y: 0.95, z: 1.2 }, "#1f130b");
    this.parts.tail.rotation.x = 0.6;
    this.makeFace(group, -1.38, 1.69, "#111827");
    this.makeFourLegs(group, "#4a2b16", 0.4, 0.18, 0.18, 0.8, 0.28, 0.55);
  }

  makeZombie(group) {
    this.makeHumanoid(group, "#1f9d55", "#2f6b36", "#3b82f6", "#2563eb", "#1f2937");
  }

  makeSkeleton(group) {
    this.makeHumanoid(group, "#e5e7eb", "#d1d5db", "#e5e7eb", "#d1d5db", "#111827");
    this.box(group, "bow", { x: 0.08, y: 1.05, z: 0.08 }, { x: -0.58, y: 0.95, z: -0.1 }, "#8b5a2b");
  }

  makeHumanoid(group, headColor, bodyColor, legColor, armColor, eyeColor) {
    this.box(group, "head", { x: 0.58, y: 0.58, z: 0.58 }, { x: 0, y: 1.76, z: -0.02 }, headColor);
    this.box(group, "body", { x: 0.62, y: 0.82, z: 0.32 }, { x: 0, y: 1.06, z: 0 }, bodyColor);
    this.box(group, "armLeft", { x: 0.2, y: 0.82, z: 0.22 }, { x: -0.48, y: 1.07, z: -0.03 }, armColor);
    this.box(group, "armRight", { x: 0.2, y: 0.82, z: 0.22 }, { x: 0.48, y: 1.07, z: -0.03 }, armColor);
    this.parts.legs = [];
    this.parts.legs.push(this.box(group, "leg0", { x: 0.23, y: 0.75, z: 0.22 }, { x: -0.15, y: 0.38, z: 0 }, legColor));
    this.parts.legs.push(this.box(group, "leg1", { x: 0.23, y: 0.75, z: 0.22 }, { x: 0.15, y: 0.38, z: 0 }, legColor));
    this.makeFace(group, -0.325, 1.83, eyeColor);
  }

  makeSpider(group) {
    this.box(group, "body", { x: 1.15, y: 0.38, z: 1.25 }, { x: 0, y: 0.45, z: 0.15 }, "#141414");
    this.box(group, "head", { x: 0.72, y: 0.34, z: 0.48 }, { x: 0, y: 0.48, z: -0.72 }, "#1f1f1f");
    this.makeFace(group, -0.975, 0.55, "#ef4444");
    this.parts.legs = [];

    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 4; i++) {
        let z = -0.48 + i * 0.32;
        let leg = this.box(group, "spiderLeg", { x: 0.8, y: 0.08, z: 0.08 }, { x: side * 0.78, y: 0.42, z }, "#111111");
        leg.rotation.z = side * (0.25 + i * 0.08);
        this.parts.legs.push(leg);
      }
    }
  }

  makeCreeper(group) {
    this.box(group, "body", { x: 0.62, y: 1.05, z: 0.42 }, { x: 0, y: 0.9, z: 0 }, "#2fbf4a");
    this.box(group, "head", { x: 0.72, y: 0.72, z: 0.72 }, { x: 0, y: 1.65, z: -0.04 }, "#38c95a");
    this.box(group, "eyeLeft", { x: 0.12, y: 0.16, z: 0.025 }, { x: -0.18, y: 1.76, z: -0.415 }, "#111827");
    this.box(group, "eyeRight", { x: 0.12, y: 0.16, z: 0.025 }, { x: 0.18, y: 1.76, z: -0.415 }, "#111827");
    this.box(group, "mouth", { x: 0.18, y: 0.24, z: 0.025 }, { x: 0, y: 1.55, z: -0.42 }, "#111827");
    this.makeFourLegs(group, "#168236", 0.18, 0.24, 0.24, 0.36, 0.23, 0.18);
  }

  makeEnderman(group) {
    this.box(group, "body", { x: 0.42, y: 1.35, z: 0.28 }, { x: 0, y: 1.35, z: 0 }, "#09090b");
    this.box(group, "head", { x: 0.58, y: 0.58, z: 0.58 }, { x: 0, y: 2.35, z: -0.02 }, "#111111");
    this.box(group, "eyeLeft", { x: 0.14, y: 0.06, z: 0.03 }, { x: -0.14, y: 2.39, z: -0.325 }, "#a855f7");
    this.box(group, "eyeRight", { x: 0.14, y: 0.06, z: 0.03 }, { x: 0.14, y: 2.39, z: -0.325 }, "#a855f7");
    this.box(group, "armLeft", { x: 0.14, y: 1.45, z: 0.14 }, { x: -0.38, y: 1.18, z: 0 }, "#09090b");
    this.box(group, "armRight", { x: 0.14, y: 1.45, z: 0.14 }, { x: 0.38, y: 1.18, z: 0 }, "#09090b");
    this.parts.legs = [];
    this.parts.legs.push(this.box(group, "leg0", { x: 0.16, y: 1.15, z: 0.16 }, { x: -0.13, y: 0.58, z: 0 }, "#09090b"));
    this.parts.legs.push(this.box(group, "leg1", { x: 0.16, y: 1.15, z: 0.16 }, { x: 0.13, y: 0.58, z: 0 }, "#09090b"));
  }

  makeSimpleAnimal(group) {
    this.box(group, "body", { x: 0.9, y: 0.8, z: 1.1 }, { x: 0, y: 0.75, z: 0 }, this.type.color || "#aaaaaa");
    this.box(group, "head", { x: 0.5, y: 0.5, z: 0.5 }, { x: 0, y: 1.02, z: -0.7 }, this.type.headColor || this.type.color || "#aaaaaa");
    this.makeFourLegs(group, this.type.color || "#777777", 0.25, 0.18, 0.18, 0.5, 0.3, 0.35);
  }

  makeHealthBar(group) {
    let barGroup = new THREE.Group();
    let back = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.09),
      new THREE.MeshBasicMaterial({ color: "#111827", transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    let fill = new THREE.Mesh(
      new THREE.PlaneGeometry(0.86, 0.055),
      new THREE.MeshBasicMaterial({ color: "#22c55e", side: THREE.DoubleSide })
    );
    fill.position.z = 0.01;
    barGroup.add(back);
    barGroup.add(fill);
    barGroup.position.y = this.type.name === "Enderman" ? 3.0 : this.type.name === "Chicken" ? 1.55 : 2.1;
    barGroup.visible = false;
    group.add(barGroup);
    this.parts.healthBar = barGroup;
    this.parts.healthFill = fill;
  }

  update(delta, game) {
    this.timer -= delta;
    this.attackTimer -= delta;
    this.hurtTimer -= delta;
    this.walkTime += delta;

    let playerDistance = this.position.distanceTo(game.player.position);
    let move = MobAI.getMove(this, game, playerDistance);
    this.velocity.x = move.x;
    this.velocity.z = move.z;
    this.velocity.y -= 18 * delta;

    let next = this.position.clone();
    next.x += this.velocity.x * delta;
    next.z += this.velocity.z * delta;
    next.y += this.velocity.y * delta;

    let ground = game.world.getSurfaceHeight(Math.floor(next.x), Math.floor(next.z)) + 1;
    if (next.y < ground) {
      next.y = ground;
      this.velocity.y = 0;
    }

    this.position.copy(next);
    this.mesh.position.copy(this.position);
    this.faceMovement();
    this.animateWalk();
    this.updateHealthBar(game, playerDistance);

    if (this.type.name === "Creeper" && playerDistance < 3.5) {
      this.fuse += delta;
      this.mesh.scale.setScalar(1 + Math.sin(this.fuse * 18) * 0.08);
      if (this.fuse > 1.5) {
        this.explode(game);
      }
    } else {
      this.fuse = Math.max(0, this.fuse - delta);
      this.mesh.scale.setScalar(1);
    }

    if (this.type.hostile && playerDistance < 1.45 && this.attackTimer <= 0) {
      game.player.damage(this.type.damage || 2);
      this.attackTimer = 1.1;
    }
  }

  faceMovement() {
    let moving = Math.abs(this.velocity.x) + Math.abs(this.velocity.z) > 0.05;
    if (!moving) return;
    this.mesh.rotation.y = Math.atan2(-this.velocity.x, -this.velocity.z);
  }

  animateWalk() {
    if (!this.parts.legs) return;

    let moving = Math.abs(this.velocity.x) + Math.abs(this.velocity.z) > 0.05;
    let swing = moving ? Math.sin(this.walkTime * 9) * 0.38 : 0;

    for (let i = 0; i < this.parts.legs.length; i++) {
      let leg = this.parts.legs[i];
      leg.rotation.x = i % 2 === 0 ? swing : -swing;
    }

    if (this.parts.wingLeft) this.parts.wingLeft.rotation.z = moving ? swing * 0.5 : 0;
    if (this.parts.wingRight) this.parts.wingRight.rotation.z = moving ? -swing * 0.5 : 0;
  }

  updateHealthBar(game, playerDistance) {
    if (!this.parts.healthBar || !this.parts.healthFill) return;

    this.parts.healthBar.visible = this.hurtTimer > 0 || playerDistance < 8;
    this.parts.healthBar.quaternion.copy(game.renderer.camera.quaternion);

    let percent = MathUtils.clamp(this.health / this.maxHealth, 0, 1);
    this.parts.healthFill.scale.x = percent;
    this.parts.healthFill.position.x = -0.43 * (1 - percent);

    if (percent < 0.35) this.parts.healthFill.material.color.set("#ef4444");
    else if (percent < 0.7) this.parts.healthFill.material.color.set("#f59e0b");
    else this.parts.healthFill.material.color.set("#22c55e");
  }

  hurt(amount, game) {
    this.health -= amount;
    this.hurtTimer = 3;
    this.velocity.y = 4;

    if (this.parts.body) {
      this.parts.body.material.emissive = new THREE.Color("#440000");
      setTimeout(() => {
        if (this.parts.body && this.parts.body.material) {
          this.parts.body.material.emissive = new THREE.Color("#000000");
        }
      }, 120);
    }

    if (this.health <= 0) {
      game.entities.remove(this);
      game.inventory.give(this.type.drop, 1);
      game.player.xp = MathUtils.clamp(game.player.xp + 0.12, 0, 1);
    }
  }

  explode(game) {
    let cx = Math.floor(this.position.x);
    let cy = Math.floor(this.position.y);
    let cz = Math.floor(this.position.z);

    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        for (let z = -2; z <= 2; z++) {
          let dist = Math.sqrt(x * x + y * y + z * z);
          if (dist <= 2.2) {
            let id = game.world.getBlock(cx + x, cy + y, cz + z);
            if (id !== BLOCK.BEDROCK) {
              game.world.setBlock(cx + x, cy + y, cz + z, BLOCK.AIR);
            }
          }
        }
      }
    }

    if (this.position.distanceTo(game.player.position) < 5) {
      game.player.damage(9);
    }

    game.audio.explosion();
    game.entities.remove(this);
  }
}

window.Mob = Mob;




const MobAI = {
  getMove(mob, game, playerDistance) {
    let speed = mob.type.hostile ? 2.2 : 1.1;
    let dir = new THREE.Vector3();

    if (mob.type.hostile && playerDistance < 22) {
      dir.subVectors(game.player.position, mob.position);
      dir.y = 0;
      if (dir.lengthSq() > 0) dir.normalize();
      return { x: dir.x * speed, z: dir.z * speed };
    }

    if (playerDistance < 4 && !mob.type.hostile) {
      dir.subVectors(mob.position, game.player.position);
      dir.y = 0;
      if (dir.lengthSq() > 0) dir.normalize();
      return { x: dir.x * speed * 1.4, z: dir.z * speed * 1.4 };
    }

    if (mob.timer <= 0) {
      mob.timer = 1 + Math.random() * 3;
      mob.wanderAngle = Math.random() * Math.PI * 2;
    }

    return {
      x: Math.sin(mob.wanderAngle || 0) * speed * 0.45,
      z: Math.cos(mob.wanderAngle || 0) * speed * 0.45
    };
  }
};

window.MobAI = MobAI;





class EntityManager {
  constructor(scene, world, events) {
    this.scene = scene;
    this.world = world;
    this.events = events;
    this.mobs = [];
    this.spawnTimer = 0;
    this.types = {
      cow: { name: "Cow", color: "#5b3a1f", headColor: "#f5f5dc", size: { x: 0.8, y: 1.1, z: 1.2 }, drop: "steak" },
      sheep: { name: "Sheep", color: "#f1f5f9", headColor: "#cbd5e1", size: { x: 0.8, y: 1.0, z: 1.1 }, drop: "block_" + BLOCK.WOOL_WHITE },
      pig: { name: "Pig", color: "#f9a8d4", size: { x: 0.8, y: 0.85, z: 1.0 }, drop: "steak" },
      chicken: { name: "Chicken", color: "#ffffff", headColor: "#ef4444", size: { x: 0.55, y: 0.75, z: 0.55 }, drop: "arrow" },
      horse: { name: "Horse", color: "#8b5a2b", headColor: "#6b3f22", size: { x: 0.9, y: 1.25, z: 1.6 }, drop: "apple", health: 16 },
      zombie: { name: "Zombie", color: "#16a34a", headColor: "#15803d", hostile: true, size: { x: 0.75, y: 1.5, z: 0.55 }, drop: "bread", damage: 2 },
      skeleton: { name: "Skeleton", color: "#e5e7eb", hostile: true, size: { x: 0.65, y: 1.55, z: 0.45 }, drop: "arrow", damage: 2 },
      spider: { name: "Spider", color: "#18181b", hostile: true, size: { x: 1.2, y: 0.55, z: 1.2 }, drop: "stick", damage: 2 },
      creeper: { name: "Creeper", color: "#22c55e", hostile: true, size: { x: 0.75, y: 1.45, z: 0.55 }, drop: "block_" + BLOCK.TNT, damage: 0 },
      enderman: { name: "Enderman", color: "#111827", headColor: "#312e81", hostile: true, size: { x: 0.7, y: 2.4, z: 0.5 }, drop: "diamond", damage: 4 }
    };
  }

  update(delta, game) {
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 5;
      this.spawnNearPlayer(game);
    }

    for (let i = this.mobs.length - 1; i >= 0; i--) {
      let mob = this.mobs[i];
      mob.update(delta, game);
      if (mob.position.distanceTo(game.player.position) > 80) {
        this.remove(mob);
      }
    }

    this.checkAttack(game);
  }

  spawnNearPlayer(game) {
    if (this.mobs.length > 24) return;

    let night = game.sky.timeOfDay > 0.78 || game.sky.timeOfDay < 0.18;
    let names = night ? ["zombie", "skeleton", "spider", "creeper", "enderman"] : ["cow", "sheep", "pig", "chicken", "horse"];

    for (let tryCount = 0; tryCount < 8; tryCount++) {
      let name = names[Math.floor(Math.random() * names.length)];
      let angle = Math.random() * Math.PI * 2;
      let dist = 18 + Math.random() * 24;
      let x = Math.floor(game.player.position.x + Math.sin(angle) * dist);
      let z = Math.floor(game.player.position.z + Math.cos(angle) * dist);
      let y = this.world.getSurfaceHeight(x, z);
      let ground = this.world.getBlock(x, y, z);
      let above = this.world.getBlock(x, y + 1, z);
      let above2 = this.world.getBlock(x, y + 2, z);

      if (above !== BLOCK.AIR || above2 !== BLOCK.AIR) continue;
      if (!night && ground !== BLOCK.GRASS && ground !== BLOCK.SAND && ground !== BLOCK.SNOW) continue;
      if (ground === BLOCK.WATER || ground === BLOCK.LAVA) continue;

      this.spawn(name, new THREE.Vector3(x + 0.5, y + 1, z + 0.5));
      return;
    }
  }

  spawn(name, position) {
    let type = this.types[name];
    if (!type) return;
    let mob = new Mob(type, position, null);
    this.mobs.push(mob);
    this.scene.add(mob.mesh);
  }

  remove(mob) {
    let index = this.mobs.indexOf(mob);
    if (index !== -1) this.mobs.splice(index, 1);
    this.scene.remove(mob.mesh);
  }

  checkAttack(game) {
    if (!game.player.controls.leftDown || !game.player.controls.mouseLocked) return;
    let camera = game.renderer.camera;
    let dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    for (let i = 0; i < this.mobs.length; i++) {
      let mob = this.mobs[i];
      let toMob = mob.position.clone().add(new THREE.Vector3(0, 0.8, 0)).sub(camera.position);
      let dist = toMob.length();
      if (dist > 3.2) continue;
      toMob.normalize();
      if (toMob.dot(dir) > 0.94) {
        mob.hurt(this.attackDamage(game), game);
        game.audio.blockSound("hit");
        game.player.controls.leftDown = false;
        break;
      }
    }
  }

  attackDamage(game) {
    let slot = game.inventory.current();
    if (!slot) return 2;
    let item = game.itemRegistry.get(slot.id);
    if (!item || item.toolType !== "sword") return 2;
    if (slot.id.includes("diamond")) return 8;
    if (slot.id.includes("iron")) return 6;
    if (slot.id.includes("stone")) return 5;
    return 4;
  }
}

window.EntityManager = EntityManager;
