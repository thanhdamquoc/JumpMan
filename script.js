let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");
let scoreDisplay = document.getElementById("scoreDisplay");
let lifeDisplay = document.getElementById("lifeDisplay");

c.style.border = "1px solid black";
c.width = 700;
c.height = 500;
//button input
function movePlayer(inputCode) {
    switch (inputCode) {
        case 0:
            player.speedX = -5;
            break;
        case 2:
            player.speedX = 5;
            break;
        case 1:
            if (player.touchesGround === true) {
                player.speedY = 20;
                player.color = randomizeColor();
            }
            break;
        case 3:
            player.speedX = 0;
            if (player.touchesGround === false) {
                player.speedY = -10;
            }
            break;
    }
}
//keyboard input
addEventListener("keydown", getKey);
function getKey(event) {
    if([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }

    switch (event.keyCode) {
        case 37:
            player.speedX = -5;
            break;
        case 39:
            player.speedX = 5;
            break;
        case 38:
            if (player.touchesGround === true) {
                player.speedY = 20;
                player.color = randomizeColor();
            }
            break;
        case 40:
            player.speedX = 0;
            if (player.touchesGround === false) {
                player.speedY = -10;
            }
            break;
    }
}
//objects
let Player = function Player(x,y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedGravity = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.touchesGround = false;
    this.color = randomizeColor();
    this.life = 3;
    this.isCrazy = false;
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        if (this.isCrazy) {
            ctx.fillStyle = "black";
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
    this.update = function() {
        this.draw();
        //gravity
        this.speedGravity += gravity;
        this.y -= this.speedY - this.speedGravity;
        this.speedX *= friction;
        this.x += this.speedX;
        //collision
        this.checkCollision();
    }
    this.checkCollision = function() {
        //check ground
        if ((this.x > ground.x) && (this.x < ground.x + ground.width) && (this.y > ground.y - this.size)) {
            this.y = ground.y - this.size;
            this.touchesGround = true;
        } else {
            this.touchesGround = false;
        }

        if (this.touchesGround === true) {
            this.speedGravity = 0;
            this.speedY = 0;
        }
        //check sides
        if (this.x - this.size < 0) {this.x = this.size}
        if (this.x + this.size > c.width) {this.x = c.width - this.size}
    }
}

let Tile = function Tile(x,y,width,height,color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.draw = function () {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

let Enemy = function Enemy(x,y,size,speedX,speedY, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color;
    this.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    this.update = function () {
        this.draw();
        this.x += this.speedX;
        this.y += this.speedY;
    }
}
let PowerUp = function PowerUp(x,y,size,value,color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.value = value;
    this.color = color;
    this.draw = function () {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = this.color
        ctx.fill();
    }
}
//render
function render() {
    animationFrameID = requestAnimationFrame(render);
    //clear screen
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(0,0,c.width, c.height);
    //score board
    gameScore++;
    // crazyTime++;
    scoreDisplay.innerHTML = "" + gameScore;
    lifeDisplay.innerHTML = player.life
    //draw player & ground
    player.update();
    ground.draw();
    //spawn enemies
    if (Math.random() < 0.2) {
        let x = (Math.random()-0.5) * 3 * c.width;
        let y = (Math.random() * -20) - 10;
        let size = Math.random() * 25 + 5;
        let speedX = (Math.random()-0.5)*20;
        let speedY = Math.random() + 2;
        let color = randomizeColor();
        enemies.push(new Enemy(x,y,size,speedX,speedY,color))
    }
    //draw enemies
    for (let i = 0; i < enemies.length; i++) {
        let thisEnemy = enemies[i];
        thisEnemy.update();
        //detect going off screen
        if (thisEnemy.y - thisEnemy.size > c.height) {
            enemies.splice(i,1);
        }
        //detect collision
        let distX = Math.abs(thisEnemy.x - player.x);
        let distY = Math.abs(thisEnemy.y - player.y);
        let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
        if (dist < player.size + thisEnemy.size) {
            hitSound.play();
            enemies.splice(i,1);
            //spawn particles
            for (let i = 1; i < thisEnemy.size; i++) {
                let x = thisEnemy.x;
                let y = thisEnemy.y;
                let size = 5;
                let speedX = (Math.random()-0.5)*10;
                let speedY = (Math.random()-0.5)*10;
                let color = thisEnemy.color;
                particles.push(new Enemy(x,y,size,speedX,speedY,color))
            }
            if (!player.isCrazy) {
                player.life--;
                player.size-=5;
            }
        }
        if (player.life < 0) {
            cancelAnimationFrame(animationFrameID);
            let userWantsToReplay = confirm("Do you want to restart?");
            if (userWantsToReplay) {
                location.reload();
            }
            return;
        }
    }
    //draw & pop particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    particles.pop();
    //spawn power ups
    if (Math.random() < 0.005 && powerUps.length < 3) {
        let x = Math.random() * (c.width-40) + 20;
        let y = c.height - (Math.random() * 160 + 40);
        let size = 20;
        let numberOfPowerUps = 6;
        let value = getRandomInt(1,numberOfPowerUps);
        let color;
        switch (value) {
            case 1:
                color = "white";
                break;
            case 2:
                color = "red";
                break;
            case 3:
                color = "black";
                break;
            case 4:
                color = "blue";
                break;
            case 5:
                color = "yellow";
                break;
            // case 6:
            //     color = "green";
            //     break;
            case numberOfPowerUps:
                color = "purple";
                value = getRandomInt(1,numberOfPowerUps-1);
                break;
        }
        powerUps.push(new PowerUp(x,y,size,value,color));
    }
    //draw power ups
    for (let i = 0; i < powerUps.length; i++) {
        let thisPowerUp = powerUps[i];
        thisPowerUp.draw();
        //power up collision
        let distX = Math.abs(thisPowerUp.x - player.x);
        let distY = Math.abs(thisPowerUp.y - player.y);
        let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
        if (dist < player.size + thisPowerUp.size) {
            levelUpSound.play();
            if (thisPowerUp.value === 1) {
                enemies = [];
            } else if (thisPowerUp.value === 2) {
                player.life+=1;
                player.size+=5;
            } else if (thisPowerUp.value === 3) {
                player.isCrazy = true;
                setTimeout(function () {player.isCrazy = false},5000);
            } else if (thisPowerUp.value === 4) {
                for (let i = 0; i < enemies.length; i++) {
                    enemies[i].size = 5;
                }
            } else if (thisPowerUp.value === 5) {
                gameScore += 1000;
            }
            // else if (thisPowerUp.value === 6) {
            //     player.y = getRandomInt(player.size, c.height-player.size);
            //     player.x = getRandomInt(player.size, c.width-player.size);
            //     player.touchesGround = false;
            //     enemies = [];
            // }
            powerUps.splice(i,1);
        }
    }
}
//start game
let animationFrameID;
let gravity = 1;
let friction = 0.95;
let player = new Player(c.width/2,0,20);
let enemies = [];
let powerUps = [];
let gameScore = 0;
let particles = [];
player.draw();
requestAnimationFrame(render);
let ground = new Tile(0,c.height-10,c.width,10,"black");
//other functions
function randomizeColor() {
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//add music
let hitSound = new Audio('hitSound.mp3');
let levelUpSound = new Audio("levelUpSound.mp3");

