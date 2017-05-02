import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Planned} from "../components/Planned";
import {Built} from "../components/Built";
import {MaterialsRequired} from "../components/MaterialsRequired";
import {Cost} from "../components/Cost";
import {LandRequired} from "../components/LandRequired";

export class PlanBuilder implements System{

    private shouldBuild = false;
    private shouldCancel = false;

    process(entities: EntityManager): void {
        if(this.shouldBuild){

            let entitiesList = [];
            for(let planned of entities.queryComponents([Planned])){
                entitiesList.push(planned);
            }

            for(let planned of entitiesList){
                planned.removeComponent(Planned);
                planned.addComponent(Built);

                let immediateCost = entities.createEntity().addComponent(Cost);
                if(planned.hasComponent(MaterialsRequired)){
                    immediateCost.cost.amount += planned.materialsRequired.materials;
                }
                if(planned.hasComponent(LandRequired)){
                    immediateCost.cost.amount += planned.landRequired.land;
                }
            }

            this.shouldBuild = false;
        }else if(this.shouldCancel){
            let entitiesList = [];
            for(let planned of entities.queryComponents([Planned])){
                entitiesList.push(planned);
            }

            for(let entity of entitiesList){
                entities.removeEntity(entity);
            }

            this.shouldCancel = false;
        }
    }

    build(){
        this.shouldBuild = true;
    }

    cancel(){
        this.shouldCancel = true;
    }

}