const booksDiv = document.getElementById('books-container');

const searchForm = document.getElementById('search-form');
const searchFormInput = document.getElementById('search-form-input');

export const renderBooks = async () => {

    const isAdmin = document.URL === 'http://localhost:3000/admin';

    while(booksDiv.children.length>0){
        booksDiv.removeChild(booksDiv.lastChild);
    };

    if(isAdmin){
        const BookModelBg = document.getElementById('book-model-bg');
        const BookModelClose = document.querySelector('.book-model-close');
        const bookModelHeader = document.getElementById('book-form-header');

        const addBookSpan = document.createElement('span');
        addBookSpan.className = 'add-book-span'; 
        booksDiv.appendChild(addBookSpan);           

        const addBookButton = document.createElement('button');
        addBookButton.className = 'add-book-button';
        addBookButton.innerText = 'Add book';
        addBookButton.addEventListener('click', () => {
            bookModelHeader.innerHTML = 'Add book';
            BookModelBg.classList.add('model-bg-active');
        });

        BookModelClose.addEventListener('click', () => {
            BookModelBg.classList.remove('model-bg-active');
        });

        addBookSpan.appendChild(addBookButton);        
    }

    const isUserSearch = searchFormInput.value.length;
                                                                
    const response = isUserSearch < 1 ? 
        await fetch('http://localhost:3000/books/get-all') : 
            await fetch(`http://localhost:3000/books/search?searchInput=${searchFormInput.value.trim().replaceAll(' ', '+')}`);

    const books = await response.json();  

    if(books.length === 0){
        const message = document.createElement('h2');
        message.innerText = "No books found!";
        message.className = 'form-container';
        booksDiv.appendChild(message);
    }

    for(let i=0; i<books.length; i++){
        const bookSpan = document.createElement('span');
        bookSpan.className = 'book-span';
        bookSpan.setAttribute('book-id', books[i]._id);
        booksDiv.appendChild(bookSpan);

        const bookImg = document.createElement('img');
        bookImg.className = 'book-img'        
        bookImg.src = books[i].imgSrc;
        bookImg.alt = books[i].imgAlt;
        bookSpan.appendChild(bookImg);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-div';
        bookSpan.appendChild(infoDiv);
        
        const infoObj = {name:'Name: ', author:'By: ', ganre:'Ganre: ', rating:'Rating: '}
        for(let propety of Object.keys(infoObj)){
            const lable = document.createElement('label');
            if(propety === 'rating'){
                lable.innerHTML = 'Rating: '
                for(let j=parseInt(books[i][propety]); j>=1; j--){
                    lable.innerHTML += '★'
                }                
            }
            else            
                lable.innerHTML = infoObj[propety] + books[i][propety];
            infoDiv.appendChild(lable);
            infoDiv.appendChild(document.createElement('br'));
        }
        
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'description-div';
        let description = 'Description: ' + books[i].description
        if(description.length>200){
            description = description.substring(0, 200);
            if(description[199] === ' '){
                description = description.trim();
                description += '...';
            }else{
                description = description.substring(0, description.lastIndexOf(' ')) + '...';
            }                
        }
        descriptionDiv.innerHTML = description;
        bookSpan.appendChild(descriptionDiv);

        const bottomDiv = document.createElement('div');
        bottomDiv.className = 'bottom-div';
        bookSpan.appendChild(bottomDiv);   
        
        if(isAdmin)
            adminsBottomDiv(bottomDiv, books[i]);
        else
            usersBottomDiv(bottomDiv, i);        
    }
    updateCartCounter();
}

// searchForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     renderBooks();      
// });

const usersBottomDiv = (div, i) => {
    const addButton = document.createElement('button');
        addButton.innerText = 'Add';
        addButton.addEventListener('click', async (e) => {
            addToCart(e);
        });
        div.appendChild(addButton);

        const ratingForm = document.createElement('form');
        ratingForm.className = 'rating-form';
        for(let j=1; j<=5; j++){
            const rateLable = document.createElement('label');
            rateLable.innerText = '⭐';
            rateLable.className = 'rate-lable';
            rateLable.addEventListener('click', async (e) => {
                const newRating = {
                    id : e.target.parentElement.parentElement.parentElement.getAttribute('book-id'),
                    rating : j
                };

                for(let i=0; i<j; i++){
                    ratingForm.children[i].classList.add('active');
                }

                ratingForm.classList.add('disabled');
    
                const response = await fetch('http://localhost:3000/books/rate', {
                    'method': 'POST',
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    'body': JSON.stringify(newRating)
                });
                const data = await response.json();
                const updatedRating = parseInt(data.newRating);

                const ratingInfo = e.target.parentElement.parentElement.parentElement.querySelector('.info-div').children[6];
                ratingInfo.innerHTML = 'Rating: '
                for(let j=updatedRating; j>=1; j--){
                    ratingInfo.innerHTML += '★'
                }                

                console.log('rating info: ', ratingInfo)
            });
            ratingForm.appendChild(rateLable);            
        };

        div.appendChild(ratingForm);
}

const adminsBottomDiv = (div, book) => {
    const addButton = document.createElement('button');
        addButton.innerText = 'Edit';
        addButton.addEventListener('click', async (e) => {
            //edit book
            const BookModelBg = document.getElementById('book-model-bg');
            const bookModelHeader = document.getElementById('book-form-header');
            const bookForm = document.getElementById('book-form');

            const bookName = document.getElementById('name');
            bookName.value = book.name;
            bookName.setAttribute('book-id', book._id);
            const author = document.getElementById('author');
            author.value = book.author;
            const description = document.getElementById('description');
            description.value = book.description;
            const imgSrc = document.getElementById('imgSrc');
            imgSrc.value = book.imgSrc;
            const imgAlt = document.getElementById('imgAlt');
            imgAlt.value = book.imgAlt;
            const genre = document.getElementById('genre');
            genre.value = book.genre;
            const price = document.getElementById('price');
            price.value = book.price;
            const stock = document.getElementById('stock');
            stock.value = book.stock;   

            bookModelHeader.innerHTML = 'Edit book';
            BookModelBg.classList.add('model-bg-active');
        });
        div.appendChild(addButton);
}

const addToCart = async (e) => {
    e.preventDefault();
    try{
        const newItem = {
            book: e.target.parentElement.parentElement.getAttribute('book-id')
        };

        const response = await fetch('http://localhost:3000/items/new', {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(newItem)
        });
        if(response.status)
            updateCartCounter();
    }catch(err){
        console.log(err);
    }        
};

const updateCartCounter = async () => {
    const cartCounter = document.getElementById('cartCounter');
    
    const items = await fetch('http://localhost:3000/items/get');
    if(items.status === 200){
        const itemsData = await items.json();
        let sum = 0;
        for(let item of itemsData){
            sum += item.amount;
        }
        cartCounter.innerText = ` ${sum}`;
    }
    
};

renderBooks();