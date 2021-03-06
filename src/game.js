/* global requestAnimationFrame State Level */
function trackKeys (keys) {
  let down = Object.create(null)
  down.Pause = false
  function track (event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type === 'keydown'
      event.preventDefault()
    }
  }
  window.onkeydown = track
  window.onkeyup = track
  return down
}

var arrowKeys = trackKeys(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Pause'])

var Game = class Game {
  constructor () {
    this.totalPoints = 0
    this.pointsBuffer = 0
    this.lives = 3
    this.timer = null
    this.paused = true
    this.gameMusic = document.createElement('audio')
    
    var pauseMusic = document.createElement('audio')
    pauseMusic.src = 'sounds/title_screen.mp3'
    
    this.pause = function () {
      this.paused = true
      this.gameMusic.pause()
      pauseMusic.play()
    }
    
    this.unPause = function () {
      this.paused = false
      pauseMusic.src = 'sounds/title_screen.mp3' // re-defining audio source will stop it from playing and reset at the beginning
      this.gameMusic.play()
    }
    
    var win = document.createElement('audio')
    win.src = 'sounds/stage_clear.wav'
    
    var lose = document.createElement('audio')
    lose.src = 'sounds/die.wav'
    
    this.playSfx = function (status) {
      this.gameMusic.pause()
      switch (status) {
        case 'won':
          win.play()
          break
        case 'lost':
          lose.play()
          break
        default:
          console.log('Uh-oh...') // do nothing
      }
    }
  }
  
  get points () {
    return `Score: ${this.totalPoints + this.pointsBuffer}`
  }

  get clock () {
    let timer = this.timer
    let clock = 'Time Remaining: '
    clock += Math.floor(timer / 60) + ':' // MINUTES
    let seconds = Math.floor(timer % 60) // SECONDS
    clock += ((seconds < 10) ? '0' : '') + seconds // Add a leading 0 if less than 10 seconds

    if (timer < 15 && timer !== 0) { // Detailed time if less than 15 seconds remain
      let centiseconds = (Math.floor(timer * 100) % 100)
      clock += '.' + ((centiseconds < 10) ? '0' : '') + centiseconds // Add a leading 0 if less than 10 centiseconds
    }
    return clock
  }

  countDown (timeStep) {
    this.timer -= timeStep
    if (this.timer < 0) {
      this.timer = 0
      return false
    }
    return true
  }

  collectItem (typeOfItem) {
    switch (typeOfItem) {
      case 'coin':
        let sfx = document.createElement('audio')
        sfx.src = 'sounds/coin.wav'
        sfx.play()
        this.pointsBuffer += Math.floor(this.timer * 2)
        break
      default:
        console.log('Uh-oh...') // do nothing
    }
  }

  winLevel () {
    this.totalPoints += this.pointsBuffer
    this.pointsBuffer = 0
  }

  loseLife () {
    this.pointsBuffer = 0
    this.lives --
    if (this.lives < 0) return false
    return true
  }

  end (state) {
    console.log(`You've ${state.status}!`)
    let music = document.createElement('audio')
    music.src = 'sounds/gameover.wav'
    if (state.status === 'won') music.src = 'sounds/world_clear.wav'
    music.play()
  }
}

async function runGame (plans, Display) { // eslint-disable-line no-unused-vars
  document.getElementById('start-game').remove()
  var game = new Game()
  var state
  State.prototype.game = game
  for (let level = 0; level < plans.length;) {
    game.timer = plans[level].timeLimit
    game.pause()
    game.gameMusic.src = plans[level].musicSrc
    state = await runLevel(new Level(plans[level].map), Display)
    let status = state.status
    if (status === 'won') {
      game.winLevel()
      level++
    } else {
      if (!game.loseLife()) break
    }
  }
  return (game.end(state))
}

function runLevel (level, Display) {
  let display = new Display(document.body, level)
  let state = State.start(level)
  let ending = 2
  return new Promise(resolve => {
    runAnimation(time => {
      state = state.update(time, arrowKeys)
      display.setState(state)
      if (state.status === 'playing' || state.status === 'paused') {
        return true
      } else if (ending > 0) {
        ending -= time
        return true
      } else {
        display.clear()
        resolve(state)
        return false
      }
    })
  })
}

function runAnimation (frameFunc) {
  let lastTime = null
  function frame (time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000
      if (frameFunc(timeStep) === false) return
    }
    lastTime = time
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

var Vec = class Vec { // eslint-disable-line no-unused-vars
  constructor (x, y) {
    this.x = x; this.y = y
  }
  plus (other) {
    return new Vec(this.x + other.x, this.y + other.y)
  }
  times (factor) {
    return new Vec(this.x * factor, this.y * factor)
  }
}
