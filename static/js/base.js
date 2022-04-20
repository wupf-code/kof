import { GameMap } from '/static/js/game_map/base.js';
import { Player } from '/static/js/player/base.js';
import { Kyo } from './player/kyo.js';

export class KOF {
    constructor(id) {
        this.id = id;
        this.$kof = $('#' + id);

        this.game_map = new GameMap(this);

        this.players = [
            new Kyo(this, {
                x: 200,
                y: 0,
                width: 150,
                height: 270,
                color: "blue",
                id: 0,
            }),
            new Kyo(this, {
                x: 930,
                y: 0,
                width: 150,
                height: 270,
                color: "red",
                id: 1,
            })
        ];
    }
}