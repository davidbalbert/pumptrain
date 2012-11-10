window.onload = function() {
  WIDTH = 800;
  HEIGHT = 576;

  Crafty.init(WIDTH, HEIGHT);
  Crafty.canvas.init();

  Crafty.sprite(32, "sprites.png", {
    train: [0, 0]
  });

  Crafty.scene("main", function() {
    Crafty.e("2D, Canvas, train, Multiway")
      .attr({x: Crafty.math.randomInt(0, WIDTH - 32),
             y: Crafty.math.randomInt(0, HEIGHT - 32)})
      .multiway(4, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180});
  });

  Crafty.scene("main");
}
