window.onload = function() {
  WIDTH = 800;
  HEIGHT = 576;

  SPRITE_WIDTH = SPRITE_HEIGHT = 32

  Crafty.init(WIDTH, HEIGHT);
  Crafty.canvas.init();

  Crafty.sprite(SPRITE_WIDTH, "sprites.png", {
    train: [0, 0]
  });

  Crafty.scene("main", function() {
    Crafty.e("2D, Canvas, train, Multiway")
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
      });
  });

  Crafty.scene("main");
}
