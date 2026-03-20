const supabaseClient = window.supabase.createClient(
  'https://lirhxxvemagoyvlijfrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw'
);

let paginaActual = 1;
const cantidadPorPagina = 9;

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

  const params = new URLSearchParams(window.location.search);
  if (params.get("operacion")) filtroOperacion.value = params.get("operacion");
  if (params.get("tipo")) filtroTipo.value = params.get("tipo");
  if (params.get("barrio")) document.getElementById("filtroBarrio").value = params.get("barrio");

  cargarResultados(true);
}

async function cargarResultados(resetearPagina = false) {
  if (resetearPagina) {
    paginaActual = 1;
  }

  const inicioRango = (paginaActual - 1) * cantidadPorPagina;
  const finRango = inicioRango + cantidadPorPagina - 1;

  document.getElementById("contenedorResultados").innerHTML = "";

  const operacion = document.getElementById("filtroOperacion").value;
  const tipo = document.getElementById("filtroTipo").value;
  const barrio = document.getElementById("filtroBarrio").value;

  const dormitorios = document.getElementById("filtroDormitorios").value;
  const precioMin = document.getElementById("filtroPrecioMin").value;
  const precioMax = document.getElementById("filtroPrecioMax").value;

  let query = supabaseClient
    .from('Propiedades')
    .select(`
            *,
            Barrios!inner (name),
            Tipos (name),
            Operaciones (name),
            Imagenes!inner (image_url, is_main)
        `, { count: 'exact' });

  if (operacion) query = query.eq('Operaciones_id', operacion);
  if (tipo) query = query.eq('Tipos_id', tipo);
  if (barrio) query = query.ilike('Barrios.name', `%${barrio}%`);

  if (dormitorios) query = query.gte('bedrooms', dormitorios);
  if (precioMin) query = query.gte('price', precioMin);
  if (precioMax) query = query.lte('price', precioMax);

  query = query.range(inicioRango, finRango);

  const { data, count, error } = await query;

  if (error) {
    console.log("Error cargando resultados:", error);
    return;
  }

  mostrarResultados(data);

  renderizarPaginacion(count);
}

function mostrarResultados(propiedades) {
  const contenedor = document.getElementById("contenedorResultados");

  if (propiedades.length === 0) {
    contenedor.innerHTML = "<p style='grid-column: 1 / -1; text-align: center;'>No hay propiedades disponibles con esos filtros.</p>";
    return;
  }

  propiedades.forEach(propiedad => {
    let imagenUrl = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
    if (propiedad.Imagenes && propiedad.Imagenes.length > 0) {
      const imagenPrincipal = propiedad.Imagenes.find(img => img.is_main);
      imagenUrl = imagenPrincipal ? imagenPrincipal.image_url : propiedad.Imagenes[0].image_url;
    }

    const nombreTipo = propiedad.Tipos ? propiedad.Tipos.name : 'N/A';
    const nombreOperacion = propiedad.Operaciones ? propiedad.Operaciones.name : 'N/A';
    const nombreBarrio = propiedad.Barrios ? propiedad.Barrios.name : 'N/A';

    const cantDormitorios = propiedad.bedrooms ? propiedad.bedrooms : '-';

    const card = `
        <div class="card-propiedad" onclick="verPropiedad(${propiedad.id})" style="cursor:pointer;">
            <img src="${imagenUrl}" alt="Imagen de propiedad">
            <div class="card-info">
                <h3 class="precio">$${propiedad.price}</h3>
                <p class="detalles">${nombreTipo} • ${nombreOperacion} • ${cantDormitorios} Dorm.</p>
                <p class="ubicacion">${nombreBarrio}</p>
            </div>
        </div>
        `;

    contenedor.innerHTML += card;
  });
}

window.verPropiedad = function(id) {
    window.location.href = `propiedades.html?id=${id}`;
};

function renderizarPaginacion(totalItems) {
  const contenedor = document.getElementById("contenedorPaginacion");
  contenedor.innerHTML = "";

  const totalPaginas = Math.ceil(totalItems / cantidadPorPagina);

  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const boton = document.createElement("button");
    boton.innerText = i;

    if (i === paginaActual) {
      boton.className = "pagina-activa";
    } else {
      boton.className = "pagina-inactiva";
      boton.onclick = () => {
        paginaActual = i;
        cargarResultados(false);
      };
    }

    contenedor.appendChild(boton);
  }
}

let indiceSeleccionado = -1;

async function buscarBarrios() {
  const texto = document.getElementById("filtroBarrio").value;
  const contenedor = document.getElementById("sugerenciasBarrios");

  if (texto.length < 1) {
    contenedor.innerHTML = "";
    cargarResultados(true);
    return;
  }

  const { data } = await supabaseClient
    .from('Barrios')
    .select('*')
    .ilike('name', `%${texto}%`);

  contenedor.innerHTML = "";
  data.forEach(barrio => {
    contenedor.innerHTML += `
        <div class="sugerencia" onclick="seleccionarBarrio('${barrio.name}')">
            ${barrio.name}
        </div>
        `;
  });
}

window.seleccionarBarrio = function (nombre) {
  document.getElementById("filtroBarrio").value = nombre;
  document.getElementById("sugerenciasBarrios").innerHTML = "";
  cargarResultados(true);
}

function manejarTeclas(e) {
  const items = document.querySelectorAll(".sugerencia");

  if (e.key === "Enter" && items.length === 0) {
    cargarResultados(true);
    return;
  }

  if (items.length === 0) return;

  if (e.key === "ArrowDown") {
    indiceSeleccionado++;
    if (indiceSeleccionado >= items.length) indiceSeleccionado = 0;
  }
  if (e.key === "ArrowUp") {
    indiceSeleccionado--;
    if (indiceSeleccionado < 0) indiceSeleccionado = items.length - 1;
  }
  if (e.key === "Enter") {
    if (indiceSeleccionado >= 0) {
      items[indiceSeleccionado].click();
    }
  }

  items.forEach(item => item.classList.remove("activo"));
  if (indiceSeleccionado >= 0) {
    items[indiceSeleccionado].classList.add("activo");
  }
}

document.addEventListener("click", function (event) {
  const input = document.getElementById("filtroBarrio");
  const contenedor = document.getElementById("sugerenciasBarrios");
  if (input && contenedor && !input.contains(event.target)) {
    contenedor.innerHTML = "";
  }
});

document.getElementById("filtroOperacion").addEventListener("change", () => cargarResultados(true));
document.getElementById("filtroTipo").addEventListener("change", () => cargarResultados(true));

const inputBarrio = document.getElementById("filtroBarrio");
inputBarrio.addEventListener("input", buscarBarrios);
inputBarrio.addEventListener("keydown", manejarTeclas);
document.getElementById("filtroDormitorios").addEventListener("change", () => cargarResultados(true));
document.getElementById("filtroPrecioMin").addEventListener("change", () => cargarResultados(true));
document.getElementById("filtroPrecioMax").addEventListener("change", () => cargarResultados(true));
inicializarFiltros();