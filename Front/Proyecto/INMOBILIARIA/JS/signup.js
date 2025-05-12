
document.getElementById('formularioRegistro').addEventListener('submit', async function (e) {
    e.preventDefault(); 
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

        if (userType === 'Owner') {
            customLink.href = 'perfilVendedor.html';
            customLink.textContent = 'Ir a Perfil';
        } else{
            customLink.href = 'perfilCliente.html';
            customLink.textContent = 'Mi Perfil';
        }

        // Agregar el enlace personalizado
        defaultLinks.appendChild(customLink);

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
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const pass = document.getElementById('pass').value;
    const confPass = document.getElementById('confPass').value;
    const esPropietario = document.getElementById("chkPropietario").checked ? "Owner" : "Client";

    if (pass !== confPass) {
        alert("Las contraseñas no coinciden.");
        return;
    }
    if (pass < 8 && confPass < 8) {
        alert("La contraseña debe tener al menos 8 caracteres");
        return;
    }

    const nuevoUsuario = {
        name: nombre,
        email: correo,
        password: pass,
        usertype: esPropietario
    };

    try {
    const res = await fetch('https://localhost:7164/api/User', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
    });

    // Primero verifica si la respuesta tiene contenido
    const responseText = await res.text();
    let responseData = {};
    
    try {
        // Intenta parsear solo si hay contenido
        responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
        console.error('Error parsing JSON:', e);
    }

    if (!res.ok) {
        // Extrae el mensaje de error de la respuesta
        const errorMessage = responseData.message || 
                           'Error al registrar el usuario (código: ' + res.status + ')';
        throw new Error(errorMessage);
    }

    alert("Usuario registrado con éxito");
    setTimeout(() => location.href = 'login.html', 1500);
    
} catch (err) {
    console.error('Error detallado:', err);
    alert(err.message || "Ocurrió un error al registrar.");
}
});

