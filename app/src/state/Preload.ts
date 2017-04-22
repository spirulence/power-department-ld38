export class Preload extends Phaser.State {
    private preloadBar: Phaser.Sprite;
    private slickUI: Phaser.Plugin.SlickUI;

    preload() {
        this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
        this.load.setPreloadSprite(this.preloadBar);

        this.load.tilemap("map1", "assets/map1.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("tileset", "assets/tileset.png");

        this.load.spritesheet('buttons', 'assets/buttons.png', 32, 32);

        this.slickUI = this.game.plugins.add(Phaser.Plugin.SlickUI);
        this.slickUI.load("assets/kenney-theme/kenney.json");

        this.load.audio("main_menu_music", "assets/power_main_menu_01.mp3");
        this.load.image("logo", "assets/logo.png");

        this.load.json("setup_text", "assets/gametext-setup.json");
        this.load.audio("setup_music", "assets/power_department_setup.mp3");

        this.load.audio("main_music_01", "assets/power_department_01.mp3");
    }

    create() {
        this.preloadBar.destroy();
        this.game.state.start('main_menu', false, false, this.slickUI);
    }
}
