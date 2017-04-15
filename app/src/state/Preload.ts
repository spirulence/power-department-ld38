export class Preload extends Phaser.State {
    private preloadBar: Phaser.Sprite;

    preload() {
        this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
        this.load.setPreloadSprite(this.preloadBar);

        this.load.tilemap("map1", "assets/map1.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("tileset", "assets/tileset.png");

        this.load.spritesheet('buttons', 'assets/buttons.png', 32, 32);
    }

    create() {
        this.game.state.start('main');
    }
}
