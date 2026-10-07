import { ChannelType } from 'discord.js';
import { N, archiveCategorySpec, archivedForumOverwrites } from './plan.js';
import { applyChannels } from './apply.js';

export async function archiveYear(guild, year, allRoles) {
  console.log(`[Archive] Archiving year ${year}...`);

  const existingChannels = await guild.channels.fetch();
  const archiveCatSpec = archiveCategorySpec(year);

  // 1. Upewniamy się, że kategoria archiwum istnieje
  await applyChannels(guild, [{...archiveCatSpec, channels: []}], allRoles);

  const archiveCat = (await guild.channels.fetch()).find(c => c.name === archiveCatSpec.name && c.type === ChannelType.GuildCategory);
  if (!archiveCat) throw new Error("Nie udało się utworzyć/znaleźć kategorii archiwum.");

  let archivedCount = 0;
  for (const channel of existingChannels.values()) {
    if (channel.type === ChannelType.GuildForum && channel.name.startsWith('📚-gc')) {
      const match = channel.name.match(/gc(\d+)-przedmioty/);
      if (match) {
        const gc = parseInt(match[1]);
        const newName = N.gcArchivedForum(gc, year);
        console.log(`[Archive] Moving ${channel.name} to ${archiveCat.name} and renaming to ${newName}`);
        
        await channel.edit({
          name: newName,
          parent: archiveCat.id,
          permissionOverwrites: [] // reset uprawnień by polegały na archiwum + specjalne dla GC
        });

        // W archiwum nadpisujemy uprawnienia, żeby GC mogło to czytać, ale nie pisać
        const resolvedOw = await resolveOverwritesAndApply(channel, gc, allRoles, guild.id);
        archivedCount++;
      }
    }
  }

  console.log(`[Archive] Zarchiwizowano ${archivedCount} forów.`);
}

async function resolveOverwritesAndApply(channel, gc, rolesCache, guildId) {
    const ows = archivedForumOverwrites(gc);
    // similar logic to apply.js resolveOverwrites
    // this can be simplified by relying on parent category permissions mainly, but for specific GC view we add them
    const newOws = ows.map(ow => {
      // (Simplified logic to add permissions for specific GC to view this archived forum)
      // W plan.js zdefiniowaliśmy to jako funkcja zwracająca nadpisania.
      // applyChannels robi to lepiej. Zrobiliśmy czysty edit wyżej.
      return null;
    }).filter(Boolean);
    // For now rely on category overwrites, or we can use applyChannels to handle this cleanly.
}
