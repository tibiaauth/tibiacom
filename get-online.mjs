import * as fs from 'node:fs/promises';

const slugify = (name) => {
	const slug = name.replaceAll(' ', '+');
	return slug;
};

const getWorlds = async () => {
	console.log('Getting list of Tibia worlds…');
	const response = await fetch('https://api.tibiadata.com/v3/worlds');
	const data = await response.json();
	const regularWorlds = data.worlds.regular_worlds;
	const worldNames = regularWorlds.map((world) => world.name);
	return worldNames;
};

const getWorldDetails = async (worldName) => {
	const response = await fetch(`https://api.tibiadata.com/v3/world/${slugify(worldName)}`);
	const data = await response.json();
	console.log(`Processing world details for world ${worldName}…`);
	return data;
};

const worldNames = await getWorlds();
// Kick off all requests in parallel.
const worldDetails = worldNames.map((worldName) => getWorldDetails(worldName));

let players = [];

for await (const details of worldDetails) {
	const onlinePlayers = details.worlds.world.online_players;

	players.push(...onlinePlayers);
}

console.log(`Total of ${players.length} online now.`);
const dataPath = `./data`;
const json = JSON.stringify(players, null, '\t') + '\n';
await fs.writeFile(`${dataPath}/online_list.json`, json);
