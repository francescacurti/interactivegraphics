// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) { 
    let hb = bgImg.height;
    let wb = bgImg.width;
    let hf = fgImg.height;
    let wf = fgImg.width;

    for (let y = 0; y < hb; y++) {
        for (let x = 0; x < wb; x++) {
            let xpos = x - fgPos.x;
            let ypos = y - fgPos.y;

            if (xpos >= 0 && xpos < wf && ypos >= 0 && ypos < hf) {
                const bpos = ((y * wb)+ x) * 4;
                const fpos = ((ypos * wf) + xpos) * 4;

                const br = bgImg.data[bpos + 0] / 255;
                const bg = bgImg.data[bpos + 1] / 255;
                const bb = bgImg.data[bpos + 2] / 255;
                const ba = bgImg.data[bpos + 3] / 255;

                const fr = fgImg.data[fpos + 0] / 255;
                const fg = fgImg.data[fpos + 1] / 255;
                const fb = fgImg.data[fpos + 2] / 255;
                const fa = fgImg.data[fpos + 3] / 255;
				
                const fo = fgOpac;
                const a = (fa * fo) + (1 - (fa * fo)) * ba;
                const r = ((fa * fo) * fr + (1 - (fa * fo)) * ba * br);
                const g = ((fa * fo) * fg + (1 - (fa * fo)) * ba * bg);
                const b = ((fa * fo) * fb + (1 - (fa * fo)) * ba * bb);

                bgImg.data[bpos + 0] = r * 255;
                bgImg.data[bpos + 1] = g * 255;
                bgImg.data[bpos + 2] = b * 255;
                bgImg.data[bpos + 3] = a * 255;
            }
        }
    }
}
