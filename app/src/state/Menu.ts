export class Menu extends Phaser.State {
    private slickUI: any;
    private music: Phaser.Sound;
    private panel: SlickUI.Element.Panel;
    private logo: Phaser.Image;

    init(slickUI: any){
        this.slickUI = slickUI;
    }

    create() {
        this.music = this.add.audio("main_menu_music");
        this.music.loopFull(0.3);
        this.logo = this.add.image(0, 0, "logo");

        let panel = new SlickUI.Element.Panel(430, 400, 140, 110);
        this.slickUI.add(panel);
        this.panel = panel;

        let newGameButton = new SlickUI.Element.Button(0,0, 140, 50);
        panel.add(newGameButton);
        newGameButton.add(new SlickUI.Element.Text(0,0, "New Game")).center();
        newGameButton.events.onInputUp.add(this.newGame.bind(this));

        // let loadGameButton = new SlickUI.Element.Button(0, 55, 140, 50);
        // panel.add(loadGameButton);
        // loadGameButton.add(new SlickUI.Element.Text(0,0, "Load Game")).center();
        // loadGameButton.events.onInputUp.add(function () {console.log('Clicked button');});
    }

    private newGame(){
        this.panel.container.displayGroup.removeAll();
        this.logo.destroy();
        this.music.destroy();
        this.game.state.start("setup", false, false, this.slickUI);
    }

    update(){

    }
}