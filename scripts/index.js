import { system, world } from '@minecraft/server';
import { HttpRequest, http, HttpRequestMethod, HttpHeader } from '@minecraft/server-net';
import { deathMessages } from './IDeathMessages';
import { webHookURL } from './setup';
system.events.beforeWatchdogTerminate.subscribe((arg) => arg.cancel = true);
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
world.events.beforeChat.subscribe((arg) => { weebhookMessage(`[Minecraft] ${arg.sender.name}: ${arg.message}`); });
world.events.playerJoin.subscribe((arg) => { weebhookMessage(undefined, [{ "title": `**${arg.playerName}**`, "color": 65280, "description": "Has joined the server!" }]); });
world.events.playerLeave.subscribe((arg) => { weebhookMessage(undefined, [{ "title": `**${arg.playerName}**`, "color": 16711680, "description": "Has left the server!" }]); });
function parseKillerName(name) {
    const newName = name
        .replace(/§./g, '')
        .replace(/(\n).+/, '');
    return newName;
};
world.events.entityDie.subscribe((arg) => {
    if (arg.deadEntity.typeId != 'minecraft:player') {
        return;
    };
    try {
        const embed = [{ "title": `**${arg.deadEntity.name} died**`, "color": 7340032, "description": "" }];
        let killer;
        if (arg.damageSource.damagingEntity === undefined) {
            killer = undefined;
        } else {
            killer = arg.damageSource.damagingEntity?.nameTag == '' ? arg.damageSource.damagingEntity.typeId.match(/(?<=:).+/g)?.[0] : arg.damageSource.damagingEntity?.nameTag
        };
        if (killer != undefined) {
            killer = `${killer[0].toUpperCase()}${killer.substring(1).replace(/_/g, ' ').replace('_v2', '').replace(/(?<= )./g, (char) => `${char.toUpperCase()}`)}`;
            switch (arg.damageSource.cause) {
                case 'entityExplosion':
                    embed[0]['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]} ${parseKillerName(killer)}.`
                    break;
                case 'entityAttack':
                    embed[0]['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]} ${parseKillerName(killer)}.`
                    break;
                case 'magic':
                    embed[0]['description'] = `${arg.deadEntity.name} was slain by ${parseKillerName(killer)} using magic.`
                    break;
                case 'projectile':
                    embed[0]['description'] = `${arg.deadEntity.name} was shot by ${parseKillerName(killer)}.`
                    break;
            };
        } else {
            embed[0]['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]}.`;
        };
        weebhookMessage(undefined, embed);
    } catch (error) {
        world.sendMessage(`Internal CraftLink error. You may report this to CibNumeritos#1094 (Discord).\n${error}, ${error.stack}`);
    };
});