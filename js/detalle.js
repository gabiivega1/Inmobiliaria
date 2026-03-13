const supabaseClient = window.supabase.createClient(
  'https://lirhxxvemagoyvlijfrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw'
)

const params = new URLSearchParams(window.location.search)
const id = params.get("id")

async function cargarPropiedad(){

  const { data, error } = await supabaseClient
    .from('Propiedades')
    .select('*')
    .eq('id', id)
    .single()

  if(error){
    console.log(error)
    return
  }

  const { data: imagenes } = await supabaseClient
    .from('Imagenes')
    .select('*')
    .eq('Propiedades_id', id)

  const contenedor = document.getElementById("detallePropiedad")

  contenedor.innerHTML = `
    <div id="carruselImagenes"></div>

    <h1>${data.title}</h1>
    <p>${data.description}</p>
    <p>Precio: ${data.price}</p>
  `

  let imagenActual = 0

  function mostrarImagen(index){
    const carrusel = document.getElementById("carruselImagenes")

    carrusel.innerHTML = `
      <img src="${imagenes[index].image_url}" style="width:500px;">
      <br>
      <button onclick="cambiarImagen(-1)">Anterior</button>
      <button onclick="cambiarImagen(1)">Siguiente</button>
    `
  }

  window.cambiarImagen = function(direccion){
    imagenActual += direccion

    if(imagenActual < 0){
      imagenActual = imagenes.length - 1
    }

    if(imagenActual >= imagenes.length){
      imagenActual = 0
    }

    mostrarImagen(imagenActual)
  }

  mostrarImagen(imagenActual)

}


cargarPropiedad()