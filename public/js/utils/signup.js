const form = document.getElementById('signup-form');
const userName = document.getElementById('userName');
const age = document.getElementById('age');
const email = document.getElementById('email');
const password = document.getElementById('password');
const favoriteGenre = document.getElementById('favoriteGenre');

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    try{
        const newUser = {
            userName: userName.value,
            age: age.value,
            email: email.value,
            password: password.value,
            cartItems: []
        }
        console.log(newUser);
        
        const response = await fetch('http://localhost:3000/users/new', {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(newUser)
        });

        // console.log(await response.json())


        const cookieArr = document.cookie.split(";");
        for(let cookie of cookieArr){
            const cookiePair = cookie.split("=");
            if(cookiePair[0].trim() === 'cart'){
                // console.log('fetch req from signup')
                await fetch('http://localhost:3000/items/convert-to-new-user', {
                    'method': 'PATCH',
                    'headers': {
                    },
                    'body': {}
                    });
                break;
            }
        }

        window.location.href = 'http://localhost:3000/book-shop';
    }catch(err){
        console.log(err);
    }
    
});