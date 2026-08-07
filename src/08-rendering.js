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
