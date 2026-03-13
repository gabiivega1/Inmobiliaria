const supabaseClient = window.supabase.createClient(
  'https://lirhxxvemagoyvlijfrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw'
)

async function cargarPropiedades() {

  const { data, error } = await supabaseClient
  .from('Propiedades')
  .select(`
    *,
    Barrios (name),
    Tipos (name),
    Operaciones (name),
    Imagenes!inner (image_url, is_main)
  `)
    
  console.log(data)

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
    <div onclick="verPropiedad(${propiedad.id})" style="cursor:pointer; border:1px solid black; padding:10px; margin:10px; width:300px;">

    <img src="${imagenPrincipal.image_url}" style="width:100%; height:200px; object-fit:cover;">

    <h3>${propiedad.title}</h3>

    <p>${propiedad.Operaciones.name}</p>

    <p>${propiedad.Tipos.name}</p>

    <p>${propiedad.Barrios.name}</p>

    <p>Precio: ${propiedad.price}</p>

    </div>
`

    contenedor.innerHTML += card
  })

}


async function cargarFiltros() {

  const { data: operaciones } = await supabaseClient
    .from('Operaciones')
    .select('*')

  const { data: tipos } = await supabaseClient
    .from('Tipos')
    .select('*')

  const { data: barrios } = await supabaseClient
    .from('Barrios')
    .select('*')

  const filtroOperacion = document.getElementById("filtroOperacion")
  const filtroTipo = document.getElementById("filtroTipo")
  const filtroBarrio = document.getElementById("filtroBarrio")

  operaciones.forEach(op => {
    filtroOperacion.innerHTML += `<option value="${op.id}">${op.name}</option>`
  })

  tipos.forEach(tipo => {
    filtroTipo.innerHTML += `<option value="${tipo.id}">${tipo.name}</option>`
  })

  barrios.forEach(barrio => {
    filtroBarrio.innerHTML += `<option value="${barrio.id}">${barrio.name}</option>`
  })

}

const filtroOperacion = document.getElementById("filtroOperacion")
const filtroTipo = document.getElementById("filtroTipo")
const filtroBarrio = document.getElementById("filtroBarrio")

filtroOperacion.addEventListener("change", filtrar)
filtroTipo.addEventListener("change", filtrar)
filtroBarrio.addEventListener("change", filtrar)

async function filtrar(){

  const operacion = filtroOperacion.value
  const tipo = filtroTipo.value
  const barrio = filtroBarrio.value

  let query = supabaseClient
    .from('Propiedades')
    .select('*')

  if(operacion){
    query = query.eq('Operaciones_id', operacion)
  }

  if(tipo){
    query = query.eq('Tipos_id', tipo)
  }

  if(barrio){
    query = query.eq('Barrios_id', barrio)
  }

  const { data, error } = await query

  console.log(data)
}



window.verPropiedad = function(id){
  window.location.href = `propiedades.html?id=${id}`
}

cargarPropiedades()
cargarFiltros()
