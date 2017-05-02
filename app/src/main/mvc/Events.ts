import {SyncEvent} from 'ts-events';
import {Line, Substation} from "./model/Facilities";

export namespace Events {
    //facilities events
    export const lineAdded = new SyncEvent<Line>();
    export const lineDisabled = new SyncEvent<Line>();
    export const substationAdded = new SyncEvent<Substation>();
    export const plantAdded = new SyncEvent<Substation>();
}
