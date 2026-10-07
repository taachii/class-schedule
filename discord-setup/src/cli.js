import dotenv from 'dotenv';
dotenv.config(); // wczytuje .env z current dir
dotenv.config({ path: '../.env.local' }); // nadpisuje/uzupełnia ze zmiennych głownego środowiska

import fs from 'fs';
import path from 'path';
import { Client, GatewayIntentBits } from 'discord.js';
import { fetchSubjects } from './subjects.js';
import { buildPlan, validatePlan } from './plan.js';
import { applyRoles, applyChannels, applyMemberRoles } from './apply.js';
import { applyOnboarding } from './onboarding.js';
import { archiveYear } from './archive.js';

const [,, cmd, ...args] = process.argv;

async function run() {
  const config = JSON.parse(fs.readFileSync(new URL('../config/server.json', import.meta.url), 'utf8'));
  const starosci = JSON.parse(fs.readFileSync(new URL('../config/starosci.json', import.meta.url), 'utf8'));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = process.env.DISCORD_TOKEN;
  const guildId = process.env.GUILD_ID;

  const yearIdx = args.findIndex(a => a === '--year');
  const year = yearIdx >= 0 ? parseInt(args[yearIdx + 1]) : 1;
  const semIdx = args.findIndex(a => a === '--sem');
  const semester = semIdx >= 0 ? parseInt(args[semIdx + 1]) : 1;
  
  const dryRun = args.includes('--dry-run');

  if (cmd === 'setup' || cmd === 'start-semester') {
    console.log(`[CLI] Fetching subjects for year ${year}...`);
    const subjects = await fetchSubjects({ url, anonKey, year });
    
    console.log(`[CLI] Building declarative plan (year: ${year}, semester: ${semester})...`);
    const plan = buildPlan({ year, semester, config, subjects, starosci });
    
    const { errors, stats } = validatePlan(plan);
    if (errors.length > 0) {
      console.error('Błędy walidacji planu:');
      errors.forEach(e => console.error(' - ' + e));
      if (!dryRun) process.exit(1);
    }

    console.log(`[CLI] Plan valid. Stats:`, stats);
    if (dryRun) {
      console.log(`[CLI] Dry-run finished. Plan:`);
      // console.log(JSON.stringify(plan, null, 2));
      return;
    }

    if (!token || !guildId) throw new Error("Brak DISCORD_TOKEN lub GUILD_ID.");

    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
    await client.login(token);
    
    const guild = await client.guilds.fetch(guildId);
    
    const allRoles = await applyRoles(guild, plan.roles);
    await applyChannels(guild, plan.categories, allRoles);
    await applyMemberRoles(guild, plan.memberRoles, allRoles);
    await applyOnboarding(guild, plan.onboarding, allRoles);

    console.log(`[CLI] Setup completed successfully.`);
    client.destroy();
  } 
  else if (cmd === 'archive-year') {
    if (dryRun) {
      console.log(`[CLI] Dry-run dla archive. By zarchiwizować rok ${year}, uruchom bez flahi.`);
      return;
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    await client.login(token);
    const guild = await client.guilds.fetch(guildId);
    const allRoles = await guild.roles.fetch();

    await archiveYear(guild, year, allRoles);

    console.log(`[CLI] Archive completed successfully.`);
    client.destroy();
  }
  else {
    console.log(`Dostępne komendy:
  setup --year N [--sem 1|2] [--dry-run]
  start-semester --year N --sem 2 [--dry-run]
  archive-year --year N [--dry-run]`);
  }
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
