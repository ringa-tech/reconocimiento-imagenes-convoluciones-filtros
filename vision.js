/**
 * Convolucion regular
 * canvasFuente: Donde esta la imagen original
 * canvasDestino: Donde se va a pintar el resultado de la convolucion
 * Kernel: El kernel (acepta tamanos impar como 3x3, 5x5).
 * Divisor: El divisor general. Muchos tienen 1, pero otros como los desenfoques gaussianos si llevan otro valor
 *          Algunos ejemplos en https://es.wikipedia.org/wiki/N%C3%BAcleo_(procesamiento_digital_de_im%C3%A1genes)
 *
 * Esta funcion espera que la imagen del canvasFuente esté ya en escala de grises.
 * Cada vez que lo llamas con canvas de colores se muere un gatito
 */
function convolucionar(canvasFuente, canvasDestino, kernel, divisor) {
    var ctxFuente = canvasFuente.getContext("2d");
    var dataFuente = ctxFuente.getImageData(0, 0, canvasFuente.width, canvasFuente.height);
    var pixelesFuente = dataFuente.data;


    var ctxDestino = canvasDestino.getContext("2d");
    var dataDestino = ctxDestino.getImageData(0, 0, canvasDestino.width, canvasDestino.height);
    var pixelesDestino = dataDestino.data;

    var canvasWidth = canvasFuente.width;
    var canvasHeight = canvasFuente.height;

    //Limpiar el canvas destino
    ctxDestino.clearRect(0, 0, canvasWidth, canvasHeight);

    //Uso 1 y -1 para no hacer convoluciones en los pixeles de la orilla (se puede rellenar de 0s pero de momento NAH)
    for (var y=1; y < canvasHeight-1; y++) {
        for (var x=1; x < canvasWidth-1; x++) {

            //el indice del pixel actual. Me tarde en llegar esta mugrosa formulita. Viva canvas.
            //El *4 es porque cada pixel del canvas se separa en 4: rojo, verde, azul y alpha. Entonces andamos saltando de 4 en 4
            var i = ((y*canvasWidth) + x) * 4; 

            var val = 0;
            for (var k1=0; k1 < kernel.length; k1++) {
                for (var k2=0; k2 < kernel[k1].length; k2++) {
                    var k = kernel[k1][k2]; //valor del kernel

                    //El offset se usa para saber como buscar el indice correcto en la imagen
                    //Un kernel tamano 3 nos debe decir que el offset sea 1, para buscar -1, 0, 1
                    //Un kernel tamano 3 nos debe decir que el offset sea 2, para buscar -2, -1, 0, 1, 2
                    //etc...
                    var offset = Math.floor(kernel.length/2);

                    var ii = (((y+k1-offset)*canvasWidth) + (x+k2-offset)) * 4; //el indice de la imagen que vamos a multiplicar

                    val += pixelesFuente[ii] * k;
                }
            }

            val = val / divisor; //Dividimos entre un divisor solo para que el pixel no se haga excesivamente blanco por andar sumandole cosas

            pixelesDestino[i] = val;
            pixelesDestino[i+1] = val;
            pixelesDestino[i+2] = val;
            pixelesDestino[i+3] = 255;
        }
    }

    ctxDestino.putImageData(dataDestino, 0, 0);
}


/**
 * Casi lo mismo que el de arriba pero mas especifico para sobel completo (requiere 2 kernels)
 * Y si ves este comentario es que no llegue a unir las dos funciones en una sola hohohh
 */
 function convolucionarSobel(canvasFuente, canvasDestino, colorizar, blurFirst, lowThreshold) {

    //Sobel horizontal
    var kernelX = [
        [-1, 0,1],
        [-2, 0,2],
        [-1, 0,1],
    ];

    //Sobel vertical
    var kernelY = [
        [-1,-2,-1],
        [ 0, 0, 0],
        [ 1, 2, 1],
    ];

    var ctxFuente = canvasFuente.getContext("2d");
    var dataFuente = ctxFuente.getImageData(0, 0, canvasFuente.width, canvasFuente.height);
    var pixelesFuente = dataFuente.data;

    if (typeof blurFirst !== "undefined" && blurFirst) {
        //Pasar un proceso de blur antes?
        var blurCanvas = document.createElement("canvas");
        blurCanvas.width = canvasFuente.width;
        blurCanvas.height = canvasFuente.height;

        var ctxBlur = blurCanvas.getContext("2d");
        var dataBlur = ctxBlur.getImageData(0, 0, blurCanvas.width, blurCanvas.height);
        var pixelesFuente = dataFuente.data;

        var kernelBlur = [
            [1,2,1],
            [2,4,2],
            [1,2,1],
        ];
        var divisorBlur = 16;
        convolucionar(canvasFuente, blurCanvas, kernelBlur, divisorBlur);

        //Ahora el blurcanvas es la fuente :)
        var ctxFuente = blurCanvas.getContext("2d");
        var dataFuente = ctxFuente.getImageData(0, 0, canvasFuente.width, canvasFuente.height);
        var pixelesFuente = dataFuente.data;

    }

    var ctxDestino = canvasDestino.getContext("2d");
    var dataDestino = ctxDestino.getImageData(0, 0, canvasDestino.width, canvasDestino.height);
    var pixelesDestino = dataDestino.data;

    var canvasWidth = canvasFuente.width;
    var canvasHeight = canvasFuente.height;

    //Comentarios en la funcion de arriba
    ctxDestino.clearRect(0, 0, canvasWidth, canvasHeight);

    for (var y=1; y < canvasHeight-1; y++) {
        for (var x=1; x < canvasWidth-1; x++) {
            var i = ((y*canvasWidth) + x) * 4; //Comentarios en la funcion de arriba

            var valX = 0;
            var valY = 0;
            for (var k1=0; k1 < kernelX.length; k1++) {
                for (var k2=0; k2 < kernelX[k1].length; k2++) {
                    var kx = kernelX[k1][k2]; //valor del kernel en X
                    var ky = kernelY[k1][k2]; //valor del kernel en Y (se infiere mismo tamano :) )

                    //Comentarios en la funcion de arriba
                    var offset = Math.floor(kernelX.length/2);

                    var ii = (((y+k1-offset)*canvasWidth) + (x+k2-offset)) * 4; //el indice de la imagen que vamos a multiplicar

                    valX += pixelesFuente[ii] * kx;
                    valY += pixelesFuente[ii] * ky;
                }
            }

            //Sobel no lleva divisor :)

            var mag = Math.sqrt( (valX * valX) + (valY * valY) );

            //Colorizar? O regular?
            if (typeof colorizar !== "undefined" && colorizar) {
                var radians = Math.atan( valY / valX );
                var degrees = radians * (180/Math.PI);
                var rgb = changeHue("#FF0000", degrees);
                pixelesDestino[i] = rgb.r;
                pixelesDestino[i+1] = rgb.g;
                pixelesDestino[i+2] = rgb.b;
                pixelesDestino[i+3] = (mag/100) * 255;
            } else {

                if (typeof lowThreshold !== "undefined") { //Si tengo un threshold bajo solicitado, quito todo lo que sea menor para que quede con magnitud 0 :)
                    mag = mag > lowThreshold ? mag : 0;
                }
                pixelesDestino[i] = mag;
                pixelesDestino[i+1] = mag;
                pixelesDestino[i+2] = mag;
                pixelesDestino[i+3] = 255;
            }
        }
    }

    ctxDestino.putImageData(dataDestino, 0, 0);
}



// Funciones para colorizacion.
//
// Recibe un "RGB" base y un angulo y hace un cambio en el "Hue".
// Temas medio irrelevantes la verdad. Lo unico relevante que agregue yo
// de lo que saque de stackoverflow fue el 'cache', porque sin eso el
// desempeno es como de un 20%
var cache = [];
function changeHue(rgb, degree) {
    //Ver si lo tengo en cache
    //Normalizar los grados
    degree = Math.floor(degree);
    if ("degrees:"+degree in cache) {
        return cache["degrees:"+degree];
    }

    var hsl = rgbToHSL(rgb);
    hsl.h += degree;
    if (hsl.h > 360) {
        hsl.h -= 360;
    }
    else if (hsl.h < 0) {
        hsl.h += 360;
    }

    var value = hslToRGB(hsl);
    cache["degrees:"+degree] = value;
    return value;
}

// exepcts a string and returns an object
function rgbToHSL(rgb) {
    // strip the leading # if it's there
    rgb = rgb.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(rgb.length == 3){
        rgb = rgb.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(rgb.substr(0, 2), 16) / 255,
        g = parseInt(rgb.substr(2, 2), 16) / 255,
        b = parseInt(rgb.substr(4, 2), 16) / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    }
    else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    }
    else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    }
    else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    }
    else {
        s = (delta/(1-Math.abs(2*l - 1)))
    }

    return {
        h: h,
        s: s,
        l: l
    }
}

// expects an object and returns a string
function hslToRGB(hsl) {
    var h = hsl.h,
        s = hsl.s,
        l = hsl.l,
        c = (1 - Math.abs(2*l - 1)) * s,
        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
        m = l - c/ 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return {r:r,g:g,b:b};
}

function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}