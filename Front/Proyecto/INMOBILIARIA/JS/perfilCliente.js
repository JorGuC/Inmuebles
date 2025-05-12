document.addEventListener("DOMContentLoaded", async () => {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const defaultLinks = document.querySelector('.default-links');

    // Mostrar/ocultar menú
    hamburgerBtn.addEventListener('click', function () {
        hamburgerMenu.classList.toggle('active');
    });

    // Verificar sesión del usuario
    const userData = sessionStorage.getItem('user');
    let ID = null;
    let user = null;
    if (userData) {
        user = JSON.parse(userData);
        ID = user.id;
    } else {
        console.error("No se encontró usuario logueado.");
        document.getElementById('tblHistorial').innerHTML = `
            <tr><td colspan="4">Por favor, inicia sesión para ver tu historial.</td></tr>
        `;
        return;
    }
    console.log("Usuario:", user);

    if (user) {
        document.querySelector("#title h2").textContent = `${user.name}`;
    }

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


    
    try {
        const response = await fetch(`https://localhost:7164/api/Petitions?userId=${ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Error al obtener las peticiones');
        }

        const petitions = await response.json();
        console.log("Peticiones obtenidas:", petitions);

        const tableBody = document.getElementById('tblHistorial');
        
        if (!petitions || petitions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">No tienes peticiones registradas.</td>
                </tr>
            `;
        } else {
            while (tableBody.rows.length > 1) {
                tableBody.deleteRow(1);
            }

            petitions.forEach(petition => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${petition.propertyId}</td>
                    <td>${petition.nombre} ${petition.apellido}</td>
                    <td>${petition.comentarios || 'Sin comentarios'}</td>
                    <td>${petition.documentos ? `<a href="uploads/${petition.documentos}" target="_blank">${petition.documentos}</a>` : 'Ninguno'}</td>
                `;
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
        document.getElementById('tblHistorial').innerHTML = `
            <tr>
                <td colspan="4">Error al cargar el historial: ${error.message}</td>
            </tr>
        `;
    }


    
});