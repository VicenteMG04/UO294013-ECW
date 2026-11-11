/*
 * Formulario de contacto sin backend.
 * Al enviarlo, valida (atributos nativos) y abre el cliente de correo con el mensaje preparado.
 * Se lanza desde JavaScript, y no con action="mailto:", para evitar el aviso de contenido
 * mixto / "no usa HTTPS" de Lighthouse y poder confirmar el envío al usuario.
 * Depende de textos.js (función texto).
 */
(function () {
    'use strict';

    const formulario = document.querySelector('form[data-destinatario]');
    if (!formulario) {
        return;
    }
    const confirmacion = formulario.querySelector('output');

    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const datos = new FormData(formulario);
        const asunto = texto('formulario.asunto') + ' (' + datos.get('nombre') + ')';
        const cuerpo = texto('formulario.cuerpo-nombre') + ': ' + datos.get('nombre') + '\r\n'
            + texto('formulario.cuerpo-email') + ': ' + datos.get('email') + '\r\n\r\n'
            + datos.get('mensaje');

        window.location.href = 'mailto:' + formulario.dataset.destinatario
            + '?subject=' + encodeURIComponent(asunto)
            + '&body=' + encodeURIComponent(cuerpo);

        confirmacion.dataset.i18n = 'formulario.confirmacion';
        confirmacion.textContent = texto('formulario.confirmacion');
    });
})();
