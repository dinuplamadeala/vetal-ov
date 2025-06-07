let cart = JSON.parse(localStorage.getItem('cart')) || [];

const scriptURL = 'https://script.google.com/macros/s/AKfycbwGKXaiW2kBj9BSpOUrsMr9IpDYQIVhXL8YS87Igng8KG45XIUaWRGLSleRE5PgDp_X/exec';

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".add-to-cart").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            addToCart(this);
        });
    });
    updateCart();

    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    if (menuToggle && menu) {
        menuToggle.addEventListener("click", () => menu.classList.toggle("active"));
    }
});

function toggleCart() {
    document.getElementById('cart').classList.toggle('active');
}

function addToCart(link) {
    let item = link.parentElement;
    let name = item.getAttribute('data-name');
    let price = parseFloat(item.getAttribute('data-price'));
    let img = item.getAttribute('data-img');

    let existingItem = cart.find(i => i.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, img, quantity: 1 });
    }

    saveAndUpdateCart();
    showAddedToCartMessage();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveAndUpdateCart();
}

function saveAndUpdateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPrice = document.getElementById('total-price');

    if (cartItems && cartCount && totalPrice) {
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            let div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <p>${item.name} - ${item.price} MDL (x${item.quantity})</p>
                <a href="#" onclick="removeFromCart(${index})">&#x2715</a>
            `;
            cartItems.appendChild(div);
            total += item.price * item.quantity;
        });

        cartCount.textContent = cart.length;
        totalPrice.textContent = total.toFixed(2);
    }
}

function showAddedToCartMessage() {
    let message = document.getElementById('cart-message');
    if (message) {
        message.classList.add('show');
        setTimeout(() => message.classList.remove('show'), 3000);
    }
}

const orderButton = document.getElementById('orderButton');
const overlay = document.getElementById('overlay');
const step1Window = document.getElementById('step1Window');
const confirmOrderWindow = document.getElementById('confirmOrderWindow');
const step2Window = document.getElementById('step2Window');
const step1Form = document.getElementById('step1Form');
const step2Form = document.getElementById('step2Form');
const confirmOrderButton = document.getElementById('confirmOrderButton');
const editOrderButton = document.getElementById('editOrderButton');

orderButton?.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Coșul este gol! Adăugați produse înainte de a plasa o comandă.');
    } else {
        overlay.style.display = 'block';
        step1Window.style.display = 'block';
        setTimeout(() => step1Window.classList.add('active'), 10);
    }
});

step1Form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (name && phone && address) {
        step1Window.classList.remove('active');
        setTimeout(() => {
            step1Window.style.display = 'none';
            confirmOrderWindow.style.display = 'block';
            setTimeout(() => confirmOrderWindow.classList.add('active'), 10);
            updateConfirmOrderWindow();
        }, 300);
    } else {
        alert('Vă rugăm să completați toate câmpurile.');
    }
});

function updateConfirmOrderWindow() {
    const cartItemsConfirm = document.getElementById('cart-items-confirm');
    const totalPriceConfirm = document.getElementById('total-price-confirm');

    if (cartItemsConfirm && totalPriceConfirm) {
        cartItemsConfirm.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            let div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <p>${item.name} - ${item.price} MDL (x${item.quantity})</p>
            `;
            cartItemsConfirm.appendChild(div);
            total += item.price * item.quantity;
        });
        totalPriceConfirm.textContent = total.toFixed(2);
    }
}

confirmOrderButton?.addEventListener('click', () => {
    confirmOrderWindow.classList.remove('active');
    setTimeout(() => {
        confirmOrderWindow.style.display = 'none';
        step2Window.style.display = 'block';
        setTimeout(() => step2Window.classList.add('active'), 10);
    }, 300);
});

editOrderButton?.addEventListener('click', () => {
    confirmOrderWindow.classList.remove('active');
    setTimeout(() => {
        confirmOrderWindow.style.display = 'none';
        step1Window.style.display = 'block';
        setTimeout(() => step1Window.classList.add('active'), 10);
    }, 300);
});

step2Form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        cardNumber: document.getElementById('cardNumber').value.trim(),
        expiry: document.getElementById('expiry').value.trim(),
        cvv: document.getElementById('cvv').value.trim(),
        cart: cart.map(item => `${item.name} (x${item.quantity}) - ${item.price} MDL`).join(', ')
    };

    if (!data.name || !data.phone || !data.address || !data.cardNumber || !data.expiry || !data.cvv) {
        alert("Vă rugăm să completați toate câmpurile.");
        return;
    }

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data).toString()
        });

        const text = await response.text();

        if (response.ok && text.includes("Success")) {
            alert("Comanda a fost trimisă cu succes!");
        } else {
            alert("A apărut o eroare la salvarea comenzii: " + text);
        }

        cart = [];
        localStorage.removeItem('cart');
        updateCart();

        step1Form.reset();
        step2Form.reset();

        step2Window.classList.remove('active');
        overlay.style.display = 'none';
        setTimeout(() => {
            step2Window.style.display = 'none';
        }, 300);

    } catch (error) {
        console.error("Eroare la trimiterea comenzii:", error);
        alert("A apărut o eroare. Vă rugăm să încercați din nou.");
    }
});

overlay?.addEventListener('click', () => {
    [step1Window, confirmOrderWindow, step2Window].forEach(win => win?.classList.remove('active'));
    overlay.style.display = 'none';
    setTimeout(() => {
        [step1Window, confirmOrderWindow, step2Window].forEach(win => win.style.display = 'none');
    }, 300);
});

