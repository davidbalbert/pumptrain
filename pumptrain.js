window.onload = function() {
  WIDTH = 800;
  HEIGHT = 576;

  SPRITE_WIDTH = SPRITE_HEIGHT = 53;

  INITIAL_WATER_LEVEL = 2;

  Crafty.init(WIDTH, HEIGHT);
  Crafty.canvas.init();

  Crafty.sprite(SPRITE_WIDTH, "images/sprite.png", {
    trainUp:        [0, 0],
    trainUpRight:   [1, 0],
    trainRight:     [2, 0],
    trainDownRight: [3, 0],
    trainDown:      [4, 0],
    trainDownLeft:  [5, 0],
    trainLeft:      [6, 0],
    trainUpLeft:    [7, 0],
    station0:       [0, 1],
    station1:       [1, 1],
    station2:       [2, 1],
    station3:       [3, 1],
    station4:       [4, 1],
    station5:       [5, 1],
    station6:       [6, 1],
    station7:       [7, 1],
    station8:       [8, 1],
    station9:       [9, 1]
  });

  Crafty.scene("main", function() {
    Crafty.c("Station", {
      init: function() {
        this.waterLevel = INITIAL_WATER_LEVEL;
      },
      _changeWaterLevel: function(delta) {
        if (this.waterLevel > 0 && delta === -1 || this.waterLevel < 9 && delta === 1) {
          this.waterLevel += delta;
          this.sprite(this.waterLevel, 1, 1, 1);
        }
      },
      pump: function() {
        this._changeWaterLevel(-1);
      },
      flood: function() {
        this._changeWaterLevel(1);
      }
    });

    for (var i=0; i<3; i++) {
      Crafty.e("2D, Canvas, Station, station" + INITIAL_WATER_LEVEL)
        .attr({x: Crafty.math.randomInt(0, WIDTH - SPRITE_WIDTH),
               y: Crafty.math.randomInt(0, HEIGHT - SPRITE_HEIGHT)});
    }

    Crafty.e("2D, Canvas, trainDownRight, Multiway, Collision")
      .attr({x: Crafty.math.randomInt(0, WIDTH - SPRITE_WIDTH),
             y: Crafty.math.randomInt(0, HEIGHT - SPRITE_HEIGHT)})
      .multiway(4, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
      .bind("NewDirection", function(direction) {
        if (direction.x < 0) { // left
          this.sprite(6, 0, 1, 1);
        } else if (direction.x > 0) { // right
          this.sprite(2, 0, 1, 1);
        } else if (direction.y < 0) { //up
          this.sprite(0, 0, 1, 1);
        } else if (direction.y > 0) { // down
          this.sprite(4, 0, 1, 1);
        }

      })
      .bind("Moved", function(oldPosition) {
        if (this.x < 0) {
          this.x = 0;
        } else if (this.x > WIDTH - SPRITE_WIDTH) {
          this.x = WIDTH - SPRITE_WIDTH;
        }

        if (this.y < 0) {
          this.y = 0;
        } else if (this.y > HEIGHT - SPRITE_HEIGHT) {
          this.y = HEIGHT - SPRITE_HEIGHT;
        }
      })
      .bind("KeyDown", function(e) {
        if (e.key == Crafty.keys['SPACE'] && this.currentStation != null) {
          this.currentStation.pump();
        }
      })
      .onHit("Station", function(entities) {
        this.currentStation = entities[0].obj;
      }, function() {
        this.currentStation = null;
      });


    var waterTimer = null;
    var stationsSelectTimer = setInterval(function() {
      if (waterTimer != null) {
        clearInterval(waterTimer);
      }
      Crafty("Station").each(function() {
        if (Crafty.math.randomInt(0,1) == 1) {
          this.addComponent("Flooding");
        } else {
          this.removeComponent("Flooding");
        }
      });

      waterTimer = setInterval(function() {
        Crafty("Flooding Station").each(function() {
          this.flood();
        });
      }, 1000);
    }, 5000);

  });

  Crafty.scene("main");
}
