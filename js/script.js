// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Find the button, gallery, modal, and space fact elements
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');
const spaceFact = document.getElementById('spaceFact');

// Put your NASA API key here
const apiKey = "PLACE API KEY HERE";

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Random space facts for the optional LevelUp requirement
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "The Sun makes up more than 99% of the mass in our solar system.",
  "One million Earths could fit inside the Sun.",
  "Neutron stars can spin hundreds of times per second.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Mars has the tallest volcano in the solar system: Olympus Mons.",
  "Jupiter has a giant storm called the Great Red Spot.",
  "Light from the Sun takes about 8 minutes to reach Earth.",
  "Saturn's rings are made mostly of ice and rock.",
  "The Moon is slowly moving away from Earth."
];

// Show a random fact when the page loads
function showRandomSpaceFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  spaceFact.textContent = spaceFacts[randomIndex];
}

showRandomSpaceFact();

// Fetch NASA APOD images when the button is clicked
getImagesButton.addEventListener('click', getSpaceImages);

async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Please select both a start date and an end date.</p>
      </div>
    `;
    return;
  }

  gallery.innerHTML = `
    <div class="loading">
      <div class="placeholder-icon">🚀</div>
      <p>Loading NASA space images...</p>
    </div>
  `;

  try {
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("NASA API request failed.");
    }

    const spaceData = await response.json();

    displayGallery(spaceData);
  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">❌</div>
        <p>Something went wrong while loading the NASA images. Please check your API key and try again.</p>
      </div>
    `;

    console.error(error);
  }
}

function displayGallery(spaceData) {
  gallery.innerHTML = "";

  if (!spaceData || spaceData.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No space images were found for this date range.</p>
      </div>
    `;
    return;
  }

  spaceData.forEach((spaceItem) => {
    const galleryItem = document.createElement('div');
    galleryItem.classList.add('gallery-item');

    let mediaContent = "";

    if (spaceItem.media_type === "image") {
      mediaContent = `
        <img src="${spaceItem.url}" alt="${spaceItem.title}" />
      `;
    } else if (spaceItem.media_type === "video") {
      mediaContent = `
        <div class="video-preview">
          <div class="video-icon">▶</div>
          <p>Video Entry</p>
        </div>
      `;
    } else {
      mediaContent = `
        <div class="video-preview">
          <div class="video-icon">?</div>
          <p>Media Entry</p>
        </div>
      `;
    }

    galleryItem.innerHTML = `
      ${mediaContent}
      <h3>${spaceItem.title}</h3>
      <p class="date">${formatDate(spaceItem.date)}</p>
    `;

    galleryItem.addEventListener('click', () => {
      openModal(spaceItem);
    });

    gallery.appendChild(galleryItem);
  });
}

function openModal(spaceItem) {
  let modalMediaContent = "";

  if (spaceItem.media_type === "image") {
    modalMediaContent = `
      <img src="${spaceItem.hdurl || spaceItem.url}" alt="${spaceItem.title}" class="modal-image" />
    `;
  } else if (spaceItem.media_type === "video") {
    modalMediaContent = `
      <div class="modal-video">
        <iframe src="${spaceItem.url}" title="${spaceItem.title}" allowfullscreen></iframe>
        <p>
          <a href="${spaceItem.url}" target="_blank">Open video in a new tab</a>
        </p>
      </div>
    `;
  } else {
    modalMediaContent = `
      <p>This APOD entry contains media that cannot be displayed directly.</p>
      <p>
        <a href="${spaceItem.url}" target="_blank">Open media in a new tab</a>
      </p>
    `;
  }

  modalBody.innerHTML = `
    ${modalMediaContent}
    <h2>${spaceItem.title}</h2>
    <p class="modal-date">${formatDate(spaceItem.date)}</p>
    <p class="modal-explanation">${spaceItem.explanation}</p>
  `;

  modal.style.display = "flex";
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Close modal when X button is clicked
closeModal.addEventListener('click', () => {
  modal.style.display = "none";
});

// Close modal when clicking outside of the modal content
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});