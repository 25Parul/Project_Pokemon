const pokemons = {
    Amby: {
        position: {
            x: 460,
            y: 500
        },
        image: {
            src: './images/AmbySprite.png'
        },
        frames: {
            max: 4,
            hold: 30
        },
        animate: true,
        isEnemy: false,
        name: 'Amby',
        attacks: [attacks.Tackle, attacks.FireBall]
    },
    Dragon: {
        position: {
            x: 1200,
            y: 180
        },
        image: {
            src: './images/DragonSprite.png'
        },
        frames: {
            max: 4,
            hold: 30
        },
        animate: true,
        isEnemy: true,
        name: 'Dragon',
        attacks: [attacks.Tackle, attacks.FireBall]
    }
}