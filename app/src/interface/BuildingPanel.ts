import {Builder} from "../mainstate/Builders";

export const enum BuildingPanelButtons {
    NewPlant = 2,
    NewSubstation = 4
}

class IndividualPanel{
    public isOpen: boolean;
    public confirmation: {yes: Phaser.Button, no: Phaser.Button};

    private openPosition: number;
    private closedPosition: number;
    private moveTime: number;
    private toClose: IndividualPanel[];
    private aboveGroup: Phaser.Group;
    private belowGroup: Phaser.Group;
    private game: Phaser.Game;
    private builder: Builder;
    private landCost: Phaser.Text;
    private materialsCost: Phaser.Text;
    private workersCost: Phaser.Text;
    private fuelCost: Phaser.Text;
    private upkeepCost: Phaser.Text;


    constructor(game: Phaser.Game, parent: Phaser.Group, buttonImage: number, panel_key: string, y: number, builders: {[id:string]: Builder}) {
        this.moveTime = 250;
        this.openPosition = 864;
        this.closedPosition = 1000 - 32;
        this.game = game;
        this.toClose = [];

        this.isOpen = false;
        this.builder = builders[panel_key];
        this.builder.onChange(this.onChange.bind(this));
        this.builder.onReady(this.onReady.bind(this));

        let group = game.add.group(parent);
        group.position.set(this.closedPosition, 0);
        group.add(game.add.image(0, y, panel_key));
        this.aboveGroup = group;

        let belowPanelGroup = game.add.group(parent);
        belowPanelGroup.position.set(1000, 140);
        belowPanelGroup.add(game.add.image(0, 0, "generator_panel_below"));
        this.belowGroup = belowPanelGroup;

        let style = {font: "20px monospace", fill: "#000", boundsAlignV:"bottom", boundsAlignH:"right"};

        this.materialsCost = new Phaser.Text(game, 12, 49, "", style);
        this.belowGroup.add(this.materialsCost);
        this.landCost = new Phaser.Text(game, 12, 49+32, "", style);
        this.belowGroup.add(this.landCost);
        this.workersCost = new Phaser.Text(game, 12, 49+64, "", style);
        this.belowGroup.add(this.workersCost);

        this.fuelCost = new Phaser.Text(game, 12, 189, "", style);
        this.belowGroup.add(this.fuelCost);
        this.upkeepCost = new Phaser.Text(game, 12, 189+32, "", style);
        this.belowGroup.add(this.upkeepCost);

        group.add(game.add.button(0, y,
            "buttons",
            function(this: IndividualPanel){
                if(this.isOpen){
                    this.close();
                }else{
                    this.open();
                }
            }, this,
            buttonImage + 1, buttonImage, buttonImage, buttonImage));
    }

    onChange(){
        this.landCost.text = this.builder.landCost.toString(10);
        this.materialsCost.text = this.builder.materialsCost.toString(10);
        this.workersCost.text = this.builder.workersCost.toString(10);

        this.fuelCost.text = this.builder.fuelCost.toString(10);
        this.upkeepCost.text = this.builder.upkeepCost.toString(10);
    }

    onReady(){
        this.builder.setupConfirmation(this.confirmation);
    }

    public closeOtherOnOpen(other: IndividualPanel){
        this.toClose.push(other);
    }

    private closeOthers(){
        for(let panel of this.toClose){
            panel.close();
        }
    }

    close() {
        let tween = this.game.add.tween(this.aboveGroup);
        let newX = this.closedPosition;
        tween.to({x: newX}, this.moveTime, Phaser.Easing.Quadratic.InOut);
        tween.start();

        let tweenBottom = this.game.add.tween(this.belowGroup);
        newX = 1000;
        tweenBottom.to({x: newX}, this.moveTime, Phaser.Easing.Quadratic.InOut);
        tweenBottom.start();

        this.isOpen = false;
        this.builder.close();
    }

    open(){
        let tween = this.game.add.tween(this.aboveGroup);
        let newX = this.openPosition;
        tween.to({x: newX}, this.moveTime, Phaser.Easing.Quadratic.InOut);
        tween.start();

        let tweenBottom = this.game.add.tween(this.belowGroup);
        newX = this.openPosition - 32;
        tweenBottom.to({x: newX}, this.moveTime, Phaser.Easing.Quadratic.InOut);
        tweenBottom.start();

        this.isOpen = true;
        this.closeOthers();
        this.builder.open();
    }
}

export class BuildingPanel{
    public group: Phaser.Group;

    private game: Phaser.Game;
    private affirmative: Phaser.Button;
    private negative: Phaser.Button;

    constructor(game: Phaser.Game, builders: {[id:string]: Builder}){

        this.game = game;
        this.group = game.add.group();

        this.group.position.set(0, 0);

        let generator = new IndividualPanel(game, this.group, BuildingPanelButtons.NewPlant, "generator_panel", 10, builders);
        let substation = new IndividualPanel(game, this.group, BuildingPanelButtons.NewSubstation, "substation_panel", 50, builders);
        // let line = new IndividualPanel(game, this.group, BuildingPanelButtons.NewTransmissionLine, "line_panel", 90, builders);

        generator.closeOtherOnOpen(substation);
        // generator.closeOtherOnOpen(line);
        //
        substation.closeOtherOnOpen(generator);
        // substation.closeOtherOnOpen(line);
        //
        // line.closeOtherOnOpen(generator);
        // line.closeOtherOnOpen(substation);

        this.affirmative = game.add.button(100, 100,
            "buttons",
            null, null,
            9, 8, 8, 8, this.group
        );
        this.affirmative.visible = false;
        this.negative = game.add.button(100, 200,
            "buttons",
            null, null,
            11, 10, 10, 10, this.group
        );
        this.negative.visible = false;

        let confirmationButtons = {yes: this.affirmative, no: this.negative};
        generator.confirmation = confirmationButtons;
        substation.confirmation = confirmationButtons;
    }
}
