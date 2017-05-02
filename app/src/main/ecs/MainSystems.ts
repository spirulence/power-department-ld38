import TinyECS = require("tiny-ecs");
import {System} from "./systems/System";
import {MapLoaderSystem} from "./systems/MapLoaderSystem";
import {ConsumerLoaderSystem} from "./systems/ConsumerLoaderSystem";
import {NetworkHealthSystem} from "./systems/NetworkHealthSystem";
import {UpdateConnectedStatusSystem} from "./systems/UpdateConnectedStatusSystem";
import {Level} from "./entities/Level";
import {SpeculativeAddSystem} from "./systems/SpeculativeAddSystem";
import {SpeculativeTileRenderSystem} from "./systems/SpeculativeTileRenderSystem";
import {SpeculativeLineRenderSystem} from "./systems/SpeculativeLineRenderSystem";
import {SpeculativeCostSystem} from "./systems/SpeculativeCostSystem";

export class MainSystems{
    private entities: TinyECS.EntityManager;

    private systems: System[];

    networkHealth: NetworkHealthSystem;
    mapLoader: MapLoaderSystem;

    speculative: SpeculativeAddSystem;

    constructor(game: Phaser.Game){
        this.entities = new TinyECS.EntityManager();
        this.initialEntities();

        this.systems = [];
        this.addSystems(game);
    }

    speculativeCost: SpeculativeCostSystem;

    private addSystems(game: Phaser.Game) {
        //systems that load data
        this.mapLoader = new MapLoaderSystem(game);
        this.systems.push(this.mapLoader);
        this.systems.push(new ConsumerLoaderSystem());

        //systems dealing with network health
        this.systems.push(new UpdateConnectedStatusSystem());
        this.networkHealth = new NetworkHealthSystem();
        this.systems.push(this.networkHealth);

        //systems for building things
        this.speculative = new SpeculativeAddSystem(this.entities);
        this.systems.push(this.speculative);
        this.systems.push(new SpeculativeTileRenderSystem(game));
        this.systems.push(new SpeculativeLineRenderSystem(game));
        this.speculativeCost = new SpeculativeCostSystem();
        this.systems.push(this.speculativeCost);
    }

    public update() {
        for(let system of this.systems){
            system.process(this.entities);
        }
    }

    private initialEntities() {
        Level.make(this.entities);
    }
}