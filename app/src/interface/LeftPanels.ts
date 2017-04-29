
import {OpenablePanel} from "./OpenablePanel";
import {Finances} from "../mainstate/Finances";
import {BoundTextLabel} from "./BoundTextLabel";
import {Inventory} from "../mainstate/Inventory";
import {HappinessCalculator} from "../mainstate/Happiness";

export class LeftPanels{

    private static readonly TEXT_STYLE = {font: "15px monospace", fill: "#000", boundsAlignV:"bottom", boundsAlignH:"right"};

    constructor(game: Phaser.Game, finances: Finances, inventory: Inventory, happiness: HappinessCalculator){
        this.setupMoney(game, finances);
        this.setupWorkers(game, inventory);
        this.setupHappiness(game, happiness);
    }

    private setupMoney(game: Phaser.Game, finances: Finances) {
        let smallPanelGroup = game.add.group();
        let moneyButton = game.add.button(104, 0,"buttons", null, null, 13,12,12,12, smallPanelGroup);
        let smallPanelText = game.add.text(0,0, finances.current.cash.toString(), LeftPanels.TEXT_STYLE, smallPanelGroup);
        smallPanelText.setTextBounds(0,0,104,32);

        let setSmallText = function(){
            if(smallPanel.isOpen){
                smallPanelText.text = ""+finances.current.cash+"->"+finances.current.projectedCash;
            }else{
                smallPanelText.text = ""+finances.current.cash;
            }
        };

        finances.current.cash.addCallback(setSmallText);
        finances.current.projectedCash.addCallback(setSmallText);

        let smallPanel = new OpenablePanel({
            panelKey: "money_panel",

            openPosition: {x: 0, y: 16},
            closedPosition: {x: -64, y: 16},
            animationTime: 250,

            slots: [
                smallPanelGroup
            ],
            slotStart: {x:0, y:0},
            slotSpacing: {x:0, y:0}
        }, game);


        let align = 110;
        let bigPanel = new OpenablePanel({
            panelKey: "left_panel",

            openPosition: {x: 0, y: 144},
            closedPosition: {x: -180, y: 160},
            animationTime: 250,

            slots: [
                new BoundTextLabel(game, "cash", align, finances.current.cash, 50).group,
                game.add.text(0, 0, "----------------", LeftPanels.TEXT_STYLE),
                new BoundTextLabel(game, "+revenue", align, finances.current.revenue, 50).group,
                game.add.text(0, 0, "----------------", LeftPanels.TEXT_STYLE),
                new BoundTextLabel(game, "-fuel", align, finances.current.fuel, 50).group,
                new BoundTextLabel(game, "-upkeep", align, finances.current.upkeep, 50).group,
                new BoundTextLabel(game, "-interest", align, finances.current.loanInterest, 50).group,
                new BoundTextLabel(game, "-payroll", align, finances.current.payroll, 50).group,
                game.add.text(0, 0, "----------------", LeftPanels.TEXT_STYLE),
                new BoundTextLabel(game, "=projected", align, finances.current.projectedCash, 50).group,
            ],
            slotStart: {x:0, y:16},
            slotSpacing: {x:0, y:20}
        }, game);

        moneyButton.onInputUp.add(function(){
            if(smallPanel.isOpen){
                smallPanel.close();
                bigPanel.close();
            }else {
                smallPanel.open();
                bigPanel.open();
            }
            setSmallText();
        })
    }

    private setupWorkers(game: Phaser.Game, inventory: Inventory) {
        let smallPanelGroup = game.add.group();
        let moneyButton = game.add.button(104, 0,"buttons", null, null, 15,14,14,14, smallPanelGroup);
        let smallPanelText = game.add.text(0,0, inventory.workers.number.toString(), LeftPanels.TEXT_STYLE, smallPanelGroup);
        smallPanelText.setTextBounds(0,0,104,32);

        let setSmallText = function(){
            if(smallPanel.isOpen){
                smallPanelText.text = ""+inventory.available+"->"+inventory.next;
            }else{
                smallPanelText.text = ""+inventory.available;
            }
        };

        inventory.available.addCallback(setSmallText);
        inventory.next.addCallback(setSmallText);

        let smallPanel = new OpenablePanel({
            panelKey: "money_panel",

            openPosition: {x: 0, y: 48},
            closedPosition: {x: -64, y: 48},
            animationTime: 250,

            slots: [
                smallPanelGroup
            ],
            slotStart: {x:0, y:0},
            slotSpacing: {x:0, y:0}
        }, game);


        let align = 110;
        let boxRight = 50;
        let bigPanel = new OpenablePanel({
            panelKey: "left_panel",

            openPosition: {x: 0, y: 144},
            closedPosition: {x: -180, y: 160},
            animationTime: 250,

            slots: [
                new BoundTextLabel(game, "workers", align, inventory.workers, boxRight).group,
                new BoundTextLabel(game, "-assigned", align, inventory.assigned, boxRight).group,
                game.add.text(0, 0, "----------------", LeftPanels.TEXT_STYLE),
                new BoundTextLabel(game, "=available", align, inventory.available, boxRight).group,
                game.add.text(0, 0, "", LeftPanels.TEXT_STYLE),
                new BoundTextLabel(game, "+1 qtrs", align, inventory.next, boxRight).group,
                new BoundTextLabel(game, "+2 qtrs", align, inventory.nextNext, boxRight).group
            ],
            slotStart: {x:0, y:16},
            slotSpacing: {x:0, y:20}
        }, game);

        moneyButton.onInputUp.add(function(){
            if(smallPanel.isOpen){
                smallPanel.close();
                bigPanel.close()
            }else {
                smallPanel.open();
                bigPanel.open();
            }
            setSmallText();
        })
    }

    private setupHappiness(game: Phaser.Game, _happiness: HappinessCalculator) {
        let smallPanelGroup = game.add.group();
        let moneyButton = game.add.button(104, 0,"buttons", null, null, 17,16,16,16, smallPanelGroup);
        let smallPanelText = game.add.text(0,0, "250", LeftPanels.TEXT_STYLE, smallPanelGroup);
        smallPanelText.setTextBounds(0,0,104,32);

        let smallPanel = new OpenablePanel({
            panelKey: "money_panel",

            openPosition: {x: 0, y: 80},
            closedPosition: {x: -64, y: 80},
            animationTime: 250,

            slots: [
                smallPanelGroup
            ],
            slotStart: {x:0, y:0},
            slotSpacing: {x:0, y:0}
        }, game);


        let bigPanel = new OpenablePanel({
            panelKey: "left_panel",

            openPosition: {x: 0, y: 144},
            closedPosition: {x: -180, y: 160},
            animationTime: 250,

            slots: [
            ],
            slotStart: {x:0, y:0},
            slotSpacing: {x:0, y:0}
        }, game);

        moneyButton.onInputUp.add(function(){
            if(smallPanel.isOpen){
                smallPanel.close();
                bigPanel.close()
            }else {
                smallPanel.open();
                bigPanel.open();
            }
        })
    }
}
