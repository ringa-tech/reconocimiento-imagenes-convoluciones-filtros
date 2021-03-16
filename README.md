# Reconocimiento de imágenes con IA - 01 
## Convoluciones y filtros

Este código fuente sirve como apoyo para el video "Reconocimiento de imágenes con IA - 01 - Convoluciones y filtros" del canal Ringa Tech

### Demo en vivo
Puedes probar esto en vivo en las siguientes rutas:

[Imagen](https://ringa-tech.com/vision01/imagen.html)

[Camara web](https://ringa-tech.com/vision01/camara.html)


### Cómo utilizarlo
Algo importante a considerar es que el código fuente utiliza funciones del canvas que no pueden ser utilizadas si se abren las páginas directamente desde tu equipo (e.g. si bajas el código y das doble clic sobre los HTMLs). Eso es por temas de seguridad de los canvas.

Para poder utilizarlo, debe ponerse en algún servidor web.
Personalmente lo que yo hice es:
- Tener python instalado (Yo tengo 3.7.9, espero funcione igual de ahí para arriba)
- Abrir una línea de comandos o terminal
- Navegar hasta la carpeta donde está el código
- Ejecutar `python -m http.server 8000`
- En un explorador abrir http://localhost:8000/imagen.html o http://localhost:8000/camara.html

Puedes hacerlo sobre cualquier otro servidor web que quieras como Apache o Nginx o lo que sea, pero eso es lo que personalmente hago.

### ¿Por qué con Javascript?
La convolución es un algoritmo general y se puede hacer en el lenguaje que gustes. De hecho primero las hice con Python, pero para que fuera fácil compartir el código (y considerando que programadores regularmente ven primero javascript antes que Python) decidí manejarlo así.