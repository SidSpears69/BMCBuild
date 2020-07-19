// Входные данные торговых предложений
var colors = [{
    color: "Зеленый",
    images: [
        "img/green.png",
        "img/green-1.png",
        "img/green-2.png",
        "img/green-3.png",
        "img/green-4.png",
        "img/green-5.png"
    ],
    quantity: 1
},
{
    color: "Желтый",
    images: [
        "img/yellow.jpg",
        "img/yellow-1.jpg",
        "img/yellow-2.jpg",
        "img/yellow-3.jpg",
    ],
    quantity: 3
},
{
    color: "Красный",
    images: [
        "img/red.jpg",
        "img/red-1.jpg",
        "img/red-2.jpg",
    ],
    quantity: 5
},
{
    color: "Синий",
    images: [
        "img/blue.jpg",
        "img/blue-1.jpg",
    ],
    quantity: 7
},
]

$(document).ready(function () {
    // Выпадающее меню
    $(".menu__item--dropdown").click(function () {
        $(this).toggleClass("opened");
    });

    // Выпадающий поиск
    $(".search__toggle").click(function () {
        $(".search__wrapper").toggleClass("opened");
    });

    // Настройки рейтинга
    $(".rating__stars").rating({
        fx: "full",
        stars: 5
    });
    // Открытие мобильного меню
    $(".menu__toggle").click(function(){
        $("body").toggleClass("menu-opened")
    })
    // Инициализация слайдера
    function initSlider() {
        $(".product-images__slider").removeClass("product-images__slider--destroy");
        var mySwiper = new Swiper('.swiper-container ', {
            observer: true,
            slidesPerView: 3,
            spaceBetween: 29,
            slideToClickedSlide: true,
            setWrapperSize: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                1200: {
                    slidesPerView: 5,
                },
                992: {
                    slidesPerView: 4,
                }
            },
        });
        $(".product-images__photo").first().addClass("active");
        mySwiper.on('slideChangeTransitionEnd', function () {
            $(".product-images__photo").removeClass("active");
            $(".swiper-slide-active").addClass("active");
            $(".product-images__big-photo").children("img").attr("src", $(".product-images__photo.active").children("img").attr("src"));
        });
        $(".product-images__photo").each(function(){
            $(this).click(function(){
                $(".product-images__photo").removeClass("active");
                $(this).addClass("active");
                $(".product-images__big-photo").children("img").attr("src", $(this).children("img").attr("src"));
            })
        })
    }
    // Всплывающие окна
    $(".page-header__link").magnificPopup({
        type: 'inline',
        mainClass: 'mfp-fade'
    });
    $(".page-header__enter").magnificPopup({
        type: 'inline',
        mainClass: 'mfp-fade'
    });

    // Инициализация карточки товара
    var selectedColor = $(".colors__radio:checked").val();
    changeColors(selectedColor);
    updateCounter($("#basket"), $(".page-header__link--basket").find("span"), $(".product-info__quantity--basket"));
    updateCounter($("#favourites"), $(".page-header__link--favourites").find("span"), $(".product-info__quantity--favourites"));
    updateFavouritesButton();
    updateBasketButton();
    deleteProduct($("#favourites"), updateFavouritesButton);
    deleteProduct($("#basket"), updateAvailableCounter);

    // При изменении значения radio менять цвет
    $(".colors__radio").change(function () {
        var selectedColor = $(".colors__radio:checked").val();
        changeColors(selectedColor);
    })

    // Изменение цвета
    function changeColors(selectedColor) {
        var images = findColors(selectedColor).images;
        var quantity = findColors(selectedColor).quantity;
        changeSlider(images, quantity);
    }

    // Берем данные из массива входных значений
    function findColors(selectedColor) {
        var result = $.grep(colors, function (el) {
            return el.color == selectedColor;
        });
        var quantity = result[0].quantity - checkedProductInBasket();
        return {
            images: result[0].images,
            quantity: "(" + quantity + ")"
        };
    }

    // Меняем слайдер при изменении цвета
    function changeSlider(images, quantity) {
        $(".product-images").empty();
        var sliderTemplate = $("#product-images")[0].content.cloneNode(true);
        $(sliderTemplate).find(".product-images__big-photo").children("img").attr("src", images[0]);
        $.each(images, function () {
            changeSmallImages(sliderTemplate, this)
        });
        $(sliderTemplate).appendTo($(".product-images"));
        $(".availability__quantity").text(quantity);
        updateFavouritesButton();
        updateBasketButton();
        initSlider();
    }

    // Добавляем изображения из массива входных значений
    function changeSmallImages(slider, image) {
        var photoTemplate = $("#slide")[0].content.cloneNode(true);
        var container = $(slider).find(".swiper-wrapper");
        $(photoTemplate).find("img").attr("src", image);
        $(photoTemplate).appendTo(container);
    }

    // Добавление товара в корзину
    $(".product-controls__button--basket").click(function () {
        $(".popup_empty").removeClass("visible");
        var quantity = parseInt($(".availability__quantity").text().slice(1, -1));
        if (quantity > 0) {
            var product = copyProductTemplate($("#order"));
            if (findSameProduct($("#basket")) !== undefined) {
                var element = findSameProduct($("#basket"));
                var sameProduct = $($(".popup__item")[element]);
                var value = parseInt(sameProduct.find(".popup__quantity").text());
                value++;
                sameProduct.find(".popup__quantity").text(value);
            }
            else {
                $("#basket").find($(".popup__control--borders")).before(product);
            }
            quantity--;
            $(".availability__quantity").text("(" + quantity + ")");
            updateCounter($("#basket"), $(".page-header__link--basket").find("span"), $(".product-info__quantity--basket"));
            updateBasketButton();
            deleteProduct($("#basket"), updateAvailableCounter);
        }
    })

    // Добавление товара в избранное
    $(".product-controls__button--favourites").click(function () {
        $(".popup_empty").removeClass("visible");
        var product = copyProductTemplate($("#like"));
        if (findSameProduct($("#favourites")) === undefined) {
            product.appendTo("#favourites");
            updateCounter($("#favourites"), $(".page-header__link--favourites").find("span"), $(".product-info__quantity--favourites"));
            $(".product-controls__button--favourites").text("Товар в избранном");
            $(".product-controls__button--favourites").prop('disabled', true);
        }
        updateFavouritesButton();
        deleteProduct($("#favourites"), updateFavouritesButton);
    })

    //Проверяем количество товара в корзине
    function checkedProductInBasket() {
        var element = findSameProduct($("#basket"));
        var quantity;
        if (element !== undefined) {
            quantity = parseInt($($(".popup__item")[element]).find(".popup__quantity").text());
        }
        else {
            quantity = 0;
        }
        return quantity;
    }
    // Проверяем наличие товара в всплывающем окне
    function findSameProduct(element) {
        var index;
        $.makeArray(element.find(".popup__item")).some(function (el, i) {
            if (($(el).find(".popup__product-name").text() == $(".product-description__title").text()) && ($(el).find(".popup__color").text() == $(".colors__radio:checked").val())) {
                return (index = i);
            }
        });
        return index;
    }

    // Копируем товар из шаблона
    function copyProductTemplate(template) {
        var name = $(".product-description__title").text();
        var color = $(".colors__radio:checked").next(".colors__item").text();
        var colorValue = $(".colors__radio:checked").val();
        var image = findColors(colorValue).images[0];
        var price = $(".price__value").text();
        var order = {
            image: image,
            name: name,
            color: color,
            price: price
        };
        var orderTemplate = template[0].content.cloneNode(true);
        $(orderTemplate).find("img").attr("src", order.image);
        $(orderTemplate).find(".popup__product-name").text(order.name);
        $(orderTemplate).find(".popup__color").text(order.color);
        $(orderTemplate).find(".popup__price").text(order.price);
        return $(orderTemplate);
    }

    // Пересчет значений товара в счетчиках
    function updateCounter(element, counterHeader, counterFooter) {
        var counter = 0;
        if (element.find(".popup__quantity").length > 0) {
            element.find(".popup__quantity").each(function () {
                counter += parseInt($(this).text());
            });
        }
        else {
            counter = element.find(".popup__item").length;
        }
        counterHeader.text(counter);
        counterFooter.text(counter);
    }

    // Обновляем кнопку избранного при добавлени
    function updateFavouritesButton() {
        var condition = findSameProduct($("#favourites"));
        if (condition !== undefined) {
            $(".product-controls__button--favourites").text("Товар в избранном");
            $(".product-controls__button--favourites").prop('disabled', true);
        }
        else {
            $(".product-controls__button--favourites").html("<i class='far fa-heart'></i> В избранное");
            $(".product-controls__button--favourites").prop('disabled', false);
        }
        updateCounter($("#favourites"), $(".page-header__link--favourites").find("span"), $(".product-info__quantity--favourites"));
    }

    // Обновляем кнопку добавления в корзину
    function updateBasketButton() {
        var condition = parseInt($(".availability__quantity").text().slice(1, -1));
        if (condition == 0) {
            $(".product-controls__button--basket").text("Товар закончился");
            $(".product-controls__button--basket").prop('disabled', true);
        }
        else {
            $(".product-controls__button--basket").html("<i class='fas fa-shopping-bag'></i> Добавить в корзину");
            $(".product-controls__button--basket").prop('disabled', false);
        }
    }

    // Удаление товара
    function deleteProduct(element, callback) {
        element.find(".popup__button").each(function () {
            $(this).click(function () {
                $(this).parent(".popup__item").remove();
                callback();
                if (element.find(".popup__item").length == 0) {
                    $(".popup_empty").addClass("visible");
                }
            });
        })
        if (element.find(".popup__item").length == 0) {
            $(".popup_empty").addClass("visible");
        }
        updateBasketButton();
    }

    // Обновить счетчики количества доступного товара
    function updateAvailableCounter() {
        var selectedColor = $(".colors__radio:checked").val();
        var quantity = findColors(selectedColor).quantity;
        $(".availability__quantity").text(quantity);
        updateCounter($("#basket"), $(".page-header__link--basket").find("span"), $(".product-info__quantity--basket"));
        updateBasketButton();
    }

    // Очистить корзину
    $(".popup__control--borders").click(function () {
        $("#basket").find(".popup__button").each(function () {
            $(this).trigger('click');
        })
    })
})
