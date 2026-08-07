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
