import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import http from 'http';

// Replace with your actual bot token and client ID
const TOKEN = 'MTM0MTcxODUwNTYwNjYxMDk2NA.GjWYPH.y8SpvxlcU0lTvp58p83785_nrfw2iNTxNOoTxc'; // Replace with your bot token
const CLIENT_ID = '1341718505606610964'; // Replace with your bot's client ID
const GUILD_ID = '1222570193096671343'; // Replace with your server (guild) ID

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Slash commands to be registered
const commands = [
  new SlashCommandBuilder()
    .setName('aircraft_register')
    .setDescription('Registers aircrafts onto the SkyLuxe Database!'),
  new SlashCommandBuilder()
    .setName('view_aircrafts')
    .setDescription('View the registered aircrafts in the SkyLuxe Database!'),
  new SlashCommandBuilder()
    .setName('aircraft_remove')
    .setDescription('Remove an aircraft from the SkyLuxe Database!')
    .addStringOption(option => 
      option.setName('aircraft')
        .setDescription('The aircraft to remove')
        .setRequired(true)
    ),
].map(command => command.toJSON());

// Register slash commands
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), // Registers commands for a specific guild (server)
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
    console.log(`Commands registered: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// When the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Set custom status for the bot
  client.user.setPresence({
    activities: [
      { name: 'Development', type: 3 }, // 3 = Watching
    ],
    status: 'dnd', // online, idle, dnd, invisible
  });
  console.log('Bot status has been set!');
});

// Mock database for aircrafts
let aircrafts = ['Boeing 747', 'Airbus A320', 'Cessna 172'];

// Listen for slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'aircraft_register') {
    const loadingEmbed = new EmbedBuilder()
      .setDescription('... Loading embed');

    await interaction.reply({ embeds: [loadingEmbed] });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "SkyLuxe Staff", // The name next to the logo
        iconURL: "https://cdn.discordapp.com/emojis/1322230317742034985.webp?size=96"
      })
      .setColor('#0F52BA')
      .setTitle('Aircrafts')
      .setDescription('SkyLuxe Fleet')
      .addFields(aircrafts.map(aircraft => ({ name: aircraft, value: '\u200B' })));

    await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === 'view_aircrafts') {
    const loadingEmbed = new EmbedBuilder()
      .setDescription('... Loading');

    await interaction.reply({ embeds: [loadingEmbed] });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "SkyLuxe Staff", // The name next to the logo
        iconURL: "https://cdn.discordapp.com/emojis/1322230317742034985.webp?size=96"
      })
      .setColor('#0F52BA')
      .setTitle('Aircrafts')
      .setDescription('SkyLuxe Fleet')
      .addFields(aircrafts.map(aircraft => ({ name: aircraft, value: '\u200B' })));

    await interaction.editReply({ embeds: [embed] });
  }

  if (interaction.commandName === 'aircraft_remove') {
    const aircraftToRemove = interaction.options.getString('aircraft');

    if (!aircrafts.includes(aircraftToRemove)) {
      await interaction.reply({ content: `Aircraft ${aircraftToRemove} not found in the database.`, ephemeral: true });
      return;
    }

    aircrafts = aircrafts.filter(aircraft => aircraft !== aircraftToRemove);

    await interaction.reply({ content: `Aircraft ${aircraftToRemove} has been removed from the database.`, ephemeral: true });
  }
});

// Log in to Discord using the bot token
client.login(TOKEN);

// Keep the bot online with a basic HTTP server
http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!\n');
  })
  .listen(8080);

console.log('Ping server is running!');
