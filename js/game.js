(function() {
  var Exit, Gate, Gnome, Gnone, PlayState, Sign, Sprout, Switch, TitleState, Water,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Gnone = {};

  PlayState = (function(_super) {
    __extends(PlayState, _super);

    function PlayState() {
      this.currentMap = 'beginning';
    }

    PlayState.prototype.create = function() {
      var gnome, i, sprout, style, _i, _j, _k, _switch;
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.physics.OVERLAP_BIAS = 16;
      this.farBack = this.add.tileSprite(0, 0, 800, 600, 'far');
      this.farBack.fixedToCamera = true;
      this.nearBack = this.add.tileSprite(0, 0, 800, 600, 'near');
      this.nearBack.fixedToCamera = true;
      this.water = new Phaser.Group(this.game, this.game.world, 'water');
      this.switches = new Phaser.Group(this.game, this.game.world, 'switches');
      this.gates = new Phaser.Group(this.game, this.game.world, 'gates');
      this.sprouts = new Phaser.Group(this.game, this.game.world, 'sprouts');
      this.signs = new Phaser.Group(this.game, this.game.world, 'signs');
      this.gnomes = new Phaser.Group(this.game, this.game.world, 'gnomes');
      style = {
        font: "24px mini-serif",
        fill: "#ffffff",
        align: "center"
      };
      this.signText = this.add.text(400, 200, "", style);
      this.signText.fixedToCamera = true;
      this.signText.anchor.setTo(0.5);
      this.signText.stroke = '#000000';
      this.signText.strokeThickness = 2;
      for (i = _i = 0; _i <= 20; i = ++_i) {
        gnome = new Gnome(this.game, -100, -100);
        gnome.kill();
        this.gnomes.add(gnome);
      }
      for (i = _j = 0; _j <= 20; i = ++_j) {
        sprout = new Sprout(this.game, -100, -100);
        sprout.kill();
        this.sprouts.add(sprout);
      }
      for (i = _k = 0; _k <= 5; i = ++_k) {
        _switch = new Switch(this.game, -100, -100);
        _switch.kill();
        this.switches.add(_switch);
      }
      this.loadMap(this.currentMap);
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.pullKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
      this.jumpKey = this.game.input.keyboard.addKey(Phaser.Keyboard.C);
      this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
      this.game.time.events.loop(500, (function(_this) {
        return function() {
          return _this.gnomes.forEachAlive(function(gnome) {
            return _this.exit.reportNearest(gnome);
          });
        };
      })(this));
      this.growBurst = this.add.emitter(0, 0, 100);
      this.growBurst.makeParticles('sprites', ['dirt0', 'dirt1', 'dirt2']);
      this.growBurst.setYSpeed(-100, -120);
      this.growBurst.setXSpeed(-100, 100);
      this.growBurst.gravity = 300;
      this.music = this.add.audio('march', 1, true);
      this.music.play('', 0, 1, true);
      this.jumpSnd = this.add.audio('jump', 1, false);
      this.pullupSnd = this.add.audio('pullup', 1, false);
      this.drownSnd = this.add.audio('drown', 1, false);
      return this.switchSnd = this.add.audio('switch', 1, false);
    };

    PlayState.prototype.loadMap = function(name) {
      var gate, gnome, obj, objects, sign, sprout, water, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _switch;
      this.currentMap = name;
      if (this.map != null) {
        this.map.destroy();
      }
      this.map = this.add.tilemap(name);
      this.map.addTilesetImage('tileset');
      if (this.layer != null) {
        this.layer.destroy();
      }
      this.layer = this.map.createLayer('Tile Layer 1');
      this.layer.resizeWorld();
      this.map.setCollisionBetween(1, 96);
      objects = this.game.cache._tilemaps[name].data.layers[1].objects;
      this.gnomes.callAll('kill');
      this.sprouts.callAll('kill');
      this.switches.callAll('kill');
      this.water.removeAll();
      this.gates.removeAll();
      this.signs.removeAll();
      this.game.world.bringToTop(this.signText);
      if (this.exit != null) {
        this.exit.destroy();
      }
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        obj = objects[_i];
        if (!(obj.name === 'start')) {
          continue;
        }
        gnome = this.spawnGnome(obj.x, obj.y);
        this.game.camera.follow(gnome);
      }
      for (_j = 0, _len1 = objects.length; _j < _len1; _j++) {
        obj = objects[_j];
        if (!(obj.name === 'sprout')) {
          continue;
        }
        sprout = this.sprouts.getFirstDead();
        sprout.reset(obj.x, obj.y);
      }
      for (_k = 0, _len2 = objects.length; _k < _len2; _k++) {
        obj = objects[_k];
        if (!(obj.name === 'exit')) {
          continue;
        }
        this.exit = new Exit(this.game, obj.x, obj.y, obj.type);
        this.exit.body.height = obj.height;
        this.exit.body.width = obj.width;
      }
      for (_l = 0, _len3 = objects.length; _l < _len3; _l++) {
        obj = objects[_l];
        if (!(obj.name === 'water')) {
          continue;
        }
        water = new Water(this.game, obj.x, obj.y, obj.width, obj.height);
        this.water.add(water);
      }
      for (_m = 0, _len4 = objects.length; _m < _len4; _m++) {
        obj = objects[_m];
        if (!(obj.name === 'switch')) {
          continue;
        }
        _switch = this.switches.getFirstDead();
        _switch.target = obj.type;
        _switch.reset(obj.x, obj.y);
      }
      for (_n = 0, _len5 = objects.length; _n < _len5; _n++) {
        obj = objects[_n];
        if (!(obj.name === 'gate')) {
          continue;
        }
        gate = new Gate(this.game, obj.x, obj.y, obj.width, obj.height, obj.type);
        this.gates.add(gate);
      }
      for (_o = 0, _len6 = objects.length; _o < _len6; _o++) {
        obj = objects[_o];
        if (!(obj.name === 'sign')) {
          continue;
        }
        sign = new Sign(this.game, obj.x, obj.y, obj.type);
        this.signs.add(sign);
      }
      return this.game.time.events.start();
    };

    PlayState.prototype.spawnGnome = function(x, y) {
      var gnome;
      gnome = this.gnomes.getFirstExists(false);
      if (gnome != null) {
        gnome.reset(x, y);
        gnome.body.velocity.setTo(0, 0);
        gnome.scale.x = 1;
      }
      return gnome;
    };

    PlayState.prototype.findEmptySpace = function(gnome) {
      var isOverlappingGnome;
      isOverlappingGnome = (function(_this) {
        return function() {
          var overlaps;
          overlaps = false;
          _this.gnomes.forEachAlive(function(gnome2) {
            if (gnome !== gnome2 && _this.game.physics.arcade.intersects(gnome.body, gnome2.body)) {
              return overlaps = true;
            }
          });
          return overlaps;
        };
      })(this);
      while (isOverlappingGnome()) {
        gnome.body.y -= 2;
      }
    };

    PlayState.prototype.update = function() {
      this.nearBack.tilePosition.x = this.game.camera.x * -0.2;
      this.game.physics.arcade.collide(this.gnomes, this.layer);
      this.game.physics.arcade.collide(this.gnomes, this.gnomes);
      this.game.physics.arcade.collide(this.gnomes, this.gates);
      this.game.physics.arcade.collide(this.gnomes, this.switches, (function(_this) {
        return function(gnome, _switch) {
          _switch.setState('down');
          return _this.gates.forEach(function(gate) {
            if (_switch.target === gate.target && !gate.isOpen) {
              _this.switchSnd.play();
              return gate.open();
            }
          });
        };
      })(this));
      this.game.physics.arcade.overlap(this.gnomes, this.exit, (function(_this) {
        return function(exit, gnomes) {
          return _this.loadMap(exit.destination);
        };
      })(this));
      this.game.physics.arcade.overlap(this.gnomes, this.water, (function(_this) {
        return function(gnome, water) {
          if (gnome.alive === true) {
            _this.drownSnd.play();
            return gnome.drown();
          }
        };
      })(this));
      this.signText.text = '';
      this.game.physics.arcade.overlap(this.gnomes, this.signs, (function(_this) {
        return function(gnome, sign) {
          return _this.signText.text = sign.text;
        };
      })(this));
      if (this.cursors.right.isDown) {
        this.gnomes.forEachAlive((function(_this) {
          return function(gnome) {
            return gnome.body.velocity.x = 100;
          };
        })(this));
      } else if (this.cursors.left.isDown) {
        this.gnomes.forEachAlive((function(_this) {
          return function(gnome) {
            return gnome.body.velocity.x = -100;
          };
        })(this));
      } else {
        this.gnomes.forEachAlive((function(_this) {
          return function(gnome) {
            return gnome.body.velocity.x = 0;
          };
        })(this));
      }
      if (this.cursors.up.isDown || this.jumpKey.isDown) {
        this.gnomes.forEachAlive((function(_this) {
          return function(gnome) {
            if (gnome.body.onFloor() && !gnome.body.touching.up) {
              _this.jumpSnd.play('', 0, 0.5, false, false);
              return gnome.body.velocity.y = -200;
            } else if (!gnome.body.onFloor() && (gnome.body.touching.down || gnome.body.wasTouching.down)) {
              _this.jumpSnd.play('', 0, 0.5, false, false);
              return gnome.body.velocity.y = -200;
            }
          };
        })(this));
      }
      if (this.cursors.down.isDown || this.pullKey.isDown) {
        this.game.physics.arcade.overlap(this.gnomes, this.sprouts, (function(_this) {
          return function(gnome, sprout) {
            var newGnome;
            newGnome = _this.spawnGnome(gnome.x, gnome.y);
            _this.findEmptySpace(newGnome);
            sprout.kill();
            _this.growBurst.x = sprout.x;
            _this.growBurst.y = sprout.y;
            _this.growBurst.start(true, 1000, null, 10);
            return _this.pullupSnd.play('', 0, 0.7, false, false);
          };
        })(this));
      }
      if (!this.resetKey.onUp.has(this.resetMap)) {
        return this.resetKey.onUp.add(this.resetMap, this);
      }
    };

    PlayState.prototype.resetMap = function() {
      return this.loadMap(this.currentMap);
    };

    PlayState.prototype.render = function() {};

    return PlayState;

  })(Phaser.State);

  Gnome = (function(_super) {
    __extends(Gnome, _super);

    function Gnome(game, x, y) {
      Gnome.__super__.constructor.call(this, game, x, y, 'sprites', 'gnome_stand');
      this.animations.add('stand', ['gnome_stand']);
      this.animations.add('jump', ['gnome_jump']);
      this.animations.add('fall', ['gnome_fall']);
      this.animations.add('walk', ['gnome_walk0', 'gnome_walk1', 'gnome_walk2', 'gnome_walk3'], 8, true);
      this.animations.add('drown', ['gnome_dead0', 'gnome_dead1', 'gnome_dead2', 'gnome_dead3'], 2, true);
      this.game.physics.enable(this);
      this.body.gravity.y = 350;
      this.anchor.setTo(0.5, 0.5);
      this.body.width = 20;
      this.body.height = 32;
    }

    Gnome.prototype.update = function() {
      if (this.body.y - this.body.height > this.game.world.bounds.height) {
        this.kill();
      }
      if (this.alive) {
        if (this.body.deltaY() > 0.1) {
          this.animations.play('fall');
        } else if (this.body.deltaY() < -0.1) {
          this.animations.play('jump');
        } else if (Math.abs(this.body.deltaX()) > 0.5) {
          this.animations.play('walk');
        } else if (this.body.touching.down || this.body.blocked.down) {
          this.animations.play('stand');
        }
      } else {
        this.animations.play('drown');
      }
      if (this.body.velocity.x < 0) {
        return this.scale.x = -1;
      } else if (this.body.velocity.x > 0) {
        return this.scale.x = 1;
      }
    };

    Gnome.prototype.drown = function() {
      this.alive = false;
      return this.body.velocity.x = 0;
    };

    return Gnome;

  })(Phaser.Sprite);

  Sprout = (function(_super) {
    __extends(Sprout, _super);

    function Sprout(game, x, y) {
      Sprout.__super__.constructor.call(this, game, x, y, 'sprites', 'gnome_sprout0');
      this.game.physics.enable(this);
      this.animations.add('wiggle', ['gnome_sprout0', 'gnome_sprout1', 'gnome_sprout2', 'gnome_sprout1'], 6, true);
      this.animations.play('wiggle');
    }

    return Sprout;

  })(Phaser.Sprite);

  Exit = (function(_super) {
    __extends(Exit, _super);

    function Exit(game, x, y, destination) {
      this.destination = destination;
      Exit.__super__.constructor.call(this, game, x, y);
      this.game.physics.enable(this);
      this.nearest = null;
      this.nearestDistance = 100000;
    }

    Exit.prototype.reportNearest = function(gnome) {
      var distance;
      distance = gnome.position.distance(this);
      if (distance < this.nearestDistance || ((this.nearest != null) && !this.nearest.alive)) {
        this.nearest = gnome;
        this.nearestDistance = distance;
        return this.game.camera.follow(gnome);
      }
    };

    return Exit;

  })(Phaser.Sprite);

  Water = (function(_super) {
    __extends(Water, _super);

    function Water(game, x, y, width, height) {
      Water.__super__.constructor.call(this, game, x, y, width, height, 'water');
      this.game.physics.enable(this);
      this.body.height = this.height - 20;
      this.body.setSize(this.width, this.height - 20, 0, 20);
      this.autoScroll(10, 0);
    }

    return Water;

  })(Phaser.TileSprite);

  Switch = (function(_super) {
    __extends(Switch, _super);

    function Switch(game, x, y, target) {
      this.target = target;
      Switch.__super__.constructor.call(this, game, x, y, 'sprites', 'switch_up');
      this.game.physics.enable(this);
      this.body.immovable = true;
      this.setState('up');
      this.state = this.game.state.getCurrentState();
    }

    Switch.prototype.setState = function(state) {
      if (state === 'up') {
        this.frameName = 'switch_up';
        this.state = 'up';
        return this.body.setSize(32, 20, 0, 12);
      } else if (state === 'down') {
        this.frameName = 'switch_down';
        this.state = 'down';
        return this.body.setSize(32, 12, 0, 24);
      }
    };

    Switch.prototype.reset = function(x, y) {
      this.setState('up');
      return Switch.__super__.reset.call(this, x, y);
    };

    return Switch;

  })(Phaser.Sprite);

  Gate = (function(_super) {
    __extends(Gate, _super);

    function Gate(game, x, y, width, height, target) {
      this.target = target;
      Gate.__super__.constructor.call(this, game, x, y, width, height, 'gate');
      this.game.physics.enable(this);
      this.body.immovable = true;
      this.isOpen = false;
    }

    Gate.prototype.open = function() {
      this.isOpen = true;
      this.body.checkCollision = {
        up: false,
        down: false,
        left: false,
        right: false
      };
      return this.alpha = 0.2;
    };

    Gate.prototype.close = function() {
      return this.body.checkCollision = {
        up: true,
        down: true,
        left: true,
        right: true
      };
    };

    return Gate;

  })(Phaser.TileSprite);

  Sign = (function(_super) {
    __extends(Sign, _super);

    function Sign(game, x, y, text) {
      this.text = text;
      Sign.__super__.constructor.call(this, game, x, y, 'sprites', 'sign');
      this.game.physics.enable(this);
    }

    return Sign;

  })(Phaser.Sprite);

  TitleState = (function(_super) {
    __extends(TitleState, _super);

    function TitleState() {}

    TitleState.prototype.preload = function() {
      var level, levels, _i, _len;
      levels = ['beginning', 'stepping_stones', 'stacks', 'switches', 'parallels', 'unbridge', 'finish', 'treasure'];
      for (_i = 0, _len = levels.length; _i < _len; _i++) {
        level = levels[_i];
        this.game.load.tilemap(level, "assets/lvls/" + level + ".json", null, Phaser.Tilemap.TILED_JSON);
      }
      this.game.load.image('title', 'assets/gfx/title.png');
      this.game.load.image('tileset', 'assets/gfx/tileset.png');
      this.game.load.image('water', 'assets/gfx/water.png');
      this.game.load.image('gate', 'assets/gfx/gate.png');
      this.game.load.image('near', 'assets/gfx/near_back.png');
      this.game.load.image('far', 'assets/gfx/far_back.png');
      this.load.atlasXML('sprites', 'assets/gfx/sprites.png', 'assets/gfx/sprites.xml');
      this.game.load.audio('march', 'assets/snd/march.mp3');
      this.game.load.audio('jump', 'assets/snd/jump.mp3');
      this.game.load.audio('pullup', 'assets/snd/pullup.mp3');
      this.game.load.audio('drown', 'assets/snd/drown.mp3');
      return this.game.load.audio('switch', 'assets/snd/switch.mp3');
    };

    TitleState.prototype.create = function() {
      return this.add.sprite(0, 0, 'title');
    };

    TitleState.prototype.update = function() {
      if (this.game.input.keyboard.isDown(Phaser.Keyboard.X) || this.game.input.keyboard.isDown(Phaser.Keyboard.C)) {
        return this.game.state.start('play', true);
      }
    };

    return TitleState;

  })(Phaser.State);

  Gnone.game = new Phaser.Game(800, 600, Phaser.WEBGL, "game", new TitleState(), false, false);

  Gnone.game.state.add('play', new PlayState(), false);

}).call(this);

//# sourceMappingURL=game.js.map
