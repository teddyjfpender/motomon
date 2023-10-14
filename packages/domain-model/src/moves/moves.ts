import { Field } from "snarkyjs";
import { MonsterAttributeStruct } from "../monsters";

export const movesDictionary = {
    "solar beam": new MonsterAttributeStruct(
                                       // Move ID
                                        Field(0),
                                        // Move Strength
                                        Field(120),
                                        // Move's count
                                        Field(2)
                                      ),
    "tackle": new MonsterAttributeStruct(
                                    // Move ID
                                    Field(1),
                                    // Move Strength
                                    Field(8),
                                    // Move's count
                                    Field(6)
                                  ),
    "scratch": new MonsterAttributeStruct(
                                     // Move ID
                                     Field(2),
                                     // Move Strength
                                     Field(12),
                                     // Move's count
                                     Field(6)
                                   ),
    "ember": new MonsterAttributeStruct(
                                  // Move ID
                                  Field(3),
                                  // Move Strength
                                  Field(13),
                                  // Move's count
                                  Field(4)
                                ),
    "empty": new MonsterAttributeStruct(
                                  // Move ID
                                  Field(4),
                                  // Move Strength
                                  Field(0),
                                  // Move's count
                                  Field(20)
                                )
  }