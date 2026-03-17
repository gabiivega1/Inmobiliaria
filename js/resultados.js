const supabaseClient = window.supabase.createClient(
  'https://lirhxxvemagoyvlijfrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw'
)


function obtenerParametros(){

const params = new URLSearchParams(window.location.search)

return {
operacion: params.get("operacion"),
tipo: params.get("tipo"),
barrio: params.get("barrio")
}

}

async function cargarResultados(){

const { operacion, tipo, barrio } = obtenerParametros()

let query = supabaseClient
.from('Propiedades')
.select(`
*,
Barrios (name),
Tipos (name),
Operaciones (name),
Imagenes!inner (image_url, is_main)
`)

if(operacion){
query = query.eq('Operaciones_id', operacion)
}

if(tipo){
query = query.eq('Tipos_id', tipo)
}

if(barrio){
query = query.ilike('Barrios.name', `%${barrio}%`)
}

const { data, error } = await query

if(error){
console.log(error)
return
}

mostrarPropiedades(data)

}

function mostrarPropiedades(propiedades){

  const contenedor = document.getElementById("Propiedades")

  contenedor.innerHTML = ""

  propiedades.forEach(propiedad => {

  const imagenPrincipal = propiedad.Imagenes.find(img => img.is_main)

const card = `
<div class="card" onclick="verPropiedad(${propiedad.id})">

<img src="${imagenPrincipal.image_url}">

<div class="card-info">

<h3>$${propiedad.price}</h3>

<p>${propiedad.Tipos.name} • ${propiedad.Operaciones.name}</p>

<p>${propiedad.Barrios.name}</p>

<button>Ver propiedad</button>

</div>

</div>
`

    contenedor.innerHTML += card
  })

}

cargarResultados()