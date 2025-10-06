
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.alive = true;
        this.is_counted = false;
        this.dy = 0;
        this.is_on_ground = true;
        this.speed = 0.1;
        this.jump_height = 0.8;
        this.fireballs = [];
        this.fire_cooldown = 0;

        this.facing = 'left';
        this.frame_index = 0;
        this.frame_timer = 0;
        this.frame_interval = 12;
        this.frame_index_y = 0;
        this.health = 3;
    }
    update() {
        if (!this.alive) return;

        this.is_on_ground = false;

        if (player.x < this.x) {
            this.x -= this.speed;
            this.facing = 'left';
            this.frame_index_y = TILE_SIZE;
        } else if (player.x > this.x) {
            this.x += this.speed;
            this.facing = 'right';
            this.frame_index_y = TILE_SIZE;
        } else {
            this.frame_index_y = 0;
        }

        enemies.forEach(other_enemy => {
            if (other_enemy !== this && other_enemy.alive) {
                if (
                    Math.abs(this.x - other_enemy.x) < this.width &&
                    Math.abs(this.y - other_enemy.y) < this.height
                ) {
                    if (this.x < other_enemy.x) {
                        this.x -= 0.1;
                        other_enemy.x += 0.1;
                    } else {
                        this.x += 0.1;
                        other_enemy.x -= 0.1;
                    }
                }
            }
        });

        //if (this.x < 0) this.x = 0;
        //if (this.x + this.width > world_width) this.x = world_width - this.width;

        if (!this.is_on_ground) {
            this.dy += 0.02;
        }
        this.y += this.dy;


        floor_tiles.forEach(floor =>{
            if (this.y + this.height >= floor.y) {
                this.y = floor.y - this.height;
                this.dy = 0;
                this.is_on_ground = true;
            }
        })

        

        platforms.forEach(p => {
            if (
                this.y + this.height + this.dy >= p.y &&
                this.y + this.height <= p.y + p.height &&
                this.x + this.width > p.x &&
                this.x < p.x + p.width
            ) {
                this.y = p.y - this.height;
                this.is_on_ground = true;
                this.dy = 0;
            }
        });

        if (this.is_on_ground && Math.random() < 0.005) {
            this.dy = -this.jump_height;
            this.is_on_ground = false;
        }

        this.frame_timer++;
        if (this.frame_timer >= this.frame_interval) {
            this.frame_timer = 0;
            this.frame_index++;
            if (this.frame_index >= 4) {
                this.frame_index = 0;
            }
        }
    }
    draw() {
        if (!this.alive) return;


        ctx.font = "6px Arial";
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText("Health: " + this.health, this.x, this.y);

        ctx.save();
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(
                tile_map,
                this.frame_index * TILE_SIZE,
                3*this.frame_index_y,
                TILE_SIZE,
                TILE_SIZE,
                -this.x - this.width,
                this.y,
                this.width,
                this.height
            );
        } else {
            ctx.drawImage(
                tile_map,
                this.frame_index * TILE_SIZE,
                3*this.frame_index_y,
                TILE_SIZE,
                TILE_SIZE,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        ctx.restore();
    }
}