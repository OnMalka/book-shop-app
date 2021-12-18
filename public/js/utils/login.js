const form = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUser = {
        email: email.value,
        password: password.value,
    }
    // console.log(newUser);
    let response = '';
    try{
        response = await fetch('http://localhost:3000/users/login', {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(newUser)
        });

        if(response.status === 200)
            window.location.href = 'http://localhost:3000/book-shop';
        else{
            response = await fetch('http://localhost:3000/admins/login', {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify(newUser)
            });

            if(response.status === 200)
                window.location.href = 'http://localhost:3000/admin';
        }        
        
    }catch(err){
        console.log(err);
    }
    
});

console.log('login js loaded');