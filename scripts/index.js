import { world } from '@minecraft/server';
import { HttpRequest, http, HttpRequestMethod, HttpHeader } from '@minecraft/server-net';
import { deathMessages } from './IDeathMessages';
import { webHookURL } from './setup';
function weebhookMessage(messageContent = undefined, embeds = undefined) {
    const request = new HttpRequest(webHookURL);
    const body = {};
    if (messageContent) {
        body['content'] = messageContent;
    };
    if (embeds) {
        body['embeds'] = embeds;
    };
    request.setMethod(HttpRequestMethod.POST);
    request.setBody(JSON.stringify(body));
    request.setHeaders([new HttpHeader("Content-Type", "application/json")]);
    http.request(request);
};
world.events.beforeChat.subscribe((arg) => {
    weebhookMessage(`[Minecraft] ${arg.sender.name}: ${arg.message}`);
});
world.events.playerJoin.subscribe((arg) => {
    weebhookMessage(undefined, [
        { "title": `**${arg.playerName}**`, "color": 65280, "description": "Has joined the server!" }
    ])
});
world.events.playerLeave.subscribe((arg) => {
    weebhookMessage(undefined, [
        { "title": `**${arg.playerName}**`, "color": 16711680, "description": "Has left the server!" }
    ]);
});
world.events.entityDie.subscribe((arg) => {
    if (arg.deadEntity.typeId != 'minecraft:player') {
        return;
    };
    const embed = [
        {
            "title": `**${arg.deadEntity.name} died**`,
            "color": 7340032,
            "description": ""
        }
    ];
    /**
    * @type {string}
    */
    let killer;
    if (arg.damageSource.damagingEntity === undefined) {
        killer = undefined;
    } else {
        killer = arg.damageSource.damagingEntity?.nameTag == '' ? arg.damageSource.damagingEntity.typeId.match(/(?<=:).+/g)?.[0] : arg.damageSource.damagingEntity?.nameTag
    };
    if (killer != undefined) {
        killer = `${killer[0].toUpperCase()}${killer.substring(1).replace(/_/g, ' ').replace(/(?<= )./g, (char) => `${char.toUpperCase()}`)}`
        switch (arg.damageSource.cause) {
            case 'entityExplosion':
                embed[0]['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]} ${killer.replace(/§./g, '').replace(/(\n).+/, '')}.`
                break;
            case 'entityAttack':
                embed[0]['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]} ${killer.replace(/§./g, '').replace(/(\n).+/, '')}.`
                break;
            case 'magic':
                embed[0]['description'] = `${arg.deadEntity.name} was slain by ${killer.replace(/§./g, '').replace(/(\n).+/, '')} using magic.`
                break;
            case 'projectile':
                embed[0]['description'] = `${arg.deadEntity.name} was shot by ${killer.replace(/§./g, '').replace(/(\n).+/, '')}.`
                break;
            case 'contact':
                embed[0]['description'] = `${arg.deadEntity.name} was probably trying to fuck with a cactus.`
                break;
            default:
                break;
        }
        world.sendMessage(embed[0]['description'])
    } else {
        embed[0]['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]}.`
    };
    weebhookMessage(undefined, embed);
});