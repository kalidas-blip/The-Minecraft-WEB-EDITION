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
