const canvas = document.querySelector("canvas"),
      toolBtns = document.querySelectorAll(".tool"),
      fillColor = document.querySelector("#fill-color"),
      sizeSlider = document.querySelector("#size-slider"),
      colorBtns = document.querySelectorAll(".colors .option"),
      colorPicker = document.querySelector("#color-picker"),
      clearCanvas = document.querySelector(".clear-canvas"),
      saveImg = document.querySelector(".save-img"),
      addTextBtn = document.querySelector("#add-text"),
      textInput = document.querySelector("#text-input"),
      fontSizeInput = document.querySelector("#font-size"),
      fontFamilySelect = document.querySelector("#font-family"),
      fontWeightSelect = document.querySelector("#font-weight"),
      textColorInput = document.querySelector("#text-color"),
      underlineCheckbox = document.querySelector("#underline"),
      borderCheckbox = document.querySelector("#border"),
      textProperties = document.querySelector(".text-properties"),
      ctx = canvas.getContext("2d", { willReadFrequently: true });

// Variables globales avec valeurs par défaut
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000";

// Fonction pour définir l'arrière-plan du canevas en blanc
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // Réinitialise la couleur sélectionnée
}

// Fonction pour obtenir la position du curseur ou du toucher
const getPointerPosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Fonction pour dessiner un rectangle
const drawRect = (e) => {
    const { x, y } = getPointerPosition(e);
    ctx.beginPath();
    if (!fillColor.checked) {
        return ctx.strokeRect(prevMouseX, prevMouseY, x - prevMouseX, y - prevMouseY);
    }
    ctx.fillRect(prevMouseX, prevMouseY, x - prevMouseX, y - prevMouseY);
}

// Fonction pour dessiner un cercle
const drawCircle = (e) => {
    const { x, y } = getPointerPosition(e);
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

// Fonction pour dessiner un triangle
const drawTriangle = (e) => {
    const { x, y } = getPointerPosition(e);
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(x, y);
    ctx.lineTo(prevMouseX * 2 - x, y);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

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
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); // Prendre une capture de l'état actuel
}

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
}

// Fonction pour ajouter du texte sur le canevas
const addTextToCanvas = (e) => {
    const text = textInput.value;
    if (!text) return; // Ne pas ajouter de texte si le champ est vide

    const fontSize = fontSizeInput.value;
    const fontFamily = fontFamilySelect.value;
    const fontWeight = fontWeightSelect.value;
    const textColor = textColorInput.value;
    const underline = underlineCheckbox.checked;
    const border = borderCheckbox.checked;

    // Position du texte
    const { x, y } = getPointerPosition(e);

    // Appliquer les propriétés du texte
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";

    // Dessiner le texte
    ctx.fillText(text, x, y);

    // Ajouter un encadré autour du texte si nécessaire
    if (border) {
        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize; // Estimation de la hauteur de texte
        ctx.strokeStyle = textColor;
        ctx.strokeRect(x, y, textWidth, textHeight);
    }

    // Ajouter un soulignement si nécessaire
    if (underline) {
        const textWidth = ctx.measureText(text).width;
        ctx.beginPath();
        ctx.moveTo(x, y + parseInt(fontSize));
        ctx.lineTo(x + textWidth, y + parseInt(fontSize));
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Suppression de l'écouteur après ajout du texte
    canvas.removeEventListener("mousedown", addTextToCanvas);
    canvas.removeEventListener("touchstart", handleTouchText);
}

// Fonction pour afficher/cacher les propriétés de texte
const toggleTextProperties = () => {
    if (textProperties.style.display === "none" || !textProperties.style.display) {
        textProperties.style.display = "block";  // Afficher les propriétés de texte

        // Ajout des événements après avoir activé le bouton Add Text
        canvas.addEventListener("mousedown", addTextToCanvas, { once: true });
        canvas.addEventListener("touchstart", handleTouchText, { once: true });
    } else {
        textProperties.style.display = "none";  // Cacher les propriétés de texte
    }
}

// Fonction spéciale pour gérer l'ajout de texte en mode tactile
const handleTouchText = (e) => {
    e.preventDefault(); // Prévenir le comportement par défaut du navigateur sur les touches
    addTextToCanvas(e);  // Utiliser la même logique d'ajout de texte
}

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

// Gestion du bouton Add Text
addTextBtn.addEventListener("click", toggleTextProperties);

// Début du dessin lors du clic de la souris ou d'un toucher
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDraw(e);
});

// Dessin lorsque la souris ou un toucher se déplace
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
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

    // Masquer les propriétés de texte au départ
    textProperties.style.display = "none";
});
