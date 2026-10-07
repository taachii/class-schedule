import { ROLE } from './plan.js';

export async function applyOnboarding(guild, onboardingPlan, allRoles) {
  console.log(`[Onboarding] Setting up onboarding...`);

  // Discord.js v14 Guild#editOnboarding
  const options = onboardingPlan.options.map(opt => {
    const roleIds = opt.roles.map(rName => allRoles.find(r => r.name === rName)?.id).filter(Boolean);
    return {
      title: opt.title,
      description: opt.description,
      roleIds: roleIds,
      emoji: null // można dodać emoji
    };
  });

  const existingChannels = await guild.channels.fetch();
  const defaultChannelIds = onboardingPlan.defaultChannels
    .map(name => existingChannels.find(c => c.name === name)?.id)
    .filter(Boolean);

  try {
    await guild.editOnboarding({
      enabled: true,
      defaultChannelIds,
      prompts: [
        {
          title: onboardingPlan.title,
          options: options,
          singleSelect: true,
          required: true,
          inOnboarding: true
        }
      ]
    });
    console.log(`[Onboarding] Onboarding successfully updated.`);
  } catch (err) {
    console.error(`[Onboarding] Error applying onboarding: ${err.message}`);
    if (err.code === 50035) { // Invalid form body
       console.error(`Make sure the server has Community enabled and features ONBOARDING.`);
    }
  }
}
