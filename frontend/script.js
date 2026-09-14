// Declaramos la posición actual del slider
let indiceSlide = 0;

// Función para avanzar o retroceder
function moverSlide(direccion) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    // Cambiamos el índice
    indiceSlide += direccion;

    // Reiniciar ciclo si llega al final o al inicio
    if (indiceSlide >= slides.length) { indiceSlide = 0; }
    if (indiceSlide < 0) { indiceSlide = slides.length - 1; }

    // Ocultar todas las imágenes y desactivar puntos
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Mostrar la imagen actual y su punto correspondiente
    slides[indiceSlide].classList.add('active');
    if (dots[indiceSlide]) {
        dots[indiceSlide].classList.add('active');
    }
}

document.querySelectorAll('.productos-slider').forEach(slider => {
    const track = slider.querySelector('.productos-track');
    const productos = slider.querySelectorAll('.producto');
    let posicion = 0;

    slider.querySelector('.siguiente').addEventListener('click', () => {
        const visibles = window.innerWidth <= 450 ? 1 : window.innerWidth <= 700 ? 2 : 4;
        const maximo = Math.max(0, productos.length - visibles);

        posicion = Math.min(posicion + 1, maximo);
        moverProductos();
    });

    slider.querySelector('.anterior').addEventListener('click', () => {
        posicion = Math.max(posicion - 1, 0);
        moverProductos();
    });

    function moverProductos() {
        const ancho = productos[0].getBoundingClientRect().width + 18;
        track.style.transform = `translateX(-${posicion * ancho}px)`;
    }
});
