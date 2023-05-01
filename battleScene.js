// Import battleground image
const battleBackgroundImage = new Image()
battleBackgroundImage.src = './images/battleBackground.png'

// Battleground sprite
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
})

// Pokemon1
let dragon
//Pokemon 2
let amby
// Array for all the sprites which are being rendered like characters, attacks, etc
let renderedSprites
// Battle animation Id to help cancel the battle animation
let battleAnimationId
// Attack Queue
let attackQueue

// Initialize battle scene
let initBattle = () => {
    document.querySelector("#health_and_attack_bar_interface").style.display = 'block'
    document.querySelector("#dialogue_box").style.display = 'none'
    document.querySelector('#pokemon1_health_bar_full').style.width = '100%'
    document.querySelector('#pokemon2_health_bar_full').style.width = '100%'
    document.querySelector('#attacks_box').replaceChildren()

    dragon = new Pokemon(pokemons.Dragon)
    document.querySelector('#pokemon2_health_txt').innerHTML = pokemons.Dragon.name
    amby = new Pokemon(pokemons.Amby)
    document.querySelector('#pokemon1_health_txt').innerHTML = pokemons.Amby.name
    renderedSprites = [dragon, amby]
    attackQueue = []

    // Create buttons for all attacks for the pokemon
    amby.attacks.forEach((attack) => {
        const button = document.createElement('button')
        button.innerHTML = attack.name
        document.querySelector('#attacks_box').append(button)
    })

    // Event Listeners for attack
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (event) => {
            const selectedAttack = attacks[event.currentTarget.innerHTML]
            amby.attack({
                attack: selectedAttack,
                recipient: dragon,
                renderedSprites: renderedSprites
            })

            // When health is zero or less than zero, make dragon faint
            if (dragon.health <= 0) {
                attackQueue.push(() => {
                    dragon.faint()
                })

                attackQueue.push(() => {
                    // Fade back to black 
                    gsap.to('#battle_div', {
                        opacity: 1,
                        onComplete: () => {
                            // Cancel battle animation
                            window.cancelAnimationFrame(battleAnimationId)
                            // Start main island animation
                            animate()
                            // Fade all attack and health bar interface
                            document.querySelector('#health_and_attack_bar_interface').style.display = 'none'
                            gsap.to('#battle_div', {
                                opacity: 0
                            })

                            battle.initiated = false
                            audio.Map.play()
                        }
                    })
                })
            }

            // Randomize dragon/Enemy attacks
            const randomDragonAttack = dragon.attacks[Math.floor(Math.random() * dragon.attacks.length)]

            attackQueue.push(() => {
                dragon.attack({
                    attack: randomDragonAttack,
                    recipient: amby,
                    renderedSprites
                })

                if (amby.health <= 0) {
                    attackQueue.push(() => {
                        amby.faint()
                    })

                    attackQueue.push(() => {
                        // fade back to black
                        gsap.to('#battle_div', {
                            opacity: 1,
                            onComplete: () => {
                                // Cancel battle animation
                                window.cancelAnimationFrame(battleAnimationId)
                                // Start main island animation
                                animate()
                                // Fade all attack and health bar interface
                                document.querySelector('#health_and_attack_bar_interface').style.display = 'none'
                                gsap.to('#battle_div', {
                                    opacity: 0
                                })

                                battle.initiated = false
                                audio.Map.play()
                            }
                        })
                    })
                }
            })
        })

        button.addEventListener('mouseenter', (event) => {
            const selectedAttack = attacks[event.currentTarget.innerHTML]
            document.querySelector('#attack_type_txt').innerHTML = selectedAttack.type
            document.querySelector('#attack_type_txt').style.color = selectedAttack.color
        })
    })
}

let animateBattle = () => {
    battleAnimationId = window.requestAnimationFrame(animateBattle)
    console.log("animate battle")

    battleBackground.draw()

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    })
}

animate()
//initBattle()
//animateBattle()

// Event Listeners for dialogue box
document.querySelector('#dialogue_box').addEventListener('click', (event) => {
    if (attackQueue.length > 0) {
        attackQueue[0]() // Calling attack method passed in the attackQueue
        attackQueue.shift() // Delete that attack 
    } else {
        event.currentTarget.style.display = 'none'
    }
})