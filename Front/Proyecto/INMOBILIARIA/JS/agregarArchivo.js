document.addEventListener('DOMContentLoaded', function () {


    // Mostrar/ocultar menú


    debugger;
    const form = document.querySelector('.AE-inmueble');
    const submitButton = form.querySelector('.large');
    const fileInput = document.getElementById('file-up');
    const fileListContainer = document.getElementById('fileListContainer');
    let selectedFiles = [];

    // Verificar si estamos en modo edición
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    const isEditMode = !!propertyId;

    // Obtener usuario de sessionStorage
    const userString = sessionStorage.getItem('user');
    if (!userString) {
        alert('Debes iniciar sesión para continuar');
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userString);

    // Configurar interfaz según modo
    if (isEditMode) {
        document.querySelector('#title h2').textContent = 'Editar Inmueble';
        submitButton.textContent = 'Actualizar Propiedad';
        loadPropertyData(propertyId);
    }

    // Cargar datos de la propiedad para edición
    async function loadPropertyData(id) {
        try {
            debugger;
            const response = await fetch(`https://localhost:7164/api/Property/${id}`);
            if (!response.ok) throw new Error('Error al cargar la propiedad');

            const property = await response.json();

            // Verificar que el usuario es el propietario
            if (property.ownerId !== user.id) {
                alert('No tienes permiso para editar esta propiedad');
                window.location.href = 'perfilVendedor.html';
                return;
            }

            // Llenar formulario con los datos
            document.getElementById('nombre').value = property.title || '';
            document.getElementById('precio').value = property.price ? `$${property.price.toLocaleString()}` : '';
            document.getElementById('habitaciones').value = property.bedrooms || '';
            document.getElementById('mediobanos').value = property.halfBathrooms || '';
            document.getElementById('banos').value = property.bathrooms || '';
            document.getElementById('estacionamiento').checked = property.hasParking || false;
            document.getElementById('isReserved').checked = property.isReserved || false;
            document.getElementById('direccion').value = property.location || '';
            document.getElementById('descripcion').value = property.description || '';

            console.log(property.isReserved)
            // Cargar imágenes existentes (si las hay)


        } catch (error) {
            console.error('Error cargando propiedad:', error);
            alert('No se pudo cargar la propiedad para edición');
            window.location.href = 'perfilCliente.html';
        }
    }

    // Manejo de selección de archivos
    fileInput.addEventListener('change', function (event) {
        const files = event.target.files;
        selectedFiles = [...selectedFiles, ...files];
        displaySelectedFiles();
    });




    function displaySelectedFiles() {
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



    submitButton.addEventListener('click', async function (e) {
        e.preventDefault();

        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const precio = document.getElementById('precio').value.trim();
        const habitaciones = document.getElementById('habitaciones').value;
        const mediobanos = document.getElementById('mediobanos').value;
        const banos = document.getElementById('banos').value;
        const estacionamiento = document.getElementById('estacionamiento').checked;
        const direccion = document.getElementById('direccion').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const reserved = document.getElementById('isReserved').checked;
        // Validaciones
        let isValid = true;
        const errorFields = [];

        if (nombre === '') {
            errorFields.push('Nombre');
            isValid = false;
        }

        const precioNum = parseFloat(precio.replace(/[^0-9.]/g, ''));
        if (isNaN(precioNum) || precioNum <= 0) {
            errorFields.push('Precio (debe ser un número válido)');
            isValid = false;
        }

        if (habitaciones === '' || isNaN(habitaciones) || parseInt(habitaciones) < 0) {
            errorFields.push('Habitaciones');
            isValid = false;
        }

        if (banos === '' || isNaN(banos) || parseInt(banos) < 0) {
            errorFields.push('Baños');
            isValid = false;
        }

        if (mediobanos === '' || isNaN(mediobanos) || parseInt(mediobanos) < 0) {
            errorFields.push('Medios Baños');
            isValid = false;
        }

        if (direccion === '') {
            errorFields.push('Dirección');
            isValid = false;
        }

        if (descripcion.length < 20) {
            errorFields.push('Descripción (mínimo 20 caracteres)');
            isValid = false;
        }

        if (!isValid) {
            alert(`Por favor corrige los siguientes campos:\n\n${errorFields.join('\n')}`);
            return;
        }

        try {
            debugger;
            // Preparar objeto de propiedad
            const propiedad = {
                title: nombre,
                price: precioNum,
                bedrooms: parseInt(habitaciones),
                halfBathrooms: parseInt(mediobanos),
                bathrooms: parseInt(banos),
                hasParking: estacionamiento,
                location: direccion,
                description: descripcion,
                ownerId: user.id,
                isReserved: reserved
            };

            // Determinar si es creación o edición
            let endpoint = 'https://localhost:7164/api/Property';
            let method = 'POST';

            if (isEditMode) {
                endpoint += `/${propertyId}`;
                method = 'PUT';
                // Mantener el mismo ownerId al editar
                propiedad.ownerId = user.id;
                propiedad.id = propertyId;
            }


            // 1. Crear/Actualizar la propiedad
            const propertyResponse = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(propiedad)
            });
            //console.log("Propiedad enviada:", propiedad.parking);

            let propertyData = {};
            if (!propertyResponse.ok) {
                throw new Error('Error al ' + (isEditMode ? 'actualizar' : 'crear') + ' la propiedad');
            } else if (propertyResponse.status !== 204) {
                propertyData = await propertyResponse.json();
            }

            // 2. Manejo de imágenes (solo si hay archivos seleccionados)
            if (selectedFiles.length > 0) {
                let formData = new FormData();
                const fileNames = [];

                selectedFiles.forEach((file, index) => {
                    const uniqueFileName = `${Date.now()}_${index}${getFileExtension(file.name)}`;
                    fileNames.push(uniqueFileName);
                    formData.append('files', file, uniqueFileName);
                });

                // Subir archivos al servidor
                const uploadResponse = await fetch('https://localhost:7164/api/inmuebles/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('Error al subir las imágenes');
                }

                // Asociar imágenes a la propiedad
                const saveImagePromises = fileNames.map(fileName => {
                    return fetch('https://localhost:7164/api/PropertyImage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            propertyId: propertyData.id,
                            imageUrl: fileName
                        })
                    });
                });

                await Promise.all(saveImagePromises);
            }

            // Feedback al usuario
            alert(isEditMode
                ? '¡Propiedad actualizada correctamente!'
                : '¡Propiedad creada exitosamente!');

            // Redirección después de éxito
            window.location.href = isEditMode
                ? 'perfilVendedor.html'
                : 'index.html';

        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error: ' + error.message);
        }
    });

    function getFileExtension(fileName) {
        return fileName.slice(fileName.lastIndexOf('.')) || '';
    }

    // Formateador de precio
    document.getElementById('precio').addEventListener('input', function (e) {
        let value = e.target.value.replace(/[^0-9.]/g, '');
        if (value) {
            const num = parseFloat(value);
            if (!isNaN(num)) {
                e.target.value = `$${num.toLocaleString()}`;
            }
        }
    });
});


