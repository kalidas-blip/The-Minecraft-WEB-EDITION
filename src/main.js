class EventBus {
  constructor() {
    this.events = {};
  }

  on(name, callBack) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(callBack);
  }

  off(name, callBack) {
    if (!this.events[name]) return;
    this.events[name] = this.events[name].filter((item) => item !== callBack);
  }

  emit(name, data) {
    if (!this.events[name]) return;
    for (let i = 0; i < this.events[name].length; i++) {
      this.events[name][i](data);
    }
  }
}

window.EventBus = EventBus;





const MathUtils = {
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  floorVec3(vec) {
    return {
      x: Math.floor(vec.x),
      y: Math.floor(vec.y),
      z: Math.floor(vec.z)
    };
  },

  distance2D(a, b) {
    let dx = a.x - b.x;
    let dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  },

  key(x, z) {
    return x + "," + z;
  },

  mod(value, size) {
    return ((value % size) + size) % size;
  },

  chunkCoord(value, size) {
    return Math.floor(value / size);
  },

  now() {
    return performance.now() / 1000;
  }
};

window.MathUtils = MathUtils;





class SeededRandom {
  constructor(seed) {
    this.seed = seed || 12345;
  }

  next() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
}

class Noise {
  constructor(seed) {
    this.seed = seed || 1337;
    this.random = new SeededRandom(this.seed);
    this.perm = [];

    let numbers = [];
    for (let i = 0; i < 256; i++) {
      numbers.push(i);
    }

    for (let i = 255; i >= 0; i--) {
      let j = Math.floor(this.random.next() * (i + 1));
      let temp = numbers[i];
      numbers[i] = numbers[j];
      numbers[j] = temp;
    }

    for (let i = 0; i < 512; i++) {
      this.perm[i] = numbers[i & 255];
    }
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  grad(hash, x, y, z) {
    let h = hash & 15;
    let u = h < 8 ? x : y;
    let v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    let first = (h & 1) === 0 ? u : -u;
    let second = (h & 2) === 0 ? v : -v;
    return first + second;
  }

  perlin3(x, y, z) {
    let xi = Math.floor(x) & 255;
    let yi = Math.floor(y) & 255;
    let zi = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    let u = this.fade(x);
    let v = this.fade(y);
    let w = this.fade(z);

    let a = this.perm[xi] + yi;
    let aa = this.perm[a] + zi;
    let ab = this.perm[a + 1] + zi;
    let b = this.perm[xi + 1] + yi;
    let ba = this.perm[b] + zi;
    let bb = this.perm[b + 1] + zi;

    let x1 = MathUtils.lerp(this.grad(this.perm[aa], x, y, z), this.grad(this.perm[ba], x - 1, y, z), u);
    let x2 = MathUtils.lerp(this.grad(this.perm[ab], x, y - 1, z), this.grad(this.perm[bb], x - 1, y - 1, z), u);
    let y1 = MathUtils.lerp(x1, x2, v);

    x1 = MathUtils.lerp(this.grad(this.perm[aa + 1], x, y, z - 1), this.grad(this.perm[ba + 1], x - 1, y, z - 1), u);
    x2 = MathUtils.lerp(this.grad(this.perm[ab + 1], x, y - 1, z - 1), this.grad(this.perm[bb + 1], x - 1, y - 1, z - 1), u);
    let y2 = MathUtils.lerp(x1, x2, v);

    return MathUtils.lerp(y1, y2, w);
  }

  noise2(x, z) {
    return this.perlin3(x, 0, z);
  }

  noise3(x, y, z) {
    return this.perlin3(x, y, z);
  }

  fbm2(x, z, octaves, lacunarity, gain) {
    let value = 0;
    let amp = 0.5;
    let freq = 1;

    for (let i = 0; i < octaves; i++) {
      value += this.noise2(x * freq, z * freq) * amp;
      freq *= lacunarity;
      amp *= gain;
    }

    return value;
  }

  pickChance(x, z, chance) {
    let value = Math.abs(this.noise2(x * 12.9898 + 4.13, z * 78.233 + 2.71));
    return value - Math.floor(value) < chance;
  }
}

window.SeededRandom = SeededRandom;
window.Noise = Noise;





const BLOCK = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLE: 4,
  SAND: 5,
  GRAVEL: 6,
  OAK_LOG: 7,
  BIRCH_LOG: 8,
  SPRUCE_LOG: 9,
  OAK_LEAVES: 10,
  BIRCH_LEAVES: 11,
  SPRUCE_LEAVES: 12,
  WATER: 13,
  LAVA: 14,
  GLASS: 15,
  BEDROCK: 16,
  COAL_ORE: 17,
  IRON_ORE: 18,
  GOLD_ORE: 19,
  DIAMOND_ORE: 20,
  REDSTONE_ORE: 21,
  EMERALD_ORE: 22,
  LAPIS_ORE: 23,
  OBSIDIAN: 24,
  ICE: 25,
  SNOW: 26,
  CLAY: 27,
  NETHERRACK: 28,
  SOUL_SAND: 29,
  GLOWSTONE: 30,
  BRICKS: 31,
  OAK_PLANKS: 32,
  BIRCH_PLANKS: 33,
  SPRUCE_PLANKS: 34,
  SLAB: 35,
  STAIR: 36,
  FENCE: 37,
  DOOR: 38,
  TRAPDOOR: 39,
  CHEST: 40,
  FURNACE: 41,
  CRAFTING_TABLE: 42,
  BOOKSHELF: 43,
  TNT: 44,
  CAKE: 45,
  PUMPKIN: 46,
  MELON: 47,
  CACTUS: 48,
  SUGAR_CANE: 49,
  FLOWER: 50,
  MUSHROOM: 51,
  TORCH: 52,
  LADDER: 53,
  VINE: 54,
  BED: 55,
  SIGN: 56,
  JUKEBOX: 57,
  NOTE_BLOCK: 58,
  WOOL_WHITE: 59,
  WOOL_RED: 60,
  WOOL_BLUE: 61,
  WOOL_GREEN: 62,
  TERRACOTTA: 63,
  CONCRETE: 64,
  FARMLAND: 65,
  WHEAT: 66,
  FIRE: 67,
  REDSTONE_DUST: 68,
  REDSTONE_TORCH: 69,
  LEVER: 70,
  BUTTON: 71,
  PRESSURE_PLATE: 72,
  PISTON: 73,
  REDSTONE_LAMP: 74,
  REPEATER: 75,
  END_STONE: 76,
  PORTAL: 77
};

class BlockRegistry {
  constructor() {
    this.blocks = {};
    this.tileSize = 16;
    this.atlasCols = 16;
    this.atlasRows = 16;
    this.tiles = {};
    this.nextTile = 0;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.tileSize * this.atlasCols;
    this.canvas.height = this.tileSize * this.atlasRows;
    this.ctx = this.canvas.getContext("2d");
    this.add(BLOCK.AIR, "Air", "#000000", { solid: false, transparent: true, hardness: 0 });
    this.add(BLOCK.GRASS, "Grass Block", "#3f9f37", { side: "#6b4f2a", bottom: "#7a5232", hardness: 0.7 });
    this.add(BLOCK.DIRT, "Dirt", "#7a5232", { hardness: 0.55 });
    this.add(BLOCK.STONE, "Stone", "#777f89", { hardness: 1.35 });
    this.add(BLOCK.COBBLE, "Cobblestone", "#5f6670", { hardness: 1.55 });
    this.add(BLOCK.SAND, "Sand", "#d9c27c", { hardness: 0.45 });
    this.add(BLOCK.GRAVEL, "Gravel", "#7b7b74", { hardness: 0.5 });
    this.add(BLOCK.OAK_LOG, "Oak Log", "#8b5a2b", { side: "#7a4a24", top: "#c08a4b", hardness: 1.4 });
    this.add(BLOCK.BIRCH_LOG, "Birch Log", "#d8cfab", { side: "#e5dcc1", top: "#d4b06b", hardness: 1.4 });
    this.add(BLOCK.SPRUCE_LOG, "Spruce Log", "#5b371f", { top: "#8c6437", hardness: 1.4 });
    this.add(BLOCK.OAK_LEAVES, "Oak Leaves", "#2f8f39", { transparent: true, hardness: 0.2 });
    this.add(BLOCK.BIRCH_LEAVES, "Birch Leaves", "#66a93b", { transparent: true, hardness: 0.2 });
    this.add(BLOCK.SPRUCE_LEAVES, "Spruce Leaves", "#1f5f38", { transparent: true, hardness: 0.2 });
    this.add(BLOCK.WATER, "Water", "#2f83ff", { solid: false, transparent: true, fluid: true, opacity: 0.58 });
    this.add(BLOCK.LAVA, "Lava", "#ff5a1f", { solid: false, transparent: true, fluid: true, luminance: 15, opacity: 0.8 });
    this.add(BLOCK.GLASS, "Glass", "#bdeeff", { transparent: true, opacity: 0.32, hardness: 0.35 });
    this.add(BLOCK.BEDROCK, "Bedrock", "#20242c", { hardness: 999 });
    this.add(BLOCK.COAL_ORE, "Coal Ore", "#55595f", { ore: "#202020", hardness: 1.7 });
    this.add(BLOCK.IRON_ORE, "Iron Ore", "#7e7770", { ore: "#d39a62", hardness: 1.8 });
    this.add(BLOCK.GOLD_ORE, "Gold Ore", "#786f58", { ore: "#facc15", hardness: 2.0 });
    this.add(BLOCK.DIAMOND_ORE, "Diamond Ore", "#637782", { ore: "#38e8ff", hardness: 2.2 });
    this.add(BLOCK.REDSTONE_ORE, "Redstone Ore", "#695a5d", { ore: "#ef4444", hardness: 2.1 });
    this.add(BLOCK.EMERALD_ORE, "Emerald Ore", "#607167", { ore: "#10b981", hardness: 2.2 });
    this.add(BLOCK.LAPIS_ORE, "Lapis Ore", "#5b6579", { ore: "#355dd8", hardness: 2.0 });
    this.add(BLOCK.OBSIDIAN, "Obsidian", "#1a1028", { hardness: 5.5 });
    this.add(BLOCK.ICE, "Ice", "#a5f3fc", { transparent: true, opacity: 0.5, hardness: 0.35 });
    this.add(BLOCK.SNOW, "Snow", "#f8fafc", { hardness: 0.25 });
    this.add(BLOCK.CLAY, "Clay", "#90a4b8", { hardness: 0.6 });
    this.add(BLOCK.NETHERRACK, "Netherrack", "#742626", { hardness: 0.8 });
    this.add(BLOCK.SOUL_SAND, "Soul Sand", "#5d4037", { hardness: 0.8 });
    this.add(BLOCK.GLOWSTONE, "Glowstone", "#ffe08a", { luminance: 15, hardness: 0.45 });
    this.add(BLOCK.BRICKS, "Bricks", "#a64535", { hardness: 1.8 });
    this.add(BLOCK.OAK_PLANKS, "Oak Planks", "#b8874f", { hardness: 1.0 });
    this.add(BLOCK.BIRCH_PLANKS, "Birch Planks", "#d7be78", { hardness: 1.0 });
    this.add(BLOCK.SPRUCE_PLANKS, "Spruce Planks", "#6c472b", { hardness: 1.0 });
    this.add(BLOCK.SLAB, "Slab", "#a57646", { shape: "slab", hardness: 1.0 });
    this.add(BLOCK.STAIR, "Stair", "#a57646", { hardness: 1.0 });
    this.add(BLOCK.FENCE, "Fence", "#8b5a2b", { hardness: 1.0 });
    this.add(BLOCK.DOOR, "Door", "#9a6a36", { transparent: true, hardness: 1.0 });
    this.add(BLOCK.TRAPDOOR, "Trapdoor", "#8f6133", { transparent: true, hardness: 1.0 });
    this.add(BLOCK.CHEST, "Chest", "#a66a2f", { hardness: 1.0 });
    this.add(BLOCK.FURNACE, "Furnace", "#55595f", { hardness: 1.7 });
    this.add(BLOCK.CRAFTING_TABLE, "Crafting Table", "#9b642f", { hardness: 1.0 });
    this.add(BLOCK.BOOKSHELF, "Bookshelf", "#8a5a2b", { hardness: 1.0 });
    this.add(BLOCK.TNT, "TNT", "#dc2626", { hardness: 0.4 });
    this.add(BLOCK.CAKE, "Cake", "#fff7ed", { hardness: 0.25 });
    this.add(BLOCK.PUMPKIN, "Pumpkin", "#f97316", { hardness: 0.8 });
    this.add(BLOCK.MELON, "Melon", "#58a437", { hardness: 0.7 });
    this.add(BLOCK.CACTUS, "Cactus", "#15803d", { hardness: 0.4 });
    this.add(BLOCK.SUGAR_CANE, "Sugar Cane", "#84cc16", { transparent: true, hardness: 0.2 });
    this.add(BLOCK.FLOWER, "Flower", "#f43f5e", { transparent: true, hardness: 0.1 });
    this.add(BLOCK.MUSHROOM, "Mushroom", "#b45309", { transparent: true, hardness: 0.1 });
    this.add(BLOCK.TORCH, "Torch", "#facc15", { transparent: true, luminance: 14, hardness: 0.1 });
    this.add(BLOCK.LADDER, "Ladder", "#a16207", { transparent: true, hardness: 0.4 });
    this.add(BLOCK.VINE, "Vine", "#166534", { transparent: true, hardness: 0.1 });
    this.add(BLOCK.BED, "Bed", "#ef4444", { hardness: 0.4 });
    this.add(BLOCK.SIGN, "Sign", "#b8874f", { transparent: true, hardness: 0.4 });
    this.add(BLOCK.JUKEBOX, "Jukebox", "#6b3f25", { hardness: 1.3 });
    this.add(BLOCK.NOTE_BLOCK, "Note Block", "#7c4a2d", { hardness: 1.0 });
    this.add(BLOCK.WOOL_WHITE, "White Wool", "#f8fafc", { hardness: 0.5 });
    this.add(BLOCK.WOOL_RED, "Red Wool", "#dc2626", { hardness: 0.5 });
    this.add(BLOCK.WOOL_BLUE, "Blue Wool", "#2563eb", { hardness: 0.5 });
    this.add(BLOCK.WOOL_GREEN, "Green Wool", "#16a34a", { hardness: 0.5 });
    this.add(BLOCK.TERRACOTTA, "Terracotta", "#b45309", { hardness: 1.1 });
    this.add(BLOCK.CONCRETE, "Concrete", "#64748b", { hardness: 1.1 });
    this.add(BLOCK.FARMLAND, "Farmland", "#5b3a1f", { hardness: 0.5 });
    this.add(BLOCK.WHEAT, "Wheat", "#facc15", { transparent: true, hardness: 0.1 });
    this.add(BLOCK.FIRE, "Fire", "#fb923c", { solid: false, transparent: true, luminance: 12, hardness: 0 });
    this.add(BLOCK.REDSTONE_DUST, "Redstone Dust", "#dc2626", { transparent: true, hardness: 0.05 });
    this.add(BLOCK.REDSTONE_TORCH, "Redstone Torch", "#ef4444", { transparent: true, luminance: 10, hardness: 0.1 });
    this.add(BLOCK.LEVER, "Lever", "#78716c", { transparent: true, hardness: 0.2 });
    this.add(BLOCK.BUTTON, "Button", "#a8a29e", { transparent: true, hardness: 0.2 });
    this.add(BLOCK.PRESSURE_PLATE, "Pressure Plate", "#a3a3a3", { transparent: true, hardness: 0.2 });
    this.add(BLOCK.PISTON, "Piston", "#8b7355", { hardness: 1.2 });
    this.add(BLOCK.REDSTONE_LAMP, "Redstone Lamp", "#f59e0b", { luminance: 0, hardness: 0.7 });
    this.add(BLOCK.REPEATER, "Repeater", "#e5e7eb", { transparent: true, hardness: 0.2 });
    this.add(BLOCK.END_STONE, "End Stone", "#e7e3a3", { hardness: 1.6 });
    this.add(BLOCK.PORTAL, "Portal", "#8b5cf6", { solid: false, transparent: true, luminance: 12, opacity: 0.55 });
    this.texture = this.makeAtlasTexture();
  }

  add(id, name, color, options) {
    let data = options || {};
    this.blocks[id] = {
      id,
      name,
      color,
      top: data.top || data.color || color,
      side: data.side || data.color || color,
      bottom: data.bottom || data.side || data.color || color,
      ore: data.ore || null,
      solid: data.solid === false ? false : true,
      transparent: data.transparent || false,
      fluid: data.fluid || false,
      opacity: data.opacity === undefined ? 1 : data.opacity,
      luminance: data.luminance || 0,
      hardness: data.hardness || 1,
      shape: data.shape || "cube"
    };
  }

  get(id) {
    return this.blocks[id] || this.blocks[BLOCK.AIR];
  }

  isSolid(id) {
    return this.get(id).solid;
  }

  isTransparent(id) {
    return this.get(id).transparent;
  }

  isFluid(id) {
    return this.get(id).fluid;
  }

  faceColor(id, normal) {
    let block = this.get(id);
    if (normal.y > 0) return block.top;
    if (normal.y < 0) return block.bottom;
    return block.side;
  }

  tileNameForFace(id, normal) {
    if (normal.y > 0) return id + "_top";
    if (normal.y < 0) return id + "_bottom";
    return id + "_side";
  }

  tileUv(id, normal) {
    let name = this.tileNameForFace(id, normal);
    let tile = this.tiles[name] || this.tiles[id + "_side"] || this.tiles["missing"];
    let pad = 0.0015;
    let u0 = tile.x / this.atlasCols + pad;
    let v0 = tile.y / this.atlasRows + pad;
    let u1 = (tile.x + 1) / this.atlasCols - pad;
    let v1 = (tile.y + 1) / this.atlasRows - pad;
    return [
      [u0, v0],
      [u1, v0],
      [u1, v1],
      [u0, v1]
    ];
  }

  makeAtlasTexture() {
    this.ctx.imageSmoothingEnabled = false;
    this.makeTile("missing", "#ff00ff", {});

    for (let id in this.blocks) {
      id = Number(id);
      if (id === BLOCK.AIR) continue;
      this.makeBlockTiles(this.get(id));
    }

    let texture = new THREE.CanvasTexture(this.canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  }

  makeBlockTiles(block) {
    this.makeTile(block.id + "_top", block.top, { block, face: "top" });
    this.makeTile(block.id + "_side", block.side, { block, face: "side" });
    this.makeTile(block.id + "_bottom", block.bottom, { block, face: "bottom" });
  }

  makeTile(name, baseColor, options) {
    let tileIndex = this.nextTile++;
    let tx = tileIndex % this.atlasCols;
    let ty = Math.floor(tileIndex / this.atlasCols);
    this.tiles[name] = { x: tx, y: ty };

    let ox = tx * this.tileSize;
    let oy = ty * this.tileSize;
    let ctx = this.ctx;
    let block = options.block || {};
    let face = options.face || "side";
    let base = new THREE.Color(baseColor || "#888888");

    for (let y = 0; y < this.tileSize; y++) {
      for (let x = 0; x < this.tileSize; x++) {
        let n = this.pixelNoise(x, y, block.id || 0, face);
        let c = base.clone().multiplyScalar(0.78 + n * 0.34);
        ctx.fillStyle = "#" + c.getHexString();
        ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }

    this.decorateTile(ctx, ox, oy, block, face, base);
  }

  pixelNoise(x, y, id, face) {
    let seed = id * 101 + face.length * 37;
    let value = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return value - Math.floor(value);
  }

  decorateTile(ctx, ox, oy, block, face, base) {
    if (!block.id) return;

    if (block.id === BLOCK.GRASS && face === "side") {
      ctx.fillStyle = "#3fa53a";
      for (let x = 0; x < 16; x++) {
        let h = 3 + Math.floor(this.pixelNoise(x, 2, block.id, face) * 3);
        ctx.fillRect(ox + x, oy, 1, h);
      }
    }

    if (block.id === BLOCK.GRASS && face === "top") {
      ctx.fillStyle = "rgba(185,255,134,0.25)";
      for (let i = 0; i < 28; i++) {
        let x = Math.floor(this.pixelNoise(i, 1, block.id, face) * 16);
        let y = Math.floor(this.pixelNoise(i, 2, block.id, face) * 16);
        ctx.fillRect(ox + x, oy + y, 1, 2);
      }
    }

    if (block.id === BLOCK.STONE || block.name.includes("Ore") || block.id === BLOCK.COBBLE) {
      ctx.fillStyle = "rgba(20,24,30,0.28)";
      for (let i = 0; i < 18; i++) {
        let x = Math.floor(this.pixelNoise(i, 5, block.id, face) * 16);
        let y = Math.floor(this.pixelNoise(i, 8, block.id, face) * 16);
        ctx.fillRect(ox + x, oy + y, 2, 1);
      }
    }

    if (block.ore) {
      ctx.fillStyle = block.ore;
      for (let i = 0; i < 10; i++) {
        let x = Math.floor(this.pixelNoise(i, 9, block.id, face) * 14);
        let y = Math.floor(this.pixelNoise(i, 11, block.id, face) * 14);
        ctx.fillRect(ox + x, oy + y, 2, 2);
      }
    }

    if (block.name.includes("Log")) {
      if (face === "top" || face === "bottom") {
        ctx.strokeStyle = "rgba(80,45,20,0.65)";
        ctx.lineWidth = 1;
        ctx.strokeRect(ox + 3, oy + 3, 10, 10);
        ctx.strokeRect(ox + 6, oy + 6, 4, 4);
      } else {
        ctx.fillStyle = "rgba(60,35,15,0.35)";
        for (let x = 2; x < 16; x += 4) {
          ctx.fillRect(ox + x, oy, 1, 16);
        }
      }
    }

    if (block.name.includes("Leaves")) {
      ctx.fillStyle = "rgba(5,50,20,0.35)";
      for (let i = 0; i < 22; i++) {
        let x = Math.floor(this.pixelNoise(i, 3, block.id, face) * 16);
        let y = Math.floor(this.pixelNoise(i, 7, block.id, face) * 16);
        ctx.fillRect(ox + x, oy + y, 2, 2);
      }
    }

    if (block.name.includes("Planks")) {
      ctx.fillStyle = "rgba(50,25,10,0.28)";
      ctx.fillRect(ox, oy + 4, 16, 1);
      ctx.fillRect(ox, oy + 10, 16, 1);
      ctx.fillRect(ox + 7, oy, 1, 4);
      ctx.fillRect(ox + 12, oy + 5, 1, 5);
      ctx.fillRect(ox + 5, oy + 11, 1, 5);
    }

    if (block.id === BLOCK.SAND || block.id === BLOCK.GRAVEL) {
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      for (let i = 0; i < 15; i++) {
        let x = Math.floor(this.pixelNoise(i, 13, block.id, face) * 16);
        let y = Math.floor(this.pixelNoise(i, 17, block.id, face) * 16);
        ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }

    if (block.id === BLOCK.WATER) {
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      for (let y = 4; y < 16; y += 5) {
        ctx.fillRect(ox + 1, oy + y, 14, 1);
      }
    }

    if (block.id === BLOCK.GLASS || block.id === BLOCK.ICE) {
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.strokeRect(ox + 1, oy + 1, 14, 14);
      ctx.beginPath();
      ctx.moveTo(ox + 3, oy + 13);
      ctx.lineTo(ox + 13, oy + 3);
      ctx.stroke();
    }

    if (block.id === BLOCK.BRICKS) {
      ctx.strokeStyle = "rgba(45,20,15,0.35)";
      for (let y = 4; y < 16; y += 5) ctx.strokeRect(ox, oy + y, 16, 1);
      ctx.strokeRect(ox + 8, oy, 1, 5);
      ctx.strokeRect(ox + 3, oy + 5, 1, 5);
      ctx.strokeRect(ox + 11, oy + 10, 1, 6);
    }

    if (block.id === BLOCK.TNT) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(ox, oy + 6, 16, 4);
      ctx.fillStyle = "#111827";
      ctx.font = "bold 5px monospace";
      ctx.fillText("TNT", ox + 3, oy + 10);
    }
  }

  makeColor(id, normal, x, y, z) {
    let color = new THREE.Color(this.faceColor(id, normal));
    let block = this.get(id);

    if (block.ore && ((x + y + z) % 5 === 0 || (x * 3 + z) % 7 === 0)) {
      color = new THREE.Color(block.ore);
    }

    let shade = 1;
    if (normal.y < 0) shade = 0.46;
    if (normal.x !== 0 || normal.z !== 0) shade = 0.68;
    if (normal.z > 0 || normal.x < 0) shade *= 0.86;

    if (block.transparent) shade = Math.max(shade, 0.78);

    color.setRGB(shade, shade, shade);
    return color;
  }
}

window.BLOCK = BLOCK;
window.BlockRegistry = BlockRegistry;




class GraphicsSystem {
  constructor(registry) {
    this.registry = registry;
    this.tileSize = 16;
    this.cols = 16;
    this.tiles = {};
    this.tileNumber = 0;
    this.rows = 1;
    this.texture = this.buildAtlas();
    this.applyToRegistry();
  }

  buildAtlas() {
    this.fixBlockSettings();

    let faces = [];
    for (let id in this.registry.blocks) {
      let block = this.registry.get(Number(id));
      if (block.id === BLOCK.AIR) continue;
      faces.push({ key: block.id + "_top", block, face: "top" });
      faces.push({ key: block.id + "_side", block, face: "side" });
      faces.push({ key: block.id + "_bottom", block, face: "bottom" });
    }

    this.rows = Math.ceil((faces.length + 1) / this.cols);
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.cols * this.tileSize;
    this.canvas.height = this.rows * this.tileSize;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    this.paintMissingTile();

    for (let i = 0; i < faces.length; i++) {
      this.paintBlockTile(faces[i]);
    }

    let texture = new THREE.CanvasTexture(this.canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.flipY = false;
    texture.needsUpdate = true;
    return texture;
  }

  fixBlockSettings() {
    let solidLeaves = [BLOCK.OAK_LEAVES, BLOCK.BIRCH_LEAVES, BLOCK.SPRUCE_LEAVES];
    for (let i = 0; i < solidLeaves.length; i++) {
      let block = this.registry.get(solidLeaves[i]);
      block.transparent = false;
      block.opacity = 1;
    }

    this.registry.get(BLOCK.WATER).transparent = true;
    this.registry.get(BLOCK.GLASS).transparent = true;
    this.registry.get(BLOCK.ICE).transparent = true;
    this.registry.get(BLOCK.PORTAL).transparent = true;
  }

  applyToRegistry() {
    let graphics = this;
    this.registry.texture = this.texture;
    this.registry.tiles = this.tiles;
    this.registry.atlasCols = this.cols;
    this.registry.atlasRows = this.rows;

    this.registry.tileUv = function(id, normal) {
      return graphics.getUv(id, normal);
    };
  }

  nextTile(key) {
    let number = this.tileNumber++;
    let x = number % this.cols;
    let y = Math.floor(number / this.cols);
    this.tiles[key] = { x, y };
    return this.tiles[key];
  }

  getUv(id, normal) {
    let face = "side";
    if (normal.y > 0) face = "top";
    if (normal.y < 0) face = "bottom";

    let tile = this.tiles[id + "_" + face] || this.tiles[id + "_side"] || this.tiles.missing;
    let pad = 0.002;
    let u0 = tile.x / this.cols + pad;
    let u1 = (tile.x + 1) / this.cols - pad;
    let v0 = 1 - ((tile.y + 1) / this.rows) + pad;
    let v1 = 1 - (tile.y / this.rows) - pad;

    return [
      [u0, v0],
      [u1, v0],
      [u1, v1],
      [u0, v1]
    ];
  }

  paintMissingTile() {
    let tile = this.nextTile("missing");
    let ox = tile.x * this.tileSize;
    let oy = tile.y * this.tileSize;
    this.ctx.fillStyle = "#111827";
    this.ctx.fillRect(ox, oy, 16, 16);
    this.ctx.strokeStyle = "#ef4444";
    this.ctx.strokeRect(ox + 1, oy + 1, 14, 14);
  }

  paintBlockTile(data) {
    let tile = this.nextTile(data.key);
    let ox = tile.x * this.tileSize;
    let oy = tile.y * this.tileSize;
    let block = data.block;
    let face = data.face;
    let base = this.colorFor(block, face);

    this.paintBase(ox, oy, base, block.id, face);

    if (block.id === BLOCK.GRASS) this.paintGrass(ox, oy, face);
    else if (block.id === BLOCK.DIRT || block.id === BLOCK.FARMLAND) this.paintDirt(ox, oy, block.id);
    else if (block.id === BLOCK.STONE || block.name.includes("Ore")) this.paintStone(ox, oy, block);
    else if (block.id === BLOCK.COBBLE) this.paintCobble(ox, oy);
    else if (block.id === BLOCK.SAND) this.paintSand(ox, oy);
    else if (block.id === BLOCK.GRAVEL) this.paintGravel(ox, oy);
    else if (block.name.includes("Log")) this.paintLog(ox, oy, face);
    else if (block.name.includes("Leaves")) this.paintLeaves(ox, oy, block);
    else if (block.name.includes("Planks")) this.paintPlanks(ox, oy, block);
    else if (block.id === BLOCK.WATER) this.paintWater(ox, oy);
    else if (block.id === BLOCK.GLASS || block.id === BLOCK.ICE) this.paintGlass(ox, oy);
    else if (block.id === BLOCK.BRICKS) this.paintBricks(ox, oy);
    else if (block.id === BLOCK.TNT) this.paintTnt(ox, oy);
    else if (block.id === BLOCK.CRAFTING_TABLE) this.paintCraftingTable(ox, oy, face);
    else if (block.id === BLOCK.CHEST) this.paintChest(ox, oy);
    else if (block.id === BLOCK.FURNACE) this.paintFurnace(ox, oy);
    else this.paintSmallSpecks(ox, oy, block.id, "rgba(255,255,255,0.12)", 10);
  }

  colorFor(block, face) {
    if (block.id === BLOCK.GRASS && face === "top") return "#3d9b35";
    if (block.id === BLOCK.GRASS && face === "side") return "#795332";
    if (block.id === BLOCK.GRASS && face === "bottom") return "#6a4528";
    if (face === "top") return block.top || block.color;
    if (face === "bottom") return block.bottom || block.color;
    return block.side || block.color;
  }

  paintBase(ox, oy, color, seed, face) {
    let rgb = new THREE.Color(color || "#888888");
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        let n = this.noise(x, y, seed * 19 + face.length * 11);
        let light = 0.9 + n * 0.16;
        let c = rgb.clone().multiplyScalar(light);
        this.ctx.fillStyle = "#" + c.getHexString();
        this.ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }

  paintGrass(ox, oy, face) {
    if (face === "top") {
      this.paintSmallSpecks(ox, oy, 5, "rgba(190,255,140,0.35)", 28);
      this.paintSmallSpecks(ox, oy, 7, "rgba(20,90,25,0.28)", 24);
      return;
    }

    if (face === "side") {
      this.ctx.fillStyle = "#459c39";
      for (let x = 0; x < 16; x++) {
        let h = 3 + Math.floor(this.noise(x, 3, 12) * 4);
        this.ctx.fillRect(ox + x, oy, 1, h);
      }
      this.paintDirt(ox, oy, 3);
    }
  }

  paintDirt(ox, oy, seed) {
    this.paintSmallSpecks(ox, oy, seed + 21, "rgba(45,23,10,0.28)", 30);
    this.paintSmallSpecks(ox, oy, seed + 24, "rgba(225,170,100,0.18)", 15);
  }

  paintStone(ox, oy, block) {
    this.paintSmallSpecks(ox, oy, block.id + 50, "rgba(20,28,36,0.30)", 28);
    this.paintSmallSpecks(ox, oy, block.id + 52, "rgba(230,235,240,0.18)", 12);

    if (block.ore) {
      this.ctx.fillStyle = block.ore;
      for (let i = 0; i < 9; i++) {
        let x = Math.floor(this.noise(i, 8, block.id) * 13) + 1;
        let y = Math.floor(this.noise(i, 13, block.id) * 13) + 1;
        this.ctx.fillRect(ox + x, oy + y, 2, 2);
      }
    }
  }

  paintCobble(ox, oy) {
    this.ctx.strokeStyle = "rgba(20,24,30,0.35)";
    let boxes = [
      [0, 0, 6, 5], [6, 0, 10, 5], [0, 5, 4, 6], [4, 5, 7, 6],
      [11, 5, 5, 6], [0, 11, 8, 5], [8, 11, 8, 5]
    ];
    for (let i = 0; i < boxes.length; i++) {
      this.ctx.strokeRect(ox + boxes[i][0], oy + boxes[i][1], boxes[i][2], boxes[i][3]);
    }
  }

  paintSand(ox, oy) {
    this.paintSmallSpecks(ox, oy, 80, "rgba(255,255,255,0.23)", 22);
    this.paintSmallSpecks(ox, oy, 81, "rgba(120,95,45,0.18)", 18);
  }

  paintGravel(ox, oy) {
    this.paintSmallSpecks(ox, oy, 82, "rgba(20,20,20,0.25)", 34);
    this.paintSmallSpecks(ox, oy, 83, "rgba(230,230,220,0.16)", 15);
  }

  paintLog(ox, oy, face) {
    if (face === "top" || face === "bottom") {
      this.ctx.strokeStyle = "rgba(70,38,16,0.7)";
      this.ctx.strokeRect(ox + 2, oy + 2, 12, 12);
      this.ctx.strokeRect(ox + 5, oy + 5, 6, 6);
      this.ctx.strokeRect(ox + 7, oy + 7, 2, 2);
      return;
    }

    this.ctx.fillStyle = "rgba(50,25,10,0.3)";
    for (let x = 1; x < 16; x += 4) {
      this.ctx.fillRect(ox + x, oy, 1, 16);
      this.ctx.fillRect(ox + x + 1, oy + 3, 1, 8);
    }
  }

  paintLeaves(ox, oy, block) {
    let dark = block.id === BLOCK.SPRUCE_LEAVES ? "rgba(0,35,20,0.42)" : "rgba(8,70,20,0.36)";
    this.paintSmallSpecks(ox, oy, block.id + 90, dark, 45);
    this.paintSmallSpecks(ox, oy, block.id + 91, "rgba(180,255,150,0.16)", 18);
  }

  paintPlanks(ox, oy, block) {
    this.ctx.strokeStyle = "rgba(50,25,10,0.32)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(ox, oy + 4);
    this.ctx.lineTo(ox + 16, oy + 4);
    this.ctx.moveTo(ox, oy + 9);
    this.ctx.lineTo(ox + 16, oy + 9);
    this.ctx.moveTo(ox, oy + 14);
    this.ctx.lineTo(ox + 16, oy + 14);
    this.ctx.stroke();
    this.paintSmallSpecks(ox, oy, block.id + 100, "rgba(255,220,150,0.16)", 12);
  }

  paintWater(ox, oy) {
    this.ctx.fillStyle = "rgba(255,255,255,0.22)";
    for (let y = 3; y <= 14; y += 5) {
      this.ctx.fillRect(ox + 2, oy + y, 12, 1);
    }
    this.ctx.fillStyle = "rgba(35,85,180,0.25)";
    this.ctx.fillRect(ox, oy + 10, 16, 3);
  }

  paintGlass(ox, oy) {
    this.ctx.strokeStyle = "rgba(255,255,255,0.78)";
    this.ctx.strokeRect(ox + 1, oy + 1, 14, 14);
    this.ctx.beginPath();
    this.ctx.moveTo(ox + 3, oy + 13);
    this.ctx.lineTo(ox + 13, oy + 3);
    this.ctx.stroke();
  }

  paintBricks(ox, oy) {
    this.ctx.strokeStyle = "rgba(55,20,15,0.42)";
    for (let y = 4; y < 16; y += 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(ox, oy + y);
      this.ctx.lineTo(ox + 16, oy + y);
      this.ctx.stroke();
    }
    for (let x = 4; x < 16; x += 8) {
      this.ctx.strokeRect(ox + x, oy, 1, 4);
      this.ctx.strokeRect(ox + x - 3, oy + 5, 1, 5);
      this.ctx.strokeRect(ox + x + 2, oy + 10, 1, 6);
    }
  }

  paintTnt(ox, oy) {
    this.ctx.fillStyle = "#ef4444";
    this.ctx.fillRect(ox, oy, 16, 16);
    this.ctx.fillStyle = "#f8fafc";
    this.ctx.fillRect(ox, oy + 6, 16, 4);
    this.ctx.fillStyle = "#111827";
    this.ctx.font = "bold 5px monospace";
    this.ctx.fillText("TNT", ox + 3, oy + 10);
  }

  paintCraftingTable(ox, oy, face) {
    if (face === "top") {
      this.ctx.strokeStyle = "rgba(30,15,5,0.45)";
      this.ctx.strokeRect(ox + 2, oy + 2, 12, 12);
      this.ctx.strokeRect(ox + 5, oy + 5, 6, 6);
    } else {
      this.paintPlanks(ox, oy, { id: 101 });
      this.ctx.fillStyle = "rgba(30,15,5,0.42)";
      this.ctx.fillRect(ox + 3, oy + 4, 10, 7);
    }
  }

  paintChest(ox, oy) {
    this.paintPlanks(ox, oy, { id: 102 });
    this.ctx.fillStyle = "#facc15";
    this.ctx.fillRect(ox + 7, oy + 7, 2, 3);
    this.ctx.strokeStyle = "rgba(25,12,6,0.45)";
    this.ctx.strokeRect(ox + 1, oy + 2, 14, 12);
  }

  paintFurnace(ox, oy) {
    this.paintStone(ox, oy, { id: 103, ore: null });
    this.ctx.fillStyle = "rgba(5,8,12,0.55)";
    this.ctx.fillRect(ox + 4, oy + 5, 8, 6);
    this.ctx.fillStyle = "rgba(255,130,30,0.45)";
    this.ctx.fillRect(ox + 5, oy + 8, 6, 2);
  }

  paintSmallSpecks(ox, oy, seed, color, count) {
    this.ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      let x = Math.floor(this.noise(i, 2, seed) * 16);
      let y = Math.floor(this.noise(i, 7, seed) * 16);
      let size = this.noise(i, 9, seed) > 0.7 ? 2 : 1;
      this.ctx.fillRect(ox + x, oy + y, size, size);
    }
  }

  noise(x, y, seed) {
    let value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
    return value - Math.floor(value);
  }
}

window.GraphicsSystem = GraphicsSystem;





class BlockMesher {
  constructor(registry) {
    this.registry = registry;
    this.faces = [
      {
        normal: { x: 1, y: 0, z: 0 },
        corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]
      },
      {
        normal: { x: -1, y: 0, z: 0 },
        corners: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]]
      },
      {
        normal: { x: 0, y: 1, z: 0 },
        corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]]
      },
      {
        normal: { x: 0, y: -1, z: 0 },
        corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]
      },
      {
        normal: { x: 0, y: 0, z: 1 },
        corners: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]]
      },
      {
        normal: { x: 0, y: 0, z: -1 },
        corners: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]
      }
    ];
  }

  build(chunk, world, transparentOnly) {
    let positions = [];
    let normals = [];
    let colors = [];
    let uvs = [];
    let indices = [];
    let index = 0;

    for (let x = 0; x < chunk.size; x++) {
      for (let y = 0; y < chunk.height; y++) {
        for (let z = 0; z < chunk.size; z++) {
          let id = chunk.get(x, y, z);
          if (id === BLOCK.AIR) continue;

          let block = this.registry.get(id);
          let shouldBeHere = transparentOnly ? block.transparent : !block.transparent;
          if (!shouldBeHere) continue;

          for (let f = 0; f < this.faces.length; f++) {
            let face = this.faces[f];
            let wx = chunk.worldX + x + face.normal.x;
            let wy = y + face.normal.y;
            let wz = chunk.worldZ + z + face.normal.z;
            let other = world.getBlock(wx, wy, wz);
            let otherBlock = this.registry.get(other);
            let showFace = other === BLOCK.AIR || otherBlock.transparent || otherBlock.fluid;

            if (id === BLOCK.WATER && other === BLOCK.WATER) {
              showFace = false;
            }

            if (!showFace) continue;
            this.addFace(face, x, y, z, id, positions, normals, colors, uvs, indices, index);
            index += 4;
          }
        }
      }
    }

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
  }

  addFace(face, x, y, z, id, positions, normals, colors, uvs, indices, index) {
    let normal = face.normal;
    let color = this.registry.makeColor(id, normal, x, y, z);
    let faceUvs = this.registry.tileUv(id, normal);

    for (let i = 0; i < face.corners.length; i++) {
      let corner = face.corners[i];
      positions.push(x + corner[0], y + corner[1], z + corner[2]);
      normals.push(normal.x, normal.y, normal.z);
      colors.push(color.r, color.g, color.b);
      uvs.push(faceUvs[i][0], faceUvs[i][1]);
    }

    indices.push(index, index + 1, index + 2, index, index + 2, index + 3);
  }
}

window.BlockMesher = BlockMesher;




class Chunk {
  constructor(cx, cz, size, height) {
    this.cx = cx;
    this.cz = cz;
    this.size = size;
    this.height = height;
    this.worldX = cx * size;
    this.worldZ = cz * size;
    this.blocks = new Uint16Array(size * height * size);
    this.meshGroup = new THREE.Group();
    this.needsMesh = true;
  }

  index(x, y, z) {
    return y * this.size * this.size + z * this.size + x;
  }

  inBounds(x, y, z) {
    return x >= 0 && x < this.size && z >= 0 && z < this.size && y >= 0 && y < this.height;
  }

  get(x, y, z) {
    if (!this.inBounds(x, y, z)) return BLOCK.AIR;
    return this.blocks[this.index(x, y, z)];
  }

  set(x, y, z, id) {
    if (!this.inBounds(x, y, z)) return;
    this.blocks[this.index(x, y, z)] = id;
    this.needsMesh = true;
  }

  rebuild(scene, world, mesher, materials) {
    while (this.meshGroup.children.length > 0) {
      let child = this.meshGroup.children.pop();
      child.geometry.dispose();
    }

    let solidGeo = mesher.build(this, world, false);
    let waterGeo = mesher.build(this, world, true);

    if (solidGeo.getAttribute("position").count > 0) {
      let solidMesh = new THREE.Mesh(solidGeo, materials.solid);
      solidMesh.castShadow = true;
      solidMesh.receiveShadow = true;
      solidMesh.userData.chunk = this;
      this.meshGroup.add(solidMesh);
    }

    if (waterGeo.getAttribute("position").count > 0) {
      let waterMesh = new THREE.Mesh(waterGeo, materials.transparent);
      waterMesh.userData.chunk = this;
      this.meshGroup.add(waterMesh);
    }

    this.meshGroup.position.set(this.worldX, 0, this.worldZ);

    if (!this.meshGroup.parent) {
      scene.add(this.meshGroup);
    }

    this.needsMesh = false;
  }

  dispose(scene) {
    scene.remove(this.meshGroup);
    while (this.meshGroup.children.length > 0) {
      let child = this.meshGroup.children.pop();
      child.geometry.dispose();
    }
  }
}

window.Chunk = Chunk;





class ChunkGenerator {
  constructor(seed, registry) {
    this.seed = seed || Math.floor(Math.random() * 999999);
    this.noise = new Noise(this.seed);
    this.registry = registry;
    this.waterLevel = 18;
  }

  getBiome(x, z) {
    let temp = this.noise.fbm2(x * 0.002, z * 0.002, 3, 2, 0.5);
    let wet = this.noise.fbm2((x + 900) * 0.002, (z - 500) * 0.002, 3, 2, 0.5);
    let mountain = this.noise.fbm2((x - 1200) * 0.003, (z + 300) * 0.003, 2, 2, 0.5);

    if (mountain > 0.32) return "Mountains";
    if (wet > 0.38) return "Ocean";
    if (temp > 0.3 && wet < -0.05) return "Desert";
    if (temp < -0.25) return "Snowy Tundra";
    if (wet > 0.18 && temp > 0.15) return "Jungle";
    if (wet > 0.22) return "Swamp";
    if (temp < -0.05) return "Forest";
    return "Plains";
  }

  getHeight(x, z, biome) {
    let base = this.noise.fbm2(x * 0.016, z * 0.016, 5, 2, 0.5);
    let detail = this.noise.fbm2(x * 0.055, z * 0.055, 3, 2.1, 0.42);
    let height = 23 + base * 13 + detail * 3;

    if (biome === "Mountains") height += 12 + Math.abs(base) * 18;
    if (biome === "Ocean") height -= 12;
    if (biome === "Swamp") height -= 3;
    if (biome === "Desert") height += 1;

    return Math.floor(MathUtils.clamp(height, 5, 58));
  }

  generateChunk(cx, cz, size, height) {
    let chunk = new Chunk(cx, cz, size, height);

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        let wx = cx * size + x;
        let wz = cz * size + z;
        let biome = this.getBiome(wx, wz);
        let surface = this.getHeight(wx, wz, biome);

        for (let y = 0; y < height; y++) {
          let id = this.blockForHeight(y, surface, biome, wx, wz);
          let cave = this.noise.noise3(wx * 0.07, y * 0.09, wz * 0.07);
          let deepCave = y < surface - 4 && y > 5 && cave > 0.42;

          if (deepCave && id !== BLOCK.BEDROCK) {
            id = BLOCK.AIR;
          }

          if (y <= this.waterLevel && y > surface && biome !== "Mountains") {
            id = biome === "Desert" ? BLOCK.WATER : BLOCK.WATER;
          }

          chunk.set(x, y, z, id);
        }

        this.addPlants(chunk, x, surface, z, biome, wx, wz);
      }
    }

    this.addStructures(chunk, cx, cz, size);
    return chunk;
  }

  blockForHeight(y, surface, biome, wx, wz) {
    if (y === 0) return BLOCK.BEDROCK;
    if (y > surface) return BLOCK.AIR;

    if (y < surface - 6) {
      let ore = this.oreAt(wx, y, wz);
      if (ore !== BLOCK.AIR) return ore;
      return BLOCK.STONE;
    }

    if (biome === "Desert") {
      return y > surface - 4 ? BLOCK.SAND : BLOCK.STONE;
    }

    if (biome === "Snowy Tundra" && y === surface) {
      return BLOCK.SNOW;
    }

    if (biome === "Ocean") {
      return y > surface - 3 ? BLOCK.SAND : BLOCK.CLAY;
    }

    if (y === surface) return BLOCK.GRASS;
    if (y > surface - 4) return BLOCK.DIRT;
    return BLOCK.STONE;
  }

  oreAt(x, y, z) {
    let n = this.noise.noise3(x * 0.12 + 9, y * 0.14, z * 0.12 - 4);
    if (y < 14 && n > 0.59) return BLOCK.DIAMOND_ORE;
    if (y < 18 && n > 0.55) return BLOCK.REDSTONE_ORE;
    if (y < 24 && n < -0.58) return BLOCK.GOLD_ORE;
    if (y < 38 && n > 0.49) return BLOCK.IRON_ORE;
    if (y < 46 && n < -0.5) return BLOCK.COAL_ORE;
    if (y < 22 && n > 0.53 && (x + z) % 5 === 0) return BLOCK.EMERALD_ORE;
    if (y < 28 && n < -0.54 && (x - z) % 3 === 0) return BLOCK.LAPIS_ORE;
    return BLOCK.AIR;
  }

  addPlants(chunk, x, surface, z, biome, wx, wz) {
    if (surface <= this.waterLevel || surface + 8 >= chunk.height) return;
    let n = this.noise.noise2(wx * 0.2 + 10, wz * 0.2 - 8);

    if ((biome === "Forest" || biome === "Plains") && n > 0.48) {
      this.tree(chunk, x, surface + 1, z, BLOCK.OAK_LOG, BLOCK.OAK_LEAVES, 4);
    }

    if (biome === "Jungle" && n > 0.35) {
      this.tree(chunk, x, surface + 1, z, BLOCK.OAK_LOG, BLOCK.OAK_LEAVES, 7);
      this.trySet(chunk, x + 1, surface + 2, z, BLOCK.VINE);
    }

    if (biome === "Snowy Tundra" && n > 0.55) {
      this.tree(chunk, x, surface + 1, z, BLOCK.SPRUCE_LOG, BLOCK.SPRUCE_LEAVES, 5);
    }

    if (biome === "Desert" && n > 0.55) {
      this.trySet(chunk, x, surface + 1, z, BLOCK.CACTUS);
      this.trySet(chunk, x, surface + 2, z, BLOCK.CACTUS);
    }

    if (biome !== "Desert" && biome !== "Ocean" && n < -0.56) {
      this.trySet(chunk, x, surface + 1, z, n < -0.65 ? BLOCK.FLOWER : BLOCK.MUSHROOM);
    }
  }

  tree(chunk, x, y, z, logId, leafId, treeHeight) {
    if (x < 2 || z < 2 || x > chunk.size - 3 || z > chunk.size - 3) return;

    for (let i = 0; i < treeHeight; i++) {
      this.trySet(chunk, x, y + i, z, logId);
    }

    let top = y + treeHeight;
    for (let lx = -2; lx <= 2; lx++) {
      for (let lz = -2; lz <= 2; lz++) {
        for (let ly = -1; ly <= 1; ly++) {
          let dist = Math.abs(lx) + Math.abs(lz) + Math.max(0, ly);
          if (dist <= 3) {
            this.trySet(chunk, x + lx, top + ly, z + lz, leafId);
          }
        }
      }
    }
  }

  addStructures(chunk, cx, cz, size) {
    if (Math.abs(cx) % 7 === 2 && Math.abs(cz) % 7 === 3) {
      this.addSmallHouse(chunk, 4, 28, 4);
    }

    if (Math.abs(cx) % 11 === 5 && Math.abs(cz) % 11 === 5) {
      this.addDungeon(chunk, 3, 12, 3);
    }
  }

  addSmallHouse(chunk, x, y, z) {
    for (let ix = 0; ix < 7; ix++) {
      for (let iz = 0; iz < 7; iz++) {
        this.trySet(chunk, x + ix, y, z + iz, BLOCK.OAK_PLANKS);
        if (ix === 0 || iz === 0 || ix === 6 || iz === 6) {
          for (let iy = 1; iy <= 4; iy++) {
            this.trySet(chunk, x + ix, y + iy, z + iz, iy === 2 && ix === 3 ? BLOCK.GLASS : BLOCK.OAK_PLANKS);
          }
        }
      }
    }

    for (let ix = -1; ix <= 7; ix++) {
      for (let iz = -1; iz <= 7; iz++) {
        if (ix >= 0 && ix <= 6 && iz >= 0 && iz <= 6) {
          this.trySet(chunk, x + ix, y + 5, z + iz, BLOCK.SPRUCE_PLANKS);
        }
      }
    }

    this.trySet(chunk, x + 3, y + 1, z, BLOCK.DOOR);
    this.trySet(chunk, x + 2, y + 1, z + 3, BLOCK.CHEST);
    this.trySet(chunk, x + 4, y + 1, z + 3, BLOCK.CRAFTING_TABLE);
  }

  addDungeon(chunk, x, y, z) {
    for (let ix = 0; ix < 9; ix++) {
      for (let iy = 0; iy < 5; iy++) {
        for (let iz = 0; iz < 9; iz++) {
          let wall = ix === 0 || iz === 0 || ix === 8 || iz === 8 || iy === 0 || iy === 4;
          this.trySet(chunk, x + ix, y + iy, z + iz, wall ? BLOCK.COBBLE : BLOCK.AIR);
        }
      }
    }
    this.trySet(chunk, x + 4, y + 1, z + 4, BLOCK.CHEST);
    this.trySet(chunk, x + 4, y + 2, z + 4, BLOCK.FIRE);
  }

  trySet(chunk, x, y, z, id) {
    if (chunk.inBounds(x, y, z)) {
      chunk.set(x, y, z, id);
    }
  }
}

window.ChunkGenerator = ChunkGenerator;





class World {
  constructor(seed, registry, scene, materials, events) {
    this.seed = seed || Math.floor(Math.random() * 999999);
    this.registry = registry;
    this.scene = scene;
    this.materials = materials;
    this.events = events;
    this.size = 16;
    this.height = 64;
    this.renderDistance = 5;
    this.generator = new ChunkGenerator(this.seed, registry);
    this.mesher = new BlockMesher(registry);
    this.chunks = new Map();
    this.changedBlocks = {};
  }

  key(cx, cz) {
    return cx + "," + cz;
  }

  getChunk(cx, cz) {
    return this.chunks.get(this.key(cx, cz));
  }

  ensureChunk(cx, cz) {
    let key = this.key(cx, cz);
    let chunk = this.chunks.get(key);

    if (!chunk) {
      chunk = this.generator.generateChunk(cx, cz, this.size, this.height);
      this.applyChangedBlocksToChunk(chunk);
      this.chunks.set(key, chunk);
      chunk.rebuild(this.scene, this, this.mesher, this.materials);
    }

    return chunk;
  }

  updateAround(position) {
    let pcx = MathUtils.chunkCoord(position.x, this.size);
    let pcz = MathUtils.chunkCoord(position.z, this.size);

    for (let cx = pcx - this.renderDistance; cx <= pcx + this.renderDistance; cx++) {
      for (let cz = pcz - this.renderDistance; cz <= pcz + this.renderDistance; cz++) {
        this.ensureChunk(cx, cz);
      }
    }

    for (let [key, chunk] of this.chunks.entries()) {
      let dx = Math.abs(chunk.cx - pcx);
      let dz = Math.abs(chunk.cz - pcz);
      if (dx > this.renderDistance + 1 || dz > this.renderDistance + 1) {
        chunk.dispose(this.scene);
        this.chunks.delete(key);
      } else if (chunk.needsMesh) {
        chunk.rebuild(this.scene, this, this.mesher, this.materials);
      }
    }
  }

  getBlock(x, y, z) {
    if (y < 0) return BLOCK.BEDROCK;
    if (y >= this.height) return BLOCK.AIR;

    let cx = MathUtils.chunkCoord(x, this.size);
    let cz = MathUtils.chunkCoord(z, this.size);
    let chunk = this.getChunk(cx, cz);

    if (!chunk) return BLOCK.AIR;

    let lx = MathUtils.mod(x, this.size);
    let lz = MathUtils.mod(z, this.size);
    return chunk.get(lx, y, lz);
  }

  setBlock(x, y, z, id, trackChange) {
    if (y <= 0 || y >= this.height) return false;

    let cx = MathUtils.chunkCoord(x, this.size);
    let cz = MathUtils.chunkCoord(z, this.size);
    let chunk = this.ensureChunk(cx, cz);
    let lx = MathUtils.mod(x, this.size);
    let lz = MathUtils.mod(z, this.size);

    chunk.set(lx, y, lz, id);
    this.markChunkAndNeighbours(cx, cz, lx, lz);

    if (trackChange !== false) {
      this.changedBlocks[x + "," + y + "," + z] = id;
    }

    this.events.emit("block:changed", { x, y, z, id });
    return true;
  }

  markChunkAndNeighbours(cx, cz, lx, lz) {
    let chunk = this.getChunk(cx, cz);
    if (chunk) chunk.needsMesh = true;

    if (lx === 0 && this.getChunk(cx - 1, cz)) this.getChunk(cx - 1, cz).needsMesh = true;
    if (lx === this.size - 1 && this.getChunk(cx + 1, cz)) this.getChunk(cx + 1, cz).needsMesh = true;
    if (lz === 0 && this.getChunk(cx, cz - 1)) this.getChunk(cx, cz - 1).needsMesh = true;
    if (lz === this.size - 1 && this.getChunk(cx, cz + 1)) this.getChunk(cx, cz + 1).needsMesh = true;
  }

  getSurfaceHeight(x, z) {
    for (let y = this.height - 1; y >= 0; y--) {
      let id = this.getBlock(x, y, z);
      if (id !== BLOCK.AIR && id !== BLOCK.WATER && id !== BLOCK.FLOWER && id !== BLOCK.MUSHROOM) {
        return y;
      }
    }
    return 1;
  }

  getSpawnPoint() {
    this.updateAround(new THREE.Vector3(0, 30, 0));

    let bestX = 0;
    let bestZ = 0;
    let bestHeight = -1;

    for (let x = -18; x <= 18; x += 3) {
      for (let z = -18; z <= 18; z += 3) {
        let h = this.getSurfaceHeight(x, z);
        let block = this.getBlock(x, h, z);

        if (h > this.generator.waterLevel + 1 && block !== BLOCK.WATER && h > bestHeight) {
          bestX = x;
          bestZ = z;
          bestHeight = h;
        }
      }
    }

    let y = this.getSurfaceHeight(bestX, bestZ) + 3;
    return new THREE.Vector3(bestX + 0.5, y, bestZ + 0.5);
  }

  raycast(origin, direction, maxDistance) {
    let step = 0.08;
    let lastAir = null;

    for (let dist = 0; dist <= maxDistance; dist += step) {
      let px = origin.x + direction.x * dist;
      let py = origin.y + direction.y * dist;
      let pz = origin.z + direction.z * dist;
      let bx = Math.floor(px);
      let by = Math.floor(py);
      let bz = Math.floor(pz);
      let id = this.getBlock(bx, by, bz);

      if (id !== BLOCK.AIR && id !== BLOCK.WATER && id !== BLOCK.FIRE) {
        return {
          x: bx,
          y: by,
          z: bz,
          id,
          place: lastAir || { x: bx, y: by + 1, z: bz },
          distance: dist
        };
      }

      lastAir = { x: bx, y: by, z: bz };
    }

    return null;
  }

  applyChangedBlocksToChunk(chunk) {
    for (let key in this.changedBlocks) {
      let parts = key.split(",").map(Number);
      let x = parts[0];
      let y = parts[1];
      let z = parts[2];
      let id = this.changedBlocks[key];
      let cx = MathUtils.chunkCoord(x, this.size);
      let cz = MathUtils.chunkCoord(z, this.size);

      if (cx === chunk.cx && cz === chunk.cz) {
        chunk.set(MathUtils.mod(x, this.size), y, MathUtils.mod(z, this.size), id);
      }
    }
  }

  loadChangedBlocks(changes) {
    this.changedBlocks = changes || {};
  }

  reapplyChangesToLoadedChunks() {
    for (let chunk of this.chunks.values()) {
      this.applyChangedBlocksToChunk(chunk);
      chunk.needsMesh = true;
    }
  }

  setRenderDistance(value) {
    this.renderDistance = Number(value);
  }
}

window.World = World;




class ItemRegistry {
  constructor(blockRegistry) {
    this.blockRegistry = blockRegistry;
    this.items = {};
    this.addBlockItems();
    this.addTool("wooden_pickaxe", "Wooden Pickaxe", "pickaxe", 1.8, 60, "#b8874f");
    this.addTool("stone_pickaxe", "Stone Pickaxe", "pickaxe", 2.6, 132, "#777f89");
    this.addTool("iron_pickaxe", "Iron Pickaxe", "pickaxe", 4.2, 251, "#d1d5db");
    this.addTool("gold_pickaxe", "Gold Pickaxe", "pickaxe", 5.5, 33, "#facc15");
    this.addTool("diamond_pickaxe", "Diamond Pickaxe", "pickaxe", 6.2, 1561, "#67e8f9");
    this.addTool("wooden_sword", "Wooden Sword", "sword", 1, 60, "#b8874f");
    this.addTool("stone_sword", "Stone Sword", "sword", 1, 132, "#777f89");
    this.addTool("iron_sword", "Iron Sword", "sword", 1, 251, "#d1d5db");
    this.addTool("diamond_sword", "Diamond Sword", "sword", 1, 1561, "#67e8f9");
    this.add("stick", "Stick", "#a16207", 64);
    this.add("coal", "Coal", "#18181b", 64);
    this.add("iron_ingot", "Iron Ingot", "#d1d5db", 64);
    this.add("gold_ingot", "Gold Ingot", "#facc15", 64);
    this.add("diamond", "Diamond", "#22d3ee", 64);
    this.add("bucket", "Bucket", "#94a3b8", 1);
    this.add("flint_steel", "Flint and Steel", "#cbd5e1", 1);
    this.add("apple", "Apple", "#ef4444", 64, { food: 4 });
    this.add("bread", "Bread", "#d6a341", 64, { food: 5 });
    this.add("steak", "Steak", "#7f1d1d", 64, { food: 8 });
    this.add("bow", "Bow", "#92400e", 1);
    this.add("arrow", "Arrow", "#e5e7eb", 64);
  }

  add(id, name, color, stack, extra) {
    this.items[id] = Object.assign({
      id,
      name,
      color,
      stack: stack || 64,
      type: "item"
    }, extra || {});
  }

  addTool(id, name, toolType, speed, durability, color) {
    this.add(id, name, color, 1, {
      type: "tool",
      toolType,
      speed,
      durability
    });
  }

  addBlockItems() {
    for (let id in this.blockRegistry.blocks) {
      let block = this.blockRegistry.get(Number(id));
      if (block.id === BLOCK.AIR || block.id === BLOCK.WATER || block.id === BLOCK.LAVA || block.id === BLOCK.FIRE) {
        continue;
      }
      this.add("block_" + block.id, block.name, block.color, 64, {
        type: "block",
        blockId: block.id
      });
    }
  }

  get(id) {
    return this.items[id] || null;
  }

  itemForBlock(blockId) {
    let block = this.blockRegistry.get(blockId);
    if (blockId === BLOCK.COAL_ORE) return "coal";
    if (blockId === BLOCK.DIAMOND_ORE) return "diamond";
    if (blockId === BLOCK.IRON_ORE) return "block_" + BLOCK.IRON_ORE;
    if (blockId === BLOCK.GOLD_ORE) return "block_" + BLOCK.GOLD_ORE;
    if (blockId === BLOCK.GRASS) return "block_" + BLOCK.DIRT;
    if (!block || block.id === BLOCK.AIR) return null;
    return "block_" + block.id;
  }
}

window.ItemRegistry = ItemRegistry;





class Inventory {
  constructor(itemRegistry) {
    this.itemRegistry = itemRegistry;
    this.slots = new Array(36).fill(null);
    this.selected = 0;
    this.give("block_" + BLOCK.GRASS, 32);
    this.give("block_" + BLOCK.OAK_PLANKS, 32);
    this.give("block_" + BLOCK.STONE, 32);
    this.give("block_" + BLOCK.GLASS, 16);
    this.give("block_" + BLOCK.TORCH, 24);
    this.give("wooden_pickaxe", 1);
    this.give("wooden_sword", 1);
    this.give("bread", 5);
  }

  current() {
    return this.slots[this.selected];
  }

  select(index) {
    this.selected = MathUtils.clamp(index, 0, 8);
  }

  give(itemId, count) {
    let item = this.itemRegistry.get(itemId);
    if (!item) return false;
    let left = count || 1;

    for (let i = 0; i < this.slots.length; i++) {
      let slot = this.slots[i];
      if (slot && slot.id === itemId && slot.count < item.stack) {
        let add = Math.min(left, item.stack - slot.count);
        slot.count += add;
        left -= add;
        if (left <= 0) return true;
      }
    }

    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) {
        let add = Math.min(left, item.stack);
        this.slots[i] = {
          id: itemId,
          count: add,
          durability: item.durability || null
        };
        left -= add;
        if (left <= 0) return true;
      }
    }

    return left <= 0;
  }

  useSelectedOne() {
    let slot = this.current();
    if (!slot) return;
    let item = this.itemRegistry.get(slot.id);
    if (!item || item.stack === 1) return;
    slot.count -= 1;
    if (slot.count <= 0) {
      this.slots[this.selected] = null;
    }
  }

  damageSelected(amount) {
    let slot = this.current();
    if (!slot || !slot.durability) return;
    slot.durability -= amount || 1;
    if (slot.durability <= 0) {
      this.slots[this.selected] = null;
    }
  }

  swap(a, b) {
    let temp = this.slots[a];
    this.slots[a] = this.slots[b];
    this.slots[b] = temp;
  }

  serialize() {
    return this.slots;
  }

  load(data) {
    if (Array.isArray(data)) {
      this.slots = data;
    }
  }
}

window.Inventory = Inventory;





class CraftingEngine {
  constructor(inventory) {
    this.inventory = inventory;
    this.recipes = [
      { name: "Oak Planks", need: { ["block_" + BLOCK.OAK_LOG]: 1 }, give: "block_" + BLOCK.OAK_PLANKS, count: 4 },
      { name: "Stick", need: { ["block_" + BLOCK.OAK_PLANKS]: 2 }, give: "stick", count: 4 },
      { name: "Crafting Table", need: { ["block_" + BLOCK.OAK_PLANKS]: 4 }, give: "block_" + BLOCK.CRAFTING_TABLE, count: 1 },
      { name: "Chest", need: { ["block_" + BLOCK.OAK_PLANKS]: 8 }, give: "block_" + BLOCK.CHEST, count: 1 },
      { name: "Furnace", need: { ["block_" + BLOCK.COBBLE]: 8 }, give: "block_" + BLOCK.FURNACE, count: 1 },
      { name: "Torch", need: { coal: 1, stick: 1 }, give: "block_" + BLOCK.TORCH, count: 4 },
      { name: "Wooden Pickaxe", need: { ["block_" + BLOCK.OAK_PLANKS]: 3, stick: 2 }, give: "wooden_pickaxe", count: 1 },
      { name: "Stone Pickaxe", need: { ["block_" + BLOCK.COBBLE]: 3, stick: 2 }, give: "stone_pickaxe", count: 1 },
      { name: "Bread", need: { ["block_" + BLOCK.WHEAT]: 3 }, give: "bread", count: 1 }
    ];
  }

  getCounts() {
    let counts = {};
    for (let i = 0; i < this.inventory.slots.length; i++) {
      let slot = this.inventory.slots[i];
      if (!slot) continue;
      counts[slot.id] = (counts[slot.id] || 0) + slot.count;
    }
    return counts;
  }

  canCraft(recipe) {
    let counts = this.getCounts();
    for (let id in recipe.need) {
      if (!counts[id] || counts[id] < recipe.need[id]) {
        return false;
      }
    }
    return true;
  }

  craft(index) {
    let recipe = this.recipes[index];
    if (!recipe || !this.canCraft(recipe)) {
      return false;
    }

    for (let id in recipe.need) {
      this.take(id, recipe.need[id]);
    }

    this.inventory.give(recipe.give, recipe.count);
    return recipe;
  }

  take(itemId, count) {
    let left = count;
    for (let i = 0; i < this.inventory.slots.length; i++) {
      let slot = this.inventory.slots[i];
      if (!slot || slot.id !== itemId) continue;
      let remove = Math.min(left, slot.count);
      slot.count -= remove;
      left -= remove;
      if (slot.count <= 0) this.inventory.slots[i] = null;
      if (left <= 0) return;
    }
  }
}

window.CraftingEngine = CraftingEngine;





class AudioManager {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.musicTimer = 0;
  }

  start() {
    if (this.context) return;
    let AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
  }

  beep(freq, time, type, volume) {
    if (!this.enabled) return;
    this.start();
    if (!this.context) return;

    let osc = this.context.createOscillator();
    let gain = this.context.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    gain.gain.value = volume || 0.03;
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + time);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + time);
  }

  blockSound(kind) {
    if (kind === "stone") this.beep(120, 0.08, "triangle", 0.045);
    else if (kind === "wood") this.beep(190, 0.08, "square", 0.035);
    else if (kind === "dirt") this.beep(90, 0.07, "sine", 0.035);
    else this.beep(160, 0.06, "square", 0.03);
  }

  ui() {
    this.beep(440, 0.04, "sine", 0.025);
  }

  hurt() {
    this.beep(70, 0.18, "sawtooth", 0.06);
  }

  explosion() {
    this.beep(55, 0.35, "sawtooth", 0.08);
  }

  update(delta, sky) {
    this.musicTimer -= delta;
    if (this.musicTimer <= 0 && sky && sky.timeOfDay > 0.22 && sky.timeOfDay < 0.78) {
      this.musicTimer = 8 + Math.random() * 8;
      let notes = [220, 261.63, 329.63, 392];
      let note = notes[Math.floor(Math.random() * notes.length)];
      this.beep(note, 0.42, "sine", 0.015);
      setTimeout(() => this.beep(note * 1.5, 0.3, "sine", 0.012), 180);
    }
  }
}

window.AudioManager = AudioManager;





class Renderer {
  constructor(root) {
    this.root = root;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.imageRendering = "auto";
    if (THREE.sRGBEncoding) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.root.appendChild(this.renderer.domElement);

    this.materials = {
      solid: new THREE.MeshLambertMaterial({
        vertexColors: true,
        map: null,
        dithering: true
      }),
      transparent: new THREE.MeshLambertMaterial({
        vertexColors: true,
        map: null,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        dithering: true,
        side: THREE.DoubleSide
      })
    };

    this.highlight = this.makeHighlight();
    this.scene.add(this.highlight);

    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);
    this.particles = [];

    this.sun = new THREE.DirectionalLight(0xffffff, 1.35);
    this.sun.position.set(70, 100, 45);
    this.sun.castShadow = true;
    this.scene.add(this.sun);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.48);
    this.scene.add(this.ambient);

    this.hemi = new THREE.HemisphereLight(0xaed8ff, 0x4b3a2a, 0.55);
    this.scene.add(this.hemi);

    this.scene.fog = new THREE.FogExp2(0x9bd4ff, 0.0048);
    window.addEventListener("resize", () => this.resize());
  }

  setTextureAtlas(texture) {
    this.materials.solid.map = texture;
    this.materials.transparent.map = texture;
    this.materials.solid.needsUpdate = true;
    this.materials.transparent.needsUpdate = true;
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  makeHighlight() {
    let geometry = new THREE.BoxGeometry(1.02, 1.02, 1.02);
    let edges = new THREE.EdgesGeometry(geometry);
    let material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    let lines = new THREE.LineSegments(edges, material);
    lines.visible = false;
    return lines;
  }

  setHighlight(target) {
    if (!target) {
      this.highlight.visible = false;
      return;
    }
    this.highlight.visible = true;
    this.highlight.position.set(target.x + 0.5, target.y + 0.5, target.z + 0.5);
  }

  addBreakParticles(x, y, z, color) {
    for (let i = 0; i < 14; i++) {
      let geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      let mat = new THREE.MeshBasicMaterial({ color });
      let mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
      mesh.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 2.6,
        (Math.random() - 0.5) * 3
      );
      mesh.userData.life = 0.65;
      this.particleGroup.add(mesh);
      this.particles.push(mesh);
    }
  }

  updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.userData.life -= delta;
      p.userData.vel.y -= 7 * delta;
      p.position.addScaledVector(p.userData.vel, delta);
      p.material.opacity = Math.max(0, p.userData.life);

      if (p.userData.life <= 0) {
        this.particleGroup.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

window.Renderer = Renderer;




class SkyRenderer {
  constructor(renderer, events) {
    this.renderer = renderer;
    this.events = events;
    this.timeOfDay = 0.34;
    this.dayLength = 420;
    this.weather = "clear";
    this.weatherTimer = 60;
    this.rain = this.makeRain();
    this.renderer.scene.add(this.rain);
    this.clouds = this.makeClouds();
    this.renderer.scene.add(this.clouds);
  }

  makeRain() {
    let geo = new THREE.BufferGeometry();
    let points = [];
    for (let i = 0; i < 700; i++) {
      points.push((Math.random() - 0.5) * 90, Math.random() * 45, (Math.random() - 0.5) * 90);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    let mat = new THREE.PointsMaterial({ color: 0xdbeafe, size: 0.08, transparent: true, opacity: 0.55 });
    let rain = new THREE.Points(geo, mat);
    rain.visible = false;
    return rain;
  }

  update(delta, playerPos) {
    this.timeOfDay += delta / this.dayLength;
    if (this.timeOfDay > 1) this.timeOfDay -= 1;

    this.weatherTimer -= delta;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = 70 + Math.random() * 110;
      let roll = Math.random();
      this.weather = roll < 0.68 ? "clear" : roll < 0.9 ? "rain" : "thunder";
      this.events.emit("weather:changed", this.weather);
    }

    this.applySky();
    this.updateRain(delta, playerPos);
    this.updateClouds(delta, playerPos);
  }

  applySky() {
    let t = this.timeOfDay;
    let dayAmount = Math.max(0.08, Math.sin(t * Math.PI));
    let sunrise = Math.max(0, 1 - Math.abs(t - 0.24) * 12);
    let sunset = Math.max(0, 1 - Math.abs(t - 0.76) * 12);
    let warm = Math.max(sunrise, sunset);
    let color = new THREE.Color(0x09111f).lerp(new THREE.Color(0x87b8ff), dayAmount);
    color.lerp(new THREE.Color(0xff9b65), warm * 0.45);

    if (this.weather !== "clear") {
      color.lerp(new THREE.Color(0x3b4859), 0.45);
    }

    this.renderer.scene.background = color;
    this.renderer.scene.fog.color.copy(color);
    this.renderer.scene.fog.density = this.weather === "clear" ? 0.0048 : 0.0075;
    this.renderer.sun.intensity = 0.35 + dayAmount * 1.25;
    this.renderer.ambient.intensity = 0.22 + dayAmount * 0.48;
    this.renderer.hemi.intensity = 0.2 + dayAmount * 0.5;

    let angle = t * Math.PI * 2;
    this.renderer.sun.position.set(Math.cos(angle) * 80, Math.sin(angle) * 90, 30);
  }

  makeClouds() {
    let group = new THREE.Group();
    let material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    });

    for (let i = 0; i < 22; i++) {
      let cloud = new THREE.Group();
      let parts = 4 + Math.floor(Math.random() * 4);
      for (let j = 0; j < parts; j++) {
        let geo = new THREE.BoxGeometry(8 + Math.random() * 10, 1.6, 4 + Math.random() * 6);
        let box = new THREE.Mesh(geo, material);
        box.position.set(j * 6 + Math.random() * 4, Math.random() * 1.2, (Math.random() - 0.5) * 8);
        cloud.add(box);
      }
      cloud.position.set((Math.random() - 0.5) * 170, 58 + Math.random() * 10, (Math.random() - 0.5) * 170);
      cloud.userData.speed = 0.5 + Math.random() * 0.8;
      group.add(cloud);
    }

    return group;
  }

  updateClouds(delta, playerPos) {
    this.clouds.position.x = playerPos.x;
    this.clouds.position.z = playerPos.z;

    for (let i = 0; i < this.clouds.children.length; i++) {
      let cloud = this.clouds.children[i];
      cloud.position.x += cloud.userData.speed * delta;

      if (cloud.position.x > 110) {
        cloud.position.x = -110;
        cloud.position.z = (Math.random() - 0.5) * 170;
      }
    }
  }

  updateRain(delta, playerPos) {
    this.rain.visible = this.weather === "rain" || this.weather === "thunder";
    if (!this.rain.visible) return;

    this.rain.position.set(playerPos.x, playerPos.y + 12, playerPos.z);
    let attr = this.rain.geometry.getAttribute("position");
    for (let i = 0; i < attr.count; i++) {
      let y = attr.getY(i) - delta * 35;
      if (y < -10) y = 38;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;

    if (this.weather === "thunder" && Math.random() < delta * 0.035) {
      this.renderer.ambient.intensity = 2.5;
      this.events.emit("weather:lightning");
    }
  }

  setTime(value) {
    if (value === "day") this.timeOfDay = 0.35;
    else if (value === "night") this.timeOfDay = 0.88;
    else this.timeOfDay = MathUtils.clamp(Number(value) || 0.35, 0, 1);
  }

  setWeather(value) {
    if (["clear", "rain", "thunder"].includes(value)) {
      this.weather = value;
      this.weatherTimer = 90;
    }
  }
}

window.SkyRenderer = SkyRenderer;




class WaterRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.time = 0;
  }

  update(delta) {
    this.time += delta;
    let value = 0.72 + Math.sin(this.time * 2.2) * 0.03;
    this.renderer.materials.transparent.opacity = value;
  }
}

window.WaterRenderer = WaterRenderer;




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
        this.chat.add(wantedMode === "creative" ? "Creative world created. Fly, build, and use the Creative menu." : "New world created. Click the game to lock mouse.");
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
