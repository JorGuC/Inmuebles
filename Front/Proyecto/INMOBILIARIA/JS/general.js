let userData;
let userType;
let defaultLinks;
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    defaultLinks  = document.querySelector('.default-links');

    // Mostrar/ocultar menú
    hamburgerBtn.addEventListener('click', function () {
        hamburgerMenu.classList.toggle('active');
    });
    // Verificar sesión del usuario
    userData = sessionStorage.getItem('user');

    if (userData) {
        const user = JSON.parse(userData);
        userType = user.userType;

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

});
