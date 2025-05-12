document.querySelector('form').addEventListener('submit', async function (e) {
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
    const email = document.getElementById('correo').value.trim();
    const password = document.getElementById('pass').value;

    try {
        const response = await fetch('https://localhost:7164/api/User/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || "Error de inicio de sesión.");
            return;
        }

        const user = await response.json();
        sessionStorage.setItem('user', JSON.stringify(user));
        console.log(user.userType);
        alert(`Bienvenid@, ${user.name}!`);

        if(user.userType == 'Owner'){
            window.location.href = "perfilVendedor.html";
        }
        else{
            window.location.href = "index.html";
        }
        
        
        

    } catch (err) {
        console.error(err);
        alert("Ocurrió un error al intentar iniciar sesión.");
    }
});
