// Define constants
const addButton = document.getElementById("btn-add");
const cancelButton = document.getElementById("btn-cancel");
const searchForm = document.getElementById("searchForm");
const newBook = document.getElementById("newBook");
const searchButton = document.getElementById("btn-search");
const bookTitle = document.getElementById("bookTitle");
const bookAuthor = document.getElementById("bookAuthor");
const searchResult = document.getElementById("searchResult");
const bookshelf = document.getElementById("content");



// Create arrays
let booksResult = [];
let bookElements = [];

//Button events
addButton.addEventListener("click", () => {
  addButton.style.display = "none";
  searchForm.style.display = "block";
  newBook.style.display = "none";
});

cancelButton.addEventListener("click", () => {
  searchResult.style.display = "none";
  addButton.style.display = "inline-block";
  searchForm.style.display = "none";
  newBook.style.display = "inline-block";
  location.reload();
});

// API

//Send api request and get the response
let apiRequest = new XMLHttpRequest();
searchForm.addEventListener("submit", ($event) => {
  $event.preventDefault();
  const authorInput = bookAuthor.value;
  const titleInput = bookTitle.value;
  apiRequest.open(
    "GET",
    "https://www.googleapis.com/books/v1/volumes?q=" + titleInput + authorInput
  );
  apiRequest.send();
});

//Set up the api form and book format as result

apiRequest.onreadystatechange = function () {
  if (this.readyState === 4 && this.status === 200) {
    const result = JSON.parse(this.responseText);
    if (result.totalItems === 0) {
      searchResult.innerHTML = "No book was found";
      searchResult.style.fontSize = "30px";
      searchResult.style.color = "#905858";
      searchResult.style.marginTop = "30px";
    } else {
      for (let x = 0; x < result.items.length; x++) {
        let res = result.items[x];
        booksResult.push(res);
      }
      console.log(booksResult);

      for (let i = 0; i < booksResult.length; i++) {
        const currentBook = booksResult[i];
        const bookId = currentBook.id;
        const ISBN = availableISBN(currentBook);
        const description = limitedDescription(currentBook);
        const title = currentBook.volumeInfo.title;
        const author = availableAuthor(currentBook);
        const url = availablePicture(currentBook);
        const book = bookFormat(bookId, title, author, url, description, ISBN);
        bookElements.push(book);
      }

      searchResult.innerHTML += bookElements;
    }
  }
};

//Book functions

//Check if  ISBN is available
function availableISBN(currentBook) {
  let ISBNs;
  if (currentBook.id) {
    ISBNs = currentBook.id;
  } else {
    ISBNs = "not available";
  }
  return ISBNs;
}

//Check if author is available
function availableAuthor(currentBook) {
  let authors;
  if (currentBook.volumeInfo.authors) {
    authors = currentBook.volumeInfo.authors[0];
  } else {
    authors = "Anonymous author";
  }
  return authors;
}

//Limits the description to 200 ch
function limitedDescription(currentBook) {
  let desc;
  if (currentBook.volumeInfo.description) {
    desc = currentBook.volumeInfo.description.slice(0, 200) + "...";
  } else {
    desc = "Missing Description";
  }
  return desc;
}

//Check if the picture is available
function availablePicture(currentBook) {
  let imageLinks;
  if (currentBook.volumeInfo.imageLinks) {
    imageLinks = currentBook.volumeInfo.imageLinks.thumbnail;
  } else {
    imageLinks = "img/unavailable-resized.png";
  }
  return imageLinks;
}

// Bookmark functions

function bookmarkBook(bookId) {
  const currentBook = booksResult.filter((book) => book.id === bookId);
  let sessionLength = sessionStorage.length;

  sessionStorage.setItem(bookId, JSON.stringify(currentBook));
  if (sessionLength < sessionStorage.length) {
    alert(`${currentBook[0].volumeInfo.title} Bookmarked!`);

    const savedDescription = currentBook[0].volumeInfo.description.slice(
      0,
      200
    );
    const savedTitle = currentBook[0].volumeInfo.title;
    const savedAuthor = currentBook[0].volumeInfo.authors;
    const savedUrl = currentBook[0].volumeInfo.imageLinks.thumbnail;
    const savedISBN = currentBook[0].id;

    const savedBook = savedBookFormat(
      bookId,
      savedTitle,
      savedAuthor,
      savedUrl,
      savedDescription,
      savedISBN
    );

    bookshelf.innerHTML += savedBook;
  } else {
    alert("This books is already saved");
  }
}

function pageReload() {
  let result = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    let keys = sessionStorage.key(i);
    console.log(keys);
    let value = sessionStorage.getItem(keys);
    result.push(JSON.parse(value));
    console.log(result);
  }

  for (let j = 0; j < result.length; j++) {
    const currentBook = result[j];
    const bookId = currentBook[0].id;
    const ISBN = availableISBN(currentBook[0]);
    const description = limitedDescription(currentBook[0]);
    const title = currentBook[0].volumeInfo.title;
    const author = availableAuthor(currentBook[0]);
    const url = availablePicture(currentBook[0]);
    const book = savedBookFormat(bookId, title, author, url, description, ISBN);
    bookElements.push(book);
  }
  bookshelf.innerHTML = bookElements;
}

//Book result format
function bookFormat(bookId, title, author, url, description, ISBN) {
  let bookForm =
    '<div id="bookResult">' +
    '<button type="button"  id= "bookmark"class="fa fa-bookmark" onclick="bookmarkBook(\'' +
    bookId +
    "')\"></button>" +
    "<span id='resultTitle'>" +
    title +
    "<span>" +
    "<h5 id='resultAuthor'>" +
    author +
    "</h5>" +
    "<img src=" +
    url +
    " />" +
    "<p>" +
    description +
    "</p>" +
    "<br>" +
    "<h5>" +
    "ISBN:" +
    ISBN +
    "</h5>" +
    "</div>";
  return bookForm;
}

//Saved book format
function savedBookFormat(
  bookId,
  savedTitle,
  savedAuthor,
  savedUrl,
  savedDescription,
  savedISBN
) {
  let savedBookForm =
    '<div id="savedResult" >' +
    '<button type="button" id="trash" class="fa fa-trash" onclick="trashBook(\'' +
    bookId +
    "')\"></button>" +
    "<span>" +
    savedTitle +
    "</span>" +
    "<br>" +
    "<h5>" +
    savedAuthor +
    "</h5>" +
    "<br>" +
    "<img src=" +
    savedUrl +
    "/>" +
    "<p>" +
    savedDescription +
    "..." +
    "</p>" +
    savedISBN +
    "<br>" +
    "<br>" +
    "</div>";
  return savedBookForm;
}

//Trash function
function trashBook(bookId) {
  sessionStorage.removeItem(bookId);
  document.getElementById("savedResult").remove();
}
