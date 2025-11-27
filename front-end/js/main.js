document.addEventListener('DOMContentLoaded', function() {
    // Khai báo các biến DOM
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const cartBtn = document.getElementById('cart-icon-btn');
    // Chỉ chọn nút close của giỏ hàng và thanh toán, bỏ qua nút close của Auth (vì Auth đã có hàm riêng)
const closeBtns = document.querySelectorAll('#cart-modal .close-btn, #checkout-modal .close-btn');
    const cartCountSpan = document.querySelector('.cart-count');
    const searchInput = document.getElementById('product-search');
    const searchSuggestions = document.getElementById('search-suggestions');
    const navLinks = document.querySelectorAll('.nav-link');

    // Dữ liệu Giỏ hàng
    let cartItems = JSON.parse(localStorage.getItem('meAnVatCart')) || [];

    // --- DỮ LIỆU TỈNH/THÀNH PHỐ ---
    const provinces = [
        { id: 1, name: "Thành phố Hà Nội", districts: [
            { id: 101, name: "Quận Hoàn Kiếm", wards: ["Phường Hàng Buồm", "Phường Đồng Xuân", "Phường Tràng Tiền"] },
            { id: 102, name: "Quận Cầu Giấy", wards: ["Phường Dịch Vọng", "Phường Quan Hoa", "Phường Nghĩa Đô"] },
            { id: 103, name: "Huyện Hoài Đức", wards: ["Xã An Khánh", "Xã La Phù", "Xã Đông La"] }
        ] },
        { id: 2, name: "Thành phố Hồ Chí Minh", districts: [
            { id: 201, name: "Quận 1", wards: ["Phường Bến Nghé", "Phường Bến Thành", "Phường Phạm Ngũ Lão"] },
            { id: 202, name: "Quận 3", wards: ["Phường Võ Thị Sáu", "Phường 9", "Phường 10"] },
            { id: 203, name: "Thành phố Thủ Đức", wards: ["Phường Linh Chiểu", "Phường Hiệp Bình Chánh", "Phường Thảo Điền"] }
        ] },
        { id: 3, name: "Thành phố Đà Nẵng", districts: [
            { id: 301, name: "Quận Hải Châu", wards: ["Phường Hải Châu I", "Phường Hòa Thuận Đông", "Phường Thuận Phước"] },
            { id: 302, name: "Quận Sơn Trà", wards: ["Phường Phước Mỹ", "Phường Thọ Quang", "Phường An Hải Bắc"] }
        ] }
    ];

    // =========================================================
    // --- HIỆU ỨNG SCROLL XUẤT HIỆN DẦN ---
    // =========================================================
    
    // Hàm kiểm tra xem phần tử có trong viewport không
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }

    // Hàm xử lý hiệu ứng scroll
    function handleScrollAnimation() {
        const productItems = document.querySelectorAll('.product-item');
        const categoryTitles = document.querySelectorAll('.category-title');
        
        productItems.forEach(item => {
            if (isInViewport(item) && !item.classList.contains('visible')) {
                item.classList.add('visible');
            }
        });
        
        categoryTitles.forEach(title => {
            if (isInViewport(title) && !title.classList.contains('visible')) {
                title.classList.add('visible');
            }
        });
    }

    // =========================================================
    // --- CHỨC NĂNG CHUYỂN ĐỔI TRANG ---
    // =========================================================
    function switchContent(targetId) {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';

            // Cập nhật active cho menu
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-target') === targetId) {
                    link.classList.add('active');
                }
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Kích hoạt hiệu ứng scroll sau khi chuyển trang
            setTimeout(handleScrollAnimation, 300);
        }
    }

    // =========================================================
    // --- CHỨC NĂNG GIỎ HÀNG ---
    // =========================================================
    function updateCartCount() {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
        localStorage.setItem('meAnVatCart', JSON.stringify(cartItems));
    }

    function addItemToCartWithSpecificQty(id, name, price, image, quantity, category) {
        const existingItem = cartItems.find(item => item.id == id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({
                id: id, name: name, category: category, price: price,
                quantity: quantity, image: image
            });
        }
        updateCartCount();
        alert(`Đã thêm ${quantity} x ${name} vào giỏ hàng MÊ ĂN VẶT!`);
    }

    function renderCartView() {
        const cartView = document.getElementById('cart-view');
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (cartItems.length === 0) {
            cartView.innerHTML = `<div style="text-align: center; padding: 50px; width: 100%;"><h3>Giỏ hàng của MÊ ĂN VẶT đang trống!</h3><p>Hãy chọn sản phẩm yêu thích của bạn nhé.</p></div>`;
            return;
        }

        cartView.innerHTML = `
            <div class="cart-list-container">
                <h2>Giỏ hàng của bạn</h2>
                ${cartItems.map(item => `
                    <div class="cart-product-item" data-id="${item.id}">
                        <i class="remove-item" data-id="${item.id}">&times;</i>
                        <img src="${item.image}" alt="${item.name}">
                        <div class="product-info" style="min-width: 150px;">
                            <strong>${item.name}</strong>
                            <p style="font-size: 0.9em; color: #666;">${item.price.toLocaleString('vi-VN')}₫</p>
                        </div>
                        <div class="quantity-control">
                            <button data-id="${item.id}" data-action="decrease">-</button>
                            <input type="text" value="${item.quantity}" readonly>
                            <button data-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <div class="item-total">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</div>
                    </div>
                `).join('')}
                <button class="continue-shopping" style="margin-top: 20px; background: none; border: none; color: #e67e22; cursor: pointer; font-weight: bold;">TIẾP TỤC MUA SẮM</button>
                <div style="margin-top: 20px;">
                    <label for="order-note">Ghi chú đơn hàng</label>
                    <textarea id="order-note" style="width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 5px;"></textarea>
                </div>
            </div>
            <div class="cart-summary">
                <h3>HẸN GIỜ NHẬN HÀNG</h3>
                <div class="summary-row">Ngày đặt hàng: <input type="date" value="${new Date().toISOString().split('T')[0]}" style="border: 1px solid #ddd;"></div>
                <div class="summary-row">Thời gian nhận hàng:
                    <select style="border: 1px solid #ddd; padding: 5px;">
                        <option>Càng sớm càng tốt</option>
                        <option>10:00 - 12:00</option>
                        <option>14:00 - 16:00</option>
                        <option>16:00 - 18:00</option>
                    </select>
                </div>
                <div class="summary-row">
                    <label style="font-size: 0.9em;"><input type="checkbox"> Xuất hóa đơn công ty 🏢</label>
                </div>
                <hr>
                <div class="summary-row">
                    <strong>Thành tiền</strong>
                    <strong class="total-price">${total.toLocaleString('vi-VN')}₫</strong>
                </div>
                <p style="text-align: right; font-size: 0.8em; color: #666;">(Chưa bao gồm phí vận chuyển)</p>
                <button class="checkout-btn" id="go-to-checkout" style="background-color: #e67e22;">Thanh toán</button>
            </div>
        `;

        // Thêm sự kiện cho các nút trong giỏ hàng
        cartView.querySelectorAll('.quantity-control button').forEach(button => {
            button.addEventListener('click', handleCartUpdate);
        });
        cartView.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', handleCartUpdate);
        });

        document.getElementById('go-to-checkout').addEventListener('click', function() {
            cartModal.style.display = "none";
            renderCheckoutViewStep1(total, cartItems);
            checkoutModal.style.display = "block";
        });

        document.querySelector('.continue-shopping').addEventListener('click', function() {
            cartModal.style.display = "none";
        });
    }

    function handleCartUpdate(e) {
        const itemId = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');

        const itemIndex = cartItems.findIndex(item => item.id == itemId);

        if (itemIndex > -1) {
            if (action === 'increase') {
                cartItems[itemIndex].quantity += 1;
            } else if (action === 'decrease') {
                cartItems[itemIndex].quantity -= 1;
                if (cartItems[itemIndex].quantity <= 0) {
                    cartItems.splice(itemIndex, 1);
                }
            } else if (e.target.classList.contains('remove-item')) {
                cartItems.splice(itemIndex, 1);
            }
            updateCartCount();
            renderCartView();
        }
    }

    // --- Hàm render Order Summary (Chung) ---
    function renderOrderSummary(totalAmount, items) {
        return `
            <div class="order-summary">
                <h3>Đơn hàng của bạn</h3>
                ${items.map(item => `
                    <div class="summary-row" style="font-size: 0.9em; color: #333;">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>${(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                    </div>
                `).join('')}
                <hr style="margin: 15px 0;">
                <div class="apply-discount">
                    <input type="text" placeholder="Mã giảm giá">
                    <button>Áp dụng</button>
                </div>
                <div class="summary-row">
                    <span>Tạm tính</span>
                    <span>${totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div class="summary-row">
                    <span>Phí vận chuyển</span>
                    <span>30.000₫</span>
                </div>
                <div class="checkout-total-row">
                    <strong>TỔNG CỘNG</strong>
                    <strong style="color: #c9302c; font-size: 1.2em;">${(totalAmount + 30000).toLocaleString('vi-VN')}₫</strong>
                </div>
            </div>
        `;
    }

    // --- Hàm render Giao diện Thanh toán - Bước 1 ---
    function renderCheckoutViewStep1(totalAmount, items) {
        const checkoutView = document.getElementById('checkout-view');

        const provinceOptions = provinces.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        checkoutView.innerHTML = `
            <div class="checkout-page-layout">
                <div class="checkout-info">
                    <h2>MÊ ĂN VẶT</h2>
                    <p style="color: #666;"><a href="#" style="color: #e67e22;" id="back-to-cart-link">Giỏ hàng</a> > <strong>Thông tin giao hàng</strong> > Phương thức thanh toán</p>
                    <h3>Thông tin giao hàng</h3>

                    <form id="checkout-form-step1">
                        <div class="input-group"><input type="text" id="customer-name" placeholder="Họ và tên" required></div>
                        <div class="input-group"><input type="tel" id="customer-phone" placeholder="Số điện thoại" required></div>
                        <div class="input-group"><input type="email" id="customer-email" placeholder="Email" required></div>
                        <div class="input-group"><input type="text" id="address-detail" placeholder="Địa chỉ chi tiết (Số nhà, Tên đường)" required></div>

                        <div class="address-group" style="display: flex; gap: 10px;">
                            <div style="flex: 1;"><select id="province-select" required><option value="" disabled selected>Tỉnh / thành</option>${provinceOptions}</select></div>
                            <div style="flex: 1;"><select id="district-select" required disabled><option value="" disabled selected>Quận / huyện</option></select></div>
                            <div style="flex: 1;"><select id="ward-select" required disabled><option value="" disabled selected>Phường / xã</option></select></div>
                        </div>
                        <p><a href="#" id="back-to-cart" style="color: #e67e22; display: block; margin-top: 15px;"><i class="fas fa-chevron-left"></i> Quay lại Giỏ hàng</a></p>
                        <button type="submit" class="checkout-btn" style="background-color: #e67e22;">Tiếp tục đến phương thức thanh toán</button>
                    </form>
                </div>
                ${renderOrderSummary(totalAmount, items)}
            </div>
        `;

        const provinceSelect = document.getElementById('province-select');
        const districtSelect = document.getElementById('district-select');
        const wardSelect = document.getElementById('ward-select');

        // Logic xử lý Tỉnh/Thành -> Quận/Huyện
        provinceSelect.addEventListener('change', () => {
            const provinceId = provinceSelect.value;
            const selectedProvince = provinces.find(p => p.id == provinceId);

            districtSelect.innerHTML = '<option value="" disabled selected>Quận / huyện</option>';
            wardSelect.innerHTML = '<option value="" disabled selected>Phường / xã</option>';
            wardSelect.disabled = true;

            if (selectedProvince) {
                selectedProvince.districts.forEach(d => {
                    districtSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
                });
                districtSelect.disabled = false;
            } else {
                districtSelect.disabled = true;
            }
        });

        // Logic xử lý Quận/Huyện -> Phường/Xã
        districtSelect.addEventListener('change', () => {
            const provinceId = provinceSelect.value;
            const districtId = districtSelect.value;
            const selectedProvince = provinces.find(p => p.id == provinceId);
            const selectedDistrict = selectedProvince ? selectedProvince.districts.find(d => d.id == districtId) : null;

            wardSelect.innerHTML = '<option value="" disabled selected>Phường / xã</option>';

            if (selectedDistrict) {
                selectedDistrict.wards.forEach(w => {
                    wardSelect.innerHTML += `<option value="${w}">${w}</option>`;
                });
                wardSelect.disabled = false;
            } else {
                wardSelect.disabled = true;
            }
        });

        // Lấy dữ liệu form và chuyển sang Bước 2
        document.getElementById('checkout-form-step1').addEventListener('submit', function(e) {
            e.preventDefault();
            const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerEmail = document.getElementById('customer-email').value;
            const addressDetail = document.getElementById('address-detail').value;
            
            // Kiểm tra địa chỉ
            if (!provinceSelect.value || !districtSelect.value || !wardSelect.value) {
                alert('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện và Phường/Xã!');
                return;
            }

            const customerAddress = `${addressDetail}, ${wardSelect.options[wardSelect.selectedIndex].text}, ${districtSelect.options[districtSelect.selectedIndex].text}, ${provinceSelect.options[provinceSelect.selectedIndex].text}`;

            renderCheckoutViewStep2(total, cartItems, { 
                name: customerName, 
                phone: customerPhone, 
                email: customerEmail,
                address: customerAddress 
            });
        });

        document.getElementById('back-to-cart').addEventListener('click', function(e) {
            e.preventDefault();
            checkoutModal.style.display = "none";
            renderCartView();
            cartModal.style.display = "block";
        });
    }

    // --- Hàm render Giao diện Thanh toán - Bước 2 ---
    function renderCheckoutViewStep2(totalAmount, items, customerInfo) {
        const checkoutView = document.getElementById('checkout-view');

        checkoutView.innerHTML = `
            <div class="checkout-page-layout">
                <div class="checkout-info">
                    <h2>MÊ ĂN VẶT</h2>
                    <p style="color: #666;"><a href="#" id="back-to-info" style="color: #e67e22;">Thông tin giao hàng</a> > <strong>Phương thức thanh toán</strong></p>

                    <div class="review-box">
                        <div class="summary-row" style="font-weight: bold;">
                            <span>Địa chỉ giao hàng:</span>
                            <a href="#" id="edit-address" style="color: #e67e22; font-weight: normal;">Chỉnh sửa</a>
                        </div>
                        <p style="margin-top: 5px; font-size: 0.9em;">${customerInfo.address} | ${customerInfo.phone}</p>
                    </div>

                    <h3>Phương thức vận chuyển</h3>
                    <div style="border: 1px solid #e67e22; padding: 15px; border-radius: 4px; margin-bottom: 20px; background-color: #fff3e6;">
                        <label>
                            <input type="radio" name="shipping" value="standard" checked>
                            Giao hàng tiêu chuẩn (Phí: 30.000₫)
                        </label>
                    </div>

                    <h3>Phương thức thanh toán</h3>
                    <div id="payment-methods">
                        <div style="margin-bottom: 10px;">
                            <label><input type="radio" name="payment" value="cod" checked> Thanh toán khi nhận hàng (COD)</label>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label><input type="radio" name="payment" value="bank"> Chuyển khoản ngân hàng</label>
                        </div>
                        <div>
                            <label><input type="radio" name="payment" value="e-wallet"> Ví điện tử (Momo, ZaloPay,...)</label>
                        </div>
                    </div>

                    <button class="checkout-btn" id="confirm-order" style="background-color: #c9302c;">HOÀN TẤT ĐƠN HÀNG</button>
                    <p><a href="#" id="back-to-info-link" style="color: #e67e22; display: block; margin-top: 15px;"><i class="fas fa-chevron-left"></i> Quay lại thông tin giao hàng</a></p>
                </div>
                ${renderOrderSummary(totalAmount, items)}
            </div>
        `;

        // Sửa lỗi: Thêm sự kiện cho nút "Quay lại thông tin giao hàng"
        document.getElementById('back-to-info-link').addEventListener('click', function(e) {
            e.preventDefault();
            renderCheckoutViewStep1(totalAmount, items);
        });

        // Sửa lỗi: Thêm sự kiện cho nút "Chỉnh sửa địa chỉ"
        document.getElementById('edit-address').addEventListener('click', function(e) {
            e.preventDefault();
            renderCheckoutViewStep1(totalAmount, items);
        });

        // Sửa lỗi: Thêm async cho hàm xử lý xác nhận đơn hàng
        document.getElementById('confirm-order').addEventListener('click', async function() {
            const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
            const shippingFee = 30000;

            const orderPayload = {
                customer: customerInfo,
                items: items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
                totalAmount: totalAmount + shippingFee,
                paymentMethod: selectedPayment,
                note: document.getElementById('order-note') ? document.getElementById('order-note').value : ''
            };

            console.log('Đơn hàng:', orderPayload); // Debug

            this.disabled = true;
            this.textContent = 'Đang xử lý đơn hàng...';

            try {
                // Giả lập xử lý đơn hàng
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Tạo mã đơn hàng ngẫu nhiên
                const orderId = 'MV' + Date.now();
                
                alert(`🎉 ĐẶT HÀNG THÀNH CÔNG! Mã đơn hàng của bạn là: ${orderId}. MÊ ĂN VẶT sẽ liên hệ với bạn để xác nhận.`);
                
                // Xóa giỏ hàng
                cartItems = [];
                updateCartCount();
                localStorage.setItem('meAnVatCart', JSON.stringify(cartItems));
                
                // Đóng modal và về trang chủ
                checkoutModal.style.display = "none";
                switchContent('home-section');
                
            } catch (error) {
                console.error('Lỗi đặt hàng:', error);
                this.disabled = false;
                this.textContent = 'HOÀN TẤT ĐƠN HÀNG';
                alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
            }
        });
    }

    // =========================================================
    // --- CHỨC NĂNG XEM CHI TIẾT SẢN PHẨM ---
    // =========================================================
    function showProductDetail(productElement) {
        const id = productElement.getAttribute('data-id');
        const name = productElement.getAttribute('data-name');
        const price = parseInt(productElement.getAttribute('data-price'));
        const category = productElement.getAttribute('data-category');
        const image = productElement.getAttribute('data-image');
        const description = productElement.getAttribute('data-description');

        const detailSection = document.getElementById('product-detail-section');
        
        detailSection.innerHTML = `
            <div class="breadcrumb">
                <a href="#" class="breadcrumb-link" data-target="home-section">Trang chủ</a> / 
                <a href="#" class="breadcrumb-link" data-target="product-section">Sản phẩm</a> / 
                <span class="current-product-name">${name}</span>
            </div>
            
            <div class="detail-wrapper">
                <div class="detail-image-col">
                    <img src="${image}" alt="${name}" class="product-large-image">
                </div>
                
                <div class="detail-info-col">
                    <h1 class="product-detail-title">${name}</h1>
                    <div class="product-rating">
                        <span class="stars">★★★★★</span>
                        <span class="rating-text">(4.8) 128 đánh giá</span>
                    </div>
                    <div class="product-price">${price.toLocaleString('vi-VN')}₫</div>
                    
                    <div class="product-features">
                        <h4>Đặc điểm nổi bật</h4>
                        <ul class="feature-list">
                            <li>Nguyên liệu tươi ngon, an toàn vệ sinh</li>
                            <li>Chế biến theo công thức độc quyền</li>
                            <li>Hương vị thơm ngon, hấp dẫn</li>
                            <li>Phù hợp cho mọi lứa tuổi</li>
                        </ul>
                    </div>
                    
                    <div class="product-description">
                        <p>${description}</p>
                    </div>
                    
                    <div class="product-actions-group">
                        <div class="quantity-control-detail">
                            <button class="qty-btn" id="qty-decrease-detail">-</button>
                            <input type="number" id="detail-qty-input" value="1" min="1" max="99" readonly>
                            <button class="qty-btn" id="qty-increase-detail">+</button>
                        </div>
                        <button class="add-to-cart-main-btn" id="add-to-cart-detail-btn"
                                data-id="${id}" data-name="${name}" data-price="${price}" 
                                data-category="${category}" data-image="${image}">
                            <i class="fas fa-shopping-cart"></i> THÊM VÀO GIỎ HÀNG
                        </button>
                        <button class="favorite-btn" title="Thêm vào yêu thích">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="product-tabs">
                <div class="tab-headers">
                    <button class="tab-header active" data-tab="description">Mô tả sản phẩm</button>
                    <button class="tab-header" data-tab="ingredients">Thành phần</button>
                    <button class="tab-header" data-tab="reviews">Đánh giá</button>
                </div>
                
                <div class="tab-content active" id="description-tab">
                    <div class="product-description">
                        <p>${description}</p>
                        <p>Sản phẩm được chế biến từ những nguyên liệu tươi ngon nhất, đảm bảo an toàn vệ sinh thực phẩm. Mỗi sản phẩm đều được chuẩn bị tỉ mỉ với sự tận tâm của đội ngũ đầu bếp chuyên nghiệp.</p>
                    </div>
                </div>
                
                <div class="tab-content" id="ingredients-tab">
                    <div class="product-ingredients">
                        <h4>Thành phần chính:</h4>
                        <ul class="feature-list">
                            <li>Nguyên liệu cao cấp nhập khẩu</li>
                            <li>Hương liệu tự nhiên</li>
                            <li>Không chất bảo quản</li>
                            <li>Đạt tiêu chuẩn vệ sinh an toàn thực phẩm</li>
                        </ul>
                    </div>
                </div>
                
                <div class="tab-content" id="reviews-tab">
                    <div class="product-reviews">
                        <h4>Đánh giá từ khách hàng</h4>
                        <div class="review-summary">
                            <div class="overall-rating">
                                <span class="rating-score">4.8</span>
                                <span class="stars">★★★★★</span>
                                <span class="total-reviews">(128 đánh giá)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="related-products">
                <h3>Sản phẩm liên quan</h3>
                <div class="related-products-grid" id="related-products-grid">
                    <!-- Các sản phẩm liên quan sẽ được thêm bằng JavaScript -->
                </div>
            </div>
        `;

        // Thêm sự kiện cho nút quantity
        const qtyInput = document.getElementById('detail-qty-input');
        const increaseBtn = document.getElementById('qty-increase-detail');
        const decreaseBtn = document.getElementById('qty-decrease-detail');

        increaseBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value);
            if (currentQty < 99) {
                qtyInput.value = currentQty + 1;
            }
        });

        decreaseBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value);
            if (currentQty > 1) {
                qtyInput.value = currentQty - 1;
            }
        });

        // Thêm sự kiện cho nút thêm vào giỏ hàng
        document.getElementById('add-to-cart-detail-btn').addEventListener('click', function() {
            const quantity = parseInt(qtyInput.value);
            addItemToCartWithSpecificQty(id, name, price, image, quantity, category);
            
            // Hiệu ứng thêm vào giỏ
            this.innerHTML = '<i class="fas fa-check"></i> ĐÃ THÊM VÀO GIỎ';
            this.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-shopping-cart"></i> THÊM VÀO GIỎ HÀNG';
                this.style.background = 'linear-gradient(135deg, #e67e22, #d35400)';
            }, 2000);
        });

        // Thêm sự kiện cho breadcrumb
        document.querySelectorAll('.breadcrumb-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('data-target');
                switchContent(target);
            });
        });

        // Thêm sự kiện cho tabs
        setupProductTabs();

        // Hiển thị sản phẩm liên quan
        showRelatedProducts(category, id);

        // Hiển thị trang chi tiết
        switchContent('product-detail-section');
    }

    // --- XỬ LÝ TABS SẢN PHẨM ---
    function setupProductTabs() {
        const tabHeaders = document.querySelectorAll('.tab-header');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const tabId = header.getAttribute('data-tab');
                
                // Xóa active class từ tất cả tabs
                tabHeaders.forEach(h => h.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Thêm active class cho tab được chọn
                header.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }

    // --- HIỂN THỊ SẢN PHẨM LIÊN QUAN CÙNG DANH MỤC ---
    function showRelatedProducts(category, currentProductId) {
        const relatedGrid = document.getElementById('related-products-grid');
        
        // Lấy tất cả sản phẩm cùng danh mục (trừ sản phẩm hiện tại)
        const allProducts = document.querySelectorAll('.product-item');
        const relatedProducts = [];
        
        allProducts.forEach(product => {
            const productCategory = product.getAttribute('data-category');
            const productId = product.getAttribute('data-id');
            
            if (productCategory === category && productId !== currentProductId) {
                relatedProducts.push({
                    id: productId,
                    name: product.getAttribute('data-name'),
                    price: parseInt(product.getAttribute('data-price')),
                    image: product.getAttribute('data-image'),
                    category: productCategory,
                    description: product.getAttribute('data-description'),
                    element: product
                });
            }
        });
        
        // Hiển thị tối đa 4 sản phẩm liên quan
        const displayProducts = relatedProducts.slice(0, 4);
        
        if (displayProducts.length === 0) {
            relatedGrid.innerHTML = `
                <div class="no-related-products">
                    <p>Hiện chưa có sản phẩm nào cùng danh mục</p>
                </div>
            `;
            return;
        }
        
        relatedGrid.innerHTML = displayProducts.map(product => `
            <div class="related-product-item" data-id="${product.id}" 
                 data-name="${product.name}" data-price="${product.price}" 
                 data-category="${product.category}" data-image="${product.image}" 
                 data-description="${product.description}">
                <img src="${product.image}" alt="${product.name}" class="related-product-image">
                <div class="related-product-info">
                    <h4>${product.name}</h4>
                    <p class="related-product-price">${product.price.toLocaleString('vi-VN')}₫</p>
                    <button class="add-to-cart-btn related-add-to-cart" data-id="${product.id}">Thêm vào giỏ</button>
                </div>
            </div>
        `).join('');
        
        // Thêm sự kiện click cho sản phẩm liên quan
        relatedGrid.querySelectorAll('.related-product-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (!e.target.classList.contains('related-add-to-cart')) {
                    showProductDetail(this);
                }
            });
        });
        
        // Thêm sự kiện cho nút thêm vào giỏ hàng trong sản phẩm liên quan
        relatedGrid.querySelectorAll('.related-add-to-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const productItem = this.closest('.related-product-item');
                const id = productItem.getAttribute('data-id');
                const name = productItem.getAttribute('data-name');
                const price = parseInt(productItem.getAttribute('data-price'));
                const category = productItem.getAttribute('data-category');
                const image = productItem.getAttribute('data-image');
                
                addItemToCartWithSpecificQty(id, name, price, image, 1, category);
            });
        });
    }

    // --- Xử lý menu dropdown sản phẩm ---
    function setupProductDropdown() {
        const subnavLinks = document.querySelectorAll('.subnav-link');
        
        subnavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                
                // Chuyển đến trang sản phẩm
                switchContent('product-section');
                
                // Cuộn đến danh mục tương ứng sau một chút delay
                setTimeout(() => {
                    scrollToCategory(category);
                }, 100);
            });
        });
    }

    // Hàm cuộn đến danh mục cụ thể
    function scrollToCategory(category) {
        const categoryMap = {
            'trasua': 'category-trasua',
            'cafe': 'category-cafe',
            'anvat': 'category-anvat',
            'banhngot': 'category-banhngot',
            'dacbiet': 'category-dacbiet'
        };
        
        const targetId = categoryMap[category];
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Thêm hiệu ứng highlight
                targetElement.style.backgroundColor = '#fff9f2';
                targetElement.style.transition = 'background-color 0.5s ease';
                
                setTimeout(() => {
                    targetElement.style.backgroundColor = 'transparent';
                }, 2000);
            }
        }
    }

    // =========================================================
    // --- XỬ LÝ SỰ KIỆN KHI TRANG TẢI ---
    // =========================================================

    // Xử lý các sự kiện click trên giao diện
    function setupEventListeners() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                switchContent(targetId);
            });
        });

        // XỬ LÝ SỰ KIỆN CLICK SẢN PHẨM/THÊM VÀO GIỎ
        document.querySelector('.content-container').addEventListener('click', function(e) {
            const productItem = e.target.closest('.product-item');
            
            if (productItem) {
                // Nếu click vào nút "Thêm vào giỏ"
                if (e.target.classList.contains('add-to-cart-btn')) {
                    const id = productItem.getAttribute('data-id');
                    const name = productItem.getAttribute('data-name');
                    const price = parseInt(productItem.getAttribute('data-price'));
                    const category = productItem.getAttribute('data-category');
                    const image = productItem.getAttribute('data-image');
                    
                    addItemToCartWithSpecificQty(id, name, price, image, 1, category);
                } 
                // Nếu click vào bất kỳ đâu khác trên sản phẩm (hiển thị chi tiết)
                else {
                    showProductDetail(productItem);
                }
            }
        });
        
        document.querySelector('.logo').addEventListener('click', function(e) {
            e.preventDefault();
            switchContent('home-section');
        });

        // Xử lý thanh tìm kiếm
        searchInput.addEventListener('keyup', function() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            searchSuggestions.innerHTML = '';

            if (searchTerm.length > 1) {
                // Lấy tất cả sản phẩm từ HTML
                const allProductElements = document.querySelectorAll('.product-item');
                const matchedProducts = [];

                allProductElements.forEach(element => {
                    const productName = element.getAttribute('data-name').toLowerCase();
                    if (productName.includes(searchTerm)) {
                        matchedProducts.push({
                            name: element.getAttribute('data-name'),
                            price: parseInt(element.getAttribute('data-price')),
                            image: element.getAttribute('data-image'),
                            element: element
                        });
                    }
                });

                if (matchedProducts.length > 0) {
                    searchSuggestions.style.display = 'block';
                    matchedProducts.slice(0, 5).forEach(product => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.classList.add('suggestion-item');

                        suggestionItem.innerHTML = `
                            <div style="display:flex; align-items:center;">
                                <img src="${product.image}" style="width:30px; height:30px; object-fit:cover; margin-right:10px;">
                                <span>${product.name}</span>
                            </div>
                            <strong>${product.price.toLocaleString('vi-VN')}₫</strong>
                        `;

                        suggestionItem.addEventListener('click', () => {
                            // Hiển thị trang chi tiết sản phẩm
                            showProductDetail(product.element);
                            searchSuggestions.style.display = 'none';
                            searchInput.value = '';
                        });

                        searchSuggestions.appendChild(suggestionItem);
                    });
                } else {
                    searchSuggestions.style.display = 'none';
                }
            } else {
                searchSuggestions.style.display = 'none';
            }
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-bar')) {
                searchSuggestions.style.display = 'none';
            }
        });

        // Thêm xử lý menu dropdown
        setupProductDropdown();
        // Xử lý sự kiện nút Đăng nhập / Đăng ký
        const loginBtn = document.getElementById('btn-login');
        const registerBtn = document.getElementById('btn-register');

        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                // Sau này bạn có thể thay bằng code mở Modal Đăng nhập
                alert('Chức năng Đăng nhập đang được phát triển! 🔐');
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', function() {
                // Sau này bạn có thể thay bằng code mở Modal Đăng ký
                alert('Chức năng Đăng ký đang được phát triển! 📝');
            });
        }
    }

    // --- Xử lý Giỏ hàng và Modal ---
    cartBtn.onclick = function() {
        renderCartView();
        cartModal.style.display = "block";
    }

    closeBtns.forEach(btn => {
        btn.onclick = function() {
            cartModal.style.display = "none";
            checkoutModal.style.display = "none";
        }
    });

    window.onclick = function(event) {
        if (event.target == cartModal) {
            cartModal.style.display = "none";
        }
        if (event.target == checkoutModal) {
            checkoutModal.style.display = "none";
        }
    }

    // --- HÀM KHỞI TẠO CHÍNH (INIT) ---
    function init() {
        console.log('Khởi tạo ứng dụng MÊ ĂN VẶT...');
        setupEventListeners();
        switchContent('home-section');
        updateCartCount();
        
        // Thêm sự kiện scroll
        window.addEventListener('scroll', handleScrollAnimation);
        
        // Kích hoạt lần đầu khi trang tải
        setTimeout(handleScrollAnimation, 100);
        
        console.log('Khởi tạo hoàn tất.');

        // =========================================================
// --- CHỨC NĂNG ĐĂNG NHẬP / ĐĂNG KÝ (MÔ PHỎNG) ---
// =========================================================

// 1. Khai báo biến
const authModal = document.getElementById('auth-modal');
const guestView = document.getElementById('guest-view');
const loggedView = document.getElementById('logged-view');
const userGreeting = document.getElementById('user-greeting');

// 2. Hàm mở Modal
window.openAuthModal = function(tab) {
    authModal.style.display = 'block';
    switchAuthTab(tab); // Chuyển đúng tab Login hoặc Register
}

// 3. Hàm đóng Modal
window.closeAuthModal = function() {
    authModal.style.display = 'none';
    // Reset form khi đóng
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
}

// 4. Hàm chuyển Tab (Login <-> Register)
window.switchAuthTab = function(tabName) {
    // Active nút tab
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');

    // Active form tương ứng
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(tabName + '-form').classList.add('active');
}

// 5. Xử lý ĐĂNG KÝ
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('reg-fullname').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirm-pass').value;

    // Validate cơ bản
    if(password !== confirmPass) {
        alert('Mật khẩu nhập lại không khớp! ❌');
        return;
    }

    // Lấy danh sách user từ LocalStorage (giả lập Database)
    let users = JSON.parse(localStorage.getItem('meAnVatUsers')) || [];

    // Kiểm tra trùng username
    if(users.some(u => u.username === username)) {
        alert('Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác. ⚠️');
        return;
    }

    // Lưu user mới
    const newUser = { fullname, username, password };
    users.push(newUser);
    localStorage.setItem('meAnVatUsers', JSON.stringify(users));

    alert('Đăng ký thành công! Hãy đăng nhập ngay. 🎉');
    switchAuthTab('login'); // Chuyển sang tab đăng nhập
});

// 6. Xử lý ĐĂNG NHẬP
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Lấy dữ liệu user
    let users = JSON.parse(localStorage.getItem('meAnVatUsers')) || [];

    // Tìm user khớp username và password
    const user = users.find(u => u.username === username && u.password === password);

    if(user) {
        // Lưu trạng thái "Đang đăng nhập"
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert(`Chào mừng trở lại, ${user.fullname}! 🥳`);
        closeAuthModal();
        checkLoginStatus(); // Cập nhật giao diện header
    } else {
        alert('Sai tên đăng nhập hoặc mật khẩu! ❌');
    }
});

// 7. Xử lý ĐĂNG XUẤT
window.logout = function() {
    if(confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        checkLoginStatus();
        alert('Đã đăng xuất thành công! 👋');
    }
}

// 8. Kiểm tra trạng thái đăng nhập (Chạy mỗi khi tải trang)
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        guestView.style.display = 'none';
        loggedView.style.display = 'flex';
        userGreeting.textContent = `Xin chào, ${currentUser.fullname}`;
    } else {
        guestView.style.display = 'block';
        loggedView.style.display = 'none';
    }
}

// Đóng modal khi click ra ngoài
window.addEventListener('click', function(event) {
    if (event.target == authModal) {
        closeAuthModal();
    }
});

// Gọi hàm kiểm tra khi trang vừa load
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});
    }

    // Bắt đầu ứng dụng
    init();
});