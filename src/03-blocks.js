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
