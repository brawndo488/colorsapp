document.addEventListener('DOMContentLoaded', () => {
    console.log("SCRIPT START: DOMContentLoaded event fired.");

    // --- Global Variables & Elements (within DOMContentLoaded scope) ---
    const settingsKey = 'colorGameSettings';
    const availableColors = ['red', 'yellow', 'green', 'blue'];
    const successImages = [
        'images/1.jpg',
        'images/2.jpg',
        'images/3.jpg',
        'images/4.jpg',
        'images/5.jpg',
        'images/6.jpg',
        'images/7.jpg',
        'images/8.jpg',
        'images/9.jpg',
        'images/10.jpg',
        'images/11.jpg',
        'images/12.jpg',
        'images/13.jpg',
        'images/14.jpg',
        'images/15.jpg',
        'images/16.jpg',
        'images/17.jpg',
        'images/18.jpg',
        'images/19.jpg',
        'images/20.jpg',
        'images/21.jpg',
        'images/22.jpg',
        'images/23.jpg',
        'images/24.jpg',
        'images/25.jpg',
        'images/26.jpg',
        'images/27.jpg',
        
    ];
    let gameSettings = {};
    let currentCorrectColor = null; // THE variable we need to set correctly

    // --- Utility Functions (defined within scope) ---
    function saveSettings() {
        try {
            localStorage.setItem(settingsKey, JSON.stringify(gameSettings));
            console.log("UTIL: Settings saved:", JSON.stringify(gameSettings));
        } catch (e) {
            console.error("UTIL: Error saving settings:", e);
        }
    }

    function loadSettings() {
        console.log("UTIL: Loading settings...");
        const storedSettings = localStorage.getItem(settingsKey);
        gameSettings = {}; // Start fresh
        if (storedSettings) {
            try {
                gameSettings = JSON.parse(storedSettings);
                // Basic validation: Ensure it's an object
                if (typeof gameSettings !== 'object' || gameSettings === null) {
                    console.warn("UTIL: Loaded settings were not an object, resetting.");
                    gameSettings = {};
                }
                console.log("UTIL: Settings loaded from localStorage:", JSON.stringify(gameSettings));
            } catch (e) {
                console.error("UTIL: Error parsing stored settings:", e);
                gameSettings = {}; // Reset on error
            }
        } else {
            console.log("UTIL: No settings found in localStorage.");
        }
        // Ensure it's always an object for subsequent code
         if (typeof gameSettings !== 'object' || gameSettings === null) {
             gameSettings = {};
         }
    }

     function validateSettingsColors() {
        console.log("UTIL: Validating settings colors...");
        let settingsValid = true;
        let validCount = 0;
        for (const key in gameSettings) {
            const color = gameSettings[key];
            if (!color || !availableColors.includes(color)) {
                console.error(`VALIDATION ERROR: Item "${key}" has invalid/missing color "${color}". Please fix in Settings.`);
                settingsValid = false;
                // Decide how to handle invalid entries - Option 1: Keep them (user must fix), Option 2: Delete them
                // Let's keep them for now, but they won't appear in dropdown
            } else {
                validCount++;
            }
        }
         console.log(`UTIL: Validation complete. Valid items: ${validCount}. Overall valid: ${settingsValid}`);
        if (!settingsValid && validCount > 0) {
            // Only alert if there are *some* valid settings but also invalid ones
             alert("Warning: Some items in settings have invalid colors assigned and won't appear in the game dropdown. Please check the console (F12) and fix them on the Settings page.");
        } else if (validCount === 0 && Object.keys(gameSettings).length > 0) {
             // Alert if settings exist but NONE are valid
             alert("Warning: None of the items defined in settings have valid colors assigned. Please check the console (F12) and fix them on the Settings page.");
        }
        return settingsValid; // Returns overall validity, but we use validCount below
    }

    // --- Navigation ---
    function goToPage(pageUrl) {
        console.log(`NAV: Navigating to ${pageUrl}`);
        window.location.href = pageUrl;
    }

    // --- Settings Page Logic ---
    function renderSettings() {
        const settingsGrid = document.getElementById('settingsGrid');
        if (!settingsGrid) return;
        console.log("SETTINGS: Rendering settings grid...");
        // ... (Settings rendering logic - assumed okay from previous versions) ...
        // Include the same logic as before for input, select, delete, handling renames etc.
        // Make sure event listeners inside here correctly call saveSettings()
         settingsGrid.innerHTML = ''; // Clear existing rows
        const sortedKeys = Object.keys(gameSettings).sort();
        if (sortedKeys.length === 0) {
            settingsGrid.innerHTML = '<p>No settings defined yet. Click "+ Add New Item".</p>';
             return;
        }
        sortedKeys.forEach(key => {
            const color = gameSettings[key];
            const row = document.createElement('div');
            row.classList.add('setting-row');
            row.dataset.key = key; // Store the key for reference

            // Input for the key (item name)
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.value = key;
            keyInput.placeholder = "Item Name (e.g., 'Apple')";
             keyInput.addEventListener('change', (e) => {
                 const oldKey = row.dataset.key;
                 const newKey = e.target.value.trim();
                 if (newKey && newKey !== oldKey) {
                     if (gameSettings.hasOwnProperty(newKey)) {
                         alert(`Item "${newKey}" already exists.`);
                         e.target.value = oldKey; return;
                     }
                     const currentColorValue = gameSettings[oldKey];
                     if (typeof currentColorValue === 'undefined') { // More robust check
                         console.error(`Cannot rename: Cannot find original value for key "${oldKey}"`);
                         e.target.value = oldKey; return;
                     }
                     gameSettings[newKey] = currentColorValue;
                     delete gameSettings[oldKey];
                     row.dataset.key = newKey;
                     saveSettings();
                     console.log(`SETTINGS: Renamed "${oldKey}" to "${newKey}"`);
                 } else if (!newKey) {
                     alert("Item name cannot be empty.");
                     e.target.value = oldKey;
                 }
             });


            // Dropdown for the color
            const colorSelect = document.createElement('select');
            availableColors.forEach(col => {
                const option = document.createElement('option');
                option.value = col;
                option.textContent = col.charAt(0).toUpperCase() + col.slice(1); // Capitalize
                // Allow selecting even if current saved color is somehow invalid
                if (col === color) {
                    option.selected = true;
                }
                colorSelect.appendChild(option);
            });
             colorSelect.addEventListener('change', (e) => {
                 const currentKey = row.dataset.key; // Use the potentially updated key
                 if (gameSettings.hasOwnProperty(currentKey)) {
                      const selectedColor = e.target.value;
                      if (availableColors.includes(selectedColor)) {
                          gameSettings[currentKey] = selectedColor;
                          saveSettings();
                          console.log(`SETTINGS: Updated color for "${currentKey}" to ${selectedColor}`);
                      } else {
                          console.error(`SETTINGS: Invalid color selected: ${selectedColor}`); // Should not happen with select
                      }
                 } else {
                      console.warn(`SETTINGS: Cannot update color - key "${currentKey}" no longer exists.`);
                      renderSettings(); // Re-render to sync UI
                 }
             });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                 const keyToDelete = row.dataset.key;
                if (confirm(`Are you sure you want to delete item "${keyToDelete}"?`)) {
                    if (gameSettings.hasOwnProperty(keyToDelete)) {
                        delete gameSettings[keyToDelete];
                        saveSettings();
                        console.log(`SETTINGS: Deleted item "${keyToDelete}"`);
                        renderSettings(); // Re-render the grid
                    } else {
                         console.warn(`SETTINGS: Cannot delete - key "${keyToDelete}" not found.`);
                         renderSettings(); // Re-render anyway
                    }
                }
            });

            row.appendChild(keyInput);
            row.appendChild(colorSelect);
            row.appendChild(deleteBtn);
            settingsGrid.appendChild(row);
        });

    }

    function addNewSetting() {
        const settingsGrid = document.getElementById('settingsGrid'); // Ensure it's available
         if (!settingsGrid) return;
        // ... (Add new setting logic - assumed okay) ...
         const newKey = prompt("Enter a name for the new item:");
        if (newKey && newKey.trim() !== "") {
             const trimmedKey = newKey.trim();
            if (gameSettings.hasOwnProperty(trimmedKey)) {
                alert(`Item "${trimmedKey}" already exists.`);
                return;
            }
            gameSettings[trimmedKey] = availableColors[0]; // Default to first color
            saveSettings();
            renderSettings();
            console.log(`SETTINGS: Added new item "${trimmedKey}"`);
        } else if (newKey !== null) {
             alert("Item name cannot be empty.");
        }
    }

    // --- Game Page Logic ---
    function disableGameSquares(reason) {
        const colorSquares = document.querySelectorAll('.color-square');
        console.log(`GAME: Disabling squares. Reason: ${reason}`);
        colorSquares.forEach(square => {
            square.style.pointerEvents = 'none';
            square.style.opacity = '0.5';
        });
     }

     function enableGameSquares() {
         const colorSquares = document.querySelectorAll('.color-square');
         console.log("GAME: Enabling squares.");
         colorSquares.forEach(square => {
            square.style.pointerEvents = 'auto';
            square.style.opacity = '1';
        });
     }

    function updateGameDropdown() {
        const itemSelector = document.getElementById('itemSelector');
        if (!itemSelector) return; // Should not happen if called correctly
        console.log("GAME: Updating game dropdown...");

        itemSelector.innerHTML = ''; // Clear previous options
        let validKeys = [];

        // Filter settings to get only keys with valid colors
        for (const key in gameSettings) {
            if (gameSettings[key] && availableColors.includes(gameSettings[key])) {
                validKeys.push(key);
            } else {
                 console.warn(`GAME: Item "${key}" has invalid color "${gameSettings[key]}", excluding from dropdown.`);
            }
        }
        validKeys.sort(); // Sort the valid keys
        console.log("GAME: Valid keys for dropdown:", validKeys);


        if (validKeys.length === 0) {
            console.log("GAME: No valid items found in settings for dropdown.");
            const option = document.createElement('option');
            option.textContent = "No valid items defined";
            option.disabled = true;
            itemSelector.appendChild(option);
            currentCorrectColor = null; // Explicitly set to null
            disableGameSquares("No valid items");
            console.log("GAME: currentCorrectColor set to null (no valid items)."); // <<< Log null state
            return; // Stop here
        }

        // Populate with valid keys ONLY
        validKeys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            itemSelector.appendChild(option);
        });
        console.log("GAME: Dropdown populated with valid items.");

        // CRITICAL: Dispatch the change event to set the initial state
        console.log("GAME: Triggering initial 'change' event on dropdown via setTimeout...");
        setTimeout(() => {
            console.log("GAME: setTimeout callback: Dispatching 'change' event now.");
            itemSelector.dispatchEvent(new Event('change'));
        }, 0); // Delay ensures dropdown options are rendered
    }

    function handleItemSelection(event) {
        // This function MUST set currentCorrectColor correctly
        console.log("GAME: handleItemSelection event triggered."); // <<< MOST IMPORTANT LOG 1
        const selectedKey = event.target.value; // Get the value from the selected <option>
        console.log(`GAME: Dropdown selected key: "${selectedKey}"`);

        // Check if this key exists in our loaded settings AND has a valid color
        if (gameSettings.hasOwnProperty(selectedKey) && availableColors.includes(gameSettings[selectedKey])) {
            const colorFromSettings = gameSettings[selectedKey];
            currentCorrectColor = colorFromSettings; // <<< THE ASSIGNMENT
            console.log(`GAME: SUCCESS - currentCorrectColor SET to: "${currentCorrectColor}"`); // <<< MOST IMPORTANT LOG 2
            enableGameSquares(); // Make sure squares are clickable
        } else {
            // This handles cases where the key might be invalid (e.g., empty dropdown somehow selected)
            // OR if the settings got corrupted between dropdown population and selection
            console.error(`GAME: ERROR in handleItemSelection - Could not set correct color. Key "${selectedKey}" not found in settings OR has invalid color "${gameSettings[selectedKey]}".`);
            currentCorrectColor = null; // Ensure it's null if something went wrong
            disableGameSquares(`Invalid selection or setting for ${selectedKey}`);
            console.log("GAME: currentCorrectColor set to null (error in handleItemSelection)."); // <<< Log null state
        }
    }

    function handleColorGuess(event) {
        const colorSquares = document.querySelectorAll('.color-square');
        if (colorSquares.length === 0) return;
        console.log("GAME: handleColorGuess triggered by click.");

        const clickedSquare = event.target;
        const guessedColor = clickedSquare.dataset.color;
        if (!guessedColor) {
             console.warn("GAME: Clicked element ignored (no data-color).");
             return;
        }
        console.log(`GAME: Guessed color: "${guessedColor}"`);

        // *** The Check Causing the User's Error ***
        if (!currentCorrectColor) {
            // Log the state right before the check fails
            console.error("GAME: CHECK FAILED - currentCorrectColor is null or invalid."); // <<< MOST IMPORTANT LOG 3 (if error persists)
            console.warn("GAME: Guess ignored: No correct color is currently set. Ensure an item is selected and has a valid color in settings.");
            // Visual feedback
            const itemSelector = document.getElementById('itemSelector');
            if(itemSelector) {
                itemSelector.style.outline = '2px solid red';
                setTimeout(() => { if(itemSelector) itemSelector.style.outline = ''; }, 500);
            }
            return; // Stop
        }
        // If we get past the check above, currentCorrectColor should be valid
        console.log(`GAME: Performing check - Guessed: "${guessedColor}", Correct is: "${currentCorrectColor}"`);

        // --- Guess Comparison Logic ---
        const imageOverlay = document.getElementById('imageOverlay');
        const successImage = document.getElementById('successImage');
        const bellSound = new Audio('sounds/bell.mp3'); 
        const errorSound = new Audio('sounds/beep-03.mp3')

        if (guessedColor === currentCorrectColor) {
            console.log("GAME: Result: Correct!");
             // ... (Correct guess logic: sound, image display) ...
             if (successImages.length > 0 && successImage && imageOverlay) {
                 const randomImageIndex = Math.floor(Math.random() * successImages.length);
                 successImage.src = successImages[randomImageIndex];
                 imageOverlay.classList.add('fade-in');
                 setTimeout(() => { imageOverlay.classList.remove('fade-in'); }, 2000);
             } else { console.warn("GAME: Image elements or images array missing."); }
             bellSound.play();

        } else {
            console.log("GAME: Result: Incorrect!");
            const correctSquare = document.getElementById(currentCorrectColor);
            if (correctSquare) {
                correctSquare.classList.add('pop');
                setTimeout(() => { correctSquare.classList.remove('pop'); }, 500);
            } else {
                console.error(`GAME: Error - Could not find element with ID "${currentCorrectColor}" to highlight.`);
            }
            errorSound.play();
        }
    }

    // --- Page Initialization and Event Listener Setup ---
    console.log("SCRIPT: Running page initialization...");
    loadSettings(); // Load settings first
    // Don't strictly need validateSettingsColors here, as updateGameDropdown filters

    // Determine current page (a simple way)
    const currentPage = window.location.pathname.split("/").pop();
    console.log(`SCRIPT: Current page detected as: ${currentPage}`);

    // Homepage specific listeners
    if (currentPage === 'index.html' || currentPage === '') { // Handle root case
        console.log("SCRIPT: Initializing homepage listeners.");
        const startGameBtn = document.getElementById('startGameBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        if (startGameBtn) startGameBtn.addEventListener('click', () => goToPage('game.html'));
        if (settingsBtn) settingsBtn.addEventListener('click', () => goToPage('settings.html'));
    }
    // Settings page specific listeners
    else if (currentPage === 'settings.html') {
        console.log("SCRIPT: Initializing settings page listeners and rendering.");
        const addSettingBtn = document.getElementById('addSettingBtn');
        const homeBtnSettings = document.getElementById('homeBtnSettings');
        renderSettings(); // Render the grid
        if (addSettingBtn) addSettingBtn.addEventListener('click', addNewSetting);
        if (homeBtnSettings) homeBtnSettings.addEventListener('click', () => goToPage('index.html'));
    }
    // Game page specific listeners
    else if (currentPage === 'game.html') {
        console.log("SCRIPT: Initializing game page listeners.");
        const itemSelector = document.getElementById('itemSelector');
        const colorSquares = document.querySelectorAll('.color-square');
        const homeBtnGame = document.getElementById('homeBtnGame');

        if (!itemSelector) {
             console.error("SCRIPT: FATAL - Could not find #itemSelector on game page!");
             return; // Stop game page setup if critical element missing
        }

        // Setup listener FIRST - crucial for catching initial dispatch
        itemSelector.addEventListener('change', handleItemSelection);
        console.log("SCRIPT: Attached 'change' listener to #itemSelector.");

        // Populate dropdown (which triggers the 'change' listener via setTimeout)
        updateGameDropdown();

        // Attach listeners to squares
        if (colorSquares.length > 0) {
             console.log(`SCRIPT: Attaching 'click' listeners to ${colorSquares.length} color squares.`);
             colorSquares.forEach(square => {
                square.addEventListener('click', handleColorGuess);
            });
        } else { console.warn("SCRIPT: No color squares found!"); }

        // Attach listener to home button
        if (homeBtnGame) {
            homeBtnGame.addEventListener('click', () => goToPage('index.html'));
        } else { console.warn("SCRIPT: Game home button not found!"); }
    }

    console.log("SCRIPT: Initialization complete.");

}); // End of DOMContentLoaded