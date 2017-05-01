/*  Happiness.ts
 *  Copyright (C) 2017 Cameron B Seebach
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {DemandSatisfaction} from "./Demand";

/** Different important values on the happiness scale from 0-100 */
export enum HappinessScale{
    ABYSMAL = 0.0,
    BAD = 20.0,
    ADJUST_TOWARDS = 35.0,
    LOSING = 38.0,
    NEUTRAL = 40.0,
    STARTING = 50.0,
    GOOD = 60.0,
    ECSTATIC = 80.0
}

/**
 * Encapsulates handy measures of happiness along with the satisfied demand at the time.
 */
export interface Happiness{
    value: number,
    onScale: HappinessScale,
    sentence: string
    satisfaction: DemandSatisfaction,
    outage: boolean
}

/**
 * Calculates the happiness of your consumers using a window of satisfied demand.
 */
export class HappinessCalculator{

    /**
     * How large a window the calculator keeps
     * @type {number}
     */
    public static readonly WINDOW_SIZE = 5;

    /**
     * The bonus happiness that a player gets for continuing to connect more customers.
     * @type {number}
     */
    private static readonly MORE_CONNECTIONS_BONUS = 15;

    /**
     * The minus happiness that a player experiences when consumers endure an outage.
     * @type {number}
     */
    private static readonly OUTAGE_MINUS = 15;

    private window: Happiness[];

    /**
     * Create a new calculator, and give it the state of satisfied demand as an initial seed.
     * @param startingSatisfaction
     */
    constructor(startingSatisfaction: DemandSatisfaction){
        this.window = [{
            value: HappinessScale.STARTING,
            onScale: HappinessScale.STARTING,
            sentence: HappinessCalculator.sentenceFor(HappinessScale.STARTING),
            satisfaction: startingSatisfaction,
            outage: false
        }];
    }

    /**
     * See if happiness is low enough that the game should end.
     *
     * Note that the game can never end while the window is still being filled.
     * @returns {boolean} true if game should end
     */
    isGameOver(){
        if(this.window.length != HappinessCalculator.WINDOW_SIZE){
            return false;
        }

        let earliestHappinessLow = this.window[HappinessCalculator.WINDOW_SIZE - 1].value < HappinessScale.NEUTRAL;
        let earlyHappinessLow = this.window[HappinessCalculator.WINDOW_SIZE - 2].value < HappinessScale.NEUTRAL;
        let average = this.averageHappiness();

        return average < HappinessScale.LOSING && earliestHappinessLow && earlyHappinessLow;
    }

    /**
     * Get the current happiness.
     * @returns {Happiness}
     */
    current(){
        return this.window[0];
    }

    /**
     * Add the latest satisfied demand state and whether or not there was an outage into the calculation
     * @param satisfaction the latest period
     * @param outage whether or not there was an outage in the latest period
     */
    addSatisfaction(satisfaction: DemandSatisfaction, outage: boolean){
        this.window.unshift({
            value: null,
            onScale: null,
            sentence: null,
            satisfaction: satisfaction,
            outage: outage
        });
        this.calculateHappiness();
        this.truncateWindow();
    }

    //make sure we have a window of the right size or smaller
    private truncateWindow() {
        if(this.window.length > HappinessCalculator.WINDOW_SIZE){
            this.window.pop();
        }
    }

    //get the english for a particular happiness number
    private static sentenceFor(happiness: number) {
        if(happiness > HappinessScale.ECSTATIC){
            return "The people are ecstatic about your performance.";
        }else if(happiness > HappinessScale.GOOD){
            return "The people think your performance is good.";
        }else if(happiness > HappinessScale.NEUTRAL){
            return "The people feel neutral about your performance.";
        }else if(happiness > HappinessScale.BAD){
            return "The people feel your performance is not up to par.";
        }
        return "Your performance is abysmal.";
    }

    //return a rounded value for a particular happiness number
    private static onScaleFor(happiness: number){
        if(happiness > HappinessScale.ECSTATIC){
            return HappinessScale.ECSTATIC;
        }else if(happiness > HappinessScale.GOOD){
            return HappinessScale.GOOD;
        }else if(happiness > HappinessScale.NEUTRAL){
            return HappinessScale.NEUTRAL;
        }else if(happiness > HappinessScale.BAD){
            return HappinessScale.BAD;
        }
        return HappinessScale.ABYSMAL;
    }

    //calculate a new happiness value
    private calculateHappiness() {
        this.propagateHappiness();

        this.adjustForMoreConnected();
        this.adjustForOutage();
        this.adjustTowardsLosing();

        this.setupNewHumanReadableHappiness();
    }

    //turn the happiness number into a grade and an english sentence
    private setupNewHumanReadableHappiness() {
        let happiness = this.window[0];
        happiness.onScale = HappinessCalculator.onScaleFor(happiness.value);
        happiness.sentence = HappinessCalculator.sentenceFor(happiness.value);
    }

    //make the current happiness exactly equal to the last. done first as a starting point.
    private propagateHappiness() {
        this.window[0].value = this.window[1].value;
    }

    //move the happiness up if additional demand is continuously connected (sort of, actually uses the average)
    private adjustForMoreConnected() {
        let happiness = this.window[0];

        let unconnectedAverage = this.calculateUnconnectedAverage();
        if (unconnectedAverage > happiness.satisfaction.unconnected) {
            happiness.value += HappinessCalculator.MORE_CONNECTIONS_BONUS;
        }
    }

    private calculateUnconnectedAverage() {
        let unconnectedSum = 0;
        for(let happiness of this.window){
            unconnectedSum += happiness.satisfaction.unconnected;
        }
        return unconnectedSum/this.window.length;
    }

    //move the happiness down if an outage has occurred
    private adjustForOutage() {
        let happiness = this.window[0];
        if(happiness.outage){
            happiness.value -= HappinessCalculator.OUTAGE_MINUS;
        }
    }

    //so that the player cannot rest on laurels, continuously subtract happiness
    private adjustTowardsLosing() {
        let happiness = this.window[0];
        happiness.value = happiness.value * .85 + HappinessScale.ADJUST_TOWARDS * .15;
    }

    private averageHappiness() {
        let sum = 0;
        for(let happiness of this.window){
            sum += happiness.value;
        }
        return sum / this.window.length;
    }
}
