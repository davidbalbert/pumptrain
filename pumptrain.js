window.onload = function() {
  sound();

  WIDTH = 800;
  HEIGHT = 576;

  SPRITE_WIDTH = SPRITE_HEIGHT = 32;

  INITIAL_WATER_LEVEL = 2;

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
      _changeWaterLevel: function(delta) {
        if (this.waterLevel > 0 && delta === -1 || this.waterLevel < 9 && delta === 1) {
          this.waterLevel += delta;
          this.sprite(1 + this.waterLevel, 0, 1, 1);
        }
      },
      pump: function() {
        this._changeWaterLevel(-1);
      },
      flood: function() {
        this._changeWaterLevel(1);

        // Game over
        if (this.waterLevel == 9) {
          clearInterval(pumpTimer);
          pumpTimer = null;

          clearInterval(waterTimer);
          waterTimer = null;

          clearInterval(stationsSelectTimer);
          stationsSelectTimer = null;

          Crafty.scene("gameover");
        }
      }
    });

    for (var i=0; i<3; i++) {
      Crafty.e("2D, Canvas, Station, station" + INITIAL_WATER_LEVEL)
        .attr({x: Crafty.math.randomInt(0, WIDTH - SPRITE_WIDTH),
               y: Crafty.math.randomInt(0, HEIGHT - SPRITE_HEIGHT)});
    }

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

  Crafty.scene("gameover", function() {
    Crafty.e("2D, DOM, Text")
      .attr({x: 150, y: 200, w: 500, h: 100})
      .text("Game Over :(")
      .textFont({family: "Arial", size: '100px', weight: 'bold'})
      .textColor("#FF0000");

    Crafty.e("2D, DOM, Text")
      .attr({x: 150, y: 250, w: 500, h: 100})
      .text("Tap the spacebar to play again")
      .textFont({family: "Arial", size: '30px', weight: 'bold'})
      .textColor("#FF0000")
      .bind("KeyDown", function() {
        Crafty.scene("main");
      });
  });

  Crafty.scene("main");
}


//
// sound effects from here on down
//

var context;
sound = function(){
  try {
    context = new webkitAudioContext();
  }
  catch(e) {
    console.log('Web Audio API is not supported in this browser');
  }

  // if web audio is supported, continue
  if (context) {
    loadRain();
  }
}

loadRain = function(){
  var request = new XMLHttpRequest();
  var rainBuffer = null;

  request.open('GET', 'sound/rain.mp3', true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      rainBuffer = buffer;

      // make two rain buffers to play and crossfade
      //this.rain1 = createSource(rainBuffer);
      //this.rain2 = createSource(rainBuffer);

      // play them
      //rain1.source.noteOn(0);
      //rain2.source.noteOn(0);



      playHelper(rainBuffer, rainBuffer);

      function createSource(buffer) {
        var source = context.createBufferSource();
        var gainNode = context.createGainNode();
        source.buffer = buffer;
        // Connect source to gain.
        source.connect(gainNode);
        // Connect gain to destination.
        gainNode.connect(context.destination);

        return {
          source: source,
          gainNode: gainNode
        };
      }

      function playHelper(bufferNow, bufferLater) {
        var fadeTime = 10;
        var playNow = createSource(bufferNow);
        var source = playNow.source;
        this.source = source;
        var gainNode = playNow.gainNode;
        var duration = bufferNow.duration;
        var currTime = context.currentTime;
        // Fade the playNow track in.
        gainNode.gain.linearRampToValueAtTime(0, currTime);
        gainNode.gain.linearRampToValueAtTime(1, currTime + fadeTime);
        // Play the playNow track.
        source.noteOn(0);
        // At the end of the track, fade it out.
        gainNode.gain.linearRampToValueAtTime(1, currTime + duration - fadeTime);
        gainNode.gain.linearRampToValueAtTime(0, currTime + duration);
        // Schedule a recursive track change with the tracks swapped.
        var recurse = arguments.callee;
        this.timer = setTimeout(function() {
          recurse(bufferLater, bufferNow);
        }, (duration - fadeTime) * 1000);
      }




    });
  }

  request.send();
}

// create a sound source and gain node
//function createSource(buffer) {
  //var source = context.createBufferSource();
  //var gainNode = context.createGainNode();
  //source.buffer = buffer;
  //source.connect(gainNode);
  //gainNode.connect(context.destination);
  //return {
    //source: source,
    //gainNode: gainNode
  //};
//}

// take a value from 0-1
//crossfadeRain = function(amount){
  //var gain1 = Math.cos(amount * 0.5 * Math.PI);
  //var gain2 = Math.cos((1.0 - amount) * 0.5 * Math.PI);
  //this.rain1.gainNode.gain.value = gain1;
  //this.rain2.gainNode.gain.value = gain2;
//};
