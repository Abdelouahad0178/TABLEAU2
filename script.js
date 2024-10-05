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
    uploadImageInput = document.querySelector("#upload-image"),
    textProperties = document.querySelector(".text-properties"),
    ctx = canvas.getContext("2d", { willReadFrequently: true });

// Variables globales avec valeurs par défaut
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000",
    uploadedImage = null,
    imageX = 50, imageY = 50, imageWidth = 200, imageHeight = 150,
    isResizingImage = false, isMovingImage = false,
    isMovingText = false, selectedTextX, selectedTextY;

// Fonction pour définir l'arrière-plan du canevas en blanc
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // Réinitialise la couleur sélectionnée
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
    ctx.beginPath();
    if (!fillColor.checked) {
        return ctx.strokeRect(prevMouseX, prevMouseY, x - prevMouseX, y - prevMouseY);
    }
    ctx.fillRect(prevMouseX, prevMouseY, x - prevMouseX, y - prevMouseY);
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
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); // Prendre une capture de l'état actuel
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

// Fonction pour arrêter le dessin
const stopDraw = () => {
    isDrawing = false;
};

// Fonction pour ajouter du texte sur le canevas
const addTextToCanvas = (e) => {
    const text = textInput.value;
    if (!text) return; // Ne pas ajouter de texte si le champ est vide

    selectedTextX = getPointerPosition(e).x;
    selectedTextY = getPointerPosition(e).y;

    const fontSize = fontSizeInput.value;
    const fontFamily = fontFamilySelect.value;
    const fontWeight = fontWeightSelect.value;
    const textColor = textColorInput.value;
    const underline = underlineCheckbox.checked;
    const border = borderCheckbox.checked;

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";
    ctx.fillText(text, selectedTextX, selectedTextY);

    // Ajouter un encadré autour du texte si nécessaire
    if (border) {
        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize; // Estimation de la hauteur de texte
        ctx.strokeStyle = textColor;
        ctx.strokeRect(selectedTextX, selectedTextY, textWidth, textHeight);
    }

    // Ajouter un soulignement si nécessaire
    if (underline) {
        const textWidth = ctx.measureText(text).width;
        ctx.beginPath();
        ctx.moveTo(selectedTextX, selectedTextY + parseInt(fontSize));
        ctx.lineTo(selectedTextX + textWidth, selectedTextY + parseInt(fontSize));
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};

// Fonction pour gérer l'importation d'une image
uploadImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
            uploadedImage = img;
            drawImage();
        };
    };
    reader.readAsDataURL(file);
});

const drawImage = () => {
    if (!uploadedImage) return;
    ctx.drawImage(uploadedImage, imageX, imageY, imageWidth, imageHeight);
};

// Gestion du déplacement et redimensionnement de l'image
canvas.addEventListener("mousedown", (e) => {
    const { x, y } = getPointerPosition(e);
    
    // Vérifier si l'utilisateur clique sur l'image pour la déplacer
    if (x > imageX && x < imageX + imageWidth && y > imageY && y < imageY + imageHeight) {
        isMovingImage = true;
        prevMouseX = x;
        prevMouseY = y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // Vérifier si l'utilisateur clique sur le texte pour le déplacer
    if (x > selectedTextX && x < selectedTextX + ctx.measureText(textInput.value).width && y > selectedTextY && y < selectedTextY + fontSizeInput.value) {
        isMovingText = true;
        prevMouseX = x;
        prevMouseY = y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!isMovingImage && !isMovingText) return;

    const { x, y } = getPointerPosition(e);
    ctx.putImageData(snapshot, 0, 0);

    // Déplacer l'image
    if (isMovingImage) {
        imageX += x - prevMouseX;
        imageY += y - prevMouseY;
        prevMouseX = x;
        prevMouseY = y;
        drawImage();
    }

    // Déplacer le texte
    if (isMovingText) {
        selectedTextX += x - prevMouseX;
        selectedTextY += y - prevMouseY;
        prevMouseX = x;
        prevMouseY = y;
        ctx.fillText(textInput.value, selectedTextX, selectedTextY);
    }
});

canvas.addEventListener("mouseup", () => {
    isMovingImage = false;
    isMovingText = false;
});

// Gestion du redimensionnement de l'image (avec la touche "Shift")
canvas.addEventListener("mousedown", (e) => {
    const { x, y } = getPointerPosition(e);

    // Si l'utilisateur appuie sur Shift + clic sur l'image, commencer à redimensionner
    if (e.shiftKey && x > imageX && x < imageX + imageWidth && y > imageY && y < imageY + imageHeight) {
        isResizingImage = true;
        prevMouseX = x;
        prevMouseY = y;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (!isResizingImage) return;

    const { x, y } = getPointerPosition(e);
    ctx.putImageData(snapshot, 0, 0);

    // Redimensionner l'image
    imageWidth += x - prevMouseX;
    imageHeight += y - prevMouseY;
    prevMouseX = x;
    prevMouseY = y;
    drawImage();
});

canvas.addEventListener("mouseup", () => {
    isResizingImage = false;
});

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

// Gestion du bouton Ajouter du texte
addTextBtn.addEventListener("click", () => {
    canvas.addEventListener("mousedown", addTextToCanvas, { once: true });
});

// Initialisation de l'arrière-plan du canevas lors du chargement de la page
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

// Stop drawing on mouse up or out of canvas
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseout", stopDraw);
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
