const canvas = document.querySelector("canvas"),
      toolBtns = document.querySelectorAll(".tool"),
      fillColor = document.querySelector("#fill-color"),
      sizeSlider = document.querySelector("#size-slider"),
      colorBtns = document.querySelectorAll(".colors .option"),
      colorPicker = document.querySelector("#color-picker"),
      clearCanvas = document.querySelector(".clear-canvas"),
      saveImg = document.querySelector(".save-img"),
      ctx = canvas.getContext("2d");

// Variables globales avec valeur par défaut
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000";

// Fonction pour définir l'arrière-plan du canevas en blanc
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // Remet la couleur à la couleur sélectionnée pour les outils de dessin
};

// Fonction pour obtenir la position du curseur ou du toucher
const getPointerPosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
        y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    };
};

// Fonction pour dessiner un rectangle
const drawRect = (e) => {
    const { x, y } = getPointerPosition(e);
    if (!fillColor.checked) {
        return ctx.strokeRect(x, y, prevMouseX - x, prevMouseY - y);
    }
    ctx.fillRect(x, y, prevMouseX - x, prevMouseY - y);
};

// Fonction pour dessiner un cercle
const drawCircle = (e) => {
    const { x, y } = getPointerPosition(e);
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

// Fonction pour dessiner un triangle
const drawTriangle = (e) => {
    const { x, y } = getPointerPosition(e);
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(x, y);
    ctx.lineTo(prevMouseX * 2 - x, y);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

// Fonction pour démarrer le dessin
const startDraw = (e) => {
    isDrawing = true;
    const { x, y } = getPointerPosition(e);
    prevMouseX = x;
    prevMouseY = y;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

// Fonction pour continuer le dessin en fonction de l'outil sélectionné
const drawing = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPointerPosition(e);
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else if (selectedTool === "triangle") {
        drawTriangle(e);
    }
};

// Gestion des événements pour sélectionner un outil
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

// Gestion de la taille du pinceau
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

// Gestion des couleurs
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

// Gestion du sélecteur de couleur personnalisé
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

// Effacer le canevas
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});

// Sauvegarder le dessin en tant qu'image
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

// Début du dessin lors du clic de la souris ou d'un toucher
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Empêche le défilement par défaut lors du toucher
    startDraw(e);
});

// Dessin lorsque la souris est déplacée ou un toucher se déplace
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Empêche le défilement par défaut lors du toucher
    drawing(e);
});

// Fin du dessin lorsque la souris ou le toucher est relâché
canvas.addEventListener("mouseup", () => isDrawing = false);
canvas.addEventListener("touchend", () => isDrawing = false);

// Initialisation de l'arrière-plan du canevas lors du chargement de la page
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});
