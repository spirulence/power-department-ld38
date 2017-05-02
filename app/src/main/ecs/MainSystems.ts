import TinyECS = require("tiny-ecs");
import {System} from "./systems/System";
import {MapLoaderSystem} from "./systems/MapLoaderSystem";
import {ConsumerLoaderSystem} from "./systems/ConsumerLoaderSystem";
import {NetworkHealthSystem} from "./systems/NetworkHealthSystem";
import {UpdateConnectedStatusSystem} from "./systems/UpdateConnectedStatusSystem";
import {Level} from "./entities/Level";

export class MainSystems{
    private entities: TinyECS.EntityManager;

    private systems: System[];
    private networkHealth: NetworkHealthSystem;

    constructor(game: Phaser.Game){
        this.entities = new TinyECS.EntityManager();
        this.initialEntities();

        this.systems = [];
        this.addSystems(game);
    }

    private addSystems(game: Phaser.Game) {
        //systems that load data
        this.systems.push(new MapLoaderSystem(game));
        this.systems.push(new ConsumerLoaderSystem());

        //systems dealing with network health
        this.systems.push(new UpdateConnectedStatusSystem());
        this.networkHealth = new NetworkHealthSystem();
        this.systems.push(this.networkHealth);
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