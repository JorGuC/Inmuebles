document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const defaultLinks = document.querySelector('.default-links');

    // Mostrar/ocultar menú
    hamburgerBtn.addEventListener('click', function () {
        hamburgerMenu.classList.toggle('active');
    });

    // Verificar sesión del usuario
    const userData = sessionStorage.getItem('user');

    if (userData) {
        const user = JSON.parse(userData);
        const userType = user.userType;

        // Eliminar los enlaces por defecto (Iniciar Sesión / Registrarse)
        defaultLinks.innerHTML = '';

        // Crear enlace personalizado según el tipo de usuario
        let customLink = document.createElement('a');
        const createLink = document.createElement('a');
        if (userType === 'Owner') {
            customLink.href = 'perfilVendedor.html';
            customLink.textContent = 'Ir a Perfil';
            
            
            createLink.href = 'aeInmueble.html';
            createLink.textContent = 'Nuevo Inmueble';
        } else{
            customLink.href = 'perfilCliente.html';
            customLink.textContent = 'Mi Perfil';
        }

        // Agregar el enlace personalizado
        defaultLinks.appendChild(customLink);
        defaultLinks.appendChild(createLink);

        // Agregar botón de cerrar sesión
        const logoutLink = document.createElement('a');
        logoutLink.href = 'index.html';
        logoutLink.textContent = 'Cerrar Sesión';
        logoutLink.addEventListener('click', function () {
            sessionStorage.removeItem('user');
            location.reload();
        });

        defaultLinks.appendChild(logoutLink);
    }
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