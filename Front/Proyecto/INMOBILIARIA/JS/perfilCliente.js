document.addEventListener("DOMContentLoaded", async () => {
    const userData = sessionStorage.getItem('user');
    const defaultLinks = document.querySelector('.default-links');
    let ID = null;
    let user = null;

    if (userData) {
        user = JSON.parse(userData);
        ID = user.id;
        document.querySelector("#title h2").textContent = `${user.name}`;
    } else {
        document.getElementById('tblHistorial').innerHTML = `
            <tr><td colspan="5">Por favor, inicia sesión para ver tu historial.</td></tr>
        `;
        return;
    }

    if (userData) {
        const user = JSON.parse(userData);
        const userType = user.userType;
        defaultLinks.innerHTML = '';

        let customLink = document.createElement('a');
        if (userType === 'Owner') {
            window.location.href = 'perfilVendedor.html';
            return;
        } else {
            customLink.href = 'perfilCliente.html';
            customLink.textContent = 'Mi Perfil';
        }
        defaultLinks.appendChild(customLink);

        const logoutLink = document.createElement('a');
        logoutLink.href = 'index.html';
        logoutLink.textContent = 'Cerrar Sesión';
        logoutLink.addEventListener('click', () => {
            sessionStorage.removeItem('user');
            location.reload();
        });
        defaultLinks.appendChild(logoutLink);
    }

    try {
        const response = await fetch(`https://localhost:7164/api/Petitions?userId=${ID}`);
        if (!response.ok) throw new Error(await response.text());

        const petitions = await response.json();
        const tableBody = document.getElementById('tblHistorial');

        if (!petitions || petitions.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5">No tienes peticiones registradas.</td></tr>`;
            return;
        }

        while (tableBody.rows.length > 1) {
            tableBody.deleteRow(1);
        }

        for (const petition of petitions) {
            const propertyResponse = await fetch(`https://localhost:7164/api/Property/${petition.propertyId}`);
            const property = await propertyResponse.json();

            const ownerResponse = await fetch(`https://localhost:7164/api/User/${property.ownerId}`);
            const owner = await ownerResponse.json();

            const row = tableBody.insertRow();

            const docs = [];
            if (petition.documentoINE)
                docs.push(`<button onclick="openDocument('${petition.documentoINE}')">INE</button>`);
            if (petition.documentoCURP)
                docs.push(`<button onclick="openDocument('${petition.documentoCURP}')">CURP</button>`);
            if (petition.documentoComprobanteDomicilio)
                docs.push(`<button onclick="openDocument('${petition.documentoComprobanteDomicilio}')">Comprobante</button>`);

            row.innerHTML = `
                <td>
                    ${property.title}
                    <br>
                    <button onclick="window.location.href='propiedad.html?id=${property.id}'">
                        Ver Inmueble
                    </button>
                </td>
                <td>${owner.name || 'Sin nombre registrado'}</td>
                <td>${petition.comentarios || 'Sin comentarios'}</td>
                <td>${docs.join('<br>')}</td>
            `;
        }

    } catch (error) {
        console.error('Error:', error.message);
        document.getElementById('tblHistorial').innerHTML = `
            <tr><td colspan="5">Error al cargar el historial: ${error.message}</td></tr>
        `;
    }
});

// ✅ Abre documentos desde la carpeta DOCS con URL dinámica
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
