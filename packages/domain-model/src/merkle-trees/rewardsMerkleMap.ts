import { Field, MerkleMap, MerkleMapWitness, PublicKey, UInt64 } from "snarkyjs";

export class RewardsMerkleMap {
    public map: MerkleMap;
  
    constructor() {
      this.map = new MerkleMap();
    }
  
    addField(key: Field, value: Field) {
      this.map.set(key, value);
    }
  
    getField(key: Field): Field | undefined {
      return this.map.get(key);
    }
  
    getRoot(): Field {
      return this.map.getRoot();
    }
  
    getWitness(key: Field): MerkleMapWitness {
      return this.map.getWitness(key);
    }
  }