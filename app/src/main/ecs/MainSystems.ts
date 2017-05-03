import TinyECS = require("tiny-ecs");
import {System} from "./systems/System";
import {MapLoaderSystem} from "./systems/MapLoaderSystem";
import {ConsumerLoaderSystem} from "./systems/ConsumerLoaderSystem";
import {NetworkHealthSystem} from "./systems/NetworkHealthSystem";
import {UpdateConnectedStatusSystem} from "./systems/UpdateConnectedStatusSystem";
import {Level} from "./entities/Level";
import {PlanFacility} from "./systems/PlanFacility";
import {PlanFacilityRender} from "./systems/PlanFacilityRender";
import {PlanCost} from "./systems/PlanCost";
import {LineLandRequiredSystem} from "./systems/LineLandRequiredSystem";
import {LineWorkersRequiredSystem} from "./systems/LineWorkersRequiredSystem";
import {LineMaterialsRequiredSystem} from "./systems/LineMaterialsRequiredSystem";
import {LinePowerLossSystem} from "./systems/LinePowerLossSystem";
import {Cash} from "./components/Cash";
import {CashSystem} from "./systems/CashSystem";
import {PayrollSystem} from "./systems/PayrollSystem";
import {Employee} from "./entities/Employee";
import {PlanBuilder} from "./systems/PlanBuilder";
import {SpriteForEachTileRenderSystem} from "./systems/SpriteForEachTileRenderSystem";
import {TwoPointsRenderSystem} from "./systems/LineRenderSystem";
import {PlanLineValidator} from "./systems/PlanLineValidator";
import {PlanFacilityValidator} from "./systems/PlanFacilityValidator";
import {PlanLine} from "./systems/PlanLine";
import {PlanLineDragging} from "./systems/PlanLineDragging";
import {MainLayers} from "../MainLayers";
import {Built} from "./components/Built";
import {Planned} from "./components/Planned";
import {PlanMarkerRender} from "./systems/PlanMarkerRender";
import {DragSystem} from "./systems/DragSystem";
import {Hovered} from "./components/Hovered";

export class MainSystems{
    private entities: TinyECS.EntityManager;

    private systems: System[];

    networkHealth: NetworkHealthSystem;
    mapLoader: MapLoaderSystem;

    planFacility: PlanFacility;
    planLine: PlanLine;
    cash: CashSystem;
    payroll: PayrollSystem;
    builder: PlanBuilder;
    private layers: MainLayers;

    constructor(game: Phaser.Game, layers: MainLayers){
        this.layers = layers;
        this.entities = new TinyECS.EntityManager();
        this.initialEntities();

        this.systems = [];
        this.addSystems(game);
    }

    speculativeCost: PlanCost;

    private addSystems(game: Phaser.Game) {
        //systems that load data
        this.mapLoader = new MapLoaderSystem(game, this.layers.map);
        this.systems.push(this.mapLoader);
        this.systems.push(new ConsumerLoaderSystem());

        //systems dealing with network health
        this.systems.push(new UpdateConnectedStatusSystem());
        this.networkHealth = new NetworkHealthSystem();
        this.systems.push(this.networkHealth);

        //systems for figuring out how much things cost
        this.systems.push(new LineLandRequiredSystem());
        this.systems.push(new LineWorkersRequiredSystem());
        this.systems.push(new LineMaterialsRequiredSystem());
        this.systems.push(new LinePowerLossSystem());

        //systems for planning and building of things
        this.planFacility = new PlanFacility(this.entities);
        this.planLine = new PlanLine(this.entities);
        this.speculativeCost = new PlanCost();
        this.builder = new PlanBuilder();

        this.systems.push(this.planLine);
        this.systems.push(new DragSystem(this.layers.planLines, [Planned]));
        this.systems.push(new PlanLineDragging(this.planLine));
        this.systems.push(this.planFacility);
        this.systems.push(this.speculativeCost);
        this.systems.push(this.builder);
        this.systems.push(new PlanFacilityValidator());
        this.systems.push(new PlanLineValidator());

        //financial systems
        this.cash = new CashSystem();
        this.systems.push(this.cash);
        this.payroll = new PayrollSystem();
        this.systems.push(this.payroll);

        //rendering systems
        this.systems.push(new TwoPointsRenderSystem(this.layers.planLines, [Hovered], 0x3494ac));
        this.systems.push(new TwoPointsRenderSystem(this.layers.planLines, [Planned], 0x54b4ff));
        this.systems.push(new PlanFacilityRender(this.layers.planOthers, [Planned]));
        this.systems.push(new PlanMarkerRender(this.layers.planOthers, [Planned]));

        this.systems.push(new TwoPointsRenderSystem(this.layers.lines, [Built], 0xf4e542));
        this.systems.push(new SpriteForEachTileRenderSystem(this.layers.others, [Built]));
    }

    public update() {
        for(let system of this.systems){
            system.process(this.entities);
        }
    }

    private initialEntities() {
        Level.make(this.entities);

        let startingCash = this.entities.createEntity();
        startingCash.addComponent(Cash);
        startingCash.cash.amount = 250;

        for(let i = 0; i < 50; i++){
            Employee.make(this.entities);
        }
    }
}