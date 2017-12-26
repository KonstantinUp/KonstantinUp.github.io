let pjs = new PointJS(400, 300, {
    background: 'url(./texture.jpg) center no-repeat',
    backgroundSize: 'cover',
});

pjs.system.initFullPage();
pjs.system.setTitle('Game Zombie Mode');

let game = pjs.game;
let point = pjs.vector.point;
let camera = pjs.camera;
let brush = pjs.brush;
let OOP = pjs.OOP;
let math = pjs.math;

let key = pjs.keyControl.initKeyControl();
let mouse = pjs.mouseControl.initMouseControl();

let width = game.getWH().w;
let height = game.getWH().h;

let speed = point();
pjs.mouseControl.setCursorImage("./image/cursor.png");

let zombieMoveTile = pjs.tiles.newImage('./image/zombieMove.png');
let zombieMoveFrames = zombieMoveTile.getAnimation(0, 0, 267, 275, 17);


let zombies = [];
let zombieTimer = pjs.OOP.newTimer(500, function () {
    let zombieMoveAnimation = game.newAnimationObject({
        animation: zombieMoveFrames,
        x: math.random(personAnimation.x - 1000, personAnimation.x + 1000),
        y: math.random(personAnimation.y - 1000, personAnimation.y + 1000),
        alpha: 1,
        damage:0.1,
        walking:true,
        w: 50,
        h: 50
    });
    if (personAnimation.getDistanceC(zombieMoveAnimation.getPositionC()) < 200) {
        return;
    }
    zombies.push(zombieMoveAnimation);
});

let hearts = [];
let heartTimer = pjs.OOP.newTimer(5000, function () {
    let heart = game.newImageObject({
        file: "./image/heart.png",
        x: math.random(personAnimation.x - 300, personAnimation.x + 300),
        y: math.random(personAnimation.y - 300, personAnimation.y + 300),
        h: 50,
        w: 50,
        fillColor: 't#6495ED'
    });

    if (personAnimation.getDistanceC(heart.getPositionC()) < 100) {
        return;
    }
    hearts.push(heart);
});

let cryltals = [];
let crystalTimer = pjs.OOP.newTimer(5000, function () {
    let crystal = game.newImageObject({
        file: "./image/Crystal.png",
        x: math.random(personAnimation.x - 500, personAnimation.x + 500),
        y: math.random(personAnimation.y - 150, personAnimation.y + 150),
        h: 50,
        w: 50,
        fillColor: 't#6495ED'
    });

    if (personAnimation.getDistanceC(crystal.getPositionC()) < 100) {
        return;
    }
    cryltals.push(crystal);
});

let Bullets = [];
let addBullet = function () {
    let personCenter = personAnimation.getPositionC();
    let objBullet = game.newImageObject({
        file: "./image/bullet.png",
        x: personCenter.x,
        y: personCenter.y,
    });
    objBullet.rotate(mouse.getPosition());
    Bullets.push(objBullet);
};
Bullets.count = 20;


let restartFlag = false;
let fullScreenFlag = false;

function restart() {
    restartFlag = true;
    game.setLoop('myGame');
}

function fullScreen() {
    fullScreenFlag = true;
    game.setLoop('myGame');
}


let cameraPositionXCurrent = false;
let cameraPositionYCurrent = false;


let personTile = pjs.tiles.newImage('./image/person1.png');
let personFrames = personTile.getAnimation(0, 0, 140, 130, 24);

let personAnimation = game.newAnimationObject({
    animation: personFrames,
    positionC:(point(game.getWH().w2,game.getWH().h2)),
    w: 150,
    h: 130
});

personAnimation.healthPepcent = 100;
personAnimation.health = 200;
personAnimation.score = 0;
personAnimation.zombieKilledCount = 0;


let zombieAttackTile = pjs.tiles.newImage('./image/zombie.png');
let zombieAttackFrames = zombieAttackTile.getAnimation(0, 0, 227, 235, 8);

let zombieAttackAnimation = game.newAnimationObject({
    animation: zombieAttackFrames,
    w: 50,
    h: 50
});


let gun = game.newImageObject({
    file: "./image/gun.png",
    positionC: personAnimation.getPositionC(),
    w: 180,
    h: 100,
});
gun.setCenter(point(0, 10));


let checkPoint = false;




game.newLoopFromConstructor('myGame', function () {

    let fence = [];
    let ground = [];
    let trees = [];
    let water = [];

    pjs.levels.forStringArray({
        w: 170, h: 170, source: [
            "222222222222222",
            "200004440000002",
            "200000044000002",
            "200000004000002",
            "203333333000002",
            "203000003000002",
            "222222222222222",
        ]
    }, function (symble, X, Y, W, H) {
        if (symble === '0') {
            fence.push(game.newRectObject({
                x: X, y: Y,
                w: W, h: H,
                fillColor: "#ffd916"
            }));
        } else if (symble === '3') {
            ground.push(game.newImageObject({
                file: "./image/earth.png",
                x: X, y: Y,
                w: W, h: H,
            }));
        } else if (symble === '2') {
            trees.push(game.newImageObject({
                file: "./image/tree.png",
                x: X, y: Y,
                w: W, h: H,
                fillColor: "#ffd916"
            }));

        }else if (symble === '4') {
            water.push(game.newImageObject({
                file: "./image/water.jpg",
                x: X, y: Y,
                w: W, h: H,
            }));

        }
    });

    let camPos;

    let step = 2;

    let x;
    let y;
    let h;
    let screenState ;


    let personPosition ;
    let bullet ;
    let health ;
    let healthPepcent ;
    let score ;
    let zombieKilledCount;

    let gamingMessage = game.newTextObject({
        x: game.getWH2().w - 150,
        y: game.getWH2().h - 50,
        text: "Save",
        size: 100,
        color: "#8b0d27",
        alpha: 1,
    });


    let saveTime = 0;

    let timer = pjs.OOP.newTimer(1000, function () {
        saveTime++;
    });


    let shotMusic = pjs.wAudio.newAudio("./audio/gun_fire.wav", 0.2);
    let damageMusic = pjs.wAudio.newAudio("./audio/damage.mp3", 0.3);
    let stepMusic = pjs.wAudio.newAudio("./audio/step.wav", 0.1);
    let backGroundMusic = pjs.wAudio.newAudio("./audio/background.wav", 0.4);

    this.update = function () {

      let x;
      let y;



      if(key.isPress('SPACE')){
          if( backGroundMusic.playing){
              backGroundMusic.stop();
          } else {
              backGroundMusic.play();
          }
      }

        game.clear();


        height = pjs.game.getWH().h;
        width = pjs.game.getWH().w;


        OOP.forArr(ground, function (groundPiece) {
            groundPiece.draw();

        });

        OOP.forArr(fence, function (fencePiece) {
            fencePiece.draw();
        });

        OOP.forArr(trees, function (tree) {
            tree.draw();
        });
        OOP.forArr(water, function (water) {
            water.draw();

            if (personAnimation.isIntersect(water)) {
                step = 1;
                setTimeout(function () {
                    step = 2;
                }, 3000);
            }
        });


        gun.draw();
        gun.rotate(mouse.getPosition());


        OOP.forArr(cryltals, function (crystal, crystalId) {
            crystal.draw();
            if (personAnimation.isIntersect(crystal)) {
                step = 4;
                setTimeout(function () {
                    step = 2;
                }, 5000);
                cryltals.splice(crystalId, 1);
            }
        });

        if (key.isDown('A')) {
            speed.x = -step;
        } else if (key.isDown('D')) {
            speed.x = step;
        } else {
            speed.x = 0;
        }

        if (key.isDown('W')) {
            speed.y = -step;
        } else if (key.isDown('S')) {
            speed.y = step;
        } else {
            speed.y = 0;
        }

        if (speed.x === 0 && speed.y === 0) {
            personAnimation.drawFrames(0);
        }

        if (speed.y && !speed.x) {
            personAnimation.drawFrames(7, 12);
            pjs.vector.moveCollision(personAnimation, trees, speed);
            gun.move(speed);
            stepMusic.play();
        }
        if (speed.x && !speed.y) {
            personAnimation.drawFrames(1, 6);
            pjs.vector.moveCollision(personAnimation, trees, speed);
            gun.move(speed);
            stepMusic.play();
        }

        if (key.isDown('W') && key.isDown('A') || key.isDown('S') && key.isDown('D')) {
            personAnimation.drawFrames(13, 18);
            pjs.vector.moveCollision(personAnimation, trees, speed);
            gun.move(speed);
            stepMusic.play();
        }

        if (key.isDown('W') && key.isDown('D') || key.isDown('A') && key.isDown('S')) {
            personAnimation.drawFrames(19, 24);
            pjs.vector.moveCollision(personAnimation, trees, speed);
            gun.move(speed);
            stepMusic.play();
        }


        if (zombies.length === 65) {
            game.setLoop('winner');
        }

        if (zombies.length <= 65) {
            zombieTimer.restart();
        }

        if (hearts.length <= 5) {
            heartTimer.restart();
        }

        if (cryltals.length <= 5) {
            crystalTimer.restart();
        }


        OOP.forArr(Bullets, function (bullet, bulletId) {
            if (!bullet.isInCameraStatic()) {
                Bullets.splice(bulletId, 1)
            }
            bullet.moveAngle(15);
            bullet.draw();


        });

        OOP.forArr(hearts, function (heart, heartId) {
            heart.draw();

            if (personAnimation.isIntersect(heart)) {
                personAnimation.healthPepcent += 10;
                personAnimation.health += 20;

                if (personAnimation.health >= 200) {
                    personAnimation.health = 200;
                    personAnimation.healthPepcent = 100;

                }

                hearts.splice(heartId, 1);

            }
        });


        OOP.forArr(zombies, function (zombie, idzombie) {
            zombie.rotate(personAnimation.getPositionC());
            zombie.moveAngle(0.5);

            if (zombie.isInCameraStatic()) {
                zombie.setAlpha(1);
                zombie.draw();

                OOP.forArr(Bullets, function (bullet, id) {
                    if (bullet.isIntersect(zombie)) {
                        zombies.splice(idzombie, 1);
                        Bullets.splice(id, 1);
                        personAnimation.zombieKilledCount+= 1;
                        personAnimation.score += 10;
                        personAnimation.health += 0.08;
                        personAnimation.healthPepcent += 0.04;
                    }
                });

                OOP.forArr(ground, function (groundPiece) {
                    if (groundPiece.isIntersect(zombie) && personAnimation.isIntersect(zombie)) {
                        zombie.damage = 0.5;
                        zombieAttackAnimation.rotate(personAnimation.getPositionC());
                        zombieAttackAnimation.x = zombie.x;
                        zombieAttackAnimation.y = zombie.y;
                        zombieAttackAnimation.draw();

                        if (personAnimation.healthPepcent <= 1) {
                            personAnimation.diad = true;
                        }
                        personAnimation.healthPepcent -= 0.25;
                        personAnimation.health -= zombie.damage;

                    }

                });

                if (personAnimation.isIntersect(zombie)) {
                    damageMusic.play();
                    zombie.damage = 0.1;
                    personAnimation.drawStaticBox();
                    zombieAttackAnimation.rotate(personAnimation.getPositionC());
                    zombieAttackAnimation.x = zombie.x;
                    zombieAttackAnimation.y = zombie.y;
                    zombieAttackAnimation.draw();
                    if (personAnimation.healthPepcent <= 1) {
                        personAnimation.diad = true;
                        return;
                    }
                    personAnimation.healthPepcent -= 0.05;
                    personAnimation.health -= zombie.damage ;
                }

                let filredZombies = zombies.filter(function (item) {
                    return item.id !== zombie.id;
                });

                pjs.vector.moveCollisionAngle(zombie, filredZombies, math.random(0, 2), onCollision = function (zombie) {
                    zombie.moveAngle(4);
                });

            }

        });

        let isFullScreen = pjs.system.isFullScreen();

        if( personAnimation.score === 200   ){
            Bullets.count +=30;
            personAnimation.score =0;
        }

        if (personAnimation.diad) {
            game.setLoop('hasdied');
        }

        if (mouse.isPress('LEFT') && Bullets.count) {
            shotMusic.play();
            Bullets.count -=1;
            addBullet();
        }
        if(key.isDown('E') && !checkPoint){
            checkPoint = true;
            personPosition = personAnimation.getPosition();
            bullet =  Bullets.count;
            health = personAnimation.health;
            healthPepcent = personAnimation.healthPepcent;
            score = personAnimation.score ;
            zombieKilledCount = personAnimation.zombieKilledCount;
            timer.start();
        }

        if(saveTime > 0 && saveTime < 6){
            timer.restart();
            gamingMessage.x = personAnimation.getPositionC().x - 100;
            gamingMessage.y = personAnimation.getPositionC().y -  400;
            gamingMessage.draw();
            gamingMessage.transparent(-0.005);
        }

        if (key.isDown('TAB') && isFullScreen) {
            if(screenState ){
                pjs.system.exitFullScreen();
                pjs.system.initFullPage();
                console.log(1);
                setTimeout(function () {
                    y =  y+60;
                    camera.setPositionC(point( x,y));
                },100);

                screenState = false;

            } else {
                pjs.system.exitFullScreen();
                pjs.system.initFullPage();
                camera.setPositionC(point(cameraPositionXCurrent, cameraPositionYCurrent));
            }
        }



        if (key.isDown("R")) {
            backGroundMusic.stop();
            game.setLoop('pause');
            return;
        }

        let staticBox = camera.getStaticBox();
         x = staticBox.x;
         y = staticBox.y;
         h = staticBox.h;

         if(staticBox.y+ staticBox.h>1300){
             screenState = true;
             cameraPositionYCurrent = cameraPositionYCurrent -60;
             camera.setPositionC(point( cameraPositionXCurrent,cameraPositionYCurrent));
         }

        if (staticBox.x > 0 && (staticBox.x + staticBox.w) < 2550 && staticBox.y > 0  && (staticBox.y+ staticBox.h) < 1190) {
            camera.setPositionC(personAnimation.getPositionC());
        }

        camPos = camera.getPositionC();

        if((staticBox.x + staticBox.w) >= 2550 && staticBox.y <= 0) {
            camera.setPositionC({ x: camPos.x, y: camPos.y });
            if (personAnimation.getPositionC().y > camPos.y) {
                camera.setPositionC({ x: camPos.x, y: personAnimation.getPositionC().y });
            } else   if (personAnimation.getPositionC().x < camPos.x) {
                camera.setPositionC({ x: personAnimation.getPositionC().x, y: camPos.y});
            }

        }else if((staticBox.x + staticBox.w) >= 2550 && (staticBox.y+ staticBox.h) >= 1190) {
            camera.setPositionC({ x: camPos.x, y: camPos.y });
            if (personAnimation.getPositionC().y < camPos.y) {
                camera.setPositionC({ x: camPos.x, y: personAnimation.getPositionC().y });
            } else   if (personAnimation.getPositionC().x < camPos.x) {
                camera.setPositionC({ x: personAnimation.getPositionC().x, y: camPos.y});
            }

        } else if(staticBox.x <= 0 && staticBox.y <= 0) {
            camera.setPositionC({ x: camPos.x, y: camPos.y });
            // console.log(cameraPositionXCurrent ,cameraPositionXCurrent);
            if (personAnimation.getPositionC().y > camPos.y) {
                camera.setPositionC({ x: camPos.x, y: personAnimation.getPositionC().y });
            } else   if (personAnimation.getPositionC().x > camPos.x) {
                camera.setPositionC({ x: personAnimation.getPositionC().x, y: camPos.y});
            }
        }else if(staticBox.x <= 0 && (staticBox.y+ staticBox.h) >= 1190) {
            camera.setPositionC({ x: camPos.x, y: camPos.y });
            if (personAnimation.getPositionC().y < camPos.y) {
                camera.setPositionC({ x: camPos.x, y: personAnimation.getPositionC().y });
            } else   if (personAnimation.getPositionC().x > camPos.x) {
                camera.setPositionC({ x: personAnimation.getPositionC().x, y: camPos.y});
            }
        } else if (staticBox.x <= 0) {
            camera.setPositionC({ x: camPos.x, y: personAnimation.getPositionC().y });
            if (personAnimation.getPositionC().x > camPos.x) {
                camera.setPositionC(personAnimation.getPositionC());
            }
        } else if ((staticBox.x + staticBox.w) >= 2550) {
            camera.setPositionC({ x: camPos.x, y: personAnimation.getPositionC().y });
            if (personAnimation.getPositionC().x < camPos.x) {
                camera.setPositionC(personAnimation.getPositionC());
            }
        } else if (staticBox.y <= 0) {
            camera.setPositionC({ x: personAnimation.getPositionC().x, y: camPos.y});
            if (personAnimation.getPositionC().y > camPos.y) {
                camera.setPositionC(personAnimation.getPositionC());
            }
        } else if ((staticBox.y+ staticBox.h) >= 1190) {
            camera.setPositionC({ x: personAnimation.getPositionC().x, y: camPos.y});
            if (personAnimation.getPositionC().y < camPos.y) {
                camera.setPositionC(personAnimation.getPositionC());
            }
        }

        camPos = camera.getPositionC();

        cameraPositionXCurrent = camPos.x;
        cameraPositionYCurrent = camPos.y;

        x= cameraPositionXCurrent;
        y =cameraPositionYCurrent;

        pjs.brush.drawText({
            text: 'HEALTH : ' + (personAnimation.healthPepcent).toFixed() + '%',
            x: camPos.x + 400, y: camPos.y - 450,
            size: 30,
            color: "#FF2400"
        });

        pjs.brush.drawText({
            text: 'SCORE : ' + personAnimation.score,
            x: camPos.x + 400, y: camPos.y - 350,
            size: 30,
            color: "#FF2400"
        });

        pjs.brush.drawRect({
            x: camPos.x + 400, y: camPos.y - 400,
            w: 200, h: 30,
            strokeColor: "white",
            strokeWidth: 2
        });

        pjs.brush.drawRect({
            x: camPos.x + 400, y: camPos.y - 250,
            w: 200, h: 30,
            fillColor : "grey"
        });

        pjs.brush.drawRect({
            x: camPos.x + 401, y: camPos.y - 399,
            w: personAnimation.health, h: 30,
            fillColor: "#FF2400"
        });

        pjs.brush.drawText({
            text: 'Your key to salvation: ' + zombies.length,
            x: camPos.x + 400, y: camPos.y - 300,
            size: 30,
            color: "#ff5340"
        });

        pjs.brush.drawText({
            text:  Bullets.count,
            x: camPos.x + 550, y: camPos.y -250,
            size: 30,
            color: "#ff5340"
        });

        pjs.brush.drawImage({
            file: "./image/bullet.png",
            x: camPos.x + 410, y: camPos.y -245,
        });

    };

    this.entry = function () {

        camera.setPositionC(point( cameraPositionXCurrent,cameraPositionYCurrent));

        heartTimer.start();
        crystalTimer.start();

        // saveTimer.start();

        pjs.system.setStyle({
            background: 'url(./image/texture.jpg) center no-repeat',
            backgroundSize: 'cover',
        });
        let body = document.getElementById('main');
        let fullScreen = document.getElementsByClassName('fullScreen')[0];
        let gameStart = document.getElementsByClassName('wrapper')[0];
        if (fullScreen) {
            body.removeChild(fullScreen);
        }
        if (gameStart) {
            body.removeChild(gameStart);
        }

        let pause_menu = document.getElementById('pause');
        let dead_menu = document.getElementById('dead');
        if (dead_menu) {
            body.removeChild(dead_menu);
            personAnimation.diad = false;

        }
        if (pause_menu) {
            body.removeChild(pause_menu);
        }
        let fullScreenWrapper = document.getElementsByClassName('fullScreenWrapper')[0];
        if (fullScreenWrapper) {
            body.removeChild(fullScreenWrapper);
        }
         if(checkPoint && !restartFlag ){
             pjs.OOP.clearArr(zombies);
             personAnimation.setPosition( personPosition);
             gun.setPosition(personPosition);
             Bullets.count = bullet ;
             personAnimation.health = health ;
             personAnimation.healthPepcent = healthPepcent;
             personAnimation.score  = score;
             personAnimation.zombieKilledCount = zombieKilledCount;
             camera.moveTimeC(point(cameraPositionXCurrent,cameraPositionYCurrent),50);
             checkPoint = false;
             personAnimation.diad = false;
             saveTime = 0;
             gamingMessage.alpha = 1;
         }

        if (restartFlag) {
            pjs.OOP.clearArr(zombies);
            pjs.OOP.clearArr(Bullets);
            pjs.OOP.clearArr(hearts);
            pjs.OOP.clearArr(cryltals);
            Bullets.count =20;
            personAnimation.health = 200;
            personAnimation.healthPepcent = 100;
            personAnimation.score = 0;
            personAnimation.zombieKilledCount =0;
            personAnimation.x = width / 2 - personAnimation.w / 2;
            personAnimation.y = height / 2 - personAnimation.h / 2;
            gun.x = width / 2 - gun.w / 2;
            gun.y = height / 2 - gun.h / 2;
            restartFlag = false;
            checkPoint = false;
            saveTime = 0;
            gamingMessage.alpha = 1;
        }

        if (fullScreenFlag) {
            pjs.system.initFullScreen();
            fullScreenFlag = false;
        }


        this.exit = function () {

        };

    }
});


    game.newLoopFromConstructor('hasdied', function () {

        this.update = function () {

        };

        this.entry = function () {

            pjs.system.setStyle({
                background: 'url(./image/backgroundGaming.jpg)  center no-repeat ',
                backgroundSize: 'cover'
            });

            let div = pjs.system.newDOM('div', true);
            div.setAttribute('id', 'dead');
            div.innerHTML =
                '<div class ="menu-wrapper">' +
                '<div class="score"></div>' +
                '<h1>Game Over</h1> ' +
                '<div class="settings" onclick="restart();">Restart</div>' +
                '<div class="settings" onclick="game.setLoop(\'myGame\');">CheckPoint</div>'+
                '<div class="settings" onclick="game.setLoop(\'gameStart\');">Exit</div>' +
                '</div>';

            let score = document.getElementsByClassName('score')[0];
            score.innerHTML = 'Zombies have been killed:' + personAnimation.zombieKilledCount;

        };

        this.exit = function () {

        };
    });


    game.newLoopFromConstructor('pause', function () {

        this.update = function () {

            camera.setPositionC(point( cameraPositionXCurrent,cameraPositionYCurrent));
        };

        this.entry = function () {

            pjs.system.setStyle({
                background: 'url(./image/backgroundGaming.jpg)  center no-repeat ',
                backgroundSize: 'cover'
            });

            let div = pjs.system.newDOM('div', true);
            div.setAttribute('id', 'pause');
            div.innerHTML =
                '<div class ="menu-wrapper">' +
                '<h1>Game Zombie Mode</h1> ' +
                '<div class="play" onclick="game.setLoop(\'myGame\');">Continue</div>' +
                '<div class="settings" onclick="restart();">Restart</div>' +
                '</div>';

            let wrapper = pjs.system.newDOM('div');
            wrapper.setAttribute('style', 'z-index:200001');
            wrapper.setAttribute('class', 'fullScreenWrapper');
            wrapper.innerHTML = '<div class="fullScreenFromPause" onclick="fullScreen()"> Full Screen</div>';
        };

        this.exit = function () {

        };

    });

    game.newLoopFromConstructor('winner', function () {

        this.update = function () {

        };

        this.entry = function () {

            pjs.system.setStyle({
                background: 'url(./image/winner.gif) center no-repeat',
                backgroundSize: 'cover',
            });

            let div = pjs.system.newDOM('div', true);
            div.setAttribute('id', 'winner');
            div.innerHTML =
                '<div class ="menu-wrapper">' +
                '<h1>You saved zombies </h1> ' +
                '<div class="settings" onclick="game.setLoop(\'gameStart\');">Exit</div>' +
                '</div>';

        };

        this.exit = function () {

        };

    });


    game.newLoopFromConstructor('delay', function () {


        let time = 3;

        let timer = pjs.OOP.newTimer(1000, function () {
            time--;
        });

        let gamingSlogan = game.newTextObject({
            x: game.getWH2().w - 150,
            y: game.getWH2().h - 50,
            text: "Survive",
            size: 100,
            color: "#8b0d27",
            alpha: 0,
        });

        this.update = function () {

            timer.restart();

            if (time <= 0 && time !== -6) {
                gamingSlogan.draw();
                gamingSlogan.x = game.getWH2().w - 150;
                gamingSlogan.y = game.getWH2().h - 50;
                gamingSlogan.transparent(0.005);
            }

            if (time === -6) {
                game.setLoop('myGame');
            }
            if (time > 0) {
                pjs.brush.drawText({
                    text: time,
                    x: game.getWH2().w,
                    y: game.getWH2().h - 50,
                    color: "red",
                    size: 100,
                });
            }


        };

        this.entry = function () {

            pjs.system.setStyle({
                background: 'url(./image/backgroundGaming.jpg) center no-repeat',
                backgroundSize: 'cover',
            });
            gamingSlogan.alpha = 0;
            time = 3;
            timer.start();

            let body = document.getElementById('main');
            let fullScreen = document.getElementsByClassName('fullScreen')[0];
            let gameStart = document.getElementsByClassName('wrapper')[0];
            if (fullScreen) {
                body.removeChild(fullScreen);
            }
            if (gameStart) {
                body.removeChild(gameStart);
            }
        };

        this.exit = function () {

        };
    });

    function landingPage() {
        window.location = "https://konstantinup.github.io/about/index.html";
    }

    game.newLoopFromConstructor('gameStart', function () {


        this.update = function () {


            let isFullScreen = pjs.system.isFullScreen();

            if (isFullScreen) {
                document.getElementsByClassName('fa-expand')[0].setAttribute('style', 'display:none');
            }

            if (key.isDown('TAB') && isFullScreen) {
                pjs.system.exitFullScreen();
                document.getElementsByClassName('fa-expand')[0].setAttribute('style', 'display:block');
            }
        };

        this.entry = function () {
            pjs.system.setStyle({
                            background: 'url(./image/start-game.jpg)  center no-repeat ',
                            backgroundSize: 'cover'
                        });

            let body = document.getElementById('main');
            let dead_menu = document.getElementById('dead');
            let winner_menu = document.getElementById('winner');
            if (dead_menu || winner_menu) {
                if (dead_menu) {
                    body.removeChild(dead_menu);
                }
                if (winner_menu) {
                    body.removeChild(winner_menu);
                }
                personAnimation.diad = false;
                restartFlag = true;
                pjs.system.setStyle({
                    background: 'url(./image/start-game.jpg) ',
                });
            }

            let fullScreen = pjs.system.newDOM('div');
            fullScreen.className = 'fullScreen';
            fullScreen.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i>';
            fullScreen.onclick = function () {
                pjs.system.initFullScreen();
            };

            let div = pjs.system.newDOM('div', true);
            div.className = 'wrapper';
            div.innerHTML =
                '<div class ="menu-wrapper">' +
                '<h1>Game Zombie Mode</h1> ' +
                '<div class="play" onclick="game.setLoop(\'delay\');">PLAY</div>' +
                '<div class ="about" onclick="landingPage()">About</div>' +
                '</div>';


        };

        this.exit = function () {
        };

    });


    game.startLoop('gameStart');
