import axios from 'axios';
import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel';

import { SUBGRAPH_URL } from '../utils/constants.js';
import { uriToHttp } from '../utils/helpers.js';
import { GameMeta, Metadata } from '../utils/types.js';

export type GameMetaInfoFragment = {
  __typename?: 'Game';
  id: string;
  startedAt: unknown;
  chainId: unknown;
  uri: string;
  experience: string;
  owner: { __typename?: 'GameOwner'; address: string };
  admins: Array<{ __typename?: 'GameAdmin'; address: string }>;
  masters: Array<{ __typename?: 'GameMaster'; address: string }>;
  characters: Array<{ __typename?: 'Character'; id: string; player: string }>;
  classes: Array<{ __typename?: 'Class'; id: string }>;
  items: Array<{ __typename?: 'Item'; id: string }>;
};

const fetchMetadataFromUri = async (uri: string): Promise<Metadata> => {
  const res = await fetch(uri);
  if (!res.ok) throw new Error('Failed to fetch');
  const metadata = await res.json();
  metadata.name = metadata.name || '';
  metadata.description = metadata.description || '';
  metadata.image = metadata.image || '';
  metadata.equippable_layer = metadata.equippable_layer || null;
  metadata.attributes = metadata.attributes || [];
  return metadata;
};

const fetchMetadata = async (ipfsUri: string): Promise<Metadata> => {
  try {
    const uris = uriToHttp(ipfsUri);
    for (const u of uris) {
      try {
        const metadata = await fetchMetadataFromUri(u);
        return metadata;
      } catch (e) {
        console.error('Failed to fetch metadata from', u);
        continue;
      }
    }
  } catch (e) {
    console.error('Failed to fetch metadata from', ipfsUri);
  }
  return {
    name: '',
    description: '',
    image: '',
    equippable_layer: null,
    attributes: [],
  };
};

export const formatGameMeta = async (
  game: GameMetaInfoFragment,
): Promise<GameMeta> => {
  const metadata = await fetchMetadata(game.uri);

  return {
    id: game.id,
    startedAt: Number(game.startedAt) * 1000,
    chainId: Number(game.chainId),
    uri: game.uri,
    owner: game.owner.address,
    admins: game.admins.map(a => a.address),
    masters: game.masters.map(m => m.address),
    players: game.characters.map(c => c.player),
    name: metadata.name,
    description: metadata.description,
    image: uriToHttp(metadata.image)[0],
    characters: game.characters,
    classes: game.classes,
    items: game.items,
    experience: game.experience,
    equippable_layer: null,
    attributes: metadata.attributes,
  };
};

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

const defaultContainer = (children: JSX.Element) => (
  <div
    style={{
      alignItems: 'center',
      background: 'black',
      backgroundSize: '100% 100%',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      height: '100%',
      justifyContent: 'center',
      textAlign: 'center',
      width: '100%',
    }}
  >
    {children}
  </div>
);

app.frame('/', c => {
  return c.res({
    title: 'Game Gallery',
    image: defaultContainer(
      <div
        style={{
          alignItems: 'center',
          border: '6px solid #ff3864',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: '60%',
          width: '90%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 48,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          Welcome to the CharacterSheets!
        </div>
        <div
          style={{
            color: 'white',
            fontSize: 32,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          Enter a game ID or address to view game on Gnosis chain.
        </div>
      </div>,
    ),
    intents: [
      <TextInput placeholder="Game ID/address..." />,
      <Button action={`/game`}>View Game</Button>,
    ],
  });
});

app.frame('/game', async c => {
  const gameId = c.inputText ?? '';

  let game = null;

  try {
    const query = `
      query {
        game(id: "${gameId.toLowerCase()}") {
          id
          startedAt
          chainId
          uri
          owner {
            address
          }
          admins {
            address
          }
          masters {
            address
          }
          experience
          characters {
            id
            player
          }
          classes {
            id
          }
          items {
            id
          }
        }
      }
    `;

    const response = await axios({
      url: SUBGRAPH_URL,
      method: 'post',
      data: {
        query,
      },
    });

    if (response.data.errors) {
      throw new Error(JSON.stringify(response.data.errors));
    }

    game = await formatGameMeta(response.data.data.game);
  } catch (error) {
    console.error('Error fetching game data', error);
  }

  if (!game) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: defaultContainer(
        <div
          style={{
            alignItems: 'center',
            border: '6px solid #ff3864',
            display: 'flex',
            height: '60%',
            width: '90%',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: 48,
              fontStyle: 'normal',
              letterSpacing: '-0.025em',
              lineHeight: 1.4,
              padding: '0 120px',
              whiteSpace: 'pre-wrap',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            An error occurred.
          </div>
        </div>,
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const imageText = await fetch(game.image).then(res => res.text());
  const isSvg = imageText.startsWith('<svg');

  if (isSvg) {
    const svgBuffer = Buffer.from(imageText);
    const svgBase64 = svgBuffer.toString('base64');

    game.image = `data:image/svg+xml;base64,${svgBase64}`;
  }

  return c.res({
    title: 'CharacterSheets Gallery',
    image: defaultContainer(
      <div
        style={{
          alignItems: 'center',
          border: '6px solid #ff3864',
          display: 'flex',
          height: '80%',
          width: '90%',
          padding: '0 60px',
          gap: '60px',
        }}
      >
        <img src={game.image} alt={game.name} width={160} />
        <div
          style={{
            alignItems: 'flex-start',
            color: 'white',
            fontSize: 48,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              textAlign: 'left',
              fontSize: 32,
            }}
          >
            {game.name}
          </div>
          <div style={{ display: 'flex' }}>---</div>
          <div
            style={{
              display: 'flex',
              textAlign: 'left',
              fontSize: 32,
              width: '700px',
            }}
          >
            {game.description}
          </div>
        </div>
      </div>,
    ),
    intents: [
      <TextInput placeholder="Enter new address..." />,
      <Button value="characters">Characters</Button>,
      <Button value="classes">Classes</Button>,
      <Button value="items">Items</Button>,
    ],
  });
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined';
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development';
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
