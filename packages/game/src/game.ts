import * as Phaser from 'phaser';
import Demo from './Demo';

const config = {
    type: Phaser.AUTO,
    //backgroundColor: '#125555',
    width: 800,
    height: 608,
    scene: Demo,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
