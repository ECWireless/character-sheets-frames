import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel';
import { gnosis } from 'viem/chains';

import { getGameMetaForChainId } from '../graphql/games.js';

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
  const game = await getGameMetaForChainId(gnosis.id, gameId);

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
