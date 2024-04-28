export type Attribute = {
  trait_type: string;
  value: string;
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

export type Metadata = {
  name: string;
  description: string;
  image: string;
  equippable_layer: string | null;
  attributes: Attribute[];
};
