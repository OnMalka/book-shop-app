const searchForm = document.getElementById('search-form');
const searchFormInput = document.getElementById('search-form-input');
const searchFormSubmit = document.getElementById('search-button');
const searchSuggestionsList = document.querySelector('.search-suggestions-list');
import {renderBooks} from './renderBooksDiv.js';

searchFormInput.setAttribute('autocomplete', 'off');

let searchTerms = []; 
(async function(){
    try{
        searchTerms = await (await fetch(`http://localhost:3000/books/search-terms`)).json();
    }catch(err){
        console.log(err);
    };
     
})();

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    renderBooks();
});

searchFormInput.addEventListener('keyup', async () => {
    const input = searchFormInput.value;
    if(input === ''){
        clearSearchList();
        return;
    };
    clearSearchList();
    for(let term of searchTerms){
        if(term.toLowerCase().includes(input.toLowerCase())){
            const li = document.createElement('li');
            li.innerText = term;
            li.addEventListener('click', () => {
                searchFormInput.value = li.innerText;
                clearSearchList();
                searchFormSubmit.click();
            });
            searchSuggestionsList.appendChild(li);
            
        }
    };
});

const clearSearchList = () => {
    while(searchSuggestionsList.children.length>0){
        searchSuggestionsList.removeChild(searchSuggestionsList.lastChild);
    };
};