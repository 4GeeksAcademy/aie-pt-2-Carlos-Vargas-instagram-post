const accion = document.getElementById("accion");
const conQuien = document.getElementById("conQuien");
const cuando = document.getElementById("cuando");
const donde = document.getElementById("donde");
const generarExcusaBtn = document.getElementById("generarExcusaBtn");

const acciones = [
	"Olvidé entregar el proyecto",
	"Llegué tarde",
	"No pude asistir",
	"Perdí la reunión",
	"Cancelé la salida",
	"No respondí el mensaje",
	"Se me pasó la fecha",
	"No terminé la tarea",
	"No pude conectarme",
	"Fallé en enviar el archivo"
];

const quienes = [
	"con mi jefe",
	"con mi profesora",
	"con mi equipo",
	"con mi cliente",
	"con mi pareja",
	"con mi amigo",
	"con mi vecino",
	"con recursos humanos",
	"con soporte técnico",
	"con mi tutor"
];

const cuandoOpciones = [
	"esta mañana",
	"anoche",
	"hace un rato",
	"justo antes de salir",
	"al mediodía",
	"el fin de semana",
	"durante la madrugada",
	"ayer por la tarde",
	"hoy temprano",
	"hace unos minutos"
];

const dondeOpciones = [
	"en el trabajo",
	"en la universidad",
	"en el tráfico",
	"en el metro",
	"en casa",
	"en el aeropuerto",
	"en el gimnasio",
	"en una videollamada",
	"en la cafetería",
	"en el parque"
];

function obtenerElementoAleatorio(array) {
	const indicealeatorio = Math.floor(Math.random() * array.length);
	return array[indicealeatorio];
}

function generarExcusa() {
	accion.innerHTML = obtenerElementoAleatorio(acciones);
	conQuien.innerHTML = obtenerElementoAleatorio(quienes);
	cuando.innerHTML = obtenerElementoAleatorio(cuandoOpciones);
	donde.innerHTML = obtenerElementoAleatorio(dondeOpciones);
}

generarExcusa();
generarExcusaBtn.addEventListener("click", generarExcusa);
