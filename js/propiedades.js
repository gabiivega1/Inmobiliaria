// js/propiedades.js

const supabaseClient = window.supabase.createClient(
  'https://lirhxxvemagoyvlijfrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw'
)

// --- Estado de la galería ---
let imagenes = []
let indiceActual = 0

// --- Obtener ID de la URL ---
const params = new URLSearchParams(window.location.search)
const propiedadId = params.get('id')

// --- Cargar propiedad ---
async function cargarPropiedad() {

  if (!propiedadId) {
    mostrarError()
    return
  }

  const { data, error } = await supabaseClient
    .from('Propiedades')
    .select(`
      *,
      Barrios (name),
      Tipos (name),
      Operaciones (name),
      Imagenes (image_url, is_main)
    `)
    .eq('id', propiedadId)
    .single()

  if (error || !data) {
    mostrarError()
    return
  }

  renderizarPropiedad(data)
}

// --- Renderizar todo ---
function renderizarPropiedad(p) {

  // Ordenar imágenes: principal primero
  imagenes = [...p.Imagenes].sort((a, b) => b.is_main - a.is_main)

  // Breadcrumb
  document.getElementById('breadcrumbTitulo').textContent = p.title
  document.title = `${p.title} - Vitriol Inmobiliaria`

  // Tags
  document.getElementById('tagOperacion').textContent = p.Operaciones?.name || ''
  document.getElementById('tagTipo').textContent = p.Tipos?.name || ''

  // Título y barrio
  document.getElementById('detalleTitulo').textContent = p.title
  document.getElementById('detalleBarrio').textContent = p.Barrios?.name || ''

  // Precio
  document.getElementById('detallePrecio').textContent = `$${Number(p.price).toLocaleString('es-AR')}`

  // Características (ocultar si no tiene valor)
  if (p.bedrooms) {
    document.getElementById('cantDormitorios').textContent = p.bedrooms
  } else {
    document.getElementById('itemDormitorios').style.display = 'none'
  }

  if (p.bathrooms) {
    document.getElementById('cantBanos').textContent = p.bathrooms
  } else {
    document.getElementById('itemBanos').style.display = 'none'
  }

  if (p.CoverMeters) {
  document.getElementById('cantMetros').textContent = p.CoverMeters
} else {
  document.getElementById('itemMetros').style.display = 'none'
}

// m² totales
if (p.TotalMeters) {
  document.getElementById('cantMetrosTotales').textContent = p.TotalMeters
} else {
  document.getElementById('itemMetrosTotales').style.display = 'none'
}

  // --- NUEVO: Cochera ---
  const cochera = document.getElementById('cantCochera');
  
  if (p.garage) {
  cochera.textContent = "Sí";
} else {
  cochera.textContent = "No";
}

  // Descripción
  document.getElementById('detalleDescripcion').textContent = p.description || 'Sin descripción disponible.'
  
  // Galería
  renderizarGaleria()

  // Mostrar contenido
  document.getElementById('loading').style.display = 'none'
  document.getElementById('contenidoDetalle').style.display = 'block'
}

function optimizarImagen(url){
  if(url.includes("?")){
    return url + "&w=800&q=70&auto=format"
  }
  return url + "?w=800&q=70&auto=format"
}


// --- Galería ---
function renderizarGaleria() {

  const imgPrincipal = document.getElementById('imagenPrincipal')
  const thumbsContainer = document.getElementById('galeriaThumbs')
  const contadorTotal = document.getElementById('contadorTotal')

  contadorTotal.textContent = imagenes.length

  if (imagenes.length === 0) return

  // Imagen principal
  imgPrincipal.src = optimizarImagen(imagenes[0].image_url)
  actualizarContador()

  // Thumbnails
  thumbsContainer.innerHTML = ''
  imagenes.forEach((img, i) => {
    const thumb = document.createElement('img')
    thumb.src = optimizarImagen(img.image_url)
    thumb.alt = `Foto ${i + 1}`
    thumb.className = 'thumb' + (i === 0 ? ' activa' : '')
    thumb.onclick = () => irAImagen(i)
    thumbsContainer.appendChild(thumb)
  })

  // Ocultar flechas si hay solo una imagen
  if (imagenes.length <= 1) {
    document.querySelector('.galeria-nav.prev').style.display = 'none'
    document.querySelector('.galeria-nav.next').style.display = 'none'
    document.querySelector('.galeria-contador').style.display = 'none'
  }
}

function irAImagen(i) {
  indiceActual = i
  const imgPrincipal = document.getElementById('imagenPrincipal')

  imgPrincipal.style.opacity = '0'
  setTimeout(() => {
    imgPrincipal.src = optimizarImagen(imagenes[indiceActual].image_url)
    imgPrincipal.style.opacity = '1'
  }, 150)

  actualizarThumbs()
  actualizarContador()
}

window.cambiarImagen = function(direccion) {
  indiceActual = (indiceActual + direccion + imagenes.length) % imagenes.length
  irAImagen(indiceActual)
}

function actualizarThumbs() {
  const thumbs = document.querySelectorAll('.thumb')
  thumbs.forEach((t, i) => t.classList.toggle('activa', i === indiceActual))
}

function actualizarContador() {
  document.getElementById('contadorActual').textContent = indiceActual + 1
}

// --- Error ---
function mostrarError() {
  document.getElementById('loading').style.display = 'none'
  document.getElementById('error').style.display = 'block'
}

// --- Teclado para galería ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') window.cambiarImagen(-1)
  if (e.key === 'ArrowRight') window.cambiarImagen(1)
})

// --- Iniciar ---
cargarPropiedad()