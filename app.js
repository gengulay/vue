var eventBus = new Vue()

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="(review, index) in reviews" :key="index">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>
    
      </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
})

Vue.component('product-review', {
  template: `
        <form class="review-form" @submit.prevent="onSubmit">
          <p v-if=""errors.length>
            <b>Please correct the following error(s):</b>
              <ul>
                <li v-for="error in errors">{{ error }}</li>
              </ul>
          </p>
          <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name">
          </p>
        
          <p>
            <label for="review">Review:</label>      
            <textarea id="review" v-model="review"></textarea>
          </p>
        
         <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
              <option>5</option>
              <option>4</option>
              <option>3</option>
              <option>2</option>
              <option>1</option>
            </select>
          </p>
      
          <p>Would you recommend this product?</p>
          <label>
            Yes
            <input type="radio" id="yes" value="true" v-model="reccomend">
          </label>
            No  
            <input type="radio" id="no" value="false" v-model="reccomend">
          <p>
            <input type="submit" value="Submit">
          </p>
        </form>
`,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      reccomend: false,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          reccomend: this.reccomend
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
        this.reccomend = null
      } else {
        if (!this.name) {
          this.errors.push("Name required.")
        }
        if (!this.review) {
          this.errors.push("Review required.")
        }
        if (!this.rating) {
          this.errors.push("Rating required.")
        }
        if (!this.reccomend) {
          this.errors.push("Reccomendation required.")
        }
      }
    }
  }
})

Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `<div class="product">
        
      <div class="product-image">
        <img :src="image" />
      </div>

      <div class="product-info">
          <h1>{{ product }}</h1>
          <p v-if="inStock">In Stock</p>
          <p v-else>Out of Stock</p>
          <p>Shipping: {{ shipping }}</p>

          <product-details :details="details"></product-details>

          <div class="color-box"
               v-for="(variant, index) in variants" 
               :key="variant.variantId"
               :style="{ backgroundColor: variant.variantColor }"
               @mouseover="updateProduct(index)"
               >
          </div> 

          <button v-on:click="addToCart" 
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
          Add to cart
          </button>
          
          <button v-on:click="removeToCart" 
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
          Remove to cart
          </button>
          
          <product-tabs :reviews="reviews"></product-tabs>
          
          
       </div>  
    </div>`,
  data() {
    return {
      product: 'Socks',
      brand: 'Vue Mastery',
      selectedVariant: 0,
      details: ['80% cotton', '20% polyester', 'Gender-neutral'],
      variants: [
        {
          variantId: 2234,
          variantColor: 'green',
          variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
          variantQuantity: 10
        },
        {
          variantId: 2235,
          variantColor: 'blue',
          variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
          variantQuantity: 0
        }
      ],
      reviews: []
    }
  },
  methods: {
    addToCart: function () {
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
    },
    removeToCart: function () {
      this.$emit('remove-to-cart',
          this.variants[this.selectedVariant].variantId)
    },
    updateProduct: function (index) {
      this.selectedVariant = index
    }
  },
  computed: {
    title: function () {
      return this.brand + ' ' + this.product
    },
    image: function () {
      return this.variants[this.selectedVariant].variantImage
    },
    inStock: function () {
      return this.variants[this.selectedVariant].variantQuantity
    },
    sale() {
      if (this.onSale) {
        return this.brand + ' ' + this.product + ' are on sale!'
      }
      return this.brand + ' ' + this.product + ' are not on sale'
    },
    shipping: function () {
      if (this.premium) {
        return "Free"
      }
      return 2.99
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview)
    })
  }
})

var mamaApp = new Vue({
  el: '#mamaStore',
  data: {
    premium: false,
    details: ["test", "123", "321"],
    cart: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id)
    },
    removeItem(id) {
      for (var i = this.cart.length - 1; i >= 0; i--) {
        if (this.cart[i] === id) {
          this.cart.splice(i, 1)
        }
      }
    }
  }
})
