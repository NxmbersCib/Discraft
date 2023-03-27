import { world } from '@minecraft/server';
import { HttpRequest, http, HttpRequestMethod } from '@minecraft/server-net';
import { webHookURL } from './setup';
world.events.beforeChat.subscribe((arg) => {
    const request = new HttpRequest(webHookURL);
    request.setBody(
        JSON.parse(
            {
                "content": arg.message,
                "username": arg.sender.name
            }
        )
    );
    request.setMethod(HttpRequestMethod.POST);
    http.request(request);
});
world.events.playerJoin.subscribe((arg) => {
    const request = new HttpRequest(webHookURL);
    request.setBody(
        JSON.parse(
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
    http.request(request);
});
world.events.playerLeave.subscribe((arg) => {
    const request = new HttpRequest(webHookURL);
    request.setBody(
        JSON.parse(
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
    http.request(request);
});
world.events.entityDie.subscribe((arg) => {
    if (arg.deadEntity.typeId != 'minecraft:player') {
        return;
    };
    const request = new HttpRequest(webHookURL);
    request.setBody(
        JSON.parse(
            {
                "embeds": [
                    {
                        "title": `**${arg.deadEntity.name}**`,
                        "color": 7340032,
                        "description": arg.damageSource.cause//parseDeathCause(arg.damageSource.cause)
                    }
                ]
            }
        )
    );
    request.setMethod(HttpRequestMethod.POST);
    http.request(request);
});