// message event module
const { Kayn, REGIONS } = require('kayn');

// create new instance of Kayn library
const kayn = Kayn(process.env.RIOT_API_KEY)({
    region: REGIONS.NORTH_AMERICA,
    locale: 'en_US',
    debugOptions: {
        isEnabled: true,
        showKey: false
    },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: false,
        shouldExitOn403: false
    },
    cacheOptions: {
        cache: null,
        timeToLives: {
            useDefault: false,
            byGroup: {},
            byMethod: {}
        }
    }
});

module.exports = async (client, msg) => {
    // ignore bot messages
    if (msg.author.bot) { return; }

    // 'ping' interaction
    if (msg.content.toLowerCase() === 'ping') {
        msg.channel.send('Pong!');
        return;
    }

    // 'no u' interaction
    if (msg.content.toLowerCase() === 'no u') {
        msg.channel.send('No u!');
        return;
    }

    // 'owo' interaction
    if (msg.content.toLowerCase() === 'owo') {
        msg.channel.send('uwu');
        return;
    }

    // 'uwu' interaction
    if (msg.content.toLowerCase() === 'uwu') {
        msg.channel.send('owo');
        return;
    }

    // Parse command from msg
    if (!msg.content.startsWith(process.env.PREFIX)) { return; }
    const args = msg.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Grab command from Map, check if invalid
    if (command === '') {
        client.commands.get('help').run(client, msg, args, kayn, REGIONS);
        return;
    }
    const cmd = client.commands.get(command);
    if (!cmd) {
        msg.channel.send(`${msg}: invalid command!`);
        return;
    }

    // Run command
    cmd.run(client, msg, args, kayn, REGIONS);
};