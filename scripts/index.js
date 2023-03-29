import { world } from '@minecraft/server';
import { HttpRequest, http, HttpRequestMethod, HttpHeader } from '@minecraft/server-net';
import { deathMessages } from './IDeathMessages';
import { webHookURL } from './setup';
world.events.beforeChat.subscribe((arg) => {
    const request = new HttpRequest(webHookURL);
    request.setBody(
        JSON.stringify(
            {
                "content": `[Minecraft] ${arg.sender.name}: ${arg.message}`,
            }
        )
    );
    request.setMethod(HttpRequestMethod.POST);
    request.setHeaders([new HttpHeader("Content-Type", "application/json")]);
    http.request(request);
});
world.events.playerJoin.subscribe((arg) => {
    const request = new HttpRequest(webHookURL);
    request.setBody(
        JSON.stringify(
            {
                "embeds": [
                    {
                        "title": `**${arg.playerName}**`,
                        "color": 65280,
                        "description": "Has joined the server!"
                    }
                ]
            }
        )
    );
    request.setMethod(HttpRequestMethod.POST);
    request.setHeaders([new HttpHeader("Content-Type", "application/json")]);
    http.request(request);
});
world.events.playerLeave.subscribe((arg) => {
    const request = new HttpRequest(webHookURL);
    request.setBody(
        JSON.stringify(
            {
                "embeds": [
                    {
                        "title": `**${arg.playerName}**`,
                        "color": 16711680,
                        "description": "Has left the server!"
                    }
                ]
            }
        )
    );
    request.setMethod(HttpRequestMethod.POST);
    request.setHeaders([new HttpHeader("Content-Type", "application/json")]);
    http.request(request);
});
world.events.entityDie.subscribe((arg) => {
    if (arg.deadEntity.typeId != 'minecraft:player') {
        return;
    };
    const embed = {
        "embeds": [
            {
                "title": `**${arg.deadEntity.name}**`,
                "color": 7340032,
                "description": ""
            }
        ]
    }
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
                embed['embeds']['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]} ${killer.replace(/§./g, '').replace(/(\n).+/, '')}.`
                break;
            case 'entityAttack':
                embed['embeds']['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]} ${killer.replace(/§./g, '').replace(/(\n).+/, '')}.`
                break;
            case 'magic':
                embed['embeds']['description'] = `${arg.deadEntity.name} was slain by ${killer.replace(/§./g, '').replace(/(\n).+/, '')} using magic.`
                break;
            case 'projectile':
                embed['embeds']['description'] = `${arg.deadEntity.name} was shot by ${killer.replace(/§./g, '').replace(/(\n).+/, '')}.`
                break;
            case 'contact':
                embed['embeds']['description'] = `${arg.deadEntity.name} was probably trying to fuck with a cactus.`
                break;
            default:
                break;
        }
    } else {
        embed['embeds']['description'] = `${arg.deadEntity.name} ${deathMessages[arg.damageSource.cause]}.`
    };
    const request = new HttpRequest(webHookURL);
    request.setBody(
        JSON.stringify(
            embed
        )
    );
    request.setMethod(HttpRequestMethod.POST);
    request.setHeaders([new HttpHeader("Content-Type", "application/json")]);
    http.request(request);
});