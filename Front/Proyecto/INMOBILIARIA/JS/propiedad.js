
let property = null;
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
//------------



let ID = null;
if( userData ){
    const user = JSON.parse(userData);
    ID = user.id;
}
    //--------------
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

    document.getElementById("aceptar").addEventListener('click', async (e) => {
        e.preventDefault();
        if (ID === null) {
            alert('Necesitas loguearte para ejecutar esta acción');
            return;
        }

        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const correo = document.getElementById('correo').value;
        const telefono = document.getElementById('telefono').value;
        const comentarios = document.getElementById('descripcion').value;
        const documentos = document.getElementById('file-up').files[0];

        const petitionData = {
            Nombre: nombre,
            Apellido: apellido,
            Correo: correo,
            Telefono: telefono,
            Comentarios: comentarios,
            PropertyId: parseInt(propertyId),
            Documentos: documentos ? documentos.name : "",
            UserId: ID
        };

        try {
            const petitionResponse = await fetch('https://localhost:7164/api/Petitions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(petitionData)
            });

            if (!petitionResponse.ok) {
                const errorData = await petitionResponse.text();
                throw new Error(errorData || 'Error al enviar la petición');
            }

            const petitionResult = await petitionResponse.json();
            console.log('Petición enviada con éxito:', petitionResult);

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
                throw new Error(errorData || `Error al actualizar la propiedad: ${propertyResponse.status}`);
            }

            console.log('Propiedad actualizada con éxito');
            alert('Petición enviada y propiedad reservada correctamente');

            const reservedStatus = document.querySelector('.info-section.col-100 p:last-child');
            if (reservedStatus) {
                reservedStatus.innerHTML = '<strong>Reservada:</strong> Sí';
            }

            document.getElementById('nombre').value = '';
            document.getElementById('apellido').value = '';
            document.getElementById('correo').value = '';
            document.getElementById('telefono').value = '';
            document.getElementById('descripcion').value = '';
            document.getElementById('file-up').value = '';
        } catch (error) {
            console.error('Error:', error.message);
            alert('Hubo un error: ' + error.message);
        }
    });


});

function generatePhotoRows(images) {
    if (!images || images.length === 0) return "<p>No hay imágenes disponibles.</p>";

    let html = '';
    images.forEach((img, index) => {
        if (index % 2 === 0) html += `<div class="row">`;
        html += `
            <div class="photo">
                 <img src="IMG/${img.imageUrl}" alt="Foto ${index + 1}"></img>
                 
                
            </div>`;
        if (index % 2 === 1 || index === images.length - 1) html += `</div>`;
    });
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

      tasaMensual=mortgageForm.interestRate.value;
      anios = mortgageForm.loanTerm.value;
      pMensual = monthlyPayment.toFixed(2);
      pTotal = pMensual * 12 * anios;
      genPDF.style.display = 'block';
  });


  genPDF.addEventListener('click', () =>{
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
        ["Pago mensual:", "$"+ pMensual.toString()],
        ["Precio Total:", "$"+ pTotal.toString()]
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