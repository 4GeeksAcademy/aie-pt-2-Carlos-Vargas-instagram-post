// tipos

let palabra = "string"; //texto

let numero = 123; // int = numerico

let bool = true; // boolean

let float = 3.14; // decimal

let salonDeClases = {
    cohorte: "aie-pt-2",
    profesor: "David",
    TA: "Robert"
}

let array = ["html", "css", "javascript", true, 123, salonDeClases, []];// arreglo o array

let valor = null; // undefined

console.log(array) // error, no esta definida



//comparadores

    // == compara el valor
    // === compara el valor y el tipo de dato
    // != diferente valor
    // !== diferente valor o tipo de dato
    // > mayor que
    // < menor que
    // >= mayor o igual que
    // <= menor o igual que

let edadRobert = 31;
console.log(true == (edadRobert > 70)) // true


// operadores logicos  
    // && AND
    // || OR
    // ! NOT

let isPsychologist = false;
let isMajo = false;
let isDumb = true;
console.log(isPsychologist && edadRobert >= 18) // true
console.log(isPsychologist || edadRobert <= 31) // true
console.log(isPsychologist || edadRobert > 31 || isMajo || !isDumb) // false