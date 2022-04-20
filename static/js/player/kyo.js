import { Player } from '/static/js/player/base.js';
import { GIF } from '/static/js/utils/gif.js';

export class Kyo extends Player {
    constructor(root, info) {
        super(root, info);
    }

    init_animations() {
        let outer = this;
        for (let i = 0; i < 7; i++) {
            let gif = GIF();
            gif.load(`/static/images/player/kyo/${i}.gif`);
            this.animations.set(i, {
                gif: gif,
                frame_cnt: 0,
                loaded: false,
                scale: 2,
                offset_y: 0,
                frame_rate: 5,
            });

            gif.onload = function () {
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;

                if (i === 1 || i === 2) {
                    obj.offset_y = -20;
                } else if (i === 3) {
                    obj.offset_y = -120;
                    obj.frame_rate = 4;
                }
            }
        }
    }
}