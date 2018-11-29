var scale = 20

var otherSprites = document.createElement('img')
otherSprites.src = 'img/newSprites.png'

var playerSprites = document.createElement('img')
playerSprites.src = 'img/newPlayer.png'
var playerXOverlap = 4

var lifeGraphic = document.createElement('img')
lifeGraphic.src = 'img/heart.png'
var lifeGraphicWidth = 20

var gameFontPaused = 'bold 30px Verdana'
var gameFontNormal = 'bold 16px Verdana'

function flipHorizontally (context, around) {
  context.translate(around, 0)
  context.scale(-1, 1)
  context.translate(-around, 0)
}

var CanvasDisplay = class CanvasDisplay { // eslint-disable-line no-unused-vars
  constructor (parent, level) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = Math.min(600, level.width * scale)
    this.canvas.height = Math.min(450, level.height * scale)
    parent.appendChild(this.canvas)
    this.cx = this.canvas.getContext('2d')

    this.flipPlayer = false

    this.viewport = {
      left: 0,
      top: 0,
      width: this.canvas.width / scale,
      height: this.canvas.height / scale
    }
  }

  clear () {
    this.canvas.remove()
  }

  setState (state) {
    this.updateViewport(state)
    this.clearDisplay(state.status)
    this.drawActors(state.actors)
    this.drawBackground(state.level)
    this.drawOverlay(state.game)
  }

  updateViewport (state) {
    let view = this.viewport
    let margin = view.width / 3
    let player = state.player
    let center = player.pos.plus(player.size.times(0.5))

    if (center.x < view.left + margin) {
      view.left = Math.max(center.x - margin, 0)
    } else if (center.x > view.left + view.width - margin) {
      view.left = Math.min(center.x + margin - view.width,
                           state.level.width - view.width)
    }
    if (center.y < view.top + margin) {
      view.top = Math.max(center.y - margin, 0)
    } else if (center.y > view.top + view.height - margin) {
      view.top = Math.min(center.y + margin - view.height,
                          state.level.height - view.height)
    }
  }

  clearDisplay (status) {
    if (status === 'won') {
      this.cx.fillStyle = 'rgb(241, 178, 75)'
    } else if (status === 'lost') {
      this.cx.fillStyle = 'rgb(188, 98, 92)'
    } else {
      this.cx.fillStyle = 'rgb(140, 204, 253)'
    }
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawBackground (level) {
    let {left, top, width, height} = this.viewport
    let xStart = Math.floor(left)
    let xEnd = Math.ceil(left + width)
    let yStart = Math.floor(top)
    let yEnd = Math.ceil(top + height)

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let tile = level.rows[y][x]
        if (tile === 'empty') continue
        let screenX = (x - left) * scale
        let screenY = (y - top) * scale
        let tileX = tile === 'lava' ? scale : 0
        this.cx.drawImage(otherSprites, tileX, 0, scale, scale, screenX, screenY, scale, scale)
      }
    }
  }

  drawPlayer (player, x, y, width, height) {
    width += playerXOverlap * 2
    x -= playerXOverlap
    if (player.speed.x !== 0) {
      this.flipPlayer = player.speed.x < 0
    }

    let tile = 8
    if (player.speed.y !== 0) {
      tile = 9
    } else if (player.speed.x !== 0) {
      tile = Math.floor(Date.now() / 60) % 8
    }

    this.cx.save()
    if (this.flipPlayer) {
      flipHorizontally(this.cx, x + width / 2)
    }
    let tileX = tile * width
    this.cx.drawImage(playerSprites, tileX, 0, width, height, x, y, width, height)
    this.cx.restore()
  }

  drawActors (actors) {
    for (let actor of actors) {
      let width = actor.size.x * scale
      let height = actor.size.y * scale
      let x = (actor.pos.x - this.viewport.left) * scale
      let y = (actor.pos.y - this.viewport.top) * scale
      if (actor.type === 'player') {
        this.drawPlayer(actor, x, y, width, height)
      } else {
        let tileX = (actor.type === 'coin' ? 2 : 1) * scale
        this.cx.drawImage(otherSprites, tileX, 0, width, height, x, y, width, height)
      }
    }
  }

  drawOverlay (game) {
    this.drawTimer(game)
    this.drawPoints(game)
    this.drawLives(game.lives)
    if (game.paused) this.pauseMenu(game)
  }

  drawTimer (game) {
    this.cx.font = gameFontNormal
    this.cx.fillStyle = '#000000'
    if (game.timer < 15) this.cx.fillStyle = '#FF0000'
    this.cx.fillText(game.clock, 10, 30)
  }

  drawPoints (game) {
    this.cx.fillStyle = 'black'
    this.cx.font = gameFontNormal
    this.cx.fillText(game.points, 10, 50)
  }

  drawLives (lives) {
    let xPosition = this.canvas.width - 10
    for (let i = 0; i < lives; i++) {
      xPosition -= (lifeGraphicWidth + 5)
      this.cx.drawImage(lifeGraphic, xPosition, 15)
    }
  }

  pauseMenu (game) {
    let text = 'GAME PAUSED'
    this.cx.font = gameFontPaused
    let offset = this.cx.measureText(text).width
    let { x, y } = { x: (this.canvas.width / 2) - (offset / 2), y: (this.canvas.height / 2) - 30 }
    this.cx.fillStyle = '#00000022'
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.cx.fillStyle = '#ffffff'
    this.cx.fillText(text, x, y)
  }
}
