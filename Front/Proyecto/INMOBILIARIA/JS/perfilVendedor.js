document.addEventListener('DOMContentLoaded', async () => {
    debugger
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
        document.querySelector("#title h1").textContent = `${user.name}`;
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
        } else {
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
        let allProperties = propertiesWithImages.filter(p => p.ownerId === user.id);
        renderProperties(allProperties);
        const searchInput = document.getElementById('searchInput');

        searchInput.addEventListener('input', () => {
            const searchText = searchInput.value.toLowerCase();

            const filtered = allProperties.filter(prop =>    //La condición sirve en caso de que no venga con titulo
                (prop.title && prop.title.toLowerCase().includes(searchText)) ||
                (prop.location && prop.location.toLowerCase().includes(searchText))
            );

            renderProperties(filtered);
        });

    } catch (error) {
        console.error('Error al cargar propiedades:', error);
        showError();
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }

    try {
        const tableBody = document.getElementById("tblHistorial");
        const response = await fetch(`https://localhost:7164/api/Petitions/vendedor/${ID}`);
        if (!response.ok) throw new Error("No se pudo cargar el historial");

        const petitions = await response.json();

        if (petitions.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6">No hay solicitudes registradas.</td></tr>`;
        } else {
            petitions.forEach(p => {
                const row = document.createElement("tr");

                // Columna: Inmueble
                const inmueble = document.createElement("td");
                inmueble.innerHTML = `${p.propertyTitle || "Sin título"}<br><button onclick="viewProperty(${p.propertyId})">Ver</button>`;
                row.appendChild(inmueble);

                // Columna: Comprador
                const comprador = document.createElement("td");
                comprador.textContent = `${p.nombre} ${p.apellido}`;
                row.appendChild(comprador);

                // Columna: Teléfono
                const tel = document.createElement("td");
                tel.textContent = p.telefono;
                row.appendChild(tel);

                // Columna: Correo
                const email = document.createElement("td");
                email.textContent = p.correo;
                row.appendChild(email);

                // Columna: Comentarios
                const comentarios = document.createElement("td");
                comentarios.textContent = p.comentarios || "Sin comentarios";
                row.appendChild(comentarios);

                // Columna: Documentos
                const docs = document.createElement("td");
                const docBtns = [];

                if (p.documentoINE)
                    docBtns.push(`<button onclick="openDocument('${p.documentoINE}')">INE</button>`);
                if (p.documentoCURP)
                    docBtns.push(`<button onclick="openDocument('${p.documentoCURP}')">CURP</button>`);
                if (p.documentoComprobanteDomicilio)
                    docBtns.push(`<button onclick="openDocument('${p.documentoComprobanteDomicilio}')">Comprobante</button>`);

                docs.innerHTML = docBtns.join('<br>');
                row.appendChild(docs);

                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error cargando historial:", error);
    }





});
async function openDocument(fileName) {
    try {
        const url = `DOCS/${encodeURIComponent(fileName)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("No se pudo cargar el documento");

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
    } catch (err) {
        alert(`Error al abrir el archivo: ${err.message}`);
    }
}

// Función para renderizar propiedades
function renderProperties(properties) {
    const container = document.getElementById('propertiesContainer');

    if (!properties || properties.length === 0) {
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

    const response = fetch(`https://localhost:7164/api/Property/${id}`, {
        method: 'DELETE'
    });



    // Mostrar mensaje opcional
    alert("Propiedad eliminada correctamente.");


    window.location.href = `perfilVendedor.html`;


}

document.getElementById('btnVentas').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;

    try {
        const response = await fetch('https://localhost:7164/api/Petitions/por-mes?anio=2025');
        if (!response.ok) throw new Error('Error al obtener datos de ventas');

        const data = await response.json();
        const labels = data.map(d => d.nombreMes.charAt(0).toUpperCase() + d.nombreMes.slice(1));
        const values = data.map(d => d.cantidad);

        const canvas = document.getElementById('ventasChart');
        const ctx = canvas.getContext('2d');

        if (window.ventasChartInstance) {
            window.ventasChartInstance.destroy();
        }

        window.ventasChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Solicitudes por mes',
                    data: values,
                    backgroundColor: '#66a3ff',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Ventas - Inmobiliaria Uriangato',
                        font: { size: 18 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        // Esperar a que el gráfico se renderice correctamente
        setTimeout(() => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.setFontSize(14);
            pdf.text("Reporte de ventas mensuales (2025)", 15, 20);
            pdf.addImage(imgData, 'PNG', 10, 30, 180, 100);
            pdf.save("reporte_ventas_2025.pdf");
        }, 800); // Tiempo extendido para asegurar render

    } catch (err) {
        console.error("Error al generar el reporte:", err);
        alert("No se pudo generar el reporte de ventas.");
    }
});

