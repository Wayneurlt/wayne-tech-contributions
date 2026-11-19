/**
 * Attribution for the SendPulse chatbots, as stated by Wayne: the WhatsApp chatbots
 * were built by Wayne Gift Ludenyi and Kingsley. This is self-reported. SendPulse does
 * not record who built a bot, so it cannot be verified from the account itself.
 */
export const botAttribution = 'Built by Wayne Gift Ludenyi and Kingsley. Self-reported, not independently verified.'

/** Bots covered by the attribution above. Instagram and website chat bots are not claimed. */
export const isMyBot = (b: { channel: string }) => b.channel === 'WHATSAPP'
