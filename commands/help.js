// help command module
module.exports = {
    name: 'help',
    description: 'Shows list of available commands',
    run(client, message, args, kayn, REGIONS) {
        message.channel.send({
            embed: {
                "color": 8838087,
                "fields": [
                    {
                        "name": "Hechan Commands",
                        "value": "Here is a list of all available Hechan commands and parameters."
                    },
                    {
                        "name": "!hechan help",
                        "value": "Displays this help guide"
                    }
                ]
            }
        });
    }
};