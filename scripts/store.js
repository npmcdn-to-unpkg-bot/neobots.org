$(function() {

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
  sURLVariables = sPageURL.split('&'),
  sParameterName,
  i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

var curProduct = getUrlParameter('product');
var prodSKU = ['225','235','335','535','2235','125']
var prodId = ['7412397315','7205509123','7204116931','7194954563','7368739331','7369694531'];

function getCurProdId(variant) {
  var sku = prodSKU.indexOf(variant);
  console.log(prodId[sku]);
  return prodId[sku];
}

var curProductId = getCurProdId(curProduct);


  /* Build new ShopifyBuy client
  ============================================================ */
  var client = ShopifyBuy.buildClient({
    apiKey: 'f1a0f987bf81e9a182d362e0035ae83f',
    myShopifyDomain: 'neobots',
    appId: '6'
  });

  var product;
  var cart;
  var cartLineItemCount;
  if(localStorage.getItem('lastCartId')) {
    client.fetchCart(localStorage.getItem('lastCartId')).then(function(remoteCart) {
      cart = remoteCart;
      cartLineItemCount = cart.lineItems.length;
      renderCartItems();
      updateCartTabButton();
      console.log('A');
    });
  } else {
    client.createCart().then(function (newCart) {
      cart = newCart;
      localStorage.setItem('lastCartId', cart.id);
      cartLineItemCount = 0;
      console.log('B');
    });
  }

  var previousFocusItem;


  /* Fetch product and init
  ============================================================ */
  if(getUrlParameter('product')) {
    $('.product').addClass('visibleProduct');
    client.fetchProduct(curProductId).then(function (fetchedProduct) {
      product = fetchedProduct;
      var selectedVariant = product.selectedVariant;
      var selectedVariantImage = product.selectedVariantImage;
      var currentOptions = product.options;

      var variantSelectors = generateSelectors(product);
      $('.variant-selectors').html(variantSelectors);

      updateProductTitle(product.title);
      updateVariantImage(selectedVariantImage);
      updateVariantTitle(selectedVariant);
      updateVariantPrice(selectedVariant);
      attachOnVariantSelectListeners(product);
      updateCartTabButton();
      bindEventListeners();
    });
  }
  else {
    $('.productpanel').addClass('visiblePanel');
    $('.products-inner').addClass('visibleInner');
    bindEventListeners();
    updateCartTabButton();
  }


  /* Generate DOM elements for variant selectors
  ============================================================ */
  function generateSelectors(product) {
    var elements = product.options.map(function(option) {
      return '<select name="' + option.name + '">' + option.values.map(function(value) {
        return '<option value="' + value + '">' + value + '</option>';
      }) + '</select>';
    });

    return elements;
  }


  /* Bind Event Listeners
  ============================================================ */
  function bindEventListeners() {
    /* cart close button listener */
    $('.cart .btn--close').on('click', closeCart);

    /* click away listener to close cart */
    $(document).on('click', function(evt) {
      if((!$(evt.target).closest('.cart').length) && (!$(evt.target).closest('.js-prevent-cart-listener').length)) {
        closeCart();
      }
    });

    /* escape key handler */
    var ESCAPE_KEYCODE = 27;
    $(document).on('keydown', function (evt) {
      if (evt.which === ESCAPE_KEYCODE) {
        if (previousFocusItem) {
          $(previousFocusItem).focus();
          previousFocusItem = ''
        }
        closeCart();
      }
    });

    /* checkout button click listener */
    $('.btn--cart-checkout').on('click', function () {
      window.open(cart.checkoutUrl, '_self');
    });

    /* buy button click listener */
    $('.buy-button').on('click', buyButtonClickHandler);

    /* increment quantity click listener */
    $('.cart').on('click', '.quantity-increment', function () {
      var variantId = $(this).data('variant-id');
      incrementQuantity(variantId);
    });

    /* decrement quantity click listener */
    $('.cart').on('click', '.quantity-decrement', function() {
      var variantId = $(this).data('variant-id');
      decrementQuantity(variantId);
    });

    /* update quantity field listener */
    $('.cart').on('keyup', '.cart-item__quantity', debounce(fieldQuantityHandler, 250));

    /* cart tab click listener */
    $('.btn--cart-tab').click(function() {
      setPreviousFocusItem(this);
      openCart();
    });

    $('#235pan').on('click', function () {
      window.open('store?product=235', '_self');
    });

    $('#225pan').on('click', function () {
      window.open('store?product=225', '_self');
    });

    $('#335pan').on('click', function () {
      window.open('store?product=335', '_self');
    });

    $('#535pan').on('click', function () {
      window.open('store?product=535', '_self');
    });

    $('#2235pan').on('click', function () {
      window.open('store?product=2235', '_self');
    });

    $('#125pan').on('click', function () {
      window.open('store?product=125', '_self');
    });

  }


  /* Variant option change handler
  ============================================================ */
  function attachOnVariantSelectListeners(product) {
    $('.variant-selectors').on('change', 'select', function(event) {
      var $element = $(event.target);
      var name = $element.attr('name');
      var value = $element.val();
      product.options.filter(function(option) {
        return option.name === name;
      })[0].selected = value;

      var selectedVariant = product.selectedVariant;
      var selectedVariantImage = product.selectedVariantImage;
      updateProductTitle(product.title);
      updateVariantImage(selectedVariantImage);
      updateVariantTitle(selectedVariant);
      updateVariantPrice(selectedVariant);
    });
  }

  /* Update product title
  ============================================================ */
  function updateProductTitle(title) {
    $('#buy-button-1 .product-title').text(title);
  }

  /* Update product image based on selected variant
  ============================================================ */
  function updateVariantImage(image) {
    var src = (image) ? image.src : ShopifyBuy.NO_IMAGE_URI;

    $('#buy-button-1 .variant-image').attr('src', src);
  }

  /* Update product variant title based on selected variant
  ============================================================ */
  function updateVariantTitle(variant) {
    $('#buy-button-1 .variant-title').text(variant.title);
  }

  /* Update product variant price based on selected variant
  ============================================================ */
  function updateVariantPrice(variant) {
    $('#buy-button-1 .variant-price').text('$' + variant.price);
  }

  /* Attach and control listeners onto buy button
  ============================================================ */
  function buyButtonClickHandler(evt) {
    evt.preventDefault();
    var id = product.selectedVariant.id;
    var quantity;
    var cartLineItem = findCartItemByVariantId(id);

    quantity = cartLineItem ? cartLineItem.quantity + 1 : 1;

    addOrUpdateVariant(product.selectedVariant, quantity);
    setPreviousFocusItem(evt.target);
    $('#checkout').focus();
  }

  /* Update product variant quantity in cart
  ============================================================ */
  function updateQuantity(fn, variantId) {
    var quantity;
    var cartLineItem = findCartItemByVariantId(variantId);
    if (cartLineItem) {
      quantity = fn(cartLineItem.quantity);
      updateVariantInCart(cartLineItem, quantity);
    }
  }

  /* Decrease quantity amount by 1
  ============================================================ */
  function decrementQuantity(variantId) {
    updateQuantity(function(quantity) {
      return quantity - 1;
    }, variantId);
  }

  /* Increase quantity amount by 1
  ============================================================ */
  function incrementQuantity(variantId) {
    updateQuantity(function(quantity) {
      return quantity + 1;
    }, variantId);
  }

  /* Update producrt variant quantity in cart through input field
  ============================================================ */
  function fieldQuantityHandler(evt) {
    var variantId = parseInt($(this).closest('.cart-item').attr('data-variant-id'), 10);
    var variant = product.variants.filter(function (variant) {
      return (variant.id === variantId);
    })[0];
    var cartLineItem = findCartItemByVariantId(variant.id);
    var quantity = evt.target.value;
    if (cartLineItem) {
      updateVariantInCart(cartLineItem, quantity);
    }
  }

  /* Debounce taken from _.js
  ============================================================ */
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }

  /* Open Cart
  ============================================================ */
  function openCart() {
    $('.cart').addClass('js-active');
  }

  /* Close Cart
  ============================================================ */
  function closeCart() {
    $('.cart').removeClass('js-active');
    $('.overlay').removeClass('js-active');
  }

  /* Find Cart Line Item By Variant Id
  ============================================================ */
  function findCartItemByVariantId(variantId) {
    return cart.lineItems.filter(function (item) {
      return (item.variant_id === variantId);
    })[0];
  }

  /* Determine action for variant adding/updating/removing
  ============================================================ */
  function addOrUpdateVariant(variant, quantity) {
    openCart();
    var cartLineItem = findCartItemByVariantId(variant.id);

    if (cartLineItem) {
      updateVariantInCart(cartLineItem, quantity);
    } else {
      addVariantToCart(variant, quantity);
    }

    updateCartTabButton();
  }

  /* Update details for item already in cart. Remove if necessary
  ============================================================ */
  function updateVariantInCart(cartLineItem, quantity) {
    var variantId = cartLineItem.variant_id;
    var cartLength = cart.lineItems.length;
    cart.updateLineItem(cartLineItem.id, quantity).then(function(updatedCart) {
      var $cartItem = $('.cart').find('.cart-item[data-variant-id="' + variantId + '"]');
      if (updatedCart.lineItems.length >= cartLength) {
        $cartItem.find('.cart-item__quantity').val(cartLineItem.quantity);
        $cartItem.find('.cart-item__price').text(formatAsMoney(cartLineItem.line_price));
      } else {
        $cartItem.addClass('js-hidden').bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
           $cartItem.remove();
        });
      }

      updateCartTabButton();
      updateTotalCartPricing();
      if (updatedCart.lineItems.length < 1) {
        closeCart();
      }
    }).catch(function (errors) {
      console.log('Fail');
      console.error(errors);
    });
  }

  /* Add 'quantity' amount of product 'variant' to cart
  ============================================================ */
  function addVariantToCart(variant, quantity) {
    openCart();

    cart.addVariants({ variant: variant, quantity: quantity }).then(function() {
      var cartItem = cart.lineItems.filter(function (item) {
        return (item.variant_id === variant.id);
      })[0];
      var $cartItem = renderCartItem(cartItem);
      var $cartItemContainer = $('.cart-item-container');
      $cartItemContainer.append($cartItem);
      setTimeout(function () {
        $cartItemContainer.find('.js-hidden').removeClass('js-hidden');
      }, 0)

    }).catch(function (errors) {
      console.log('Fail');
      console.error(errors);
    });

    updateTotalCartPricing();
    updateCartTabButton();
  }

  /* Return required markup for single item rendering
  ============================================================ */
  function renderCartItem(lineItem) {
    var lineItemEmptyTemplate = $('#CartItemTemplate').html();
    var $lineItemTemplate = $(lineItemEmptyTemplate);
    var itemImage = lineItem.image.src;
    $lineItemTemplate.attr('data-variant-id', lineItem.variant_id);
    $lineItemTemplate.addClass('js-hidden');
    $lineItemTemplate.find('.cart-item__img').css('background-image', 'url(' + itemImage + ')');
    $lineItemTemplate.find('.cart-item__title').text(lineItem.title);
    $lineItemTemplate.find('.cart-item__variant-title').text(lineItem.variant_title);
    $lineItemTemplate.find('.cart-item__price').text(formatAsMoney(lineItem.line_price));
    $lineItemTemplate.find('.cart-item__quantity').attr('value', lineItem.quantity);
    $lineItemTemplate.find('.quantity-decrement').attr('data-variant-id', lineItem.variant_id);
    $lineItemTemplate.find('.quantity-increment').attr('data-variant-id', lineItem.variant_id);

    return $lineItemTemplate;
  }

  /* Render the line items currently in the cart
  ============================================================ */
  function renderCartItems() {
    var $cartItemContainer = $('.cart-item-container');
    $cartItemContainer.empty();
    var lineItemEmptyTemplate = $('#CartItemTemplate').html();
    var $cartLineItems = cart.lineItems.map(function (lineItem, index) {
      return renderCartItem(lineItem);
    });
    $cartItemContainer.append($cartLineItems);

    setTimeout(function () {
      $cartItemContainer.find('.js-hidden').removeClass('js-hidden');
    }, 0)
    updateTotalCartPricing();
  }

  /* Update Total Cart Pricing
  ============================================================ */
  function updateTotalCartPricing() {
    $('.cart .pricing').text(formatAsMoney(cart.subtotal));
  }

  /* Format amount as currency
  ============================================================ */
  function formatAsMoney(amount) {
    return '$' + parseFloat(amount, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
  }

  /* Update cart tab button
  ============================================================ */
  function updateCartTabButton() {
    if (cart.lineItems.length > 0) {
       $('.btn--cart-tab .btn__counter').html(cart.lineItemCount);
       $('.btn--cart-tab').addClass('js-active');
     } else {
       $('.btn--cart-tab').removeClass('js-active');
       $('.cart').removeClass('js-active');
     }
  }

  /* Set previously focused item for escape handler
  ============================================================ */
  function setPreviousFocusItem(item) {
    previousFocusItem = item;
  }
});

$('#filter-btn').click(function(){
  $('#filter').toggleClass('visible');
  $('#filter-btn span').toggleClass('visible');
  $('#opc1').toggleClass('visible');
  $('#sidebar').removeClass('visible');
  $('#sidebar-btn span').removeClass('visible');
  $('#opc').removeClass('visible');
});

$('#opc1').click(function(){
  $('#filter').removeClass('visible');
  $('#filter-btn span').removeClass('visible');
  $('#opc1').removeClass('visible');
});

$(window).unload(function(){
    updateCartTabButton();
  });

$("#alumFilter").jqxCheckBox({
  width: '100px',
  height: 25,
  theme: 'arctic'
});

$("#vinFilter").jqxCheckBox({
  width: '150px',
  height: 25,
  theme: 'arctic'
});

$("#zipFilter").jqxCheckBox({
  width: '100px',
  height: 25,
  theme: 'arctic'
});

$("#20Filter").jqxCheckBox({
  width: '100px',
  height: 25,
  theme: 'arctic'
});

$("#50Filter").jqxCheckBox({
  width: '150px',
  height: 25,
  theme: 'arctic',
});

$("#51Filter").jqxCheckBox({
  width: '100px',
  height: 25,
  theme: 'arctic'
});

$("#apply").jqxButton({ width: '100', height: '25', theme: 'arctic'});
$("#viewAll").jqxButton({ width: '100', height: '25', theme: 'arctic'});
