const cartDiv = document.getElementById('cart-container');

const renderCartDiv = async () => {
    while(cartDiv.children.length>0){
        cartDiv.removeChild(cartDiv.lastChild);
    };

    const cartHeader = document.createElement('h2');
    cartHeader.innerText = 'Shoping cart';
    cartDiv.appendChild(cartHeader);

    const response = await fetch('http://localhost:3000/items/get');
    let total = 0;
    if(response.status === 200){
        const items = await response.json();  

        total = await renderItemsAndGetTotalPrice(items);
    };
    
    const cartSpan = document.createElement('span');
    const totalTextHeader = document.createElement('h3');
    totalTextHeader.innerText = 'Total:';
    const totalNumberHeader = document.createElement('h3');
    totalNumberHeader.innerText = total + ' $';
    totalNumberHeader.id = 'total Price';
    cartSpan.appendChild(totalTextHeader);
    cartSpan.appendChild(totalNumberHeader);
    cartDiv.appendChild(cartSpan);
};

const renderItemsAndGetTotalPrice = async (items) => {
    let total = 0;

    for(let item of items){   
        const bookRes = await fetch(`http://localhost:3000/books/get?id=${item.book}`);
        const {imgSrc, imgAlt, price} = await bookRes.json();
        total += price * item.amount;

        const div = document.createElement('div');

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'X';
        deleteButton.addEventListener('click', (e) => {
            deleteItem(e, item._id);
        });
        div.appendChild(deleteButton);
        
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = imgAlt;
        div.appendChild(img);

        const plusButton = document.createElement('button');
        plusButton.innerText = '+';        
        div.appendChild(plusButton);

        const amountHeader = document.createElement('h3');
        amountHeader.innerText = item.amount;
        div.appendChild(amountHeader);

        const minusButton = document.createElement('button');
        minusButton.innerText = '-';        
        div.appendChild(minusButton);

        const priceTextHeader = document.createElement('h3');
        priceTextHeader.innerText = 'Price:';
        const priceNumberHeader = document.createElement('h3');
        priceNumberHeader.className = 'price-h3'
        priceNumberHeader.innerText = price * item.amount + ' $';
        div.appendChild(priceTextHeader);
        div.appendChild(priceNumberHeader);
        cartDiv.appendChild(div)

        plusButton.addEventListener('click', () => {
            //add 1 unit of this book
            changeAmount(item, 1, amountHeader, priceNumberHeader);
        });

        minusButton.addEventListener('click', () => {
            //subtract 1 unit of this book
            changeAmount(item, -1, amountHeader, priceNumberHeader);
        });

        deleteButton.addEventListener('click', (e) => {
            deleteItem(e, item._id, priceNumberHeader);
        });        
    };
    return total;
};

const deleteItem = async (e, itemId, priceNumberHeader) => {
    try{
        await fetch(`http://localhost:3000/items/delete`, {
            'method': 'DELETE',
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify({itemId})        
        });
        
        const totalHeader = document.getElementById('total Price');
        const newTotal = +totalHeader.innerHTML.replace(' $', '') - +priceNumberHeader.innerText.replace(' $', '');
        totalHeader.innerHTML = newTotal + ' $';
        cartDiv.removeChild(e.target.parentElement);
        // console.log()

        // location.reload();
        // renderCartDiv();
    }catch(err){
        console.log(err);
    };    
};

const changeAmount = async (item, amountToAdd, amountHeader, priceNumberHeader) => {
    try{ 
        const amount = item.amount + parseInt(amountToAdd);
        if(amount < 1)
            throw new Error({
                message: 'Use cancel button to remove item from list'
            })
        else{
            const response = await fetch('http://localhost:3000/items/change-amount', {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify({book: item.book, amount})
            });
            if(response.status === 200){
                item.amount = amount;
                // location.reload();
                // renderCartDiv();
                const unitPrice = priceNumberHeader.innerText.replace(' $', '')/amountHeader.innerText;
                amountHeader.innerText = parseInt(amountHeader.innerText) + amountToAdd;
                priceNumberHeader.innerText = (amountHeader.innerText * unitPrice) + ' $';
                const totalHeader = document.getElementById('total Price');
                const newTotal = +totalHeader.innerHTML.replace(' $', '') + +(unitPrice * amountToAdd);
                totalHeader.innerHTML = newTotal + ' $';
            }
        } 
    }catch(err){
        console.log(err);
    }        
};

renderCartDiv();