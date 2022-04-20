import { AcGameObject } from '/static/js/ac_game_object/base.js';

class Player extends AcGameObject {
    constructor(root, info) {
        super();

        this.root = root;
        this.x = info.x;
        this.y = info.y;
        this.direction = 1;  // 1 表示朝右，1 表示朝左
        this.vx = 0;
        this.vy = 0;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;
        this.id = info.id;
        this.ctx = this.root.game_map.ctx;
        this.gravity = 50;
        this.speed = 400;
        this.jump_speed = -1000;
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        this.animations = new Map();

        this.status = 3;  // 0 表示idle，1-2 表示walk，3 表示跳起，4 表示攻击，5 表示被攻击，6 是死亡

        this.frame_current_cnt = 0;
        this.frame_rate = 5;

        this.hp = 100;
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
    }

    start() {
        this.init_animations();
    }

    init_animations() {

    }

    is_attacked() {
        if (this.status === 6) return false;

        this.status = 5;
        this.vx = this.vy = 0;
        this.frame_current_cnt = 0;
        this.hp -= 10;
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100
        });

        if (this.hp <= 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
        }
    }

    update_control() {
        if (this.root.game_map.time_left <= 0) return;

        let w, s, d, a, space;
        let outer = this;

        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            s = this.pressed_keys.has('s');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');
            s = this.pressed_keys.has('ArrowBottom');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        if (this.status === 0 || this.status === 1) {  // idle或者walk
            if (space) {
                this.vx = 0;
                this.status = 4;
                this.frame_current_cnt = 0;
            } else if (w) {
                if (a) this.vx = -1;
                else if (d) this.vx = 1;
                this.vy = this.jump_speed;
                this.status = 3;
                this.frame_current_cnt = 0;
            } else if (a) {
                this.vx = -1;
                this.status = 1;
            } else if (d) {
                this.vx = 1;
                this.status = 1;
            } else {
                this.vx = 0;
                this.status = 0;
            }
        }
    }

    update_direction() {
        if (this.status === 6) return false;
        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x > you.x) me.direction = -1;
            else me.direction = 1;
        }
    }

    is_collision(r1, r2) {
        if (r1.x1 > r1.x2) [r1.x1, r1.x2] = [r1.x2, r1.x1];
        if (r2.x1 > r2.x2) [r2.x1, r2.x2] = [r2.x2, r2.x1];

        if (Math.min(r1.x2, r2.x2) < Math.max(r1.x1, r2.x1))
            return false;
        if (Math.min(r1.y2, r2.y2) < Math.max(r1.y1, r2.y1))
            return false;
        return true;
    }

    update_attack() {
        if (this.status === 4 && this.frame_current_cnt === 17) {
            let players = this.root.players;
            if (players[0] && players[1]) {
                let me = this, you = players[1 - this.id];
                let r1 = {
                    x1: this.x + 75 + this.direction * 125,
                    y1: this.y,
                    x2: this.x + 75 + this.direction * (50 + 50),
                    y2: this.y + 50,
                };
                let r2 = {
                    x1: you.x,
                    y1: you.y,
                    x2: you.x + you.width,
                    y2: you.y + you.height,
                };
                if (this.is_collision(r1, r2)) {
                    you.is_attacked();
                }
            }
        }
    }

    update() {
        this.update_control();
        this.update_direction();
        this.update_attack();

        if (this.status === 3) {  // 只有跳起状态才会受重力影响
            this.vy += this.gravity;
        }

        this.x += this.vx * this.speed * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        if (this.y > this.root.game_map.ground_height) {
            this.y = this.root.game_map.ground_height;
            this.vy = this.vx = 0;
            this.status = 0;  // 变成 idle
            this.frame_current_cnt = 0;
        }

        if (this.x < 0) this.x = 0;
        if (this.x > this.ctx.canvas.width - this.width) {
            this.x = this.ctx.canvas.width - this.width;
        }

        this.render();
    }

    render() {
        let status = this.status;
        if (status === 1 && this.vx * this.direction < 0) status = 2;

        let obj = this.animations.get(status);

        if (this.direction < 0) {
            this.ctx.save();
            this.ctx.scale(-1, 1);
            this.ctx.translate(-this.ctx.canvas.width, 0);

            if (obj && obj.loaded) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                let scale = obj.scale;
                this.ctx.drawImage(image, this.ctx.canvas.width - this.x - this.width, this.y + obj.offset_y, image.width * scale, image.height * scale);
            }

            this.ctx.restore();
        } else {
            if (obj && obj.loaded) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                let scale = obj.scale;
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * scale, image.height * scale);
            }
        }

        this.frame_current_cnt++;
        if (this.status === 4 || this.status === 5 || this.status === 6) {
            if (parseInt(this.frame_current_cnt / obj.frame_rate) >= obj.frame_cnt) {
                if (this.status !== 6) {
                    this.status = 0;
                } else {
                    this.frame_current_cnt = (obj.frame_cnt - 1) * obj.frame_rate;
                }
            }
        }
    }
}

export {
    Player
}