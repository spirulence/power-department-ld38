export class Preload extends Phaser.State {
    private preloadBar: Phaser.Sprite;
    private slickUI: Phaser.Plugin.SlickUI;

    preload() {
        this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
        this.load.setPreloadSprite(this.preloadBar);

        this.load.tilemap("map1", "assets/rural-1.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap("map2", "assets/delta-2.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap("map3", "assets/islands-3.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap("map4", "assets/icy-4.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("tileset", "assets/tileset.png");
        this.load.image("rural-1.png", "assets/rural-1.png");
        this.load.image("delta-2.png", "assets/delta-2.png");

        this.load.spritesheet('buttons', 'assets/buttons.png', 32, 32);

        this.slickUI = this.game.plugins.add(Phaser.Plugin.SlickUI);
        this.slickUI.load("assets/kenney-theme/kenney.json");

        this.load.audio("main_menu_music", "assets/power_main_menu_01.mp3");
        this.load.image("logo", "assets/logo.png");

        this.load.json("setup_text", "assets/gametext-setup.json");
        this.load.audio("setup_music", "assets/power_department_setup.mp3");

        this.load.audio("main_music_01", "assets/audio/power_department_01.mp3");
        this.load.audio("main_music_02", "assets/audio/pd_chugging.mp3");
        this.load.audio("main_music_03", "assets/audio/pd_slow_it_down.mp3");

        this.load.image("game_over", "assets/game_over.png");
        this.load.image("you_win", "assets/you_win.png");
    }

    create() {
        this.preloadBar.destroy();
        this.game.state.start('setup', false, false, this.slickUI);
    }
}
