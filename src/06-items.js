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
