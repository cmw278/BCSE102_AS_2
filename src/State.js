class State { // eslint-disable-line no-unused-vars
  constructor (level, actors, status) {
    this.level = level
    this.actors = actors
    this.status = status
  }

  static start (level) {
    return new State(level, level.startActors, 'paused')
  }

  get player () {
    return this.actors.find(a => a.type === 'player')
  }

  update (time, keys, endTimer) {
    let { level, actors, status, game } = this
    if (game.paused) {
      for (let aKey in keys) {
        if (keys[aKey]) {
          game.unPause()
          status = 'playing'
        }
      }
    }
    if (!game.paused && keys.Pause === true) {
      game.pause()
      status = 'paused'
    }

    if (status === 'paused') return new State(level, actors, status)
    if (status !== 'playing') {
      keys = {}
      game.playSfx(status)
    }

    actors = actors.map(actor => actor.update(time, this, keys))
    let newState = new State(level, actors, status)

    if (status !== 'playing') return newState

    if (!this.game.countDown(time)) return new State(level, actors, 'lost')

    let player = newState.player
    if (level.touches(player.pos, player.size, 'lava')) return new State(level, actors, 'lost')

    for (let actor of actors) {
      if (actor !== player && overlap(actor, player)) {
        newState = actor.collide(newState)
      }
    }
    return newState
  }
}

function overlap (actor1, actor2) { // eslint-disable-line no-unused-vars
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
         actor1.pos.x < actor2.pos.x + actor2.size.x &&
         actor1.pos.y + actor1.size.y > actor2.pos.y &&
         actor1.pos.y < actor2.pos.y + actor2.size.y
}
