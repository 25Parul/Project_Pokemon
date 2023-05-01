const canvas = document.querySelector('canvas');
canvas.width = 1500
canvas.height = 800

const canvasContext = canvas.getContext('2d');


const collisionArea = []
for (let i = 0; i < collisionData.length; i += 70) {
    collisionArea.push(collisionData.slice(i, 70 + i))
}

const battleArea = []
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleArea.push(battleZonesData.slice(i, 70 + i))
}


const boundaries = []
const offset = {
    x: -940,
    y: -550
}

collisionArea.forEach((row, i) => {
    row.forEach((num, j) => {
        if (num === 1025)
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.pixel_width + offset.x,
                        y: i * Boundary.pixel_height + offset.y
                    }
                })
            )
    })
})


const battleZones = []

battleArea.forEach((row, i) => {
    row.forEach((num, j) => {
        if (num === 1025)
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.pixel_width + offset.x,
                        y: i * Boundary.pixel_height + offset.y
                    }
                })
            )
    })
})

console.log(battleZones)

const townImage = new Image()
townImage.src = "./images/Pokemon_Town.png"

const foregroundImage = new Image()
foregroundImage.src = "./images/foregroundObjects.png"

const playerDownImage = new Image()
playerDownImage.src = "./images/playerDown.png"

const playerUpImage = new Image()
playerUpImage.src = "./images/playerUp.png"

const playerLeftImage = new Image()
playerLeftImage.src = "./images/playerLeft.png"

const playerRightImage = new Image()
playerRightImage.src = "./images/playerRight.png"

/* This function draws the player image in front of the house door using the drawImage() method.
The first 4 parameters crop the image starting from (0,0) and the width and height of 1 character out of 4,
The second 4 parameters define the actual co-ordinates and size of the character on the canvas.
*/


/*To properly set the scene for the game. Load the town image, position it at the center of the house,
and draw it onto the canvas only after it has finished loading.
*/


townImage.onload = () => {
    canvasContext.drawImage(townImage, -940, -550);
}


// Ensure that the image of player is fully loaded before drawing it onto the canvas with playerDownImage.onload event.

playerDownImage.onload = () => {
    canvasContext.drawImage(playerDownImage, canvas.width / 2 - 180, canvas.height / 2 - 150);
    console.log(playerDownImage)
}


const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    }
})

console.log(player)

/*
To keep track of the player's current position. canvas.width/2 and canvas.height/2 center the character,
but 180px subtraction on x-axis and 150px on y-axis position the character in front of the door of house.


let playerXPos = canvas.width/2 - 180;
let playerYPos = canvas.height/2 - 150;

*/

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y,
    },
    image: townImage
});

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y,
    },
    image: foregroundImage
});


const keys = {
    ArrowDown: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}

const movingObjects = [background, ...boundaries, foreground, ...battleZones]

let squareCollision = ({
    sq1,
    sq2
}) => {
    return (
        sq1.position.x + sq1.width >= sq2.position.x &&
        sq1.position.x <= sq2.position.x + sq2.width &&
        sq1.position.y <= sq2.position.y + sq2.height &&
        sq1.position.y + sq1.height >= sq2.position.y
    )
}

const battle = {
    initiated: false
}

let animate = () => {
    const animationId = window.requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach(boundary => {
        boundary.draw()
    })

    battleZones.forEach(battleZone => {
        battleZone.draw()
    })

    player.draw()
    foreground.draw();

    let moving = true;
    player.animate = false
    if (battle.initiated) return

    // Activate a battle
    if (keys.ArrowUp.pressed || keys.ArrowDown.pressed || keys.ArrowRight.pressed || keys.ArrowLeft.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea =
                (Math.min(
                        player.position.x + player.width,
                        battleZone.position.x + battleZone.width
                    ) -
                    Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(
                        player.position.y + player.height,
                        battleZone.position.y + battleZone.height
                    ) -
                    Math.max(player.position.y, battleZone.position.y))
            if (squareCollision({
                    sq1: player,
                    sq2: battleZone
                }) && overlappingArea > (player.width * player.height) / 2
                   && Math.random() < 0.05
                ) {
                console.log("Activate battle")
                // Deactivate current animation loop
                window.cancelAnimationFrame(animationId)

                audio.Map.stop()
                audio.initBattle.play()
                audio.battle.play()

                battle.initiated = true
                gsap.to("#battle_div", {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to("#battle_div", {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                // Activate a new animation loop
                                initBattle()
                                animateBattle()
                                gsap.to("#battle_div", {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })
                    }
                })
                break;
            }
        }
    }


    if (keys.ArrowUp.pressed && lastkey === "ArrowUp") {
        player.animate = true
        player.image = player.sprites.up

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (squareCollision({
                    sq1: player,
                    sq2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 3
                        }
                    }
                })) {
                moving = false
                break;
            }
        }

        if (moving)
            movingObjects.forEach((object) => {
                object.position.y += 3
            })
    } else if (keys.ArrowDown.pressed && lastkey === "ArrowDown") {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                squareCollision({
                    sq1: player,
                    sq2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3

                        }
                    }
                })
            )

            {
                console.log("colliding")
                moving = false
                break;
            }

        }

        if (moving)
            movingObjects.forEach((object) => {
                object.position.y -= 3
            })
    } else if (keys.ArrowLeft.pressed && lastkey === "ArrowLeft") {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                squareCollision({
                    sq1: player,
                    sq2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y

                        }
                    }
                })
            )

            {
                console.log("colliding")
                moving = false
                break;
            }

        }

        if (moving)
            movingObjects.forEach((object) => {
                object.position.x += 3
            })
    } else if (keys.ArrowRight.pressed && lastkey === "ArrowRight") {
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                squareCollision({
                    sq1: player,
                    sq2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 3,
                            y: boundary.position.y

                        }
                    }
                })
            )

            {
                console.log("colliding")
                moving = false
                break;
            }

        }

        if (moving)
            movingObjects.forEach((object) => {
                object.position.x -= 3
            })
    }
};

//animate() //(Stopping it for debugging)

let lastkey = " "
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowDown":
            keys.ArrowDown.pressed = true;
            lastkey = "ArrowDown"
            break;
        case "ArrowUp":
            keys.ArrowUp.pressed = true;
            lastkey = "ArrowUp"
            break;
        case "ArrowLeft":
            keys.ArrowLeft.pressed = true;
            lastkey = "ArrowLeft"
            break;
        case "ArrowRight":
            keys.ArrowRight.pressed = true;
            lastkey = "ArrowRight"
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "ArrowDown":
            keys.ArrowDown.pressed = false;
            break;
        case "ArrowUp":
            keys.ArrowUp.pressed = false;
            break;
        case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            break;
        case "ArrowRight":
            keys.ArrowRight.pressed = false;
            break;
    }
});

// Start music with first click : Chrome limitation
let clicked = false 
window.addEventListener('click', () => {
    if(!clicked) {
        audio.Map.play()
        clicked = true
    }
})