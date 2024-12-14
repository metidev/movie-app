// Dark mode switch
function darkModeSwitch() {
  if (ui("mode") == "dark") {
    ui("mode", "light");
    localStorage.setItem("theme", "light");
  } else {
    ui("mode", "dark");
    localStorage.setItem("theme", "dark");
  }
}

// On page load, check for saved theme preference
window.onload = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    ui("mode", savedTheme);
  }
};

// delete movie
async function confirmDeleteMovie() {
  if (movieToDelete !== null) {
    await fetch(`/movies/${movieToDelete}`, { method: "DELETE" });
    fetchMovies();
    cancelDelete();
  }
}

let form = document.querySelector("#add-movie-form");

// send data
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
  fetchMovies();
  ui('#add-movie')
};

// fetch movies
async function fetchMovies() {
  const response = await fetch("/movies");
  const movies = await response.json();

  const moviesList = document.getElementById("movies-list");
  moviesList.innerHTML = "";

  movies.forEach((movie) => {
    const movieCard = document.createElement("article");
    // movieCard.addEventListener("click",  ui('#movie-detail'));
    movieCard.className = "movie-card";
    movieCard.addEventListener("click", () => viewMovieDetails(movie.id));
    movieCard.onclick = () => ui('#movie-detail');
    movieCard.innerHTML = `
        <img class="!object-top responsive large" src="${movie.poster_url}" />
          <div class="absolute bottom left right padding bottom-shadow white-text">
            <nav>
              <h5 class="text-md">${movie.title} • ${movie.release_year}</h5>
              <div class="max"></div>
              <button onclick="event.stopPropagation(); confirmDelete(${
                movie.id
              }, event)" class="circle transparent">
                <i>delete</i>
              </button>
            </nav>
          </div>
    `;
    moviesList.appendChild(movieCard);
  });
}

// movie details
async function viewMovieDetails(movieId) {

  // Add class to body to prevent scrolling
  document.body.classList.add('movie-details-open');
  
  const response = await fetch(`/movie/${movieId}`);
  const movie = await response.json();

  console.log(movie)

  const detailsContainer = document.getElementById("movie-details-content");
  detailsContainer.innerHTML = `
       <header class="rounded-xl">
            <nav>
              <button onclick="ui('#movie-detail')" class="circle transparent">
                <i>arrow_back</i>
              </button>
              <h3 class="max text-xl center-align">Details</h3>
              <button onclick="closeMovieDetails()" class="circle transparent">
                <i>star</i>
              </button>
            </nav>
          </header>

          <img class="mt-4 rounded-xl" src="${movie.poster_url}" />
          <h1 class="text-3xl">${movie.title}</h1>
          <span class="text-lg my-2 block"> ${movie.director || "unavailable"}</span>
          <div>
            <button class="chip m-1 ms-0 fill">
            ${movie.genre
              .split(",")
              .map((genre) => `<span class="genre-tag">${genre.trim()}</span>`)
              .join("")}
            </button>
    
          </div>
          <p class="my-3 text-justify">
           ${movie.description || "No description available"}
          </p>
          <button class="extra primary responsive round my-3">
            <i>play_circle</i>
            <span>Play Now</span>
          </button>
  `;

  const detailsPage = document.getElementById("movie-detail");
  detailsPage.style.display = "block";
  // Trigger reflow to ensure transition works
  detailsPage.offsetHeight;
  detailsPage.classList.add("show");
}


// close dialog
function closeMovieDetails() {
  const detailsPage = document.getElementById("movie-detail");
  detailsPage.classList.remove("show");
  
  // Remove class from body to restore scrolling
  document.body.classList.remove('movie-details-open');
  
  setTimeout(() => {
    detailsPage.style.display = "none";
  }, 300); // Match the transition duration
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

window.onclick = function (event) {
  const deleteMovieModal = document.getElementById("delete-movie-modal");
if (event.target === deleteMovieModal) {
    cancelDelete();
  }
};

fetchMovies();
