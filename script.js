import { productsList } from "./products.js";

const productsWrpDom = document.querySelector('.productsWrp');
const cartWrpDom = document.querySelector('.cartWrp');
const grandTotalDom = document.querySelector('.grandTotal');
const cartItemsDom = document.querySelector('.cartItemsDom');
const clearAllDom = document.querySelector('.clearAll');

class Products {
    getProducts() {
        return productsList;
    }

}

class UI {
    // display products
    displayProducts(products) {
        let result = "";
        products.forEach(element => {
            result +=
                `
                <div class="col-lg-3 col-md-6">
                    <div class="featured-item shadow bg-white mb-5 rounded" >
                        <div class="featured-item-img position-relative overflow-hidden">
                            <a class="d-block" href="#">
                                <img class="border-4" style="transition: 0.3s linear;" src="${element.image}" alt="Images">
                            </a>
                        </div>
                        <div class="content py-3 px-2">
                            <h2 class="h6" style="min-height: 60px;">
                                <a href="#">
                                    ${element.name}
                                </a>
                            </h2>
                            <hr class="my-1">
                            <div class="content-in d-flex align-items-center justify-content-between p-2">
                                <span class="h6">
                                    $ ${element.price}
                                </span>
                                <span>
                                    (${element.rating})
                                    <i class="fa fa-star text-warning"></i>
                                </span>
                            </div>
                            <hr class="my-1">
                            <div class="">
                                <button type="button" data-id="${element.id}" data-name="${element.name}" data-price="${element.price}"
                                    class="btn btn-primary border-radius-5 addToCart">Add to cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
            productsWrpDom.innerHTML = result;

        });
    }

    // display cart products
    displayProductsCart() {
        let result = "";
        const productsCart = Storage.getCart();
        productsCart.forEach(element => {
            result +=
                `
                    <tr>
                        <td>
                            ${element.name}
                        </td>
                        <td>
                            (${element.price})
                        </td>
                        <td>
                            <div class="input-group">
                                <input type="number" class="item-count form-control quantityCount" data-id="${element.id}" value="${element.quantity}">
                            </div>
                        </td>
                        <td>
                            <button class="deleteItem btn btn-danger" data-id="${element.id}">
                                X
                            </button>
                        </td>
                        <td class="totalPrice">
                            ${element.totalPrice}
                        </td>
                    </tr>
            `
        });
        cartWrpDom.innerHTML = result;

        // totalPrice calculation
        if (productsCart.length > 0) {
            const quantityCounts = document.querySelectorAll('.quantityCount');
            quantityCounts.forEach(element => {
                element.addEventListener("change", () => {
                    const currentValue = parseInt(element.value);
                    const id = element.dataset.id;

                    const ui = new UI;
                    const index = productsCart.findIndex(item => item.id == id);
                    if (index !== -1) {
                        productsCart[index].quantity = currentValue;
                        productsCart[index].totalPrice = currentValue * productsCart[index].price;
                        Storage.saveCart(productsCart);
                        ui.displayProductsCart();
                    }
                })
            });
        }

        // grand total calculation
        this.updateGrandTotal(productsCart);

        // deleteItem
        const deleteItem = document.querySelectorAll('.deleteItem');
        deleteItem.forEach(element => {
            element.addEventListener('click', () => {
                const filteredArray = productsCart.filter((item) => {
                    return item.id != element.dataset.id;
                })
                Storage.saveCart(filteredArray)
                this.displayProductsCart();

                // number of cart items
                this.numberOfCartItems();
            })

        });
    }

    // update grand total
    updateGrandTotal(cart) {
        const total = cart.reduce((acc, curr) => acc + curr.totalPrice, 0);
        grandTotalDom.innerHTML = total;
    }

    // disable add to cart button
    disableAddToCartBtn(btn) {
        btn.innerText = "In Cart";
        btn.disabled = true;
        btn.style.backgroundColor = "#ccc";
        btn.style.cursor = "not-allowed";
        btn.style.border = "none";
    }

    // number of cart items
    numberOfCartItems() {
        const cartItems = Storage.getCart().length;
        cartItemsDom.innerHTML = cartItems;
    }

    // delete all cart items
    clearAllCartItems() {
        const ui = new UI;
        let productsCart = Storage.getCart();
        productsCart = [];
        Storage.saveCart(productsCart);
        ui.displayProductsCart();
        ui.numberOfCartItems();

        // update products with new cart buttons
        const products = new Products;
        const getProducts = products.getProducts();
        ui.displayProducts(getProducts);
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }

    static getCart() {
        return JSON.parse(localStorage.getItem('inCart')) || [];
    }

    static saveCart(cart) {
        localStorage.setItem('inCart', JSON.stringify(cart))
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const products = new Products;
    const getProducts = products.getProducts();
    const ui = new UI;
    ui.displayProducts(getProducts);
    Storage.saveProducts(getProducts);
    ui.displayProductsCart();

    const addToCartBtns = document.querySelectorAll('.addToCart');
    // convert Nodelist to Array
    const addToCartBtnsArr = [...addToCartBtns]

    // add to cart
    addToCartBtnsArr.forEach(btn => {
        const btnId = btn.dataset.id;
        const cart = Storage.getCart();
        const inCartOrNot = cart.find(p => p.id == btnId);
        if (inCartOrNot) {
            ui.disableAddToCartBtn(btn);
        }

        btn.addEventListener("click", (e) => {
            let cart = Storage.getCart();
            getProducts.forEach(product => {
                if (product.id == btnId) {
                    ui.disableAddToCartBtn(btn);
                    cart.push({ ...product, quantity: 1, totalPrice: product.price * 1 });
                    Storage.saveCart(cart);
                    ui.displayProductsCart();
                }
            });

            // number of cart items
            ui.numberOfCartItems();
        });

    });

    // number of cart items
    ui.numberOfCartItems();

    // delete all cart items
    clearAllDom.addEventListener("click", () => ui.clearAllCartItems());
});