const discord = require("discord.js");
const { MessageActionRow, MessageButton } = require('discord.js');
const { ticketChannelId, adminChannelId, ticketPrefix } = require('./config.json');

const client = new discord.Client({
	intents: [
		"GUILDS",
		"GUILD_MESSAGES"
	]
});

client.on("ready", () => {
	const status = [
		'BOT DESENVOLVIDO EM JAVASCRIPTS ',
	];
	i = 0;
	setInterval(() => client.user.setActivity(`${status[i++ % status.length]}`, {
		type: 'PLAYING',
	}), 6000 * 15);
	client.user.setStatus('dnd')
	console.log("😍 " + client.user.username + " started working!");
});

client.on("messageCreate", async (msg) => {
	if (msg.author.bot) return;
	if (!msg.member.permissions.has('ADMINISTRATOR')) return;
	if (msg.channel.type === "dm") return;

	const prefix = ticketPrefix;

	if (!msg.content.startsWith(prefix)) return;
	const args = msg.content.toLowerCase().split(" ");

	const ticketChannel = client.channels.cache.find(channel => channel.id === ticketChannelId);

	const row = new discord.MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('ticket')
				.setLabel('Criar Ticket')
				.setEmoji('932520038030770196')
				.setStyle('SECONDARY'),
		);

	const embed = new discord.MessageEmbed()
		.setColor('0000ff')
		.setTitle('Criar ticket de atendimento')
		.addField('☄️ Detalhes', 'Ao criar um ticket você deve especificar o motivo do chamado, seja para dúvidas, compras ou suporte.', true)
		.setImage('https://media.discordapp.net/attachments/767174280281980968/992075121185538139/1.png')
		.setAuthor({ name: 'DevLog', iconURL: 'https://media.discordapp.net/attachments/767174280281980968/992075121185538139/1.png', url: 'https://devlogsoftware.netlify.app/' })
		.setURL('https://discord.com/invite/dX5RtYepjp')
		.setDescription('Para dúvidas, suporte, contato profissional, orçamentos e compras.')
		.setFooter({ text: 'Devlog Software - All Copyright reserved for © DevLog Software', iconURL: 'https://media.discordapp.net/attachments/767174280281980968/992075121185538139/1.png' });

	await ticketChannel.send({ ephemeral: true, embeds: [embed], components: [row] });
});

client.on('interactionCreate', interaction => {
	const protocol = new Date().getTime();
	if (interaction.customId === "ticket") {
		if (!interaction.isButton()) return;
		const interactionUser = client.users.cache.get(interaction.member.user.id);
		const interactionChannelName = `ticket-${interaction.user.username}`;
		const guild = client.guilds.cache.get(interaction.guild.id);
		const adminAlertChannel = client.channels.cache.find(channel => channel.id === adminChannelId);
		const guildChannels = guild.channels.cache;
		const errorEmbed = new discord.MessageEmbed()
			.setTitle("❌ Você já possui um ticket aberto!")
			.setDescription('👉 Encerre o ticket atual para poder abrir um novo.')
			.setColor("0000ff")
			.setFooter({ text: 'Devlog Software - All Copyright reserved for © DevLog Software ', iconURL: 'https://media.discordapp.net/attachments/767174280281980968/992075121185538139/1.png' });

		const sucessEmbed = new discord.MessageEmbed()
			.setTitle("✅ Ticket criado com sucesso!")
			.setDescription('👉 Você foi mencionado no canal correspondente ao seu ticket.')
			.setColor("0000ff")
			.setFooter({ text: 'Devlog Software - All Copyright reserved for © DevLog Software', iconURL: 'https://media.discordapp.net/attachments/767174280281980968/992075121185538139/1.png' });

		for (const channel of guildChannels.values()) {
			if (channel.name === interactionChannelName.toLowerCase()) {
				interaction.reply({ ephemeral: true, embeds: [errorEmbed] });
				return;
			}
		}

		const adminMessage = new discord.MessageEmbed()
			.setTitle("☄️ Um ticket foi aberto!")
			.setDescription(`💾PROTOCOLO: ${interaction.user.id}/${protocol}`)
			.addField('😀 Usuário:', `${interaction.user.username}`, true)
			.setColor("0000ff")
			.setFooter({ text: 'Devlog Software - All Copyright reserved for © DevLog Software', iconURL: 'https://media.discordapp.net/attachments/767174280281980968/992075121185538139/1.png' });

		adminAlertChannel.send({ ephemeral: true, embeds: [adminMessage] });

		guild.channels.create(`ticket-${interaction.user.username}`, {
			permissionOverwrites: [
				{
					id: interaction.user.id,
					allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
				},
				{
					id: interaction.guild.roles.everyone,
					deny: ["VIEW_CHANNEL"]
				}
			],
			type: 'text'
		}).then(async channel => {
			channel.send(`<@${interaction.user.id}>`);
			const embed = new discord.MessageEmbed()
				.setTitle("☄️ Você solicitou um ticket.")
				.setDescription("Entraremos em contato o mais rápido possível, aguarde. Clique no botão vermelho para encerrar o ticket.")
				.setColor("0000ff")
				.setFooter({ text: '', iconURL: 'https://media.discordapp.net/attachments/767174280281980968/992075121185538139/1.png' });

			const deleteButton = new discord.MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('delete')
						.setLabel('Cancelar Ticket')
						.setEmoji('✖️')
						.setStyle('DANGER'),
				);

			const sent = await channel.send({ ephemeral: true, embeds: [embed], components: [deleteButton] });
			interaction.reply({ ephemeral: true, embeds: [sucessEmbed] });
		})
	}
	if (interaction.customId === "delete") {
		interaction.channel.delete();
		const adminAlertChannel = client.channels.cache.find(channel => channel.id === adminChannelId);
		const deleteMessage = new discord.MessageEmbed()
			.setTitle("❌ Ticket encerrado!")
			.setDescription(`💾PROTOCOLO: ${interaction.user.id}/${protocol}`)
			.setColor("0000ff")
			.setFooter({ text: 'Devlog Software - All Copyright reserved for © DevLog Software ', iconURL: 'https://media.discordapp.net/attachments/767174280281980968/992075121185538139/1.png' });

		try {
			interaction.user.send({ ephemeral: true, embeds: [deleteMessage] });
		} catch (err) {
			adminAlertChannel.send({ ephemeral: true, embeds: [deleteMessage] });
		}
	}
});

client.login('OTAyOTMyODQ1NjkyMDc2MDMy.Gg1qYo.xluve8DRjP6UXG43-2JSgN_oRDQpxpzOUQbYoY');
