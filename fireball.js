class Fireball {
    constructor(x, y, width, height, dx, dy) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.dy = dy;
        this.frame_index = 0;
        this.frame_timer = 0;
        this.frame_interval = 12;
        this.life_span = 300;
    }
    update() {
        this.y += this.dy;
        this.x += this.dx;
        this.life_span--;

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
        ctx.save();
        if (this.dx < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(
                tile_map,
                this.frame_index * TILE_SIZE,
                4 * TILE_SIZE,
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
                4 * TILE_SIZE,
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