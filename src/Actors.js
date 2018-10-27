/* global Vec State */
var wobbleSpeed = 8
var wobbleDist = 0.07

var Lava = class Lava {
  constructor (pos, speed, reset) {
    this.pos = pos
    this.speed = speed
    this.reset = reset
  }

  get type () { return 'lava' }

  static create (pos, ch) {
    if (ch === '=') {
      return new Lava(pos, new Vec(2, 0))
    } else if (ch === '|') {
      return new Lava(pos, new Vec(0, 2))
    } else if (ch === 'v') {
      return new Lava(pos, new Vec(0, 3), pos)
    }
  }

  collide (state) {
    return new State(state.level, state.actors, 'lost')
  }

  update (time, state) {
    let newPos = this.pos.plus(this.speed.times(time))
    if (!state.level.touches(newPos, this.size, 'wall')) {
      return new Lava(newPos, this.speed, this.reset)
    } else if (this.reset) {
      return new Lava(this.reset, this.speed, this.reset)
    } else {
      return new Lava(this.pos, this.speed.times(-1))
    }
  }
}

Lava.prototype.size = new Vec(1, 1)

var Coin = class Coin {
  constructor (pos, basePos, wobble) {
    this.pos = pos
    this.basePos = basePos
    this.wobble = wobble
  }

  get type () { return 'coin' }

  static create (pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1))
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2)
  }

  collide (state) {
    let { status, game, actors } = state
    let filtered = actors.filter(a => a !== this)
    game.collectItem(this.type)
    if (!filtered.some(a => a.type === 'coin')) status = 'won'
    return new State(state.level, filtered, status)
  }

  update (time) {
    let wobble = this.wobble + time * wobbleSpeed
    let wobblePos = Math.sin(wobble) * wobbleDist
    return new Coin(this.basePos.plus(new Vec(0, wobblePos)), this.basePos, wobble)
  }
}

Coin.prototype.size = new Vec(0.6, 0.6)
