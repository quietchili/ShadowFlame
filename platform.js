
class Platform {
    constructor(tilemap_img, src_x, src_y, width, height, x, y, tile_width, tile_height) {
        this.tilemap_img = tilemap_img;
        this.src_x = src_x;
        this.src_y = src_y;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.tile_width = tile_width;
        this.tile_height = tile_height;
    }

    update() {
    }
    draw() {
        //ctx.fillStyle = "rgba(0,0,0,1)";
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(
            this.tilemap_img,
            this.src_x,//source x
            this.src_y,//source y
            this.tile_width,//source width
            this.tile_height,//source height
            this.x,//destination x
            this.y,//destination y
            this.width,//destination width
            this.height//destination height
        );
    }
}