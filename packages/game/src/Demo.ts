import * as Phaser from 'phaser';


export default class Demo extends Phaser.Scene {
    bob: Phaser.Physics.Arcade.Sprite;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    moving: boolean = false;
    latestDirection: string | null = null;
    enterKeyListenerSet: boolean;

    constructor() {
        super('demo');
    }

    preload() {
        this.load.spritesheet('bob', 'assets/player/player.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('tiles', 'assets/motomon_exterior.png');
        this.load.tilemapTiledJSON('map', 'assets/map1.json');
    }

    create() {
        this.latestDirection = null;
        const map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
        const tileset = map.addTilesetImage('motomon_exterior', 'tiles');
        const ground = map.createLayer("Ground", tileset, 0, 0);
        const trees = map.createLayer("Trees", tileset, 0, 0);
        const house = map.createLayer("House", tileset, 0, 0);
        const houseSign = map.createLayer("House Sign", tileset, 0, 0);
        const grass = map.createLayer("Grass", tileset, 0, 0);


        this.bob = this.physics.add.sprite(400, 300, 'bob').setScale(0.5);
        this.bob.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.bob, trees);
        trees.setCollisionBetween(32, 40)
        this.physics.add.collider(this.bob, house);
        house.setCollisionBetween(9, 35)
        this.physics.add.collider(this.bob, houseSign);
        houseSign.setCollisionBetween(3, 4)
        this.physics.add.overlap(this.bob, houseSign, this.handleHouseSignOverlap, null, this);

        // Animations
        this.setupAnimations();

        this.enterKeyListenerSet = false;

    }

    handleHouseSignOverlap(player, sign) {
        // Only set the listener if it hasn't been set before
        if (!this.enterKeyListenerSet) {
            const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
            enterKey.on('down', () => {
                if (this.latestDirection === 'up') {
                    this.callAPI();
                }
            });
            this.enterKeyListenerSet = true;
        }
    }
    
    async callAPI() {
        try {
            const response = await fetch('http://localhost:3001/createMonster');
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Failed to call API:', error);
        }
    }
    

    setupAnimations() {
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('bob', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('bob', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('bob', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('bob', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: 0
        });
    }

    update() {
        this.handleMovement();
    }

    handleMovement() {
        const speed = 150;

        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown) {
            moveX = -speed;
            this.latestDirection = 'left';
        }
        if (this.cursors.right.isDown) {
            moveX = speed;
            this.latestDirection = 'right';
        }
        if (this.cursors.up.isDown) {
            moveY = -speed;
            this.latestDirection = 'up';
        }
        if (this.cursors.down.isDown) {
            moveY = speed;
            this.latestDirection = 'down';
        }

        // Prevent diagonal movement by ensuring only the latest direction takes effect.
        if (moveX !== 0) {
            moveY = 0; // If moving horizontally, disable vertical movement
        }

        this.bob.setVelocity(moveX, moveY);

        if (this.latestDirection) {
            this.bob.play(this.latestDirection, true);
        } 
        // if no key is pressed, stop the animation
        if (!this.cursors.left.isDown && !this.cursors.right.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown){
            this.bob.anims.stop(); // Stop animation if no key is pressed
        }
    }
}
