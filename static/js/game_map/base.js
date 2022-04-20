import { AcGameObject } from '/static/js/ac_game_object/base.js';
import { Controller } from '/static/js/controller/base.js';

class GameMap extends AcGameObject {
    constructor(root) {
        super();
        this.root = root;

        this.$canvas = $('<canvas tabindex=0 width=1280 height=720></canvas>');
        this.ctx = this.$canvas[0].getContext('2d');
        this.root.$kof.append(this.$canvas);
        this.ground_height = 450;  // 地面高度
        this.$timer = this.root.$kof.find('.kof-head-timer');

        this.time_left = 60000;  // 毫秒

        this.controller = new Controller(this.$canvas);
    }

    start() {
        this.$canvas.focus();
    }

    update() {
        this.time_left -= this.timedelta;
        if (this.time_left < 0) {
            this.time_left = 0;
            let [a, b] = this.root.players;
            if (a.status !== 6 && b.status !== 6) {
                a.status = b.status = 6;
                a.frame_current_cnt = b.frame_current_cnt = 0;
            }
        }
        this.$timer.text(parseInt(this.time_left / 1000));
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

export {
    GameMap
}