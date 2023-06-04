let input = document.getElementById('file-input');
let label = input.nextElementSibling;
let labelVal = label.innerHtml;

let saveButton = document.getElementById('save-button');

let canvas;
let ctx;
let image;


function truncate(value) {
    if (value < 0) {
        value = 0;
    }
    if (value > 255) {
        value = 255;
    }

    return value;
}


input.addEventListener('change', (e) => {
    //Add in canvas
    if (e.target.files) {
        let file = e.target.files[0]; //get first file
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function (ev) {
            image = new Image();
            image.src = ev.target.result;
            image.onload = function () {
                canvas = document.getElementById('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
            }
        }
    }


    //Change label
    let fileName = '';
    if (e.target.files && e.target.files.length > 1) {

        fileName = (input.getAttribute('data-multiple-caption') || '').replace('{count}', e.target.files.length);
    } else {
        fileName = input.value.split('\\').pop();
    }

    if (fileName) {
        label.innerText = fileName;
    } else {
        label.innerText = labelVal;
    }

    // // Firefox bug fix
    input.addEventListener('focus', function () {
        input.classList.add('has-focus');
    });
    input.addEventListener('blur', function () {
        input.classList.remove('has-focus');
    });
})


let ranges = document.querySelectorAll('input[type="range"]');

for (let range of ranges) {
    range.addEventListener('change', () => {
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let contrast = Number((document.getElementById('contrast')).value);
        let brightness = Number((document.getElementById('brightness')).value);
        let transparent = Number((document.getElementById('transparent')).value);

        let factor = 259 * (255 + contrast) / (255 * (259 - contrast));
        for (let i = 0; i < pixels.length; i += 4) {
            let r =  factor * (pixels[i] - 128) + 128;
            let g = factor * (pixels[i + 1] - 128) + 128;
            let b = factor * (pixels[i + 2] - 128) + 128;

            pixels[i] = truncate(r + brightness);
            pixels[i + 1] = truncate(g + brightness);
            pixels[i + 2] = truncate(b + brightness);

            pixels[i + 3] = pixels[i + 3] * transparent;
        }

        ctx.putImageData(imageData, 0, 0);
    })
}

function downloadCanvas() {
    // get canvas data
    let img = canvas.toDataURL();

    // create temporary link
    let tmpLink = document.createElement( 'a' );
    tmpLink.download = 'result.png'; // set the name of the download file
    tmpLink.href = img;

    // temporarily add link to body and initiate the download
    document.body.appendChild( tmpLink );
    tmpLink.click();
    document.body.removeChild( tmpLink );
}

saveButton.addEventListener('click', downloadCanvas);