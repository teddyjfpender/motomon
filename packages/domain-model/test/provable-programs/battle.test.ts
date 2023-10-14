
import { Field, Poseidon, Scalar} from "snarkyjs";
import { movesDictionary, MonsterStruct, Battle } from "../../src";
import { describe, expect, it, beforeAll } from "bun:test";

describe("Battles", () => {
    let playerOneMonster: MonsterStruct;
    let playerTwoMonster: MonsterStruct;
  
  beforeAll(async () => {
    const uuid = Poseidon.hash(Scalar.random().toFields());
    // monster attributes
    const attributes = [
      movesDictionary["solar beam"], // does 120 damage
      movesDictionary["tackle"], // does 8 damage
      movesDictionary["scratch"], // does 12 damage
      movesDictionary["ember"] // does 13 damage
    ]
    // monster health points
    const hp = Field(120);
    // create the monster
    playerOneMonster = new MonsterStruct(uuid, attributes, hp);

    const uuid2 = Poseidon.hash(Scalar.random().toFields());
    playerTwoMonster = new MonsterStruct(uuid2, attributes, hp);
  })

  
  it("playerOne should win the battle", () => {
    const battle = new Battle(playerOneMonster, playerTwoMonster);
    
    const movesForPlayerOne = [
        movesDictionary["solar beam"],
        movesDictionary["empty"],
        movesDictionary["empty"],
        movesDictionary["empty"],
        movesDictionary["empty"],
        movesDictionary["empty"]
    ];
    
    const movesForPlayerTwo = [
        movesDictionary["tackle"],
        movesDictionary["empty"],
        movesDictionary["empty"],
        movesDictionary["empty"],
        movesDictionary["empty"],
        movesDictionary["empty"]
    ];
    
    battle.startBattle(movesForPlayerOne, movesForPlayerTwo);
    
    const battleLog = battle.getBattleLog();
    
    expect(battleLog.length).toBeGreaterThan(0); // ensure some moves were made
    expect(playerOneMonster.hp.equals(playerOneMonster.hp)).toBeTruthy(); // playerOne should still have health
    expect(playerTwoMonster.isFainted()).toBeTruthy(); // playerTwo should be fainted

    // battleLog is then a public input to the provable program
    });
})