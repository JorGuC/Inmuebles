document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.AE-inmueble');
    const submitButton = form.querySelector('.large');
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    const isEditMode = !!propertyId;

    // Obtener usuario de sessionStorage
    const userString = sessionStorage.getItem('user');
    if (!userString) {
        alert('Usuario no autenticado');
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userString);

    // Cargar datos de la propiedad si estamos en modo edición
    if (isEditMode) {
        loadPropertyData(propertyId);
        // Cambiar texto del botón si es edición
        submitButton.textContent = 'Actualizar Propiedad';
    }

    async function loadPropertyData(id) {
        try {
            const response = await fetch(`https://localhost:7164/api/Property/${id}`);
            if (!response.ok) throw new Error('Propiedad no encontrada');
            
            const property = await response.json();
            
            // Llenar formulario con los datos
            document.getElementById('nombre').value = property.title;
            document.getElementById('precio').value = `$${property.price.toLocaleString()}`;
            document.getElementById('habitaciones').value = property.bedrooms;
            document.getElementById('banos').value = property.bathrooms;
            document.getElementById('estacionamiento').checked = property.parking;
            document.getElementById('direccion').value = property.location;
            document.getElementById('descripcion').value = property.description;
            
        } catch (error) {
            console.error('Error cargando propiedad:', error);
            alert('No se pudo cargar la propiedad para edición');
            window.location.href = 'mis-propiedades.html';
        }
    }

    submitButton.addEventListener('click', async function(e) {
        e.preventDefault();

        // Obtener todos los valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const precio = document.getElementById('precio').value.trim();
        const habitaciones = document.getElementById('habitaciones').value;
        const banos = document.getElementById('banos').value;
        const mediobanos = document.getElementById('banos').value;
        const estacionamiento = document.getElementById('estacionamiento').checked;
        const direccion = document.getElementById('direccion').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const fotos = document.getElementById('file-up').files;
        
        // Validaciones (igual que antes)
        let isValid = true;
        // ... (mantén tus validaciones existentes)

        if (!isValid) {
            alert('Por favor completa correctamente todos los campos');
            return;
        }

        try {
            const propiedad = {
                title: nombre,
                price: parseFloat(precio.replace(/[^0-9.]/g, '')),
                bedrooms: parseInt(habitaciones),
                bathrooms: parseInt(banos),
                halfbathrooms: parent(halfbathrooms),
                parking: estacionamiento,
                location: direccion,
                description: descripcion,
                ownerId: user.id // Usamos el ID del usuario de sessionStorage
            };
            console.log(propiedad);

            let response;
            
            if (isEditMode) {
                // Modo edición - PUT
                response = await fetch(`https://localhost:7164/api/Property/${propertyId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(propiedad)
                });
            } else {
                // Modo creación - POST
                response = await fetch('https://localhost:7164/api/Property', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(propiedad)
                });
            }

            if (!response.ok) {
                throw new Error(isEditMode ? 'Error al actualizar la propiedad' : 'Error al crear la propiedad');
            }

            const result = await response.json();
            
            // Manejo de imágenes (opcional, puedes mantener tu lógica actual)
            // ...

            alert(isEditMode 
                ? `Propiedad "${nombre}" actualizada exitosamente` 
                : `Propiedad "${nombre}" registrada exitosamente`);
            
            if (isEditMode) {
                window.location.href = 'mis-propiedades.html';
            } else {
                form.reset();
            }

        } catch (error) {
            console.error('Error:', error);
            alert(`Ocurrió un error al ${isEditMode ? 'actualizar' : 'registrar'} la propiedad. Por favor intenta nuevamente.`);
        }
    });

    // Formateador automático de precio (mantén tu código actual)
    document.getElementById('precio').addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9.]/g, '');
        if (value) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                e.target.value = `$${num.toLocaleString()}`;
            }
        }
    });
});