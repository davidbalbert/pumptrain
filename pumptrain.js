window.onkeydown = function(e) {
  // Ignore space bar and arrow keys
  if (e.keyCode == 32 || e.keyCode == 37 || e.keyCode == 38 ||
      e.keyCode == 39 || e.keyCode == 40) {
    e.preventDefault();
  }
};

window.onload = function() {
  var WIDTH = 800;
  var HEIGHT = 576;
  var SPRITE_WIDTH = SPRITE_HEIGHT = 53;
  var INITIAL_WATER_LEVEL = 2;
  var spriteCoords = {
    trainUp:        [0, 0, 1, 1],
    trainUpRight:   [1, 0, 1, 1],
    trainRight:     [2, 0, 1, 1],
    trainDownRight: [3, 0, 1, 1],
    trainDown:      [4, 0, 1, 1],
    trainDownLeft:  [5, 0, 1, 1],
    trainLeft:      [6, 0, 1, 1],
    trainUpLeft:    [7, 0, 1, 1],
    station0:       [0, 1, 1, 1],
    station1:       [1, 1, 1, 1],
    station2:       [2, 1, 1, 1],
    station3:       [3, 1, 1, 1],
    station4:       [4, 1, 1, 1],
    station5:       [5, 1, 1, 1],
    station6:       [6, 1, 1, 1],
    station7:       [7, 1, 1, 1],
    station8:       [8, 1, 1, 1],
    station9:       [9, 1, 1, 1]
  };

  Crafty.init(WIDTH, HEIGHT);
  Crafty.canvas.init();

  sound();

  Crafty.sprite(SPRITE_WIDTH, "images/sprite.png", spriteCoords);

  Crafty.scene("title", function() {
    var title1 = Crafty.e("2D, DOM, Image").attr({x: 0, y: 0}).image("images/tmptitle1.png");
    var title2 = Crafty.e("2D, DOM, Image").attr({x: 0, y: 0}).image("images/tmptitle2.png");
    title1.visible = true;
    title2.visible = false;

    var blinkTimer = setInterval(function() {
      if (title1.visible) {
        title1.visible = false;
        title2.visible = true;
      } else {
        title1.visible = true;
        title2.visible = false;
      }
    }, 1000);

    Crafty.bind("KeyDown", function(e) {
      // spacebar
      if (e.keyCode == 32) {
        clearInterval(blinkTimer);
        blinkTimer = null;

        Crafty.scene("main")
      }
    });
  });

  Crafty.scene("main", function() {
    Crafty.background("url('images/map.png')");

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

        // Game over
        if (this.waterLevel == 9) {
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

    _this = this;
    Crafty.e("2D, Canvas, trainDownRight, Multiway, Collision")
      .attr({x: Crafty.math.randomInt(0, WIDTH - SPRITE_WIDTH),
             y: Crafty.math.randomInt(0, HEIGHT - SPRITE_HEIGHT)})
      .multiway(4, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
      .bind("NewDirection", function(direction) {
        if (direction.x < 0 && direction.y < 0) {
          this.sprite.apply(this, spriteCoords['trainUpLeft'])
        } else if (direction.x < 0 && direction.y > 0) {
          this.sprite.apply(this, spriteCoords['trainDownLeft'])
        } else if (direction.x < 0) {
          this.sprite.apply(this, spriteCoords['trainLeft'])
        } else if (direction.x > 0 && direction.y < 0) {
          this.sprite.apply(this, spriteCoords['trainUpRight'])
        } else if (direction.x > 0 && direction.y > 0) {
          this.sprite.apply(this, spriteCoords['trainDownRight'])
        } else if (direction.x > 0) {
          this.sprite.apply(this, spriteCoords['trainRight'])
        } else if (direction.y < 0) {
          this.sprite.apply(this, spriteCoords['trainUp'])
        } else if (direction.y > 0) {
          this.sprite.apply(this, spriteCoords['trainDown'])
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
          createSource(_this.glug).source.noteOn(0);
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
      // TODO: We probably want to wait a second or two before binding the
      // keydown. Otherwise people are going to miss the game over screen
      .bind("KeyDown", function() {
        Crafty.scene("main");
      });
  });

  Crafty.scene("title");
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
    loadGlug();
    loadRain();
    loadThunder();
    randomizeThunder();
  }
}

// start an infinite loop of two instances of the same rain sample
// which crossfade between each other at the end
loadRain = function(){
  var request = new XMLHttpRequest();
  var rainBuffer = null;

  request.open('GET', 'sound/rain.mp3', true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      rainBuffer = buffer;

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

      // create a two buffers to switch between
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

// initialize coffeescript style this
// and thunder samples in this scope
var _this = this;
this.thunder1 = null;
this.thunder2 = null;
this.thunder3 = null;
this.thunder4 = null;
this.glug = null;

loadGlug = function(){
  var request1 = new XMLHttpRequest();
  request1.open('GET', 'sound/glug.mp3', true);
  request1.responseType = 'arraybuffer';
  request1.onload = function() {
    context.decodeAudioData(request1.response, function(buffer) {
      _this.glug = buffer;
    })
  }
  request1.send();
}

// load in 4 thunder samples as buffers
// don't hate me, but I can't figure out how not to repeat
// the below loader code :(
loadThunder = function(){
  var request1 = new XMLHttpRequest();
  request1.open('GET', 'sound/thunder1.mp3', true);
  request1.responseType = 'arraybuffer';
  request1.onload = function() {
    context.decodeAudioData(request1.response, function(buffer) {
      _this.thunder1 = buffer;
    })
  }
  request1.send();

  var request2 = new XMLHttpRequest();
  request2.open('GET', 'sound/thunder2.mp3', true);
  request2.responseType = 'arraybuffer';
  request2.onload = function() {
    context.decodeAudioData(request2.response, function(buffer) {
      _this.thunder2 = buffer;
    })
  }
  request2.send();

  var request3 = new XMLHttpRequest();
  request3.open('GET', 'sound/thunder3.mp3', true);
  request3.responseType = 'arraybuffer';
  request3.onload = function() {
    context.decodeAudioData(request3.response, function(buffer) {
      _this.thunder3 = buffer;
    })
  }
  request3.send();

  var request4 = new XMLHttpRequest();
  request4.open('GET', 'sound/thunder4.mp3', true);
  request4.responseType = 'arraybuffer';
  request4.onload = function() {
    context.decodeAudioData(request4.response, function(buffer) {
      _this.thunder4 = buffer;
    })
  }
  request4.send();
}

// a recursive call to trigger a random thunder sample
// every once in a while
randomizeThunder = function(){
  // pick a random number between 10000 and 30000 (10-30 seconds)
  wait = Math.ceil(Math.random() * 20000) + 10000;

  setTimeout(function(){
    playRandomThunder();
    randomizeThunder();
  }, wait);
}

// trigger a note on for one of the samples
// add and remove the class "lightening" to the body
// a random number of times
playRandomThunder = function(){
  // stick all of the currently loaded thunders into an array
  thunderArray = [];
  if (this.thunder1) {
    thunderArray.push(this.thunder1);
  }
  if (this.thunder2) {
    thunderArray.push(this.thunder2);
  }
  if (this.thunder3) {
    thunderArray.push(this.thunder3);
  }
  if (this.thunder4) {
    thunderArray.push(this.thunder4);
  }

  // proceed if any are loaded
  if (thunderArray.length > 0){
    // trigger a random sound using the length of the
    // array of loaded sounds
    rand = Math.floor(Math.random() * thunderArray.length);

    // play the random one, creating a new sourcenode
    createSource(thunderArray[rand]).source.noteOn(0);

    // trigger randomized flashes
    lightening();
  }
}

// add and remove the class lightening to the body
// a random number of times with a random interval
lightening = function(){
  var numberOfFlashes = Math.ceil(Math.random() * 3);
  var delays = [Math.ceil(Math.random() * 400), Math.ceil(Math.random() * 400)];

  // initial flash
  flash();

  // add the delays together if necessary for the second and third flashes
  for (i = 0; i < numberOfFlashes; i++) {
    switch (i) {
      case 1:
        delay = delays[0];
        break;
      case 2:
        delay = delays[0] + delays[1];
        break;
      default:
        delay = 0;
    }

    setTimeout(function(){
      flash();
    }, delay);
  }
}

flash = function(){
  var body = document.getElementById('body');

  body.className = 'lightening';
  setTimeout(function(){
    body.className = '';
  }, 100);
}

// create a sound source and gain node
function createSource(buffer) {
  var source = context.createBufferSource();
  var gainNode = context.createGainNode();
  source.buffer = buffer;
  source.connect(gainNode);
  gainNode.connect(context.destination);
  return {
    source: source,
    gainNode: gainNode
  };
}
