// Check summoner profile module
const Discord = require('discord.js');
const Summoner = require('../models/summonerSchema');

// helper function to process match data
const processMatch = async (championIdMap, summonerId, match) => {
    const { participantId } = match.participantIdentities.find(pi => pi.player.summonerId === summonerId);
    const participant = match.participants.find(p => p.participantId === participantId);
    const champion = championIdMap.data[participant.championId];
    return {
        gameCreation: match.gameCreation,
        didWin: participant.teamId === match.teams.find(({ win }) => win === 'Win').teamId,
        championName: champion.name,
        kills: participant.stats.kills,
        deaths: participant.stats.deaths,
        assists: participant.stats.assists
    }
}

module.exports = {
    name: 'profile',
    description: 'Shows the summoner profile for a particular user',
    usage: '!hechan profile [region] [summoner]',
    async run(client, message, args, kayn, REGIONS) {
        const numMatches = 10;
        let region;
        let summonerName;
        if (args.length > 0) { // if args are present
            if (args.length < 2) {
                return message.channel.send('Missing region and/or summoner name: !hechan profile [region] [summoner]');
            } else {
                region = args.shift().toLowerCase();
                if (!(Object.values(REGIONS).includes(region))) {
                    return message.channel.send(`"${region}" is not a valid region. Valid regions are: ${Object.values(REGIONS).join(', ').toUpperCase()}`);
                }
                summonerName = args.join(' ');
            }
        } else { // no args
            await Summoner.findOne({ userID: message.author.id }).exec(function (err, result) {
                if (err) {
                    console.error(err);
                    return message.channel.send('Oops, an error has occurred! Please try again!');
                }
                if (!result) {
                    return message.channel.send('Oops, you haven\'t set a summoner for your user yet: !hechan set region summoner');
                } else {
                    region = result.region;
                    summonerName = result.summName;
                }
            });
        }

        // prep for getting match data
        const championIdMap = await kayn.DDragon.Champion.listDataByIdWithParentAsId();
        const { id, accountId, profileIconId, summonerLevel } = await kayn.Summoner.by.name(summonerName).region(region);
        const { matches } = await kayn.Matchlist.by.accountID(accountId);
        const gameIds = matches.slice(0, numMatches).map(({ gameId }) => gameId);
        const games = await Promise.all(gameIds.map(kayn.Match.get));

        // get match data
        const processor = match => processMatch(championIdMap, id, match);
        const results = await Promise.all(games.map(processor));

        // output profile to Discord
        const embed = new Discord.RichEmbed()
            .setAuthor(`Summoner Profile: ${summonerName} [${region.toUpperCase()}]`)
            .setThumbnail(`https://opgg-static.akamaized.net/images/profile_icons/profileIcon${profileIconId}.jpg`)
            .setColor(0x86DBC7)
            .setDescription(`Here is some information about ${summonerName} [${region.toUpperCase()}].`)
            .addField('Level', summonerLevel, true);
        // last 20 games, top champs, ranked stats, last played
        return message.channel.send(embed);
    }
};