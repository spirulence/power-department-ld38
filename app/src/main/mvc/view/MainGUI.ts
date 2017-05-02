import {OpenablePanel} from "./OpenablePanel";
import {ToggleTogether} from "./ToggleTogether";
import {OnlyOneOpen} from "./OnlyOneOpen";
import {MainSystems} from "../../ecs/MainSystems";
import {BuildModes} from "./BuildModes";
import {BoundTextLabel} from "../model/BoundTextLabel";

enum BuildingPanelButtons {
    NewTransmissionLine = 0,
    NewPlant = 2,
    NewSubstation = 4
}

export class MainGUI{

    // private static readonly LEFT_TEXT_STYLE = {font: "13px monospace", fill: "#000", boundsAlignV:"bottom", boundsAlignH:"right"};
    private static readonly RIGHT_TEXT_STYLE = {font: "13px monospace", fill: "#000", boundsAlignV:"bottom", boundsAlignH:"left"};
    private game: Phaser.Game;
    private systems: MainSystems;
    private buildMode: BuildModes;
    private lowerRightPanel: OpenablePanel;

    constructor(game: Phaser.Game, systems: MainSystems){
        this.game = game;
        this.systems = systems;

        this.setupLowerRightPanel();
        this.setupRightPanels();
    }

    private setupRightPanels(){
        this.buildMode = new BuildModes(this.systems, this.game);

        let newPlant = MainGUI.setupRightPanelPair(this.game, "Generator", [], BuildingPanelButtons.NewPlant, 0);
        newPlant.onOpen.add(function(this: MainGUI){
            this.buildMode.generatorMode();
            this.lowerRightPanel.open();
        }, this);
        newPlant.onClose.add(function(this: MainGUI){
            this.buildMode.close();
        }, this);

        let newSubstation = MainGUI.setupRightPanelPair(this.game, "Substation", [], BuildingPanelButtons.NewSubstation, 1);
        newSubstation.onOpen.add(function(this: MainGUI){
            this.buildMode.substationMode();
            this.lowerRightPanel.open();
        }, this);
        newSubstation.onClose.add(function(this: MainGUI){
            this.buildMode.close();
        }, this);

        let newLine = MainGUI.setupRightPanelPair(this.game, "Line", [], BuildingPanelButtons.NewTransmissionLine, 2);
        newLine.onOpen.add(function(this: MainGUI){
            this.buildMode.lineMode();
            this.lowerRightPanel.open();
        }, this);
        newLine.onClose.add(function(this: MainGUI){
            this.buildMode.close();
        }, this);

        new OnlyOneOpen([newPlant, newSubstation, newLine]).onAllClosed.add(function(this: MainGUI){
            this.lowerRightPanel.close();
        }, this);
    }

    static setupRightPanelPair(game: Phaser.Game, text: string, slots: PIXI.DisplayObject[], buttonImage: BuildingPanelButtons, yIndex: number){
        let bigGeneratorPanel = MainGUI.setupBigRightPanel(game, slots);
        let generatorButton = game.add.button(0, 0, "buttons", null, null, buttonImage + 1, buttonImage, buttonImage, buttonImage);
        let smallGeneratorPanel = MainGUI.setupSmallRightPanel(game, text, generatorButton, yIndex);
        return new ToggleTogether(smallGeneratorPanel, bigGeneratorPanel, generatorButton);
    }


    private static setupBigRightPanel(game: Phaser.Game, slots: PIXI.DisplayObject[]) {
        return new OpenablePanel({
            panelKey: "right-big-panel",

            // openPosition: {x: 1000 - 170, y: 144},
            openPosition: {x:1000, y:144},
            closedPosition: {x: 1000, y: 160},
            animationTime: 250,

            slots: slots,
            slotStart: {x:0, y:16},
            slotSpacing: {x:0, y:20}
        }, game);
    }

    private static setupSmallRightPanel(game: Phaser.Game, text: string, button: Phaser.Button, yIndex: number) {
        let closedPosition = new Phaser.Point(1000-32, 16 + yIndex * 32);
        let openPosition = new Phaser.Point(864, 16 + yIndex * 32);

        let smallPanelGroup = game.add.group();
        smallPanelGroup.add(button);
        let textElement = game.add.text(0,0,text, MainGUI.RIGHT_TEXT_STYLE, smallPanelGroup);
        textElement.setTextBounds(35, 0, 102, 32);

        return new OpenablePanel({
            panelKey: "right-small-panel",

            openPosition: openPosition,
            closedPosition: closedPosition,
            animationTime: 250,

            slots: [smallPanelGroup],
            slotStart: {x: 0, y: 0},
            slotSpacing: {x: 0, y: 0}
        }, game);
    }

    private setupLowerRightPanel() {
        this.lowerRightPanel = new OpenablePanel({
            panelKey: "lower-panel",

            openPosition: {x:823, y:500},
            closedPosition: {x:850, y:625},
            animationTime: 250,

            slots: [
                new BoundTextLabel(this.game, "materials:", 120, this.systems.speculativeCost.materials, 100).group,
                new BoundTextLabel(this.game, "land:", 120, this.systems.speculativeCost.land, 100).group,
                new BoundTextLabel(this.game, "workers:", 120, this.systems.speculativeCost.workers, 100).group,
                new BoundTextLabel(this.game, "power loss:", 120, this.systems.speculativeCost.powerLoss, 100).group,
            ],
            slotStart: {x:5, y:20},
            slotSpacing: {x:0, y:20}
        },this.game);
    }
}