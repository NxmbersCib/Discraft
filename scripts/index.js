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
                "content": "",
                "username": arg.sender.name
            }
        )
    );
    request.setMethod(HttpRequestMethod.POST);
    http.request(request);
});