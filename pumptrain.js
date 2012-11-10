window.onload = function() {
  WIDTH = 800;
  HEIGHT = 576;

  SPRITE_WIDTH = SPRITE_HEIGHT = 32;

  INITIAL_WATER_LEVEL = 9;

  Crafty.init(WIDTH, HEIGHT);
  Crafty.canvas.init();

  Crafty.sprite(SPRITE_WIDTH, "sprites.png", {
    train: [0, 0],
    station0: [1, 0],
    station1: [2, 0],
    station2: [3, 0],
    station3: [4, 0],
    station4: [5, 0],
    station5: [6, 0],
    station6: [7, 0],
    station7: [8, 0],
    station8: [9, 0],
    station9: [10, 0]
  });

  Crafty.scene("main", function() {
    Crafty.c("Station", {
      init: function() {
        this.waterLevel = INITIAL_WATER_LEVEL;
      },
      pump: function() {
        if (this.waterLevel > 0) {
          this.waterLevel--;
          this.sprite(1 + this.waterLevel, 0, 1, 1);
        }
      }
    });

    for (var i=0; i<3; i++) {
      Crafty.e("2D, Canvas, Station, station" + INITIAL_WATER_LEVEL)
        .attr({x: Crafty.math.randomInt(0, WIDTH - SPRITE_WIDTH),
               y: Crafty.math.randomInt(0, HEIGHT - SPRITE_HEIGHT)});
    }

    var pumpTimer = null;

    Crafty.e("2D, Canvas, train, Multiway, Collision")
      .attr({x: Crafty.math.randomInt(0, WIDTH - SPRITE_WIDTH),
             y: Crafty.math.randomInt(0, HEIGHT - SPRITE_HEIGHT)})
      .multiway(4, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
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
      .onHit("Station", function(entities) {
        var station = entities[0].obj;
        if (pumpTimer == null) {
          pumpTimer = setInterval(function() {
            station.pump();
          }, 1000);
        }
      }, function() {
        clearInterval(pumpTimer);
        pumpTimer = null;
      });
  });

  Crafty.scene("main");
}
