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
  var MAX_WATER_LEVEL = 9;
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
  var gallonsPumped;

  Crafty.init(WIDTH, HEIGHT);
  Crafty.canvas.init();

  flashScreen = document.createElement('div');
  flashScreen.className = 'flash-screen'
  document.getElementById('cr-stage').appendChild(flashScreen);

  sound();

  Crafty.sprite(SPRITE_WIDTH, "images/sprite.png", spriteCoords);

  Crafty.scene("title", function() {
    var title1 = Crafty.e("2D, DOM, Image").attr({x: 0, y: 0}).image("images/start-screen-0.png");
    var title2 = Crafty.e("2D, DOM, Image").attr({x: 0, y: 0}).image("images/start-screen-1.png");
    title1.visible = true;
    title2.visible = false;

    var playAgainInterval = setInterval(function() {
      if (title1.visible) {
        title1.visible = false;
        title2.visible = true;
      } else {
        title1.visible = true;
        title2.visible = false;
      }
    }, 1000);

    var spaceToStart = function(e) {
      // spacebar
      if (e.keyCode == 32) {
        clearInterval(playAgainInterval);
        playAgainInterval = null;
        playSound(soundBuffers.dingdong);

        Crafty.unbind("KeyDown", spaceToStart);
        Crafty.scene("main");
      }
    };
    Crafty.bind("KeyDown", spaceToStart);
  });

  Crafty.scene("main", function() {
    Crafty.background("url('images/map.png')");

    gallonsPumped = 0;

    var scoreText = Crafty.e("2D, DOM, Text")
      .attr({x: WIDTH - 100, y: 0, w: 100, h: 100})
      .textFont({family: "Arial", size: '12px'})
      .textColor("#FF0000");

    updateScoreText();

    function updateScoreText() {
      scoreText.text("Gallons: " + gallonsPumped);
    }

    Crafty.c("Station", {
      init: function() {
        this.waterLevel = INITIAL_WATER_LEVEL;
      },
      _changeWaterLevel: function(delta) {
        if (this.waterLevel > 0 && delta === -1 || this.waterLevel < MAX_WATER_LEVEL && delta === 1) {
          this.waterLevel += delta;
          this.sprite(this.waterLevel, 1, 1, 1);
          return true;
        }
        return false;
      },
      pump: function() {
        if (this._changeWaterLevel(-1)) {
          gallonsPumped += Crafty.math.randomInt(900, 1100);
          updateScoreText();
        }
      },
      flood: function() {
        this._changeWaterLevel(1);

        // Game over
        if (this.waterLevel == MAX_WATER_LEVEL) {
          clearInterval(waterTimer);
          waterTimer = null;

          clearInterval(stationsSelectTimer);
          stationsSelectTimer = null;

          if (window.localStorage) {
            var highScore = parseInt(localStorage.getItem("highScore") || 0);
            if (gallonsPumped > highScore) {
              highScore = gallonsPumped;
            }
            localStorage.setItem("highScore", highScore);
          }

          Crafty.scene("gameover");
        }
      }
    });

    var stations = {
      "fourteenthSt": {x: 80, y: 43},
      "firstAve": {x: 370, y: 45},
      "bedfordAve": {x: 522, y: 45},
      "delancySt": {x: 386, y: 243},
      "marcyAve": {x: 597, y: 243},
      "southFerry": {x: 246, y: 484},
      "wallSt": {x: 324, y: 411},
      "clarkSt": {x: 516, y: 366}
    }

    for (var stationName in stations) {
      Crafty.e("2D, Canvas, Station, station" + INITIAL_WATER_LEVEL)
        .attr(stations[stationName]);
    }

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
          playSound(soundBuffers.glug);
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
    Crafty.background("url('images/game-over-background-1.png')");

    var water = Crafty.e('2D, DOM, Image').attr({x: 0, y: HEIGHT}).image('images/game-over-water.png');
    var gameOverWaterLevel = HEIGHT;

    moveWater = function(direction, delta) {
      if (direction == 'up') {
        gameOverWaterLevel -= delta;
      } else {
        gameOverWaterLevel += delta;
      }

      water.attr({y: gameOverWaterLevel});
    };

    var playAgainInterval;
    var waterDirection = 'up';
    var gameOverInterval = setInterval(function() {
      if (waterDirection == 'up') {
        moveWater(waterDirection, 8);

        if (gameOverWaterLevel <= 0) {
          Crafty.background("url('images/game-over-background-2.png')");
          waterDirection = 'down';
        }
      } else {
        moveWater(waterDirection, 8);

        if (gameOverWaterLevel >= HEIGHT / 2.1) {
          clearInterval(gameOverInterval);
          gameOverInterval = null;

          // score label
          setTimeout(function(){
            var scoreText = Crafty.e('2D, DOM, Image').attr({x: WIDTH * 0.05, y: HEIGHT * 0.56}).image('images/score-text.png');
          }, 500);

          // score
          setTimeout(function(){
            // dave work here
          }, 1000);

          // play again
          setTimeout(function(){
            var playAgainPosition =  HEIGHT * 0.86
            var playAgain = Crafty.e('2D, DOM, Image').attr({x: WIDTH * 0.2, y: playAgainPosition}).image('images/play-again.png');

            playAgainInterval = setInterval(function() {
              if (playAgain._y > HEIGHT) {
                playAgain.attr({y: playAgainPosition});
              } else {
                playAgain.attr({y: HEIGHT * 2});
              }
            }, 1000);
          }, 1500);
        }
      }
    }, 25);

    // Wait for a second before registering the keypress event. This is to
    // make sure the player doesn't skip over the game over screen by pumping
    // right when the game ends
    setTimeout(function() {
      var startOver = function(e) {
        // spacebar
        if (e.keyCode == 32) {
          Crafty.unbind("KeyDown", startOver);
          if (gameOverInterval) {
            clearInterval(gameOverInterval);
            gameOverInterval = null;
          }
          if (playAgainInterval) {
            clearInterval(playAgainInterval);
            playAgainInterval = null;
          }
          Crafty.scene("main");
          playSound(soundBuffers.dingdong);
        }
      };
      Crafty.bind("KeyDown", startOver);
    }, 1000);
  });

  Crafty.scene("title");
};


//
// sound effects from here on down
//

var context;
sound = function() {
  try {
    context = new webkitAudioContext();
  }
  catch(e) {
    console.log('Web Audio API is not supported in this browser');
  }

  if (context) {
    loadDingDong();
    loadGlug();
    loadRain();
    loadThunder();
    randomizeThunder();
  }
}

// start an infinite loop of two instances of the same rain sample
// which crossfade between each other at the end
loadRain = function() {
  // Decode asynchronously
  var callback = function(buffer) {
    soundBuffers.rain = buffer;

    playHelper(buffer, buffer);

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
  }

  loadSoundFile('rain.mp3', callback);
}

var soundBuffers = {
  thunder: [],
  glug: null,
  rain: null,
  dingdong: null
};

loadDingDong = function() {
  loadSoundFile('dingdong.mp3', function(buffer) {
    soundBuffers.dingdong = buffer;
  })
}

loadGlug = function() {
  loadSoundFile('glug.mp3', function(buffer) {
    soundBuffers.glug = buffer;
  })
}

loadThunder = function() {
  var thunderSounds = ["thunder1.mp3", "thunder2.mp3", "thunder3.mp3",
      "thunder4.mp3"];

  for (var i=0; i< thunderSounds.length; i++) {
    loadSoundFile(thunderSounds[i], function(buffer) {
      soundBuffers.thunder.push(buffer);
    });
  }
}

playSound = function(buffer) {
  if (context) {
    createSource(buffer).source.noteOn(0);
  }
};

loadSoundFile = function(filename, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', 'sound/' + filename, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    context.decodeAudioData(request.response, callback);
  }
  request.send();
}

// a recursive call to trigger a random thunder sample
// every once in a while
randomizeThunder = function() {
  // wait between 10 and 25 sec
  var wait = Math.ceil(Math.random() * 10000) + 15000;

  setTimeout(function() {
    playRandomThunder();
    randomizeThunder();
  }, wait);
}

// trigger a noteOn for one of the samples
// add and remove the class "lightening" to the body
// a random number of times
playRandomThunder = function() {
  var buffers = soundBuffers.thunder;
  if (buffers.length) {
    var rand = Math.floor(Math.random() * buffers.length);

    playSound(buffers[rand]);

    // trigger randomized flashes
    lightening();
  }
}

// add and remove the class lightening to the body
// a random number of times with a random interval
lightening = function() {
  var numberOfFlashes = Math.ceil(Math.random() * 3);
  var delays = [Math.ceil(Math.random() * 400), Math.ceil(Math.random() * 400)];
  var delay;

  flash();

  // add the delays together if necessary for the second and third flashes
  for (var i = 0; i < numberOfFlashes; i++) {
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

    setTimeout(function() {
      flash();
    }, delay);
  }
}

flash = function() {
  var body = document.getElementsByTagName('body')[0];

  body.className = 'lightening';
  setTimeout(function() {
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
