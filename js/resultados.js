const supabaseClient = window.supabase.createClient(
  'https://lirhxxvemagoyvlijfrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw'
);

let inicioRango = 0;
const cantidadPorCarga = 6;

// 1. Cargar las opciones en los <select> del buscador
async function inicializarFiltros() {
    const { data: operaciones } = await supabaseClient.from('Operaciones').select('*');
    const { data: tipos } = await supabaseClient.from('Tipos').select('*');

    const filtroOperacion = document.getElementById("filtroOperacion");
    const filtroTipo = document.getElementById("filtroTipo");

    operaciones.forEach(op => {
        filtroOperacion.innerHTML += `<option value="${op.id}">${op.name}</option>`;
    });

    tipos.forEach(tipo => {
        filtroTipo.innerHTML += `<option value="${tipo.id}">${tipo.name}</option>`;
    });

    // 2. Revisamos si el usuario vino de una búsqueda en index.html
    const params = new URLSearchParams(window.location.search);
    if (params.get("operacion")) filtroOperacion.value = params.get("operacion");
    if (params.get("tipo")) filtroTipo.value = params.get("tipo");
    if (params.get("barrio")) document.getElementById("filtroBarrio").value = params.get("barrio");

    // Una vez listos los filtros, cargamos las propiedades
    cargarResultados(true);
}

// 3. Traer las propiedades de la base de datos
async function cargarResultados(limpiar = false) {
    if (limpiar) {
        inicioRango = 0;
        document.getElementById("contenedorResultados").innerHTML = "";
    }

    const finRango = inicioRango + cantidadPorCarga - 1;

    // Leemos qué dicen los inputs en este momento
    const operacion = document.getElementById("filtroOperacion").value;
    const tipo = document.getElementById("filtroTipo").value;
    const barrio = document.getElementById("filtroBarrio").value;

    let query = supabaseClient
        .from('Propiedades')
        .select(`
            *,
            Barrios (name),
            Tipos (name),
            Operaciones (name),
            Imagenes!inner (image_url, is_main)
        `);

    // Si hay algo escrito en los inputs, filtramos. Si no hay nada (entró directo), trae todo.
    if (operacion) query = query.eq('Operaciones_id', operacion);
    if (tipo) query = query.eq('Tipos_id', tipo);
    if (barrio) query = query.ilike('Barrios.name', `%${barrio}%`);

    query = query.range(inicioRango, finRango);

    const { data, error } = await query;

    if (error) {
        console.log("Error cargando resultados:", error);
        return;
    }

    mostrarResultados(data);

    // Mostramos u ocultamos el botón de "Mostrar más"
    const btnMostrarMas = document.getElementById("btnMostrarMas");
    if (data.length === cantidadPorCarga) {
        btnMostrarMas.style.display = "inline-block";
    } else {
        btnMostrarMas.style.display = "none";
    }
}

function mostrarResultados(propiedades) {
    const contenedor = document.getElementById("contenedorResultados");

    // Mensaje si la base de datos no devuelve nada
    if (propiedades.length === 0 && inicioRango === 0) {
        contenedor.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>No hay propiedades disponibles en este momento.</p>";
        return;
    }

    propiedades.forEach(propiedad => {
        // 1. PROTECCIÓN DE IMÁGENES: Buscamos la principal. Si no hay, usamos la primera que exista. 
        // Si no tiene ninguna, ponemos una imagen gris de relleno para que no se rompa la página.
        let imagenUrl = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
        if (propiedad.Imagenes && propiedad.Imagenes.length > 0) {
            const imagenPrincipal = propiedad.Imagenes.find(img => img.is_main);
            imagenUrl = imagenPrincipal ? imagenPrincipal.image_url : propiedad.Imagenes[0].image_url;
        }

        // 2. PROTECCIÓN DE TEXTOS: Si algún dato viene vacío desde Supabase, ponemos "N/A" (No Aplica)
        const nombreTipo = propiedad.Tipos ? propiedad.Tipos.name : 'N/A';
        const nombreOperacion = propiedad.Operaciones ? propiedad.Operaciones.name : 'N/A';
        const nombreBarrio = propiedad.Barrios ? propiedad.Barrios.name : 'N/A';

        // Armamos la tarjeta de forma segura
        const card = `
        <div class="card-propiedad" onclick="verPropiedad(${propiedad.id})" style="cursor:pointer;">
            <img src="${imagenUrl}" alt="Imagen de propiedad">
            <div class="card-info">
                <h3 class="precio">$${propiedad.price}</h3>
                <p class="detalles">${nombreTipo} • ${nombreOperacion}</p>
                <p class="ubicacion">${nombreBarrio}</p>
            </div>
        </div>
        `;
        
        contenedor.innerHTML += card;
    });
}

window.verPropiedad = function(id){
    window.location.href = `propiedades.html?id=${id}`;
};

// Evento: Clic en "Buscar" en esta misma página
document.getElementById("btnBuscarResultados").addEventListener("click", () => {
    // Le pasamos 'true' para que borre las propiedades viejas y arranque de cero
    cargarResultados(true); 
});

// Evento: Clic en "Mostrar más"
document.getElementById("btnMostrarMas").addEventListener("click", () => {
    inicioRango += cantidadPorCarga;
    cargarResultados(false); // Le pasamos 'false' para que sume a lo que ya hay
});

// Arrancamos todo
inicializarFiltros();