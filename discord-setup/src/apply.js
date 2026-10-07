import { ChannelType, OverwriteType, PermissionFlagsBits, ForumChannel } from 'discord.js';
import { N } from './plan.js';

/** Konwersja nazw ról (jak "@everyone") albo `user:ID` na prawidłowe obiekty uprawnień dla discord.js */
function resolveOverwrites(overwrites, rolesCache, guildId) {
  return overwrites.map(ow => {
    let id;
    let type;
    if (ow.target === '@everyone') {
      id = guildId;
      type = OverwriteType.Role;
    } else if (ow.target.startsWith('role:')) {
      const name = ow.target.substring(5);
      const role = rolesCache.find(r => r.name === name);
      if (!role) throw new Error(`Role not found: ${name}`);
      id = role.id;
      type = OverwriteType.Role;
    } else if (ow.target.startsWith('user:')) {
      id = ow.target.substring(5);
      type = OverwriteType.Member;
    } else {
      throw new Error(`Unknown overwrite target: ${ow.target}`);
    }

    const allow = ow.allow.reduce((acc, p) => acc | PermissionFlagsBits[p], 0n);
    const deny = ow.deny.reduce((acc, p) => acc | PermissionFlagsBits[p], 0n);

    return { id, type, allow, deny };
  });
}

/** Pobiera numeryczne wartości bitowe uprawnień */
function permissionsEqual(existing, desired) {
  if (!existing) return false;
  
  // existing.allow i existing.deny są BitField
  const desiredAllow = desired.allow;
  const desiredDeny = desired.deny;
  return existing.allow.bitfield === desiredAllow && existing.deny.bitfield === desiredDeny;
}

export async function applyRoles(guild, planRoles) {
  const existingRoles = await guild.roles.fetch();
  console.log(`[Roles] Fetched ${existingRoles.size} roles.`);
  
  const createdRoles = [];
  for (const pr of planRoles) {
    let role = existingRoles.find(r => r.name === pr.name);
    if (!role) {
      console.log(`[Roles] Creating role: ${pr.name}`);
      role = await guild.roles.create({
        name: pr.name,
        color: pr.color || undefined,
        hoist: pr.hoist || false,
        permissions: pr.permissions ? pr.permissions.map(p => PermissionFlagsBits[p]).reduce((acc, p) => acc | p, 0n) : 0n,
        reason: 'discord-setup'
      });
    }
    createdRoles.push(role);
  }
  return await guild.roles.fetch();
}

function resolveChannelType(typeStr) {
  if (typeStr === 'text') return ChannelType.GuildText;
  if (typeStr === 'voice') return ChannelType.GuildVoice;
  if (typeStr === 'announcement') return ChannelType.GuildAnnouncement;
  if (typeStr === 'forum') return ChannelType.GuildForum;
  return ChannelType.GuildText;
}

export async function applyChannels(guild, categories, allRoles) {
  const existingChannels = await guild.channels.fetch();
  console.log(`[Channels] Fetched ${existingChannels.size} channels.`);
  
  for (const catPlan of categories) {
    let category = existingChannels.find(c => c.name === catPlan.name && c.type === ChannelType.GuildCategory);
    const resolvedCatOw = resolveOverwrites(catPlan.overwrites || [], allRoles, guild.id);
    
    if (!category) {
      console.log(`[Channels] Creating category: ${catPlan.name}`);
      category = await guild.channels.create({
        name: catPlan.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: resolvedCatOw
      });
    } else {
      await category.permissionOverwrites.set(resolvedCatOw);
    }
    
    for (const chPlan of catPlan.channels) {
      let channel = existingChannels.find(c => c.name === chPlan.name && c.parentId === category.id);
      const chType = resolveChannelType(chPlan.type);
      const resolvedChOw = resolveOverwrites(chPlan.overwrites || [], allRoles, guild.id);
      
      let options = {
        name: chPlan.name,
        type: chType,
        parent: category.id,
        permissionOverwrites: resolvedChOw,
      };
      
      if (chPlan.topic) options.topic = chPlan.topic;

      // Handle Forum tags
      if (chPlan.type === 'forum' && chPlan.tags) {
        options.availableTags = chPlan.tags.map(t => ({ name: t }));
        // Require tags setting isn't exposed directly in create() without passing flags, but Discord.js handles it sometimes. We can set it after.
      }

      if (!channel) {
        console.log(`[Channels] Creating channel: ${chPlan.name} in ${category.name}`);
        channel = await guild.channels.create(options);
      } else {
        await channel.edit(options);
      }

      // Ensure Forum pinned posts and tags requirements
      if (chPlan.type === 'forum' && channel.type === ChannelType.GuildForum) {
        await channel.edit({ flags: channel.flags.remove('RequireTag') });
        
        await updateForumPosts(channel, chPlan);
        
        await channel.edit({ flags: channel.flags.add('RequireTag') });
      }
    }
  }
}

async function updateForumPosts(forumChannel, plan) {
  const { threads: activeThreads } = await forumChannel.threads.fetchActive();
  const archivedThreads = await forumChannel.threads.fetchArchived();
  const threads = new Map([...activeThreads, ...archivedThreads.threads]);
  
  let indexPost = null;
  const postsMap = new Map();

  for (const [id, thread] of threads) {
    if (thread.name === N.indexPost + ` — semestr ${plan.semester}`) {
      indexPost = thread;
    }
    postsMap.set(thread.name, thread);
  }

  const tagIdByName = new Map(forumChannel.availableTags.map(t => [t.name, t.id]));
  
  // Ensure individual posts for subjects
  const semesterPostsContent = [];
  for (const post of plan.posts) {
    let thread = postsMap.get(post.title);
    const tagId = tagIdByName.get(post.tag);
    const appliedTags = tagId ? [tagId] : [];

    if (!thread) {
      console.log(`[Forum ${forumChannel.name}] Creating thread for ${post.title}`);
      thread = await forumChannel.threads.create({
        name: post.title,
        message: { content: `Wątek przedmiotu: **${post.title}**\nTag: \`${post.tag}\`` },
        appliedTags
      });
    } else {
      // Ensure tags match
      if (!thread.appliedTags.includes(tagId)) {
        await thread.setAppliedTags(appliedTags);
      }
    }
    semesterPostsContent.push(`- [${post.title}](https://discord.com/channels/${forumChannel.guild.id}/${forumChannel.id}/${thread.id})`);
  }

  // Ensure index post
  const indexTitle = `${N.indexPost} — semestr ${plan.semester}`;
  const indexContent = `**Spis przedmiotów dla semestru ${plan.semester}**:\n\n` + semesterPostsContent.join('\n');
  
  if (!indexPost) {
    console.log(`[Forum ${forumChannel.name}] Creating index post`);
    indexPost = await forumChannel.threads.create({
      name: indexTitle,
      message: { content: indexContent },
      appliedTags: []
    });
  } else {
    const msg = await indexPost.fetchStarterMessage();
    if (msg.content !== indexContent) {
      await msg.edit(indexContent);
    }
  }

  // Pinned - API doesn't allow pinning forum threads directly in the same way, but it sets the `flags` Pinned on the thread. 
  // W d.js 14.x forum thread pinning is not directly a pin in the thread but setting Pinned flag.
  if (!indexPost.flags.has('Pinned')) {
    await indexPost.edit({ flags: indexPost.flags.add('Pinned') });
  }
}

export async function applyMemberRoles(guild, memberRolesPlan, allRoles) {
  for (const mp of memberRolesPlan) {
    try {
      const member = await guild.members.fetch(mp.userId);
      const role = allRoles.find(r => r.name === mp.role);
      if (role && !member.roles.cache.has(role.id)) {
        console.log(`[Members] Adding role ${role.name} to ${member.user.tag}`);
        await member.roles.add(role);
      }
    } catch(err) {
      console.warn(`[Members] Could not assign role ${mp.role} to user ${mp.userId}: ${err.message}`);
    }
  }
}
