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
