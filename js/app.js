var image = new Image();
image.src = 'images/char-boy.png';
console.log(image.naturalHeight);
//set up global environment for items that need to be reached in all functions
var globalEnv = {
  _gen: new Generator(), //setup generator function for dynamic enemy X,Y coordinates and dynamic enemy generation.
  showStats: {
    init: function() { //every 10 seconds update the statistics showing in the page title
      setInterval(function() {
        document.title = "Score: " + globalEnv.score.amount + " Lvl: " + globalEnv.level.number;
      }, 100);
      globalEnv.score.init(); //initialize score
    }
  },
  level: {
    number: 1,
    complete: function() {
      this.number++; //on level complete, add 1 to the level
      globalEnv.score.amount += 500;  //on level completion add 500 to score
    },
	lose: function() {
		globalEnv.score.amount = 0; // score set to 0
	}
  },
  score: {
    amount: 0, //start with 0 score
    goUp: function() {
      this.amount += 10; //add 10 to score
    },
    init: function() {
      setInterval(function() {
        globalEnv.score.goUp(); //every 5 seconds call the goUp function and add 10 to score.
      }, 500);
    }
  }
}

globalEnv.showStats.init(); //initialize the stats display.
var _gen = globalEnv._gen; //house the generator in an easier to use variable.

// Enemies our player must avoid
var Enemy = function(x, y, speed) {
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/enemy-bug.png';
 
  //set up Enemy's X,Y coordinates and how fast it will move across the screen.
  this.x = x
  this.y = y;
  this.speed = speed;

};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
  
  dt = dt || 0; //because this prototype will be copied into player.prototype and player.prototype doesn't require
                // the dt parameter, we can short-circuit to declare it as 0 if it doesn't exist.
                
  if (this.x >= 585) { //if enemy is at or outside of 585px left. This doesn't affect Player since it can't travel that far out.
    this.x = -50; //set enemy to before the screen. This keeps it from just jerking into view.
  } else {
    this.x = this.x + (this.speed * dt); 
  }
  //sharing this prototype with player means we have to be sure it's an enemy
  //then we check for collisions.
  if(this.constructor.name == 'Enemy') this.checkForCollide(); 
};

Enemy.prototype.checkForCollide = function(){
	//create a bounding box around the enemy and check for player connection.
	a = this, b = player;
	a.width = 80;
	a.height = b.width = b.height = 50;
	//check for collision
	if( a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y) { //if element collides
		alertIt(); //call the alertIt function. 
		player.reset();
	}
	function alertIt() {
		globalEnv.level.lose();
		console.log('Collided!');
          allEnemies.forEach(function(item, index) {
            item.x = 0;
          });
	}
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function(x, y, speed) {
  Enemy.call(this, x, y, speed); //set up pseudoclassical inheritance.
  this.sprite = 'images/char-boy.png';
  this.handleInput = function(key) {

	//set up ternary/if statements to keep within boundaries.
    switch (key) {
      case "left":
        (this.x >= 25) ? this.x = this.x - 100: console.log('boundary left');
        break;
      case "right":
        (this.x <= 375) ? this.x = this.x + 100: console.log('boundary right');
        break;
      case "down":
        (this.y <= 400) ? this.y = this.y + 100: console.log('boundary bottom');
        break;
      case "up":
        if (this.y >= 100) { //check if player hasn't made it to the top
          this.y = this.y - 100;
        } else { //if player is a top, complete level, regenerate enemies and reset player position.
          globalEnv.level.complete();
          allEnemies = [];
          for (i = 0; i < globalEnv.level.number; i++) {
            var newEnemy = globalEnv._gen.enemy();
            newEnemy.prototype = Object.create(Enemy.prototype);
            newEnemy.constructor = Enemy;

            allEnemies.push(newEnemy);
          }
          this.reset();
        }
        break;
    }   
  }
}

Player.prototype = Object.create(Enemy.prototype); //make Player prototype match Enemy prototype
Player.prototype.constructor = Player; //make sure the correct constructor is returned on call

//reset Player position.
Player.prototype.reset = function() {
  this.x = 200;
  this.y = 425;
  this.render();
}

//Generator constructor function
//it's referenced in the globalEnv block but separated for easy access.
//a.e. if anyone wanted to modify the speed, Y range, they can easily.
function Generator() {
  this.enemyY = function() { //place enemies only within a certain Y range
    var topMost = min = 75; //top most boundary
    var bottomMost = max = 225; //lower most boundary
    return Math.random() * (max - min) + min;  //return random Y
  }
  this.enemySpeed = function(speed) {//create speed based on given value(100) and level number.
    return Math.random() * (speed * globalEnv.level.number); 
  }
  this.enemy = function() {//return new enemy.
    var newEnemy = new Enemy(0, this.enemyY(), this.enemySpeed(100)); 
	newEnemy.prototype = Object.create(Enemy.prototype);
	newEnemy.prototype.constructor = Enemy;
    return newEnemy;
  }

}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

//create player, enemies and 
var player = new Player(200, 425, 1);
var allEnemies = [];
var enemy = _gen.enemy();
allEnemies.push(enemy);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);

});
