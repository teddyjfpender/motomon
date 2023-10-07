import { TestingAppChain } from "@proto-kit/sdk";
import { PrivateKey } from "snarkyjs";
import { Balances, Monsters, MonsterConfig, BalancesConfig} from "@motomon/runtime-modules";

type ModuleQueries = {
    Balances: typeof Balances;
    Monsters: typeof Monsters;
  };

export type BalancesQueries = keyof typeof Balances;
export type MonstersQueries = keyof typeof Monsters;

function getModuleQuery<T>(
    module: any,
    queryKey: keyof T
    ): any {
    return module[queryKey];
}
  
export class MotomonChain {

    public chainInstance: TestingAppChain<{
      Balances: typeof Balances;
      Monsters: typeof Monsters;
    }>;
  
    private constructor(config: {
      Balances: BalancesConfig;
      Monsters: MonsterConfig;
    }) {
      this.chainInstance = TestingAppChain.fromRuntime({
        modules: {
          Balances,
          Monsters
        },
        config
      });
    }
  
    public static create(config: {
      Balances: BalancesConfig;
      Monsters: MonsterConfig;
    }): MotomonChain {
      return new MotomonChain(config);
    }
  
    // Now you can define all the methods you want by calling them on chainInstance.
  
    public setSigner(signer: PrivateKey) {
      return this.chainInstance.setSigner(signer);
    }
  
    public async produceBlock() {
      return await this.chainInstance.produceBlock();
    }

    public async request(method: string, params: any): Promise<any> {
        switch (method) {
            case 'motomon_getBalance':
                const balanceAddress = params.address;
                return await this.chainInstance.query.runtime.Balances.balances.get(balanceAddress);
            case 'motomon_getMonster':
                const monsterAddress = params.address;
                return await this.chainInstance.query.runtime.Monsters.monsterRegistry.get(monsterAddress);
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    }
  }