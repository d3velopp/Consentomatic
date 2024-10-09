document.addEventListener("DOMContentLoaded", function () {
console.log("Background script chargé.");
});
// Fonction pour sauvegarder les paramètres
function saveSettings() {
  const modeButton = document.getElementById("modeButton");
  const settings = {
    // Récupérer les valeurs des paramètres de l'utilisateur
    autoMode: modeButton.checked,
    modeButtonClasses: modeButton.className
    // Ajoutez d'autres paramètres ici
  };

  chrome.storage.sync.set({ userSettings: settings }, function() {
    console.log('Paramètres enregistrés.');
  });
}

// Fonction pour charger les paramètres
function loadSettings(callback) {
  chrome.storage.sync.get(['userSettings'], function(result) {
    console.log('Paramètres chargés :', result.userSettings);
    callback(result.userSettings);
  });
}

// Fonction pour appliquer les paramètres à l'interface utilisateur
function applySettings(settings) {
  if (settings) {
    const modeButton = document.getElementById("modeButton");
    modeButton.checked = settings.autoMode;
    modeButton.className = settings.modeButtonClasses;
    // Appliquer d'autres paramètres ici
  }
}

// Charger les paramètres lors du chargement de l'extension
document.addEventListener("DOMContentLoaded", function () {
  loadSettings(applySettings);

  // Ajouter des écouteurs pour sauvegarder les paramètres automatiquement lorsque l'utilisateur les modifie
  document.getElementById("modeButton").addEventListener("change", saveSettings);
  // Ajoutez d'autres écouteurs ici pour d'autres paramètres
});