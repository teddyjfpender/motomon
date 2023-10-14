import { Field, Experimental, Struct, Provable, Poseidon, Bool } from "snarkyjs";
import { MonsterAttributeStruct, MonsterStruct } from "../monsters";

export class BattleLogEntry extends Struct({
    attackerUUID: Field,
    defenderUUID: Field,
    moveUsedID: Field,
    moveUsedStrength: Field,
    moveCountAfterUse: Field,
    defenderHPAfterAttack: Field
}) {
    constructor(attackerUUID: Field, defenderUUID: Field, moveUsedID: Field, moveUsedStrength: Field, moveCountAfterUse: Field, defenderHPAfterAttack: Field) {
        super({
            attackerUUID: attackerUUID,
            defenderUUID: defenderUUID,
            moveUsedID: moveUsedID,
            moveUsedStrength: moveUsedStrength,
            moveCountAfterUse: moveCountAfterUse,
            defenderHPAfterAttack: defenderHPAfterAttack
        })
    }
}

export class Battle {
    monster1: MonsterStruct;
    monster2: MonsterStruct;
    totalTurns: number;
    battleLog: BattleLogEntry[] = [];

    constructor(monster1: MonsterStruct, monster2: MonsterStruct) {
        this.monster1 = monster1;
        this.monster2 = monster2;
        this.totalTurns = 12; // 6 turns for each monster
    }

    attack(attacker: MonsterStruct, defender: MonsterStruct, move: MonsterAttributeStruct) {
        if (move && move.moveCount.greaterThan(Field(0))) {
            const hit = move.strength;
            defender.updateHP(hit);
            move.moveCount = move.moveCount.sub(Field(1));
            this.totalTurns--;

            // Log this move and its result
            this.battleLog.push({
                attackerUUID: attacker.uuid,
                defenderUUID: defender.uuid,
                moveUsedID: move.id,
                moveUsedStrength: hit,
                moveCountAfterUse: move.moveCount,
                defenderHPAfterAttack: defender.hp
            });
        }
    }

    battleRound(moveForMonster1: MonsterAttributeStruct, moveForMonster2: MonsterAttributeStruct) {
        // player 1 move
        if (this.totalTurns > 0) {
            this.attack(this.monster1, this.monster2, moveForMonster1);
        }
        // player 2 move
        if (!this.monster2.isFainted() && this.totalTurns > 0) {
            this.attack(this.monster2, this.monster1, moveForMonster2);
        }
    }

    startBattle(movesForMonster1: MonsterAttributeStruct[], movesForMonster2: MonsterAttributeStruct[]) {
        for(let i = 0; i < 6; i++) { // Each monster gets 6 turns
            if (movesForMonster1[i] && movesForMonster2[i]) {
                this.battleRound(movesForMonster1[i], movesForMonster2[i]);
            }
        }
    }

    getBattleLog(): BattleLogEntry[] {
        return this.battleLog;
    }
}



export const VerifyBattleResult = Experimental.ZkProgram({
    publicInput: BattleLogEntry,
  
    methods: {
      computeBattle: {
        privateInputs: [],
    
        method(publicInput: BattleLogEntry) {      
            const battleLog = publicInput;
            // TODO: Verify the battle log

            }
        }
    }
});