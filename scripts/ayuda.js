/*
 * Ayuda contextual: cada título principal lleva un botón (i) que abre un diálogo nativo (<dialog>)
 * con su explicación. Mejora progresiva: sin JavaScript el botón permanece oculto.
 */
(function () {
    'use strict';

    document.querySelectorAll('main > header > button').forEach(function (boton) {
        const dialogo = boton.nextElementSibling;
        boton.hidden = false;
        boton.addEventListener('click', function () {
            dialogo.showModal();
        });
    });

    /* Un clic fuera del cuadro (sobre el fondo) también cierra el diálogo. */
    document.querySelectorAll('main > header > dialog').forEach(function (dialogo) {
        dialogo.addEventListener('click', function (evento) {
            const cuadro = dialogo.getBoundingClientRect();
            const dentro = evento.clientX >= cuadro.left && evento.clientX <= cuadro.right
                && evento.clientY >= cuadro.top && evento.clientY <= cuadro.bottom;
            if (!dentro) {
                dialogo.close();
            }
        });
    });
})();
