import {OpenablePanel} from "./OpenablePanel";
import {ToggleTogether} from "./ToggleTogether";
import {OnlyOneOpen} from "./OnlyOneOpen";
import {MainSystems} from "../../ecs/MainSystems";

enum BuildingPanelButtons {
    NewTransmissionLine = 0,
    NewPlant = 2,
    NewSubstation = 4
}

export class MainGUI{

    // private static readonly LEFT_TEXT_STYLE = {font: "15px monospace", fill: "#000", boundsAlignV:"bottom", boundsAlignH:"right"};
    private static readonly RIGHT_TEXT_STYLE = {font: "15px monospace", fill: "#000", boundsAlignV:"bottom", boundsAlignH:"left"};
    private game: Phaser.Game;
    private systems: MainSystems;

    constructor(game: Phaser.Game, systems: MainSystems){
        this.game = game;
        this.systems = systems;

        this.setupRightPanels();
    }

    private setupRightPanels(){
        let newPlant = MainGUI.setupRightPanelPair(this.game, "Generator", [], BuildingPanelButtons.NewPlant, 0);
        let newSubstation = MainGUI.setupRightPanelPair(this.game, "Substation", [], BuildingPanelButtons.NewSubstation, 1);
        let newLine = MainGUI.setupRightPanelPair(this.game, "Line", [], BuildingPanelButtons.NewTransmissionLine, 2);

        new OnlyOneOpen([newPlant, newSubstation, newLine]);
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

            openPosition: {x: 1000 - 170, y: 144},
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

        let smallPanel = new OpenablePanel({
            panelKey: "right-small-panel",

            openPosition: openPosition,
            closedPosition: closedPosition,
            animationTime: 250,

            slots: [smallPanelGroup],
            slotStart: {x:0, y:0},
            slotSpacing: {x:0, y:0}
        }, game);

        return smallPanel;
    }
}