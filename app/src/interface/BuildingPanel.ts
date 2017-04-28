const enum ButtonImages {
    NewTransmissionLine = 0,
    NewPlant = 2,
    NewSubstation = 4,
    AddDistributionNetwork = 6
}

export class BuildingPanel{
    public group: Phaser.Group;

    private game: Phaser.Game;
    private openPosition: number;
    private closedPosition: number;
    private openTime: number;

    constructor(_slickUI: any, game: Phaser.Game){
        this.openTime = 250;
        this.openPosition = 864;
        this.closedPosition = 1000 - 32;

        this.game = game;
        this.group = game.add.group();

        this.group.position.set(0, 0);

        this.group.add(this.makePanel(ButtonImages.NewPlant, "generator_panel", 10));
        this.group.add(this.makePanel(ButtonImages.NewSubstation, "substation_panel", 50));
        this.group.add(this.makePanel(ButtonImages.NewTransmissionLine, "line_panel", 90));
    }

    private makePanel(buttonImage: number, panel_key: string, y: number) {
        let group = this.game.add.group();
        group.position.set(this.closedPosition, y);
        group.add(this.game.add.image(0, 0, panel_key));

        group.add(this.game.add.button(0, 0,
            "buttons",
            function(this: BuildingPanel){
               let tween = this.game.add.tween(group);
               let newX = group.position.x == this.closedPosition ? this.openPosition : this.closedPosition;
               tween.to({x: newX}, this.openTime);
               tween.start();
            }, this,
            buttonImage + 1, buttonImage, buttonImage, buttonImage));

        return group;
    }
}
