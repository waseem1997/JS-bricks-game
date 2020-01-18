class Paddle { // paddle object
  constructor(game) {

  	this.gameWidth = game.gameWidth;
  	this.gameHeight = game.gameHeight; 

    this.width = 150;
    this.height = 20;

    this.maxSpeed = 7; 
    this.speed = 0;


    // position: we want to be in the center of the gameScreen
    this.position = {
      x: this.gameWidth / 2 - this.width / 2,
      y: this.gameHeight - this.height - 10,
    }
  }

  moveLeft() {
  	this.speed = -this.maxSpeed;
  }

  moveRight() {
  	this.speed = this.maxSpeed;
  }

  draw(ctx) { // method to draw the paddle
  	ctx.fillStyle = "#0f0";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update(deltaTime) {

  	this.position.x += this.speed; 

  	if (this.position.x < 0 ) this.position.x = 0;
  	if(this.position.x + this.width > this.gameWidth) 
  	this.position.x = this.gameWidth - this.width
  }

  stop(){
  	this.speed = 0;
  }

}

class inputHandler {
	constructor(paddle, game) {
		document.addEventListener('keydown', (event) => {
			switch(event.keyCode) {
				case 37: 
					paddle.moveLeft();
					break;

				case 39: 
					paddle.moveRight();
					break;
				case 27: 
					game.togglePasue(); 
					break; 

							}
		});

		document.addEventListener('keyup', (event) => {
			switch(event.keyCode) {
				case 37: 
					if(paddle.speed < 0)
						paddle.stop();
					break;

				case 39: 
					if (paddle.speed > 0)
						paddle.stop();
					break;

							}
		});
	}
}

class Ball {
	constructor(geme) {
		this.image = document.getElementById("img_ball");

		this.game = game; 

		this.position = {x: 10, y: 400 };
		this.speed = {x: 2, y: -2};

		this.size = 30;
	}

	draw() {
		ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
		
	}

	update(deltaTime){
		this.position.x += this.speed.x;
		this.position.y += this.speed.y;

		// if the ball hit the left or the right of the wall 
		if (this.position.x + this.size  > this.game.gameWidth || this.position.x < 0) {
			this.speed.x = -this.speed.x;
		}

		// if the ball hit the top or the bottom of the wall 
		if (this.position.y + this.size > this.game.gameHeight || this.position.y < 0) {
			this.speed.y = -this.speed.y;
		}

		if(collisionDetection(this, this.game.paddle)){
			this.speed.y = -this.speed.y; // reverse the speed 
			this.position.y = this.game.paddle.position.y - this.size; 
		}
	}
}

function collisionDetection(ball, gameObject) {
		let bottomOfTheBall = ball.position.y + ball.size; // get the bottom of the ball 
		let topOfTHeBall = ball.position.y; 

		let topOfTheGame = gameObject.position.y;
		let leftSideGame= gameObject.position.x; 
		let rightSideGame = gameObject.position.x + gameObject.width;
		let bottomOfGame = gameObject.position.y + gameObject.height; 


		if(bottomOfTheBall >= topOfTheGame
			&& topOfTHeBall <= bottomOfGame
			&& ball.position.x >= leftSideGame
			&& ball.position.x + ball.size <= rightSideGame) {
			
			return true; 
		}else{false;}
}

class Brick {
	constructor(game, position) {
		this.image = document.getElementById("img_brick");

		this.gameWidth = game.gameWidth; 
		this.gameHeight = game.gameHeight;

		this.game = game; 

		this.position = position;

		this.width = 80;
		this.height = 24; 

		this.deletion = false; 
	}

	update() {

		if (collisionDetection(this.game.ball, this)) {
			this.game.ball.speed.y = -this.game.ball.speed.y; 
			this.deletion = true; 
		}

	}

	draw(ctx) {
		ctx.drawImage(
			this.image, 
			this.position.x, 
			this.position.y, 
			this.width, 
			this.height)
	}
}

const level1 = [
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0], 
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]; 

function buildLevels(level, game) {

	let bricks = []; 
	

	  level.forEach((row, levelIndex) => {
	  	row.forEach((brick, brickIndex) => {
	  		if(brick == 1) {
	  			let position = {
					x: 80 * brickIndex, 
					y: 20 + 24 * levelIndex ,
				};
	  			bricks.push(new Brick(game, position))
	  		}
	  	});
	  }); 

	  return bricks; 
}

const GAME_STATE = {
	PAUSED: 0, 
	RUNNING: 1, 
	MENU: 2, 
	GAMEOVER: 3,
}

class Game {
	constructor(gameWidth, gameHeight) {
		this.gameWidth = gameWidth; 
		this.gameHeight = gameHeight; 
	}

	start() {
		this.gameState = GAME_STATE.RUNNING; 

		this.ball = new Ball(this); 
		this.paddle = new Paddle(this);
		let bricks = buildLevels(level1, this)

		this.gameObjects = [this.ball, this.paddle, ...bricks]; 

		new inputHandler(this.paddle, this); 
	}

	update(deltaTime) {

		if (this.gameState == GAME_STATE.PAUSED) return; 

		this.gameObjects.forEach(object => object.update(deltaTime));

		 // remove the brick if it hits the ball 
		this.gameObjects = this.gameObjects.filter(object => !object.deletion);
	}

	draw(ctx) {
		
		this.gameObjects.forEach(object => object.draw(ctx));
		
		if(this.gameState == GAME_STATE.PAUSED){
			ctx.rect(0, 0, this.gameWidth, this.gameHeight); 
			ctx.fillStyle = "rgba(0, 0, 0, .5)";
			ctx.fill(); 		
		}
		
	}

	togglePasue() {
		if(this.gameState == GAME_STATE.PAUSED) {
			this.gameState = GAME_STATE.RUNNING
		}else{ 
			this.gameState = GAME_STATE.PAUSED
		}
	}
}


let canvas = document.getElementById("gameScreen"); // get the canvas

let ctx = canvas.getContext('2d'); // get the context in 2 dimensional

const GAME_WIDTH = 800;  // const game width
const GAME_HEIGHT = 600; // const game height

let game = new Game(GAME_WIDTH, GAME_HEIGHT); 
game.start(); 


let lastTime = 0;  

function gameLoop(timeStamp) {

	let deltaTime  = timeStamp - lastTime; 
	lastTime = timeStamp; 


	ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT); 
	game.draw(ctx);
	game.update(deltaTime); 

	requestAnimationFrame(gameLoop);


}

requestAnimationFrame(gameLoop);
