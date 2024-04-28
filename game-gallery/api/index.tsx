import { Button, Frog, TextInput } from 'frog';
import { devtools } from 'frog/dev';
import { serveStatic } from 'frog/serve-static';
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel';
import { gnosis } from 'viem/chains';

import { Background, Heading, Paragraph } from '../components/index.js';
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

app.frame('/', c => {
  return c.res({
    title: 'Game Gallery',
    image: (
      <Background>
        <Heading>Welcome to the CharacterSheets!</Heading>
        <Paragraph>
          Enter a game ID or address to view game on Gnosis chain.
        </Paragraph>
      </Background>
    ),
    intents: [
      <TextInput placeholder="Game ID/address..." />,
      <Button action={`/game`}>View Game</Button>,
    ],
  });
});

app.frame('/game/:gameId?', async c => {
  const gameId = c.req.param('gameId') ?? c.inputText ?? '';

  if (!gameId) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: (
        <Background>
          <Heading>No game ID/address provided.</Heading>
        </Background>
      ),
      intents: [<Button action="/">Return</Button>],
    });
  }

  const game = await getGameMetaForChainId(gnosis.id, gameId);

  if (!game) {
    return c.res({
      title: 'CharacterSheets Gallery',
      image: (
        <Background>
          <Heading>An error occurred.</Heading>
        </Background>
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
    image: (
      <Background>
        <img src={game.image} alt={game.name} width={160} />
        <Heading>{game.name}</Heading>
        <Heading>---</Heading>
        <Paragraph>{game.description}</Paragraph>
      </Background>
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