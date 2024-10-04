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

console.log("Initialisation complète. Outils et canevas prêts.");

// Fonction pour définir l'arrière-plan du canevas en blanc
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // Réinitialise la couleur sélectionnée
    console.log("Arrière-plan du canevas défini à blanc.");
};

// Fonction pour obtenir la position du curseur ou du toucher
const getPointerPosition = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    console.log(`Position de la souris/toucher: X=${x}, Y=${y}`);
    return { x, y };
};

// Fonction pour dessiner un rectangle
const drawRect = (e) => {
    const { x, y } = getPointerPosition(e);
    ctx.beginPath();
    if (!fillColor.checked) {
        ctx.strokeRect(prevMouseX, prevMouseY, x - prevMouseX, y - prevMouseY);
        console.log("Rectangle tracé sans remplissage.");
    } else {
        ctx.fillRect(prevMouseX, prevMouseY, x - prevMouseX, y - prevMouseY);
        console.log("Rectangle tracé avec remplissage.");
    }
};

// Fonction pour dessiner un cercle
const drawCircle = (e) => {
    const { x, y } = getPointerPosition(e);
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
    console.log(`Cercle tracé avec un rayon de ${radius}.`);
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
    console.log("Triangle tracé.");
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
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); // Prendre une capture de l'état actuel
    console.log(`Dessin commencé avec l'outil : ${selectedTool}, couleur : ${selectedColor}, largeur du pinceau : ${brushWidth}.`);
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
        console.log(`Outil : ${selectedTool} utilisé en position X=${x}, Y=${y}`);
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else if (selectedTool === "triangle") {
        drawTriangle(e);
    }
};

// Fonction pour ajouter du texte sur le canevas
const addTextToCanvas = (e) => {
    const text = textInput.value;
    if (!text) {
        console.log("Aucun texte entré.");
        return;
    }

    const fontSize = fontSizeInput.value;
    const fontFamily = fontFamilySelect.value;
    const fontWeight = fontWeightSelect.value;
    const textColor = textColorInput.value;
    const underline = underlineCheckbox.checked;
    const border = borderCheckbox.checked;

    const { x, y } = getPointerPosition(e);

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);

    console.log(`Texte ajouté : "${text}", Position: X=${x}, Y=${y}, Police: ${fontFamily}, Taille: ${fontSize}px, Couleur: ${textColor}`);

    if (border) {
        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize; // Estimation de la hauteur de texte
        ctx.strokeStyle = textColor;
        ctx.strokeRect(x, y, textWidth, textHeight);
        console.log("Bordure ajoutée au texte.");
    }

    if (underline) {
        const textWidth = ctx.measureText(text).width;
        ctx.beginPath();
        ctx.moveTo(x, y + parseInt(fontSize));
        ctx.lineTo(x + textWidth, y + parseInt(fontSize));
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        console.log("Soulignement ajouté au texte.");
    }
};

// Fonction pour afficher/cacher les propriétés de texte
const toggleTextProperties = () => {
    if (textProperties.style.display === "none" || !textProperties.style.display) {
        textProperties.style.display = "block";
        console.log("Propriétés de texte affichées.");
    } else {
        textProperties.style.display = "none";
        console.log("Propriétés de texte cachées.");
        canvas.addEventListener("mousedown", addTextToCanvas, { once: true });
        canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            addTextToCanvas(e);
        }, { once: true });
    }
};

// Gestion des événements pour sélectionner un outil
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(`Outil sélectionné : ${selectedTool}`);
    });
});

// Gestion de la taille du pinceau
sizeSlider.addEventListener("change", () => {
    brushWidth = sizeSlider.value;
    console.log(`Largeur du pinceau changée à : ${brushWidth}`);
});

// Gestion des couleurs
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
        console.log(`Couleur sélectionnée : ${selectedColor}`);
    });
});

// Gestion du sélecteur de couleur personnalisé
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
    console.log(`Couleur personnalisée sélectionnée : ${colorPicker.value}`);
});

// Effacer le canevas
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    console.log("Canevas effacé.");
});

// Sauvegarder le dessin en tant qu'image
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
    console.log("Image sauvegardée.");
});

// Gestion du bouton Add Text
addTextBtn.addEventListener("click", toggleTextProperties);

// Début du dessin lors du clic de la souris ou d'un toucher
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDraw(e);
    console.log("Dessin commencé (tactile).");
});

// Dessin lorsque la souris ou un toucher se déplace
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    drawing(e);
    console.log("Dessin en cours (tactile).");
});

// Fin du dessin lorsque la souris ou le toucher est relâché
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    console.log("Dessin terminé (souris).");
});
canvas.addEventListener("touchend", () => {
    isDrawing = false;
    console.log("Dessin terminé (tactile).");
});

// Initialisation de l'arrière-plan du canevas lors du chargement de la page
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
    console.log("Canevas initialisé.");
    textProperties.style.display = "none";
});
