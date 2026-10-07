import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
  console.log('Logged in to delete gc-news channels...');
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return console.error('Guild not found');
  
  const channels = await guild.channels.fetch();
  // match "📢-gcX-ogłoszenia"
  const toDelete = channels.filter(c => c.name.match(/^📢-gc\d+-ogłoszenia$/));
  
  console.log(`Found ${toDelete.size} channels to delete.`);
  for (const [id, channel] of toDelete) {
    console.log(`Deleting ${channel.name}...`);
    await channel.delete();
  }
  console.log('Done!');
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
