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
