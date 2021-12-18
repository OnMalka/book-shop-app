import {renderBooks} from './renderBooksDiv.js';

const form = document.getElementById('book-form');
const bookName = document.getElementById('name');
const author = document.getElementById('author');
const description = document.getElementById('description');
const imgSrc = document.getElementById('imgSrc');
const imgAlt = document.getElementById('imgAlt');
const genre = document.getElementById('genre');
const price = document.getElementById('price');
const stock = document.getElementById('stock');
const bookModelBg = document.getElementById('book-model-bg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    addBook();   
});

const addBook = async () => {
    try{        
        const newBook = {
            name: bookName.value,
            author: author.value,
            description: description.value,
            imgSrc: imgSrc.value,
            imgAlt: imgAlt.value,
            genre: genre.value,
            price: price.value,
            stock: stock.value,
        }

        switch (document.getElementById('book-form-header').innerText   ) {
            case 'Add book':
                await fetch('http://localhost:3000/books/new', {
                    'method': 'POST',
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    'body': JSON.stringify(newBook)
                });
                renderBooks();
                break;
            case 'Edit book':
                await fetch(`http://localhost:3000/books/edit?id=${bookName.getAttribute('book-id')}`, {
                    'method': 'PATCH',
                    'headers': {
                        'Content-Type': 'application/json'
                    },          
                    'body': JSON.stringify(newBook)
                });
                renderBooks();      
                break;
        };

        bookModelBg.classList.remove('model-bg-active');
    }catch(err){
        console.log(err);
    }
};

console.log('add book js loaded');