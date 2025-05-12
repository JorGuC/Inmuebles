document.addEventListener('DOMContentLoaded', async () => {
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

    // Actualizar el título del header con el nombre del usuario
    if (user) {
        document.querySelector("#title h2").textContent = `${user.name}`;
    }
    console.log("Usuario (vendedor):", user);
    let properties;
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
    try {
        
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('propertiesContainer').innerHTML = '';
        
        // Obtener propiedades
        const propertiesResponse = await fetch('https://localhost:7164/api/Property');
        
        if (!propertiesResponse.ok) {
            throw new Error(`Error HTTP: ${propertiesResponse.status}`);
        }

         properties = await propertiesResponse.json();
        
        // Verificar si hay propiedades
        if (!properties || properties.length === 0) {
            showNoResults();
            return;
        }

        //  Obtener imágenes para cada propiedad (en paralelo)
        const propertiesWithImages = await Promise.all(
            properties.map(async property => {
                try {
                    const imagesResponse = await fetch(`https://localhost:7164/api/PropertyImage/property/${property.id}`);
                    property.images = imagesResponse.ok ? await imagesResponse.json() : [];
                    return property;
                } catch (error) {
                    console.error(`Error cargando imágenes para propiedad ${property.id}:`, error);
                    property.images = [];
                    return property;
                }
            })
        );

        //  Renderizar propiedades
        renderProperties(propertiesWithImages.filter(p => p));
        
    } catch (error) {
        console.error('Error al cargar propiedades:', error);
        showError();
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }

    const filteredProperties = properties.filter(property => property.ownerId === ID  && property.isReserved);
    console.log(filteredProperties);
    const tableBody = document.getElementById("tblHistorial").getElementsByTagName("tbody")[0];

    filteredProperties.forEach(property => {
        const row = document.createElement("tr");

        const inmuebleCell = document.createElement("td");
        inmuebleCell.textContent = `Propiedad ${property.title}`;
        row.appendChild(inmuebleCell);

        const compradorCell = document.createElement("td");
        compradorCell.textContent = property.buyer;
        row.appendChild(compradorCell);

        const descripcionCell = document.createElement("td");
        descripcionCell.textContent = property.description;
        row.appendChild(descripcionCell);

        const documentosCell = document.createElement("td");
        const documentosLink = document.createElement("a");
        documentosLink.href = `#${property.documents}`;  // Puede ser una URL real si los documentos están en el servidor
        documentosLink.textContent = property.documents;
        documentosCell.appendChild(documentosLink);
        row.appendChild(documentosCell);

        tableBody.appendChild(row);
    });

});

// Función para renderizar propiedades
function renderProperties(properties) {
    const container = document.getElementById('propertiesContainer');
    const userData = sessionStorage.getItem('user');
    const user = JSON.parse(userData);
    const userProperties = properties.filter(prop => prop.ownerId === user.id);

    if (!userProperties || userProperties.length === 0) {
        showNoResults();
        return;
    }


    container.innerHTML = properties.map(property => `
        <div class="propiedad">
        <div class="img-prop">
                ${property.images?.length > 0 ? 
                    `<img src="IMG/${property.images[0].imageUrl}"></img>
                         alt="${property.title}" 
                         onerror="handleImageError(this)">` : 
                    `<div class="no-image">Sin imagen</div>`}
            </div>
            <div class="cont-prop">
                <h3>${property.title || 'Sin título'}</h3>
                <p>${property.description || 'Sin descripción'}</p>
                <div class="property-details">
                    <span>${property.bedrooms || 0} Hab.</span>
                    <span>${property.bathrooms || 0} Baños</span>
                    <span>$${(property.price || 0).toLocaleString()}</span>
                </div>
                <div>
                    <button class="view-button" onclick="viewProperty(${property.id})">Ver</button>
                    <button class="view-button" onclick="editProperty(${property.id})">Editar</button>
                    <button class="view-button" onclick="deleteProperty(${property.id})">Borrar</button>
                </div>
            </div>
        </div>
    `).join('');
}



function handleImageError(imgElement) {
    imgElement.onerror = null;
    imgElement.src = 'i5.walmartimages.com.mx/gr/images/product-images/img_large/00040101080200L1.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF';
}

function showError() {
    document.getElementById('propertiesContainer').innerHTML = `
        <div class="error-message">
            <p>Error al cargar propiedades. Intenta:</p>
            <ul>
                <li>Verificar tu conexión a Internet</li>
                <li>Recargar la página</li>
                <li>Intentar más tarde</li>
            </ul>
            <button onclick="window.location.reload()">Recargar</button>
        </div>
    `;
}

function showNoResults() {
    document.getElementById('propertiesContainer').innerHTML = `
        <div class="no-results">
            <p>No se encontraron propiedades disponibles</p>
        </div>
    `;
}

function viewProperty(id) {
    window.location.href = `propiedad.html?id=${id}`;
}

function editProperty(id) {
    
    // const usuario = JSON.parse(sessionStorage.getItem('user'));
    // console.log(usuario.id);
    window.location.href = `aeInmueble.html?id=${id}`;
}

function deleteProperty(id) {
    
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar esta propiedad?");

    if (!confirmDelete) return;

        const response =  fetch(`https://localhost:7164/api/Property/${id}`, {
            method: 'DELETE'
        });

        

        // Mostrar mensaje opcional
        alert("Propiedad eliminada correctamente.");

        
        window.location.href = `perfilVendedor.html`;

    
}