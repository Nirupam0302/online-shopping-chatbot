// ShopSphere Advanced Chatbot v2.0
// Features: NLP intent recognition, product recommendations, FAQ, order tracking

const CHATBOT_CONFIG = {
    greeting: "👋 Welcome to ShopSphere! I'm your AI shopping assistant. Ask me about products, shipping, returns, or anything else!",
    suggestedTopics: ['🏪 Browse Products', '💰 Show Deals', '📦 Track Order', '❓ Help & FAQ', '⭐ Recommendations'],
};

const FAQ_DATA = {
    'shipping': { q: 'Shipping', a: '📦 Standard: 3-5 days | Express: 1-2 days (extra charge)' },
    'returns': { q: 'Returns', a: '↩️ 30-day returns. Items must be in original condition with tags.' },
    'payment': { q: 'Payment', a: '💳 We accept cards, UPI, Net Banking, and digital wallets.' },
    'warranty': { q: 'Warranty', a: '✓ Select items have manufacturer warranty. Check product details.' },
    'bulk': { q: 'Bulk Orders', a: '🏢 Contact bulk@shopsphere.com for wholesale inquiries.' },
};

let chatHistory = [];
let messageCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById("userInput");
    if (!userInput) return;
    
    setTimeout(() => {
        addMessage(CHATBOT_CONFIG.greeting, "bot");
        showQuickReplies();
    }, 500);
    
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});

function sendMessage() {
    const userInput = document.getElementById("userInput");
    const message = userInput.value.trim();
    
    if (!message) return;
    
    addMessage(message, "user");
    userInput.value = "";
    messageCount++;
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        processUserMessage(message);
    }, 600 + Math.random() * 300);
}

function processUserMessage(message) {
    const lowerMsg = message.toLowerCase();
    let response = null;

    // Intent matching logic
    if (includes(lowerMsg, ['shipping', 'delivery', 'how long', 'days'])) {
        response = FAQ_DATA.shipping.a;
    } else if (includes(lowerMsg, ['return', 'refund', 'exchange'])) {
        response = FAQ_DATA.returns.a;
    } else if (includes(lowerMsg, ['payment', 'pay', 'card', 'upi'])) {
        response = FAQ_DATA.payment.a;
    } else if (includes(lowerMsg, ['warranty', 'guarantee', 'broken'])) {
        response = FAQ_DATA.warranty.a;
    } else if (includes(lowerMsg, ['bulk', 'wholesale'])) {
        response = FAQ_DATA.bulk.a;
    } else if (includes(lowerMsg, ['track', 'order', 'where', 'status'])) {
        response = "📦 Go to Profile → Order History to track your orders with real-time updates!";
    } else if (includes(lowerMsg, ['deal', 'sale', 'discount', 'offer'])) {
        response = "🎉 Check our homepage for current deals!\n• 10% OFF for new customers (₹500+)\n• Free shipping on ₹1000+ orders\n• Weekend discounts up to 25%";
    } else if (includes(lowerMsg, ['product', 'show', 'browse', 'category', 'tshirt', 'shirt', 'pant', 'shoe', 'jacket'])) {
        response = "🛍️ Let me find products for you...";
        searchProducts(lowerMsg);
    } else if (includes(lowerMsg, ['recommend', 'suggest', 'best', 'popular'])) {
        response = "⭐ **Top Sellers:**\n1. Leather Jacket - ₹7999\n2. Running Shoes - ₹4999\n3. Blue Jeans - ₹2499\n\nWould you like details?";
    } else if (includes(lowerMsg, ['size', 'fit', 'measurement'])) {
        response = "📏 **Size Guide:**\nClothing: S, M, L, XL, XXL\nShoes: 6-11\nPants: 30, 32, 34, 36, 38\n\nCheck product details for exact measurements!";
    } else if (includes(lowerMsg, ['wishlist', 'save', 'favorite', 'like'])) {
        response = "❤️ Click the heart icon to save items to your wishlist. View anytime in your Profile!";
    } else if (includes(lowerMsg, ['review', 'rating', 'feedback'])) {
        response = "⭐ Share your experience! Rate products and write reviews to help other shoppers. Your feedback matters!";
    } else if (includes(lowerMsg, ['hello', 'hi', 'thanks', 'bye'])) {
        response = "😊 How can I help you shop better today?";
    } else {
        response = "🤔 I didn't quite catch that. Try:\n• 'Show me t-shirts'\n• 'Any current sales?'\n• 'How does shipping work?'\n• 'Track my order'\n\nOr browse our collections!";
    }
    
    if (response) {
        addMessage(response, "bot");
    }
    
    if (messageCount % 3 === 0) {
        setTimeout(showQuickReplies, 800);
    }
}

function includes(message, keywords) {
    return keywords.some(kw => message.includes(kw.toLowerCase()));
}

function searchProducts(searchTerm) {
    fetch("/get_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: searchTerm })
    })
    .then(res => res.json())
    .then(data => {
        if (data.products && data.products.length > 0) {
            displayProducts(data.products);
        }
    })
    .catch(err => console.error('Error:', err));
}

function addMessage(text, sender, products = null) {
    const chatbox = document.getElementById("chatbox");
    if (!chatbox) return;

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    messageDiv.style.animation = "slideIn 0.3s ease";

    const bubbleDiv = document.createElement("div");
    bubbleDiv.classList.add("bubble");
    
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    
    if (sender === "bot") {
        bubbleDiv.innerHTML = `<strong>🤖</strong> ${formattedText}`;
    } else {
        bubbleDiv.textContent = text;
    }
    
    messageDiv.appendChild(bubbleDiv);
    chatbox.appendChild(messageDiv);
    
    if (products && products.length > 0) {
        displayProducts(products);
    }
    
    chatbox.scrollTop = chatbox.scrollHeight;
    chatHistory.push({ sender, text, time: new Date() });
}

function displayProducts(products) {
    const chatbox = document.getElementById("chatbox");
    const container = document.createElement("div");
    container.classList.add("chatbot-products");
    
    products.slice(0, 3).forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card-chatbot");
        
        const hasSize = ['shirts', 'tshirts', 'pants', 'shoes'].includes(product.category);
        let sizeHTML = '';
        
        if (hasSize) {
            let opts = '<option value="">Size</option>';
            if (['shirts', 'tshirts'].includes(product.category)) {
                opts += '<option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>';
            } else if (product.category === 'pants') {
                opts += '<option value="30">30</option><option value="32">32</option><option value="34">34</option><option value="36">36</option>';
            } else if (product.category === 'shoes') {
                opts += '<option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option>';
            }
            sizeHTML = `<select id="sz-${product.id}" class="size-sel">${opts}</select>`;
        }
        
        card.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" onerror="this.src='/static/images/placeholder.svg'" class="product-img">
            <div class="prod-info">
                <h4>${product.name}</h4>
                <p class="prod-price">₹${parseFloat(product.price).toFixed(2)}</p>
                ${sizeHTML}
                <button class="btn-add-chatbot" onclick="addToCartFromChatbot(${product.id}, '${product.category}')">Add ➕</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    chatbox.appendChild(container);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function addToCartFromChatbot(id, cat) {
    const sizeEl = document.getElementById(`sz-${id}`);
    const needsSize = ['shirts', 'tshirts', 'pants', 'shoes'].includes(cat);
    
    if (needsSize && (!sizeEl || !sizeEl.value)) {
        showNotification("Please select a size!", true);
        return;
    }
    
    addToCart(id, cat, true, sizeEl ? sizeEl.value : null);
    showNotification("✅ Added to cart!", false);
}

function showTypingIndicator() {
    const chatbox = document.getElementById("chatbox");
    const typing = document.createElement("div");
    typing.classList.add("message", "bot-message", "typing");
    typing.id = "typing-ind";
    typing.innerHTML = '<div class="bubble"><span>•</span><span>•</span><span>•</span></div>';
    chatbox.appendChild(typing);
}

function removeTypingIndicator() {
    const el = document.getElementById("typing-ind");
    if (el) el.remove();
}

function showQuickReplies() {
    const chatbox = document.getElementById("chatbox");
    const div = document.createElement("div");
    div.classList.add("quick-replies");
    
    CHATBOT_CONFIG.suggestedTopics.forEach(topic => {
        const btn = document.createElement("button");
        btn.classList.add("quick-btn");
        btn.textContent = topic;
        btn.onclick = () => {
            document.getElementById("userInput").value = topic;
            div.remove();
            sendMessage();
        };
        div.appendChild(btn);
    });
    
    chatbox.appendChild(div);
}