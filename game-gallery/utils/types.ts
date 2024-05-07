export type Asset = {
  amount: string;
  assetId: string;
  assetAddress: string;
  assetCategory: 'ERC20' | 'ERC721' | 'ERC1155';
};

export type Attribute = {
  trait_type: string;
  value: string;
};

export type Character = Metadata & {
  id: string;
  chainId: number;
  gameId: string;
  gameCharacters: string[];
  name: string;
  characterId: string;
  account: `0x${string}`;
  player: `0x${string}`;
  jailed: boolean;
  approved: string;
  removed: boolean;
  experience: string;
  uri: string;
  heldClasses: HeldClass[];
  heldItems: Item[];
  equippedItems: EquippedItem[];
};

export type Class = Metadata & {
  id: string;
  classId: string;
  uri: string;
  claimable: boolean;
  holders: { id: string; characterId: string }[];
};

export type CraftRequirement = {
  itemId: string;
  amount: string;
};

export type EquippedItem = Item & {
  equippedAt: number;
};

export type GameMeta = Metadata & {
  id: string;
  startedAt: number;
  chainId: number;
  uri: string;
  owner: string;
  admins: string[];
  masters: string[];
  players: string[];
  characters: { id: string }[];
  classes: { id: string }[];
  items: { id: string }[];
  experience: string;
};

export type HeldClass = Class & {
  experience: string;
  level: string;
};

export type Item = Metadata & {
  id: string;
  itemId: string;
  uri: string;
  soulbound: boolean;
  distribution: string;
  supply: string;
  totalSupply: string;
  amount: string;
  holders: { id: string; characterId: string }[];
  equippers: { id: string; characterId: string }[];
  merkleRoot: string;
  craftable: boolean;
  craftRequirements: CraftRequirement[];
  claimRequirements: RequirementNode | null;
};

export type Metadata = {
  name: string;
  description: string;
  image: string;
  equippable_layer: string | null;
  attributes: Attribute[];
};

export type RequirementNode = {
  operator: 'NIL' | 'AND' | 'OR' | 'NOT';
  children: RequirementNode[];
  asset: Asset | null;
};
