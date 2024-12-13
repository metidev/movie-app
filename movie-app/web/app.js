// Add these variables at the top of your file
let movieToDelete = null;

// Add this function to get the saved theme or default to 'light'
function getInitialTheme() {
  return localStorage.getItem("theme") || "light";
}

// Add this function to initialize the theme when page loads
function initializeTheme() {
  const savedTheme = getInitialTheme();
  document.documentElement.setAttribute("data-theme", savedTheme);
}

// Update the toggleTheme function
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  localStorage.setItem("theme", newTheme);
  html.setAttribute("data-theme", newTheme);
}

// Call initializeTheme when the page loads
document.addEventListener("DOMContentLoaded", initializeTheme);

const form = document.getElementById("add-movie-form");

function openAddMovieModal() {
  const modal = document.getElementById("add-movie-modal");
  modal.style.display = "block";
  // Trigger reflow to ensure transition works
  modal.offsetHeight;
  modal.classList.add("show");
}

function closeAddMovieModal() {
  const modal = document.getElementById("add-movie-modal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300); // Match the transition duration
}

function closeMovieDetails() {
  const detailsPage = document.getElementById("movie-details");
  detailsPage.classList.remove("show");
  
  // Remove class from body to restore scrolling
  document.body.classList.remove('movie-details-open');
  
  setTimeout(() => {
    detailsPage.style.display = "none";
  }, 300); // Match the transition duration
}

async function viewMovieDetails(movieId) {
  // Add class to body to prevent scrolling
  document.body.classList.add('movie-details-open');
  
  const response = await fetch(`/movie/${movieId}`);
  const movie = await response.json();

  const detailsContainer = document.getElementById("movie-details-content");
  detailsContainer.innerHTML = `
    <div class="movie-details-header">
      <button class="back-button" onclick="closeMovieDetails()">
        <i class="bi bi-arrow-left"></i>
      </button>
    </div>
    <div class="movie-details-content">
      <div class="movie-poster">
        <img src="${movie.poster_url}" alt="${movie.title}">
      </div>
      <div class="movie-info">
        <h1 class="movie-title">${movie.title}</h1>
        <div class="movie-genres">
          ${movie.genre
            .split(",")
            .map((genre) => `<span class="genre-tag">${genre.trim()}</span>`)
            .join("")}
        </div>
        <div class="movie-metadata">
          <div class="metadata-item">
            <i class="bi bi-person"></i>
            <span>Director: ${movie.director}</span>
          </div>
          <div class="metadata-item">
            <i class="bi bi-calendar"></i>
            <span>Release Year: ${movie.release_year}</span>
          </div>
          <div class="metadata-item">
          <i class="bi bi-clock"></i>
          <span>Duration: ${movie.duration || "2h 20m"}</span>
          </div>
          <div class="metadata-item">
          <i class="bi bi-star"></i>
          <span>Rating: ${movie.rating || "8.9/10"}</span>
          </div>
        </div>
        <div class="movie-description">
          ${movie.description || "No description available"}
        </div>
      </div>
    </div>
  `;

  const detailsPage = document.getElementById("movie-details");
  detailsPage.style.display = "block";
  // Trigger reflow to ensure transition works
  detailsPage.offsetHeight;
  detailsPage.classList.add("show");
}

async function fetchMovies() {
  const response = await fetch("/movies");
  const movies = await response.json();

  const moviesList = document.getElementById("movies-list");
  moviesList.innerHTML = "";

  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.onclick = () => viewMovieDetails(movie.id);
    movieCard.innerHTML = `
      <img src="${movie.poster_url}" alt="${movie.title}">
      <div class="movie-card-content">
        <div>
          <h3>${movie.title}</h3>
          <p class="movie-description">${
            movie.description || "No description available"
          }</p>
        </div>
        <div>
          <p>${movie.release_year}</p>
          <button class="btn-trash" onclick="event.stopPropagation(); confirmDelete(${
            movie.id
          }, event)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
    moviesList.appendChild(movieCard);
  });
}

function confirmDelete(id, event) {
  event.stopPropagation(); // Prevent movie details from opening
  movieToDelete = id;
  const modal = document.getElementById("delete-movie-modal");
  modal.style.display = "block";
  modal.offsetHeight; // Force reflow
  modal.classList.add("show");
}

function cancelDelete() {
  const modal = document.getElementById("delete-movie-modal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    movieToDelete = null;
  }, 300);
}

async function confirmDeleteMovie() {
  if (movieToDelete !== null) {
    await fetch(`/movies/${movieToDelete}`, { method: "DELETE" });
    fetchMovies();
    cancelDelete();
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("title", document.getElementById("title").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("director", document.getElementById("director").value);
  formData.append(
    "release_year",
    document.getElementById("release_year").value
  );
  formData.append("genre", document.getElementById("genre").value);

  // // upload poster
  // const uploadResponse = await fetch("/upload", {
  //   method: "POST",
  //   body: formData,
  // });
  // const uploadData = await uploadResponse.json();
  // const posterPath = uploadData.filePath;

  // send movie data
  await fetch("/movies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: formData.get("title"),
      description: formData.get("description"),
      director: formData.get("director"),
      release_year: parseInt(formData.get("release_year")),
      genre: formData.get("genre"),
    }),
  });

  form.reset();
  closeAddMovieModal();
  fetchMovies();
};

// Close modal when clicking outside
window.onclick = function (event) {
  const addMovieModal = document.getElementById("add-movie-modal");
  const deleteMovieModal = document.getElementById("delete-movie-modal");
  
  if (event.target === addMovieModal) {
    closeAddMovieModal();
  } else if (event.target === deleteMovieModal) {
    cancelDelete();
  }
};

fetchMovies();

// Add this scroll handler
window.addEventListener("scroll", function () {
  const header = document.getElementById("siteHeader");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Remove the existing theme switch div from the body since it's now in the header
document.querySelector(".theme-switch")?.remove();
