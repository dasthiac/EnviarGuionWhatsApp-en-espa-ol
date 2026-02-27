console.log("Iniciando envío de mensajes de prueba (versión mejorada)...");

// Función para esperar un tiempo
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para enviar un mensaje
async function enviarMensaje(texto) {
    const main = document.querySelector("#main");
    if (!main) {
        console.error("No se encontró el contenedor #main");
        return false;
    }

    const textarea = main.querySelector('div[contenteditable="true"]');
    if (!textarea) {
        console.error("No se encontró el área de texto");
        return false;
    }

    // Enfocar y limpiar el área por si acaso
    textarea.focus();
    
    // Método más fiable para insertar texto (funciona en la mayoría de casos)
    // Usamos execCommand como intento principal, pero si falla, usamos innerText
    try {
        document.execCommand('selectall', false, null); // Seleccionar todo por si hay texto previo
        document.execCommand('delete', false, null);    // Borrar
        document.execCommand('insertText', false, texto);
    } catch (e) {
        // Fallback: asignar directamente
        textarea.innerText = texto;
    }
    
    // Disparar eventos necesarios para que WhatsApp detecte el cambio
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    // Esperar un poco a que el botón se habilite
    await sleep(300);

    // Buscar el botón de enviar (varios selectores posibles)
    const boton = main.querySelector('[data-testid="send"]') || 
                  main.querySelector('[data-icon="send"]') ||
                  main.querySelector('button[aria-label="Enviar"]'); // Según idioma

    if (!boton) {
        console.error("No se encontró el botón de enviar");
        return false;
    }

    // Verificar que el botón no esté deshabilitado
    if (boton.disabled) {
        console.error("El botón de enviar está deshabilitado");
        return false;
    }

    boton.click();
    console.log(`Mensaje enviado: "${texto}"`);
    
    // Esperar un poco después del envío para asegurar que se procesa
    await sleep(500);
    return true;
}

// Lista de mensajes de prueba
const mensajes = [
    "Hola, este es el mensaje 1",
    "Este es el mensaje 2",
    "Y este es el mensaje 3"
];

// Función principal
async function enviarTodos() {
    console.log(`Se enviarán ${mensajes.length} mensajes...`);
    for (let i = 0; i < mensajes.length; i++) {
        console.log(`Enviando mensaje ${i+1}: "${mensajes[i]}"`);
        const exito = await enviarMensaje(mensajes[i]);
        if (!exito) {
            console.error(`Falló el envío del mensaje ${i+1}. Deteniendo.`);
            break;
        }
        // Esperar 1.5 segundos entre mensajes para evitar saturación
        if (i < mensajes.length - 1) await sleep(1500);
    }
    console.log("Proceso completado.");
}

// Ejecutar
enviarTodos().catch(err => console.error("Error general:", err));
