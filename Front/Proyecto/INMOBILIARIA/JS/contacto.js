document.addEventListener('DOMContentLoaded', function() {

    
    const form = document.querySelector('.form-container');
    const nombreInput = document.getElementById('nombre');
    const telefonoInput = document.getElementById('telefono');
    const correoInput = document.getElementById('correo');
    const submitButton = form.querySelector('.large');

    submitButton.addEventListener('click', function(e) {
        e.preventDefault(); // Prevenir el envío del formulario para validar primero

        // Validar campos
        let isValid = true;

        // Validar nombre 
        if (nombreInput.value.trim() === '') {
            isValid = false;
            nombreInput.style.borderColor = 'red';
        } else {
            nombreInput.style.borderColor = '';
        }

        // Validar teléfono 
        const telefonoRegex = /^\d{10,}$/;
        if (!telefonoRegex.test(telefonoInput.value.trim())) {
            isValid = false;
            telefonoInput.style.borderColor = 'red';
        } else {
            telefonoInput.style.borderColor = '';
        }

        // Validar correo electrónico
        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoRegex.test(correoInput.value.trim())) {
            isValid = false;
            correoInput.style.borderColor = 'red';
        } else {
            correoInput.style.borderColor = '';
        }

        
        if (isValid) {
            alert(`Gracias por contactarnos, ${nombreInput.value.trim()}`);
            
        } else {
            alert('Por favor completa correctamente todos los campos');
        }
    });
});