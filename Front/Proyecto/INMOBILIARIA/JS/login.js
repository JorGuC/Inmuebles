document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();
   
   debugger;
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
