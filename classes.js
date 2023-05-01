// Default Sprite class
class Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = {
            max: 1,
            hold: 10
        },
        sprites,
        animate = false,
        rotation = 0
    }) {
        this.position = position
        this.image = new Image()
        this.frames = {
            ...frames,
            val: 0,
            elapsed: 0
        }        
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
            console.log('sprite width ' + this.width)
            console.log('sprite height ' + this.height)
        }
        this.image.src = image.src

        this.animate = animate
        this.sprites = sprites
        this.opacity = 1

        this.rotation = rotation
    }

    draw() {
        canvasContext.save()
        canvasContext.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        )
        canvasContext.rotate(this.rotation)
        canvasContext.translate(
            -this.position.x - this.width / 2,
            -this.position.y - this.height / 2
        )
        canvasContext.globalAlpha = this.opacity
        canvasContext.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height,
        );
        canvasContext.restore()

        if (!this.animate) return

        if (this.frames.max > 1) {
            this.frames.elapsed++
        }

        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1)
                this.frames.val++
            else this.frames.val = 0
        }
    }

}

// Sprite class for pokemon
class Pokemon extends Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = {
            max: 1,
            hold: 10
        },
        sprites,
        animate = false,
        rotation = 0,
        isEnemy = false,
        name,
        attacks
    }) {
        super({
            position,
            velocity,
            image,
            frames,
            sprites,
            animate,
            rotation
        })
        this.health = 100
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
    }

    faint() {
        document.querySelector('#dialogue_box').style.display = 'block';
        document.querySelector('#dialogue_box').innerHTML = this.name + ' fainted!'
        gsap.to(this.position, {
            yoyo: true,
            duration: 0.8,
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop()
        audio.victory.play()
    }

    // Attack Method 
    attack({
        attack,
        recipient,
        renderedSprites
    }) {
        document.querySelector('#dialogue_box').style.display = 'block';
        document.querySelector('#dialogue_box').innerHTML = this.name + ' used ' + attack.name

        // Fetch health bar div for enemy
        let healthBar = '#pokemon2_health_bar_full'
        if (this.isEnemy) {
            healthBar = '#pokemon1_health_bar_full'
        }

        recipient.health = recipient.health - attack.damage //(Health - damage to update health bar div)

        let rotation = 1
        if (this.isEnemy) {
            rotation = -2.2 // Adjust rotation coming from enemy
        }

        switch (attack.name) {

            case 'FireBall':
                // Play Fireball sound
                audio.initFireball.play()
                // Loading fireball image required for the attack
                const fireballImage = new Image()
                fireballImage.src = "./images/fireball.png";
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation: rotation
                })
                // Push it to rendered sprites array to be animate in the animation method
                // Need to push fireball sprite before recipient image
                renderedSprites.splice(1, 0, fireball)

                // Move fireball animated object to enemy position for fireball attack
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        // Play fireball hitting enemy sounds
                        audio.fireballHit.play()
                        // Recipient gets hit with the attack 
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        // Recipient gettings hits and moving its position
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        })
                        // Recipient gettings hits and changing its opacity back and forth to give getting hit effect
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        renderedSprites.splice(1, 1) // Remove the fireball sprite after fireball animation is complete
                    }
                })
                break;

            case 'Tackle':
                // Adding gsap timeline property to perform animate in a timeline and then reset to original state
                const timeline = gsap.timeline()

                let movingDistance = 20
                if (this.isEnemy) {
                    movingDistance = -20
                }

                // Moving attacker by moving its position to illusion of tackle
                timeline.to(this.position, {
                    x: this.position.x - movingDistance
                }).to(this.position, {
                    x: this.position.x + movingDistance * 2,
                    duration: 0.1, // Complete animation in 0.1 seconds
                    onComplete: () => {
                        // Play tackle hit sound
                        audio.tackleHit.play()
                        // Recipient gets hit with the attack 
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        // Recipient gettings hits and moving its position
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        })
                        // Recipient gettings hits and changing its opacity back and forth to give getting hit effect
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
        }
    }

}

// Boundary class
class Boundary {
    static pixel_width = 48;
    static pixel_height = 48;
    constructor({
        position
    }) {
        this.position = position;
        this.width = 48;
        this.height = 48;
    }

    draw() {
        canvasContext.fillStyle = 'rgba(255, 0, 0, 0)';
        canvasContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}