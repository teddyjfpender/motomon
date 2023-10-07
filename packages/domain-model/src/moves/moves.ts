import { Field } from "snarkyjs";
import { MonsterAttributeStruct } from "../monsters";

export const movesDictionary = {
    "solar beam": new MonsterAttributeStruct(
                                       // Move ID
                                        Field(0),
                                        // Move Strength
                                        Field(101),
                                        // Move's weakness Type ID
                                        Field(1)
                                      ),
    "tackle": new MonsterAttributeStruct(
                                    // Move ID
                                    Field(1),
                                    // Move Strength
                                    Field(8),
                                    // Move's weakness Type ID
                                    Field(0)
                                  ),
    "scratch": new MonsterAttributeStruct(
                                     // Move ID
                                     Field(2),
                                     // Move Strength
                                     Field(12),
                                     // Move's weakness Type ID
                                     Field(0)
                                   ),
    "ember": new MonsterAttributeStruct(
                                  // Move ID
                                  Field(3),
                                  // Move Strength
                                  Field(13),
                                  // Move's weakness Type ID
                                  Field(0)
                                ),
  }