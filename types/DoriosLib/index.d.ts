/**
 * Minimal public typing surface used by this template.
 *
 * DoriosLib remains a runtime dependency. This declaration prevents the
 * template's type check from traversing vendored implementation files.
 */

export interface CustomComponentDefinition {
  beforeOnPlayerPlace?(event: any, options: { params: any }): any;
  onPlayerInteract?(event: any, options: { params: any }): any;
  onPlayerBreak?(event: any, options: { params: any }): any;
  onTick?(event: any, options: { params: any }): any;
  onRandomTick?(event: any, options: { params: any }): any;
  [handler: string]: any;
}

export const registry: {
  blockComponent(id: string, definition: CustomComponentDefinition): void;
  install(): void;
  registerMachineUpgrade(value: Record<string, any>): void;
  registerFluidItem(value: Record<string, any>): void;
  registerFluidHolder(value: Record<string, any>): void;
  registerGasItem(value: Record<string, any>): void;
  registerGasHolder(value: Record<string, any>): void;
  registerCoolant(value: Record<string, any>): void;
  registerCrusherRecipe(value: Record<string, any>): void;
  registerSieveDrop(value: Record<string, any>): void;
  registerAutoFisherDrop(value: Record<string, any>): void;
  registerFuel(value: Record<string, any>): void;
  registerPlant(value: Record<string, any>): void;
  registerInfuserRecipe(value: Record<string, any>): void;
  registerPressRecipe(value: Record<string, any>): void;
  registerMelterRecipe(value: Record<string, any>): void;
  registerFurnaceRecipe(value: Record<string, any>): void;
  [name: string]: any;
};

export const container: {
  initialize(): void;
  insert(target: any, options: { item: any; face?: string; slots?: number[]; maxAmount?: number }): number;
  [name: string]: any;
};

export const linkNode: {
  initializeLinkNodeIO(): void;
  [name: string]: any;
};

export const entity: {
  getEquipment(entity: any, slot: string): any;
  setNewItem(entity: any, options: any): any;
  removeItem(entity: any, typeId: string, amount?: number): any;
  [name: string]: any;
};

export const block: {
  getState(block: any, state: string): string | number | boolean | undefined;
  setState(block: any, state: string, value: string | number | boolean): any;
  [name: string]: any;
};

export const player: {
  giveItem(player: any, options: any): any;
  isSurvival(player: any): boolean;
  [name: string]: any;
};

export const math: {
  randomInt(min: number, max: number): number;
  [name: string]: any;
};

export const text: {
  formatIdentifier(identifier: string): string;
  [name: string]: any;
};

export const config: Record<string, any>;
export const dependencies: Record<string, any>;
