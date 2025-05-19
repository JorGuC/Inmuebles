document.addEventListener('DOMContentLoaded', async () => {
    try {
        debugger
        if (userType === 'Owner') {
            alert(`No puedes acceder a esta página como vendedor.`);
             window.location.href = 'perfilVendedor.html'; // o cualquier otra ruta
            return; 
        } 

    // Verificar sesión del usuario
    
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('propertiesContainer').innerHTML = '';
        
        // Obtener propiedades
        const propertiesResponse = await fetch('https://localhost:7164/api/Property');
        
        if (!propertiesResponse.ok) {
            throw new Error(`Error HTTP: ${propertiesResponse.status}`);
        }

        const properties = await propertiesResponse.json();
        
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
});

// Función para renderizar propiedades
function renderProperties(properties) {
    const container = document.getElementById('propertiesContainer');
    
    if (!properties || properties.length === 0) {
        showNoResults();
        return;
    }


    const filteredProperties = properties.filter(property =>  !property.isReserved);

    container.innerHTML = filteredProperties.map(property => `
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
                <button class="view-button" onclick="viewProperty(${property.id})">Ver</button>
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