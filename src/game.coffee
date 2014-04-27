Gnone = {}

class PlayState extends Phaser.State
  constructor: ->
    @currentMap = 'beginning'

  create: ->
    @game.physics.startSystem Phaser.Physics.ARCADE
    @game.physics.OVERLAP_BIAS = 16

    @farBack = @add.tileSprite 0, 0, 800, 600, 'far'
    @farBack.fixedToCamera = true

    @nearBack = @add.tileSprite 0, 0, 800, 600, 'near'
    @nearBack.fixedToCamera = true

    @water = new Phaser.Group @game, @game.world, 'water'
    @switches = new Phaser.Group @game, @game.world, 'switches'
    @gates = new Phaser.Group @game, @game.world, 'gates'
    @sprouts = new Phaser.Group @game, @game.world, 'sprouts'
    @signs = new Phaser.Group @game, @game.world, 'signs'
    @gnomes = new Phaser.Group @game, @game.world, 'gnomes'


    style = { font: "24px mini-serif", fill: "#ffffff", align: "center" }
    @signText = @add.text 400, 200, "", style
    @signText.fixedToCamera = true
    @signText.anchor.setTo 0.5

    @signText.stroke = '#000000';
    @signText.strokeThickness = 2;

    for i in [0..20]
      gnome = new Gnome @game, -100, -100
      gnome.kill()
      @gnomes.add gnome

    for i in [0..20]
      sprout = new Sprout @game, -100, -100
      sprout.kill()
      @sprouts.add sprout

    for i in [0..5]
      _switch = new Switch @game, -100, -100
      _switch.kill()
      @switches.add _switch

    @loadMap @currentMap

    @cursors = @game.input.keyboard.createCursorKeys()
    @pullKey = @game.input.keyboard.addKey Phaser.Keyboard.X
    @jumpKey = @game.input.keyboard.addKey Phaser.Keyboard.C
    @resetKey = @game.input.keyboard.addKey Phaser.Keyboard.R

    @game.time.events.loop 500, =>
      @gnomes.forEachAlive (gnome) =>
        @exit.reportNearest gnome

    # Set up emitters
    @growBurst = @add.emitter 0, 0, 100
    @growBurst.makeParticles 'sprites', ['dirt0', 'dirt1', 'dirt2']
    @growBurst.setYSpeed  -100, -120
    @growBurst.setXSpeed -100, 100
    @growBurst.gravity = 300

    @music = @add.audio 'march', 1, true
    @music.play '', 0, 1, true

    @jumpSnd = @add.audio 'jump', 1, false
    @pullupSnd = @add.audio 'pullup', 1, false
    @drownSnd = @add.audio 'drown', 1, false
    @switchSnd = @add.audio 'switch', 1, false

  loadMap: (name) ->
    @currentMap = name

    if @map? then @map.destroy()
    @map = @add.tilemap name
    @map.addTilesetImage 'tileset'

    if @layer? then @layer.destroy()
    @layer = @map.createLayer 'Tile Layer 1'
    @layer.resizeWorld()

    @map.setCollisionBetween(1, 96)
    objects = @game.cache._tilemaps[name].data.layers[1].objects

    @gnomes.callAll 'kill'
    @sprouts.callAll 'kill'
    @switches.callAll 'kill'

    @water.removeAll()
    @gates.removeAll()
    @signs.removeAll()

    @game.world.bringToTop @signText

    if @exit?
      @exit.destroy()

    for obj in objects when obj.name is 'start'
      gnome = @spawnGnome obj.x, obj.y
      @game.camera.follow(gnome)

    for obj in objects when obj.name is 'sprout'
      sprout = @sprouts.getFirstDead()
      sprout.reset obj.x, obj.y

    for obj in objects when obj.name is 'exit'
      @exit = new Exit(@game, obj.x, obj.y, obj.type)
      @exit.body.height = obj.height
      @exit.body.width = obj.width

    for obj in objects when obj.name is 'water'
      water = new Water(@game, obj.x, obj.y, obj.width, obj.height)
      @water.add water

    for obj in objects when obj.name is 'switch'
      _switch = @switches.getFirstDead()
      _switch.target = obj.type
      _switch.reset obj.x, obj.y

    for obj in objects when obj.name is 'gate'
      gate = new Gate(@game, obj.x, obj.y, obj.width, obj.height, obj.type)
      @gates.add gate

    for obj in objects when obj.name is 'sign'
      sign = new Sign(@game, obj.x, obj.y, obj.type)
      @signs.add sign

    @game.time.events.start()

  spawnGnome: (x, y) ->
    gnome = @gnomes.getFirstExists(false)
    if gnome?
      gnome.reset x, y
      gnome.body.velocity.setTo(0, 0)
      gnome.scale.x = 1

    return gnome

  findEmptySpace: (gnome) ->
    isOverlappingGnome = =>
      overlaps = false
      @gnomes.forEachAlive (gnome2) =>
        if gnome isnt gnome2 and @game.physics.arcade.intersects gnome.body, gnome2.body
          overlaps = true

      return overlaps
   
    gnome.body.y -= 2 while isOverlappingGnome()
    return

  update: ->
    @nearBack.tilePosition.x = @game.camera.x * -0.2

    @game.physics.arcade.collide @gnomes, @layer
    @game.physics.arcade.collide @gnomes, @gnomes
    @game.physics.arcade.collide @gnomes, @gates

    @game.physics.arcade.collide @gnomes, @switches, (gnome, _switch) =>
      _switch.setState 'down'
      @gates.forEach (gate) =>
        if _switch.target is gate.target and not gate.isOpen
          @switchSnd.play()
          gate.open()

    @game.physics.arcade.overlap @gnomes, @exit, (exit, gnomes) =>
      @loadMap exit.destination

    @game.physics.arcade.overlap @gnomes, @water, (gnome, water) =>
      if gnome.alive is true
        @drownSnd.play()
        gnome.drown()

    @signText.text = ''
    @game.physics.arcade.overlap @gnomes, @signs, (gnome, sign) =>
      @signText.text = sign.text

    if @cursors.right.isDown
      @gnomes.forEachAlive (gnome) =>
        gnome.body.velocity.x = 100
    else if @cursors.left.isDown
      @gnomes.forEachAlive (gnome) =>
        gnome.body.velocity.x = -100
    else
      @gnomes.forEachAlive (gnome) =>
        gnome.body.velocity.x = 0

    if @cursors.up.isDown or @jumpKey.isDown        
      @gnomes.forEachAlive (gnome) =>
        if gnome.body.onFloor() and not gnome.body.touching.up
          @jumpSnd.play('', 0, 0.5, false, false)
          gnome.body.velocity.y = -200
        else if not gnome.body.onFloor() and (gnome.body.touching.down or gnome.body.wasTouching.down)
          @jumpSnd.play('', 0, 0.5, false, false)
          gnome.body.velocity.y = -200

    if @cursors.down.isDown or @pullKey.isDown
      @game.physics.arcade.overlap @gnomes, @sprouts, (gnome, sprout) =>
        newGnome = @spawnGnome gnome.x, gnome.y
        @findEmptySpace newGnome
        sprout.kill()
        @growBurst.x = sprout.x
        @growBurst.y = sprout.y
        @growBurst.start true, 1000, null, 10
        @pullupSnd.play('', 0, 0.7, false, false)

    if not @resetKey.onUp.has @resetMap
      @resetKey.onUp.add @resetMap, @

  resetMap: ->
    @loadMap @currentMap

  render: ->
    # @switches.forEach (_switch) =>
    #   @game.debug.body _switch

    # @gnomes.forEachAlive (gnome) =>
    #   @game.debug.body gnome
    # @water.forEach (water) =>
    #   @game.debug.body water

class Gnome extends Phaser.Sprite
  constructor: (game, x, y) ->
    super(game, x, y, 'sprites', 'gnome_stand')

    # Add Animations
    @animations.add 'stand', ['gnome_stand']
    @animations.add 'jump', ['gnome_jump']
    @animations.add 'fall', ['gnome_fall']
    @animations.add 'walk', ['gnome_walk0', 'gnome_walk1', 'gnome_walk2', 'gnome_walk3'], 8, true
    @animations.add 'drown', ['gnome_dead0', 'gnome_dead1', 'gnome_dead2', 'gnome_dead3'], 2, true

    @game.physics.enable @
    @body.gravity.y = 350
    @anchor.setTo 0.5, 0.5
    @body.width = 20
    @body.height = 32


  update: ->
    if @body.y - @body.height > @game.world.bounds.height
      @kill()

    if @alive
      if @body.deltaY() > 0.1
        @animations.play 'fall'
      else if @body.deltaY() < -0.1
        @animations.play 'jump'
      else if Math.abs(@body.deltaX()) > 0.5
        @animations.play 'walk'
      else if @body.touching.down or @body.blocked.down
        @animations.play 'stand'
    else
      @animations.play 'drown'

    if @body.velocity.x < 0
      @scale.x = -1
    else if @body.velocity.x > 0
      @scale.x = 1

  drown: ->
    @alive = false
    @body.velocity.x = 0


class Sprout extends Phaser.Sprite
  constructor: (game, x, y) ->
    super(game, x, y, 'sprites', 'gnome_sprout0')

    @game.physics.enable @

    @animations.add 'wiggle', ['gnome_sprout0', 'gnome_sprout1', 'gnome_sprout2', 'gnome_sprout1'], 6, true
    @animations.play 'wiggle'

class Exit extends Phaser.Sprite
  constructor: (game, x, y, @destination) ->
    super(game, x, y)
    @game.physics.enable @
    @nearest = null
    @nearestDistance = 100000

  reportNearest: (gnome) ->
    distance = gnome.position.distance @

    if distance < @nearestDistance or (@nearest? and not @nearest.alive)
      @nearest = gnome
      @nearestDistance = distance
      @game.camera.follow gnome

class Water extends Phaser.TileSprite
  constructor: (game, x, y, width, height) ->
    super(game, x, y, width, height, 'water')
    @game.physics.enable @
    @body.height = @height - 20
    @body.setSize @width, @height - 20, 0, 20
    @autoScroll 10, 0


class Switch extends Phaser.Sprite
  constructor: (game, x, y, @target) ->
    super(game, x, y, 'sprites', 'switch_up')
    @game.physics.enable @
    @body.immovable = true
    @setState 'up'
    @state = @game.state.getCurrentState()

  setState: (state) ->
    if state is 'up'
      @frameName = 'switch_up'
      @state = 'up'
      @body.setSize 32, 20, 0, 12
    else if state is 'down'
      @frameName = 'switch_down'
      @state = 'down'
      @body.setSize 32, 12, 0, 24

  reset: (x, y) ->
    @setState 'up'
    super(x, y)

class Gate extends Phaser.TileSprite
  constructor: (game, x, y, width, height, @target) ->
    super(game, x, y, width, height, 'gate')
    @game.physics.enable @
    @body.immovable = true
    @isOpen = false

  open: ->
    @isOpen = true
    @body.checkCollision = {
      up: false
      down: false
      left: false
      right: false
    }
    @alpha = 0.2

  close: ->
    @body.checkCollision = {
      up: true
      down: true
      left: true
      right: true
    }

class Sign extends Phaser.Sprite
  constructor: (game, x, y, @text) ->
    super(game, x, y, 'sprites', 'sign')
    @game.physics.enable @ 

class TitleState extends Phaser.State
  constructor: ->
    # ...

  preload: ->
    # Levels
    levels = [
      'beginning',
      'stepping_stones',
      'stacks',
      'switches',
      'parallels',
      'unbridge',
      'finish',
      'treasure'
    ]

    for level in levels
      @game.load.tilemap level, "assets/lvls/#{level}.json", null, Phaser.Tilemap.TILED_JSON

    # Images
    @game.load.image 'title', 'assets/gfx/title.png'
    @game.load.image 'tileset', 'assets/gfx/tileset.png'
    @game.load.image 'water', 'assets/gfx/water.png'
    @game.load.image 'gate', 'assets/gfx/gate.png'
    @game.load.image 'near', 'assets/gfx/near_back.png'
    @game.load.image 'far', 'assets/gfx/far_back.png'
    
    @load.atlasXML 'sprites', 'assets/gfx/sprites.png', 'assets/gfx/sprites.xml'


    # Sounds
    @game.load.audio 'march', 'assets/snd/march.mp3'
    @game.load.audio 'jump', 'assets/snd/jump.mp3'
    @game.load.audio 'pullup', 'assets/snd/pullup.mp3'
    @game.load.audio 'drown', 'assets/snd/drown.mp3'
    @game.load.audio 'switch', 'assets/snd/switch.mp3'

  create: ->
    @add.sprite 0, 0, 'title'

  update: ->
    if @game.input.keyboard.isDown(Phaser.Keyboard.X) or @game.input.keyboard.isDown(Phaser.Keyboard.C)
      @game.state.start 'play', true



Gnone.game = new Phaser.Game 800, 600, Phaser.WEBGL, "game", new TitleState(), false, false
Gnone.game.state.add 'play', new PlayState(), false