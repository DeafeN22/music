
import * as ytdl from 'ytdl-core';
import { IBotPlugin, IBot } from '../bot/bot-interface';
import { MediaItem } from '../bot/media';
import { ParsedMessage } from 'discord-command-parser';
import { Message } from 'discord.js';
import * as moment from 'moment';

export default class YoutubePlugin implements IBotPlugin {

    preInitialize(bot: IBot): void {
        bot.helptext += '\n`youtube [url/idfragment]` - Add youtube audio to the queue\n'
        const player = bot.player;

        bot.commands.on('youtube', (cmd: ParsedMessage, msg: Message) => {
            if(cmd.arguments.length > 0) {
                cmd.arguments.forEach(arg => {
                    player.addMedia({ type: 'youtube', url: arg, requestor: msg.author.username });
                });
            }
        });

        player.typeRegistry.set(
            'youtube',
            {
                getDetails: (item: MediaItem) => new Promise((done, error) => {
                    item.url = item.url.includes('://') ? item.url : `https://www.youtube.com/watch?v=${item.url}`;
                    let result = ytdl.getInfo(item.url, (err, info) => {
                        if(info) {
                            item.name = info.title ? info.title : 'Unknown';
                            item.duration = moment('00:00:00', 'HH:mm:ss')
                                .add(parseInt(info.length_seconds), 's')
                                .format('HH:mm:ss');
                            done(item);
                        } else
                            error(err);
                    });
                }),
                getStream: (item: MediaItem) => new Promise((done, error) => {
                    let stream = ytdl(item.url, { filter: 'audioonly' });
                    if(stream)
                        done(stream);
                    else
                        error('Unable to get media stream');
                })
            }
        );
    }

    postInitialize(bot: IBot): void {
        
    }

}
