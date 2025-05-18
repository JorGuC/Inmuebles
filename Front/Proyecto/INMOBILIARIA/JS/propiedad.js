
let property = null;
document.addEventListener("DOMContentLoaded", async () => {
    /* ==========================================
   SELECCIÓN DE ARCHIVOS
   ========================================== */
    document.querySelectorAll(".document-column").forEach(column => {
        column.addEventListener("click", (e) => {
            const input = column.querySelector("input[type='file']");

            // Evita abrir el input si el usuario está haciendo clic sobre el botón de eliminar u otro contenido
            if (e.target.tagName.toLowerCase() !== "input") {
                input?.click();
            }
        });
    });


    function setupFilePreview(inputId, previewContainerId) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(previewContainerId);

        input.addEventListener('change', () => {
            container.innerHTML = ''; // Limpiar previsualización previa

            const file = input.files[0];
            if (!file) return;

            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    fileItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" style="max-width: 100px; max-height: 100px;"/><br>
                    <span>${file.name}</span>
                `;
                    container.appendChild(fileItem);
                };
                reader.readAsDataURL(file);
            } else {
                fileItem.innerHTML = `<span>${file.name}</span>`;
                container.appendChild(fileItem);
            }
        });
    }

    // Inicializar previews
    setupFilePreview('doc-ine', 'preview-ine');
    setupFilePreview('doc-curp', 'preview-curp');
    setupFilePreview('doc-comprobante', 'preview-comprobante');


    /* ==========================================
SELECCIÓN DE ARCHIVOS
========================================== */
    let ID = null;
    if (userData) {
        const user = JSON.parse(userData);
        ID = user.id;
    }



    const propertyId = getPropertyIdFromURL();
    if (!propertyId) {
        console.error("No se encontró el ID de propiedad.");
        return;
    }
    try {

        const response = await fetch(`https://localhost:7164/api/Property/${propertyId}`);
        property = await response.json();
        console.log("Datos de la propiedad:", property);

        // Actualiza el título del header
        document.querySelector("#title h2").textContent = property.title;

        // Contenedor principal
        const mainContainer = document.querySelector(".main-container");
        mainContainer.innerHTML = `
            <div class="row">
                <div class="info-section col-50">
                    <h3>Información de la Propiedad</h3>
                    <p><strong>Nombre:</strong> ${property.title}</p>
                    <p><strong>Dirección:</strong> ${property.location}</p>
                    <p><strong>Precio:</strong> $${property.price.toLocaleString()}</p>
                    <p><strong>Descripción:</strong> ${property.description}</p>
                </div>

                <div class="photos-section col-50">
                    <h3>Fotos</h3>
                    ${generatePhotoRows(property.images)}
                </div>
            </div>

            <div class="info-section col-100">
                <h3>Más Información</h3>
                <p><strong>Habitaciones:</strong> ${property.bedrooms}</p>
                <p><strong>Baños:</strong> ${property.bathrooms}</p>
                <p><strong>Medios Baños:</strong> ${property.halfBathrooms}</p>
                <p><strong>Estacionamiento:</strong> ${property.hasParking ? "Sí" : "No"}</p>
            </div>
        `;

        // Agrega el evento de fullscreen a las imágenes
        document.querySelectorAll(".photo img").forEach(img => {
            img.addEventListener("click", () => {
                if (img.requestFullscreen) {
                    img.requestFullscreen();
                } else if (img.webkitRequestFullscreen) {
                    img.webkitRequestFullscreen();
                } else if (img.msRequestFullscreen) {
                    img.msRequestFullscreen();
                }
            });
        });

    } catch (error) {
        console.error("Error cargando los datos de la propiedad:", error);
    }



    async function retryFetch(url, options = {}, maxRetries = 3, delay = 1000) {
        debugger
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Intento ${attempt + 1} de ${maxRetries + 1}: ${url}`);
                const response = await fetch(url, options);

                if (response.ok) {
                    return response;
                }

                // Si es el último intento, lanza el error con el contenido
                if (attempt === maxRetries) {
                    const errorText = await response.text();
                    throw new Error(`Error final - Status ${response.status}: ${errorText}`);
                }

                console.warn(`❌ Falló el intento ${attempt + 1}. Reintentando en ${delay}ms...`);

            } catch (err) {
                // Si es el último intento o el error es de red
                if (attempt === maxRetries) {
                    console.error(`❌ Error al hacer fetch: ${err.message}`);
                    throw err;
                }

                // Delay antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    document.getElementById("aceptar").addEventListener('click', async (e) => {
        e.preventDefault();

        if (ID === null) {
            alert('Debes iniciar sesión para continuar');
            return;
        }

        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const correo = document.getElementById('correo').value;
        const telefono = document.getElementById('telefono').value;
        const comentarios = document.getElementById('descripcion').value;

        const ineFile = document.getElementById('doc-ine').files[0];
        const curpFile = document.getElementById('doc-curp').files[0];
        const comprobanteFile = document.getElementById('doc-comprobante').files[0];

        if (!ineFile || !curpFile || !comprobanteFile) {
            alert('Debes subir los tres documentos: INE, CURP y Comprobante de domicilio');
            return;
        }

        try {
            const now = Date.now();
            const ineName = `${now}_INE_${ineFile.name}`;
            const curpName = `${now}_CURP_${curpFile.name}`;
            const comprobanteName = `${now}_COMPROBANTE_${comprobanteFile.name}`;

            // Paso 1: Crear la petición
            const petitionData = {
                Nombre: nombre,
                Apellido: apellido,
                Correo: correo,
                Telefono: telefono,
                Comentarios: comentarios,
                PropertyId: parseInt(propertyId),
                DocumentoINE: ineName,
                DocumentoCURP: curpName,
                DocumentoComprobanteDomicilio: comprobanteName,
                UserId: ID
            };

            const petitionResponse = await fetch('https://localhost:7164/api/Petitions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(petitionData)
            });

            if (!petitionResponse.ok) {
                const errorData = await petitionResponse.text();
                throw new Error(`Error al crear la petición: ${errorData}`);
            }

            // Paso 2: Actualizar la propiedad como reservada
            const propertyToUpdate = {
                id: property.id,
                title: property.title,
                price: property.price,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                halfBathrooms: property.halfBathrooms,
                parking: property.hasParking,
                location: property.location,
                description: property.description,
                ownerId: property.ownerId,
                isReserved: true
            };

            const propertyResponse = await fetch(`https://localhost:7164/api/Property/${propertyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(propertyToUpdate)
            });

            if (!propertyResponse.ok) {
                const errorData = await propertyResponse.text();
                throw new Error(`Error al actualizar la propiedad: ${errorData}`);
            }

            // Paso 3: Subir los documentos
            const formData = new FormData();
            formData.append("files", ineFile, ineName);
            formData.append("files", curpFile, curpName);
            formData.append("files", comprobanteFile, comprobanteName);

            const uploadResponse = await fetch('https://localhost:7164/api/Petitions/upload-documents', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Error al subir los documentos: ${errorText}`);
            }

            alert('✅ Petición enviada, propiedad reservada y documentos cargados correctamente');

            const reservedStatus = document.querySelector('.info-section.col-100 p:last-child');
            if (reservedStatus) {
                reservedStatus.innerHTML = '<strong>Reservada:</strong> Sí';
            }

            document.querySelector('form').reset();
            document.getElementById('preview-ine').innerHTML = '';
            document.getElementById('preview-curp').innerHTML = '';
            document.getElementById('preview-comprobante').innerHTML = '';

        } catch (error) {
            if (error instanceof TypeError) {
                console.error('❌ Error de red o CORS:', error);
                alert('No se pudo conectar al servidor. Verifica tu conexión o configuración de CORS.');
            } else {
                console.error('❌ Error en la solicitud:', error);
                alert('Hubo un error:\n' + error.message);
            }
        }
    });




});

function generatePhotoRows(images) {
    if (!images || images.length === 0) return "<p>No hay imágenes disponibles.</p>";

    const layoutClass = `layout-${Math.min(images.length, 5)}`;

    let html = `<div class="photo-grid ${layoutClass}">`;
    images.forEach((img, index) => {
        html += `
            <div class="photo">
                <img src="IMG/${img.imageUrl}" alt="Foto ${index + 1}" onerror="this.src='IMG/default.png'">
            </div>`;
    });
    html += `</div>`;
    return html;
}

// `<img src="IMG/${property.images[0].imageUrl}"></img>
function getPropertyIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}
// Obtener elementos del DOM
const openModalButton = document.getElementById('openMortgageCalculator');
const modal = document.getElementById('mortgageModal');
const closeButton = document.querySelector('.close-button');
const calculateButton = document.getElementById('calculateMortgage');
const genPDF = document.getElementById('pdfGenerator');
const mortgageForm = document.getElementById('mortgageForm');
const mortgageResultDiv = document.getElementById('mortgageResult');

// Función para abrir el modal
openModalButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Función para cerrar el modal al hacer clic en la 'x'
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    mortgageResultDiv.textContent = ''; // Limpiar el resultado al cerrar
    mortgageForm.reset(); // Limpiar el formulario al cerrar
});

// Función para cerrar el modal al hacer clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        mortgageResultDiv.textContent = ''; // Limpiar el resultado
        mortgageForm.reset(); // Limpiar el formulario
    }
});

let tasaMensual;
let anios;
let pMensual;
let pTotal;
// Función para calcular la hipoteca
calculateButton.addEventListener('click', () => {
    const loanAmount = parseFloat(mortgageForm.loanAmount.value);
    const interestRate = parseFloat(mortgageForm.interestRate.value) / 100 / 12; // Tasa mensual
    const loanTermMonths = parseInt(mortgageForm.loanTerm.value) * 12;

    if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTermMonths) || loanAmount <= 0 || interestRate < 0 || loanTermMonths <= 0) {
        mortgageResultDiv.textContent = 'Por favor, ingrese valores válidos.';
        return;
    }

    let monthlyPayment;
    if (interestRate === 0) {
        monthlyPayment = loanAmount / loanTermMonths;
    } else {
        monthlyPayment = (loanAmount * interestRate * Math.pow(1 + interestRate, loanTermMonths)) / (Math.pow(1 + interestRate, loanTermMonths) - 1);
    }

    mortgageResultDiv.textContent = `Pago mensual estimado: $${monthlyPayment.toFixed(2)}`;

    tasaMensual = mortgageForm.interestRate.value;
    anios = mortgageForm.loanTerm.value;
    pMensual = monthlyPayment.toFixed(2);
    pTotal = pMensual * 12 * anios;
    genPDF.style.display = 'block';
});


genPDF.addEventListener('click', () => {
    console.log("Si entra we");
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();
    // Encabezado
    doc.setFillColor(60, 60, 60); // gris oscuro
    doc.rect(0, 0, 210, 25, 'F'); // fondo del encabezado
    doc.addImage("/IMG/logo.jpeg", "JPEG", 5, 3.5, 18, 18);//IMG
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Inmobiliaria Uriangato", 28, 13);

    // Título
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(property.title, 105, 35, { align: "center" });

    // Fecha
    const fecha = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'light');
    doc.text(fecha, 180, 42, { align: "right" });

    // Línea separadora
    doc.setDrawColor(200);
    doc.line(10, 45, 200, 45);


    // Información de la propiedad
    const info = [
        ["Dirección:", property.location],
        ["Estacionamiento:", property.hasParking ? "Sí" : "No"],
        ["Habitaciones:", property.bedrooms.toString()],
        ["Baños:", property.bathrooms.toString()],
        ["Medios Baños:", property.halfBathrooms.toString()],
        ["Precio:", "$" + property.price.toLocaleString()],
        ["Tasa de Interés:", tasaMensual.toString() + "%"],
        ["Plazo:", anios.toString() + "Años"],
        ["Pago mensual:", "$" + pMensual.toString()],
        ["Precio Total:", "$" + pTotal.toString()]
    ];



    let y = 55;
    doc.setFontSize(18);
    doc.setFont(undefined, 'normal');
    info.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(label, 25, y);
        doc.setFont(undefined, 'normal');
        doc.text(value, 85, y);
        y += 12;
    });

    // Footer
    doc.setFillColor(60, 60, 60);
    doc.rect(0, 270, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("Av. Tecnológico 123", 105, 278, { align: "center" });
    doc.text("445-133-66-77", 105, 283, { align: "center" });
    doc.text("© 2025 Inmobiliaria Uriangato. Todos los derechos reservados.", 105, 288, { align: "center" });

    // Generar PDF como Blob y abrir en nueva pestaña
    doc.output('bloburl'); // Devuelve una URL temporal
    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');





});





function displaySelectedFiles(fileListContainer, selectedFiles) {
    fileListContainer.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.classList.add('remove-file');
        removeButton.textContent = 'Eliminar';
        removeButton.addEventListener('click', () => {
            debugger;
            selectedFiles = selectedFiles.filter(f => f !== file);
            displaySelectedFiles();
        });

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                fileItem.innerHTML = `
                        <div>
                            <img src="${imageUrl}" alt="${file.name}" style="max-width: 100px; max-height: 100px;"/>
                            <br>
                            <span>${file.name}</span>
                        </div>
                    `;
                fileItem.appendChild(removeButton);
                fileListContainer.appendChild(fileItem);
            };
            reader.readAsDataURL(file);
        } else {
            fileItem.innerHTML = `<span>${file.name}</span>`;
            fileItem.appendChild(removeButton);
            fileListContainer.appendChild(fileItem);
        }
    });
}
