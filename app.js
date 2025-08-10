document.addEventListener('DOMContentLoaded', init);

/* ===== JSONBin config ===== */
const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';
const BIN_ID  = '6858f4388960c979a5af8c9d';           // <-- ה-BIN שלך
const API_KEY = '$2a$10$MDoSgvY1Gkdh/YJgjWps5.KuWTLDqvMvzd4u00dhtZE/fRNwKEfUW';

function init() {
  loadCategoriesBar();
  bindSearch();
  updateCartCount(readCart().reduce((s,i)=> s+(i.quantity||1), 0));
  bindCartNav();
  bindAuthNav();
  renderAuthUI();
  initOrders();
  loadHomeRows();
}

/* ===== קטגוריות ===== */
function loadCategoriesBar() {
  const barInner = document.getElementById('categories-bar-inner');
  if (!barInner) return;

  fetch('https://dummyjson.com/products/category-list')
    .then(res => res.json())
    .then(categories => {
      barInner.textContent = '';
      categories.forEach(slug => {
        const label = humanize(slug);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-item';
        btn.dataset.category = slug;
        btn.textContent = label;
        btn.addEventListener('click', () => showCategory(slug));
        barInner.appendChild(btn);
      });
    })
    .catch(() => {
      barInner.textContent = 'שגיאה בטעינת קטגוריות';
      barInner.style.color = '#b91c1c';
    });
}

function humanize(s){
  return String(s).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ===== ניווט דפים ===== */
function showPage(id){
  document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

/* ===== חיפוש ===== */
function bindSearch(){
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    showSearchResults(q);
  });
}

function showSearchResults(q){
  const section = document.getElementById('category');
  if (!section) return;

  showPage('category');
  section.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'category-header';

  const backBtn = document.createElement('button');
  backBtn.id = 'btn-back-home';
  backBtn.className = 'btn-back';
  backBtn.type = 'button';
  backBtn.textContent = '⬅ חזרה לדף הבית';
  backBtn.addEventListener('click', () => showPage('home'));

  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = `תוצאות עבור: ${q}`;

  header.appendChild(backBtn);
  header.appendChild(title);
  section.appendChild(header);

  const content = document.createElement('div');
  content.id = 'category-content';
  content.className = 'category-content';
  content.textContent = 'טוען תוצאות…';
  section.appendChild(content);

  fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(q)}`)
    .then(res => { if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); })
    .then(data => {
      const products = data.products || [];
      content.innerHTML = '';
      if (!products.length){
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = 'לא נמצאו תוצאות.';
        content.appendChild(p);
        return;
      }
      const grid = document.createElement('div');
      grid.className = 'products-grid';
      products.forEach(prod => grid.appendChild(buildProductCard(prod)));
      content.appendChild(grid);
    })
    .catch(() => {
      content.innerHTML = '';
      const p = document.createElement('p');
      p.style.color = '#b91c1c';
      p.textContent = 'שגיאה בטעינת תוצאות';
      content.appendChild(p);
    });
}

/* ===== קטגוריה ===== */
function showCategory(slug){
  const section = document.getElementById('category');
  if (!section) return;

  showPage('category');
  section.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'category-header';

  const backBtn = document.createElement('button');
  backBtn.id = 'btn-back-home';
  backBtn.className = 'btn-back';
  backBtn.type = 'button';
  backBtn.textContent = '⬅ חזרה לדף הבית';
  backBtn.addEventListener('click', () => showPage('home'));

  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = humanize(slug);

  header.appendChild(backBtn);
  header.appendChild(title);
  section.appendChild(header);

  const content = document.createElement('div');
  content.id = 'category-content';
  content.className = 'category-content';
  section.appendChild(content);

  fetch(`https://dummyjson.com/products/category/${slug}`)
    .then(res => { if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); })
    .then(data => {
      const products = data.products || [];
      content.innerHTML = '';
      if (!products.length){
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = 'לא נמצאו מוצרים.';
        content.appendChild(p);
        return;
      }
      const grid = document.createElement('div');
      grid.className = 'products-grid';
      products.forEach(prod => grid.appendChild(buildProductCard(prod)));
      content.appendChild(grid);
    })
    .catch(() => {
      content.innerHTML = '';
      const errP = document.createElement('p');
      errP.style.color = '#b91c1c';
      errP.textContent = 'שגיאה בטעינת המוצרים';
      content.appendChild(errP);
    });
}

/* ===== כרטיס מוצר כללי ===== */
function buildProductCard(p) {
  const card  = document.createElement('div');
  card.className = 'product-card';

  const thumb = document.createElement('div');
  thumb.className = 'product-thumb';
  const img   = document.createElement('img');
  img.src = p.thumbnail;
  img.alt = p.title;
  thumb.appendChild(img);

  const body  = document.createElement('div');
  body.className = 'product-body';

  const t = document.createElement('div');
  t.className = 'product-title';
  t.textContent = p.title;

  const price = document.createElement('div');
  price.className = 'product-price';
  price.textContent = `${p.price} ₪`;

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn-add-to-cart';
  addBtn.textContent = 'הוסף לסל';
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();      // שלא יפתח דף מוצר
    addToCart(p, 1);
  });

  body.appendChild(t);
  body.appendChild(price);
  body.appendChild(addBtn);

  card.appendChild(thumb);
  card.appendChild(body);

  card.addEventListener('click', () => showProductDetails(p.id));
  return card;
}

/* ===== עמוד מוצר ===== */
function showProductDetails(productId) {
  const section = document.getElementById('product-details');
  if (!section) return;

  showPage('product-details');
  section.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'category-header';

  const backBtn = document.createElement('button');
  backBtn.className = 'btn-back';
  backBtn.type = 'button';
  backBtn.textContent = '⬅ חזרה לקטגוריה';
  backBtn.addEventListener('click', () => showPage('category'));

  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = 'טוען מוצר…';

  header.appendChild(backBtn);
  header.appendChild(title);
  section.appendChild(header);

  const content = document.createElement('div');
  content.className = 'product-hero';
  section.appendChild(content);

  fetch(`https://dummyjson.com/products/${encodeURIComponent(productId)}`)
    .then(r => { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(product => {
      title.textContent = product.title;

      const info = document.createElement('div');
      info.className = 'product-info';

      const t = document.createElement('div');
      t.className = 'product-title';
      t.textContent = product.title;

      const price = document.createElement('div');
      price.className = 'product-price';
      price.textContent = `${product.price} ₪`;

      const ratingRow = document.createElement('div');
      ratingRow.className = 'rating-row';
      const starsEl = document.createElement('span');
      starsEl.className = 'stars';
      starsEl.textContent = renderStars(product.rating);
      const ratingNum = document.createElement('span');
      ratingNum.className = 'rating-num';
      ratingNum.textContent = `(${Number(product.rating ?? 0).toFixed(1)})`;
      ratingRow.appendChild(starsEl);
      ratingRow.appendChild(ratingNum);

      const desc = document.createElement('p');
      desc.textContent = product.description || '—';

      const qtyRow = document.createElement('div');
      qtyRow.style.display = 'flex';
      qtyRow.style.alignItems = 'center';
      qtyRow.style.gap = '8px';
      const qtyLabel = document.createElement('label');
      qtyLabel.textContent = 'כמות:';
      const qtyInput = document.createElement('input');
      qtyInput.type = 'number'; qtyInput.min = '1'; qtyInput.value = '1'; qtyInput.style.width = '80px';
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-to-cart'; addBtn.type = 'button'; addBtn.textContent = 'הוסף לסל';
      addBtn.addEventListener('click', () => addToCart(product, Number(qtyInput.value)||1));
      qtyRow.appendChild(qtyLabel); qtyRow.appendChild(qtyInput); qtyRow.appendChild(addBtn);

      const small = document.createElement('div');
      small.className = 'kv';
      if (product.brand){ const d = document.createElement('div'); d.className='muted'; d.textContent = `מותג: ${product.brand}`; small.appendChild(d); }
      if (product.stock != null){ const d = document.createElement('div'); d.className='muted'; d.textContent = `מלאי: ${product.stock}`; small.appendChild(d); }

      info.appendChild(t);
      info.appendChild(price);
      info.appendChild(ratingRow);
      info.appendChild(desc);
      info.appendChild(qtyRow);
      info.appendChild(small);

      const gallery = document.createElement('div');
      gallery.className = 'gallery';
      const main = document.createElement('div');
      main.className = 'gallery-main';
      const mainImg = document.createElement('img');
      mainImg.src = product.images?.[0] || product.thumbnail;
      mainImg.alt = product.title;
      main.appendChild(mainImg);

      const thumbs = document.createElement('div');
      thumbs.className = 'gallery-thumbs';
      (product.images?.length ? product.images : [product.thumbnail]).forEach(src => {
        const ti = document.createElement('img');
        ti.src = src; ti.alt = product.title;
        ti.addEventListener('click', () => { mainImg.src = src; });
        thumbs.appendChild(ti);
      });

      gallery.appendChild(main);
      gallery.appendChild(thumbs);

      const reviewsWrap = document.createElement('div');
      reviewsWrap.className = 'reviews';
      const h3 = document.createElement('h3'); h3.textContent = 'ביקורות';
      reviewsWrap.appendChild(h3);
      const reviews = Array.isArray(product.reviews) ? product.reviews : [];
      if (!reviews.length){
        const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'אין ביקורות להצגה.'; reviewsWrap.appendChild(p);
      } else {
        reviews.forEach(r => {
          const item = document.createElement('div'); item.className = 'review-item';
          const who = document.createElement('div'); who.className = 'review-author'; who.textContent = r.reviewerName || 'לקוח/ה';
          const txt = document.createElement('div'); txt.textContent = r.comment || '';
          const rate = document.createElement('div'); rate.className='muted'; rate.textContent = `דירוג: ${r.rating ?? '-'}`;
          item.appendChild(who); item.appendChild(txt); item.appendChild(rate);
          reviewsWrap.appendChild(item);
        });
      }

      content.appendChild(info);
      content.appendChild(gallery);
      section.appendChild(reviewsWrap);
    })
    .catch(err => {
      console.error(err);
      content.innerHTML = '';
      const p = document.createElement('p');
      p.style.color = '#b91c1c';
      p.textContent = 'שגיאה בטעינת פרטי המוצר';
      content.appendChild(p);
    });
}

/* דירוג לכוכבים */
function renderStars(r){
  const n = Math.max(0, Math.min(5, Math.round(Number(r) || 0)));
  return '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);
}

/* ===== Cart (localStorage) ===== */
function readCart(){
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch { return []; }
}
function writeCart(items){
  localStorage.setItem('cart', JSON.stringify(items));
  updateCartCount(items.reduce((sum,i)=> sum + (i.quantity||1), 0));
}
function updateCartCount(n){
  const el = document.getElementById('cart-count');
  if (el) el.textContent = n;
}
function addToCart(product, qty=1){
  const q = Math.max(1, Number(qty)||1);
  const cart = readCart();
  const idx = cart.findIndex(x => x.id === product.id);
  if (idx >= 0){
    cart[idx].quantity = (cart[idx].quantity||1) + q;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: Number(product.price)||0,
      thumbnail: product.thumbnail || product.images?.[0] || '',
      quantity: q
    });
  }
  writeCart(cart);
  syncCartToUser().catch(console.error);
}
function removeFromCart(id){
  const cart = readCart().filter(x => x.id !== id);
  writeCart(cart);
}
function setCartQuantity(id, qty){
  const q = Math.max(0, Number(qty)||0);
  const cart = readCart();
  const item = cart.find(x => x.id === id);
  if (!item) return;
  if (q <= 0){
    removeFromCart(id);
  } else {
    item.quantity = q;
    writeCart(cart);
  }
}
function cartTotal(){
  return readCart().reduce((sum,i)=> sum + (Number(i.price)||0) * (i.quantity||1), 0);
}

function bindCartNav(){
  const btn = document.getElementById('nav-cart');
  if (!btn) return;
  btn.addEventListener('click', () => {
    renderCart();
    showPage('cart');
  });
}

function renderCart(){
  const section = document.getElementById('cart');
  if (!section) return;

  section.innerHTML = '';

  const title = document.createElement('h2');
  title.textContent = 'סל הקניות';
  section.appendChild(title);

  const cart = readCart();
  if (!cart.length){
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'הסל ריק כרגע.';
    section.appendChild(p);
    return;
  }

  const list = document.createElement('div');
  list.className = 'cart-list';

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';

    const img = document.createElement('img');
    img.src = item.thumbnail || '';
    img.alt = item.title || '';
    img.className = 'cart-thumb';

    const name = document.createElement('div');
    name.className = 'cart-title';
    name.textContent = item.title;

    const unit = document.createElement('div');
    unit.className = 'cart-unit';
    unit.textContent = `${item.price} ₪`;

    const qtyWrap = document.createElement('div');
    qtyWrap.className = 'cart-qty';
    const qty = document.createElement('input');
    qty.type = 'number'; qty.min = '1'; qty.value = item.quantity||1;
    qty.addEventListener('change', () => {
      setCartQuantity(item.id, Number(qty.value)||1);
      renderCart();
    });
    qtyWrap.appendChild(qty);

    const line = document.createElement('div');
    line.className = 'cart-line-total';
    line.textContent = `${(item.price * (item.quantity||1)).toFixed(2)} ₪`;

    const del = document.createElement('button');
    del.className = 'cart-remove';
    del.type = 'button';
    del.textContent = 'מחיקה';
    del.addEventListener('click', () => {
      removeFromCart(item.id);
      renderCart();
    });

    row.appendChild(img);
    row.appendChild(name);
    row.appendChild(unit);
    row.appendChild(qtyWrap);
    row.appendChild(line);
    row.appendChild(del);
    list.appendChild(row);
  });

  section.appendChild(list);

  const summary = document.createElement('div');
  summary.className = 'cart-summary';

  const total = document.createElement('div');
  total.className = 'cart-total';
  total.textContent = `סה״כ: ${cartTotal().toFixed(2)} ₪`;

  const checkout = document.createElement('button');
  checkout.className = 'btn primary';
  checkout.textContent = 'לתשלום';
  checkout.addEventListener('click', openCheckout);

  summary.appendChild(total);
  summary.appendChild(checkout);
  section.appendChild(summary);
}

/* ===== JSONBin: users ===== */
async function retrieveUsers() {
  const res = await fetch(`${JSONBIN_BASE}/${BIN_ID}`, {
    method: 'GET',
    headers: { 'X-Master-Key': API_KEY }
  });
  if (!res.ok) throw new Error('Failed to retrieve users');
  const data = await res.json();
  return data.record && Array.isArray(data.record.users) ? data.record : { users: [] };
}

async function saveUsers(doc) {
  const res = await fetch(`${JSONBIN_BASE}/${BIN_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body: JSON.stringify(doc)
  });
  if (!res.ok) throw new Error('Failed to save users');
  return res.json();
}

/* ===== Session ===== */
function saveSession(sess){ localStorage.setItem('session', JSON.stringify(sess)); }
function getSession(){ try { return JSON.parse(localStorage.getItem('session') || 'null'); } catch { return null; } }
function clearSession(){ localStorage.removeItem('session'); }
function renderAuthUI(){
  const sess = getSession();
  const loginNavBtn = document.getElementById('nav-login');
  if (!loginNavBtn) return;
  loginNavBtn.textContent = sess ? `שלום, ${sess.name} (יציאה)` : 'התחברות';
}

/* ===== Auth ===== */
async function registerUser({ name, email, password }) {
  const doc = await retrieveUsers();
  const exists = doc.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error('המשתמש כבר קיים');

  const user = { id: 'u_' + Date.now(), name, email, password, cart: [], orders: [] };
  doc.users.push(user);
  await saveUsers(doc);

  saveSession({ id: user.id, name: user.name, email: user.email });
  renderAuthUI();
  return user;
}

async function loginUser({ email, password }) {
  const doc = await retrieveUsers();
  const user = doc.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) throw new Error('אימייל או סיסמה שגויים');

  // מיזוג סל מקומי
  const local = readCart();
  if (local.length){
    local.forEach(it => {
      const idx = user.cart.findIndex(x => x.id === it.id);
      if (idx >= 0) user.cart[idx].quantity += (it.quantity || 1);
      else user.cart.push({ ...it });
    });
    await saveUsers(doc);
  }

  writeCart(user.cart);
  saveSession({ id: user.id, name: user.name, email: user.email });
  renderAuthUI();
  return user;
}

async function syncCartToUser(){
  const sess = getSession();
  if (!sess) return;
  const doc = await retrieveUsers();
  const user = doc.users.find(u => u.id === sess.id);
  if (!user) return;
  user.cart = readCart();
  await saveUsers(doc);
}

/* ===== Auth UI ===== */
function showAuthTab(which){
  const tabLogin = document.getElementById('tab-login');
  const tabReg   = document.getElementById('tab-register');
  const fLogin   = document.getElementById('form-login');
  const fReg     = document.getElementById('form-register');

  if (which === 'register'){
    tabReg.classList.add('active');   tabLogin.classList.remove('active');
    fReg.style.display   = 'grid';    fLogin.style.display = 'none';
  } else {
    tabLogin.classList.add('active'); tabReg.classList.remove('active');
    fLogin.style.display = 'grid';    fReg.style.display   = 'none';
  }
}

let _authFormsBound = false;
function bindAuthFormsOnce(){
  if (_authFormsBound) return;
  _authFormsBound = true;

  const tabLogin = document.getElementById('tab-login');
  const tabReg   = document.getElementById('tab-register');
  const fLogin   = document.getElementById('form-login');
  const fReg     = document.getElementById('form-register');

  tabLogin?.addEventListener('click', (e) => { e.preventDefault(); showAuthTab('login'); });
  tabReg?.addEventListener('click',   (e) => { e.preventDefault(); showAuthTab('register'); });

  showAuthTab('login');

  fLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('login-msg'); msg.textContent = '';
    try { await loginUser({ email, password }); showPage('home'); }
    catch (err){ msg.textContent = err.message || 'שגיאה בהתחברות'; }
  });

  fReg?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('reg-msg'); msg.textContent = '';
    try { await registerUser({ name, email, password }); showPage('home'); }
    catch (err){ msg.textContent = err.message || 'שגיאה בהרשמה'; }
  });
}

function bindAuthNav(){
  const btn = document.getElementById('nav-login');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const sess = getSession();
    if (sess) {
      if (confirm('להתנתק מהחשבון?')) {
        try {
          // שמירת סל נוכחי למשתמש ב-JSONBin
          await syncCartToUser();
  
          // ריקון הסל המקומי
          writeCart([]);
  
          // מחיקת session
          clearSession();
          renderAuthUI();
        } catch (err) {
          console.error("שגיאה בשמירת סל לפני התנתקות:", err);
        }
      }
      return;
    }
    showPage('login');
    bindAuthFormsOnce();
  });  
}


/* ===== Checkout ===== */
function openCheckout(){
  const sess = getSession();
  if (!sess){
    alert('כדי לשלם צריך להתחבר 🙂');
    showPage('login');
    return;
  }
  const items = readCart();
  if (!items.length){
    alert('הסל ריק.');
    return;
  }

  const modal = document.getElementById('checkout-modal');
  const form  = document.getElementById('checkout-form');
  const cancel= document.getElementById('co-cancel');
  const sumEl = document.getElementById('co-summary-text');

  sumEl.textContent = `סה״כ: ${cartTotal().toFixed(2)} ₪`;

  document.getElementById('co-name').value  = sess.name || '';
  document.getElementById('co-email').value = sess.email || '';

  modal.classList.add('show');

  cancel.onclick = closeCheckout;

  form.onsubmit = async (e) => {
    e.preventDefault();
    try{
      await placeOrder();
      closeCheckout();
      renderCart();
      alert('ההזמנה נקלטה! תודה 🌟');
    }catch(err){
      console.error(err);
      alert('שגיאה בביצוע ההזמנה.');
    }
  };
}

function closeCheckout(){
  const modal = document.getElementById('checkout-modal');
  const form  = document.getElementById('checkout-form');
  modal.classList.remove('show');
  form.reset();
}

async function placeOrder(){
  const sess = getSession();
  if (!sess) throw new Error('no session');

  const name  = document.getElementById('co-name').value.trim();
  const email = document.getElementById('co-email').value.trim();
  const address = document.getElementById('co-address').value.trim();
  const city    = document.getElementById('co-city').value.trim();
  const zip     = document.getElementById('co-zip').value.trim();
  const card    = document.getElementById('co-card').value.replace(/\s+/g,'');
  const exp     = document.getElementById('co-exp').value.trim();
  const cvv     = document.getElementById('co-cvv').value.trim();

  if (!name || !email || !address || !city || !zip || card.length < 8 || cvv.length < 3) {
    throw new Error('validation error');
  }

  const items = readCart();
  const total = cartTotal();

  const order = {
    id: 'o_' + Date.now(),
    date: new Date().toISOString(),
    items,
    total: Number(total.toFixed(2)),
    shipping: { name, email, address, city, zip },
    paymentLast4: String(card).slice(-4)
  };

  const doc = await retrieveUsers();
  const user = doc.users.find(u => u.id === sess.id);
  if (!user) throw new Error('user not found');

  user.orders = user.orders || [];
  user.orders.push(order);
  user.cart = [];

  await saveUsers(doc);
  writeCart([]);
}


function initOrders() {
    const btnOrders = document.getElementById('nav-orders');
    btnOrders.onclick = () => {
      const sess = getSession();
      if (!sess) {
        alert('אנא התחבר כדי לראות את ההזמנות שלך');
        showPage('login');
        return;
      }
      renderOrders(sess.id);
      showPage('orders');
    };
  }
  
  async function renderOrders(userId) {
    const doc = await retrieveUsers();
    const user = doc.users.find(u => u.id === userId);
    const listEl = document.getElementById('orders-list');
  
    if (!user || !user.orders || user.orders.length === 0) {
      listEl.innerHTML = `<p>אין הזמנות קודמות.</p>`;
      return;
    }
  
    let html = '';
    user.orders.forEach(order => {
      html += `
        <div class="order-card">
          <h3>הזמנה #${order.id}</h3>
          <p><strong>תאריך:</strong> ${new Date(order.date).toLocaleDateString('he-IL')}</p>
          <p><strong>סה״כ:</strong> ${order.total} ₪</p>
          <p><strong>פריטים:</strong></p>
          <ul>
            ${order.items.map(item => `<li>${item.title} × ${item.qty}</li>`).join('')}
          </ul>
        </div>
      `;
    });
  
    listEl.innerHTML = html;
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const btnOrders = document.getElementById("nav-orders");
    const ordersModal = document.getElementById("orders-modal");
    const ordersClose = document.getElementById("orders-close");
  
    // הצגת הכפתור "ההזמנות שלי" אם יש משתמש מחובר
    const sess = getSession?.();
    if (sess) {
      btnOrders.style.display = "inline-block";
    }
  
    btnOrders.addEventListener("click", openOrdersModal);
    ordersClose.addEventListener("click", () => {
      ordersModal.classList.remove("show");
    });
  });
  
  async function openOrdersModal() {
    const sess = getSession?.();
    if (!sess) { alert("צריך להתחבר כדי לראות הזמנות"); return; }
  
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "<p>טוען הזמנות...</p>";
  
    const doc = await retrieveUsers();
    const user = doc.users.find(u => u.id === sess.id);
  
    const fmtDate = iso => new Date(iso).toLocaleDateString('he-IL');
    const fmtMoney = n => Number(n || 0).toLocaleString('he-IL', {style:'currency', currency:'ILS'});
  
    const orders = (user?.orders || []).slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
    if (!orders.length) {
      ordersList.innerHTML = "<p>אין הזמנות להצגה.</p>";
    } else {
      ordersList.innerHTML = orders.map(o => {
        const itemsHtml = (o.items || []).map(it => `
          <div class="order-item">
            <img src="${it.thumbnail || ''}" alt="${it.title || ''}">
            <div class="oi-title">${it.title || ''}</div>
            <div class="oi-qty">×${it.quantity || 1}</div>
            <div class="oi-price">${fmtMoney((it.price||0) * (it.quantity||1))}</div>
          </div>
        `).join('');
  
        return `
          <div class="order-card">
            <div class="order-head">
              <div class="order-id">הזמנה #${o.id}</div>
              <div class="order-date">${fmtDate(o.date)}</div>
            </div>
            <div class="order-items">${itemsHtml}</div>
            <div class="order-total">סה״כ: ${fmtMoney(o.total)}</div>
          </div>
        `;
      }).join('');
    }
  
    document.getElementById("orders-modal").classList.add("show");
  }

  document.getElementById('logo').addEventListener('click', (e) => {
    e.preventDefault(); // מונע טעינה מחדש של הדף
    showPage('home');
  });

  // טוען נתונים לשתי השורות בעמוד הבית
function loadHomeRows(){
    // "מבצעי היום" – ניקח מוצרים ונמיין לפי הנחה אם יש, או סתם חיתוך
    fetch('https://dummyjson.com/products?limit=20')
      .then(r => r.json())
      .then(({products}) => {
        const deals = [...products].slice(0, 10);        // אפשר לשנות לוגיקה
        mountCarousel('daily-deals', deals);
      })
      .catch(console.error);
  
    // "Best Sellers" – כאן לצורך הדמו נשתמש בקבוצה אחרת
    fetch('https://dummyjson.com/products?limit=20&skip=10')
      .then(r => r.json())
      .then(({products}) => {
        const best = [...products].slice(0, 10);
        mountCarousel('best-sellers', best);
      })
      .catch(console.error);
  }
  
  function mountCarousel(containerId, products){
    const host = document.getElementById(containerId);
    if (!host) return;
    host.innerHTML = '';
  
    // עוטפים במסילה
    const track = document.createElement('div');
    track.className = 'carousel-track';
  
    // מייצרים כרטיסים
    const firstRun = document.createDocumentFragment();
    products.forEach(p => firstRun.appendChild(buildProductCard(p)));
    track.appendChild(firstRun);
  
    // שכפול 1:1 – כדי ש-translateX(-50%) ייצור לופ חלק בלי "חור"
    const clone = track.cloneNode(true);
    // לוקחים רק את הילדים (לא את המסילה עצמה)
    while (clone.firstChild) {
      const dupChild = clone.firstChild;
      dupChild.setAttribute('aria-hidden', 'true'); // לא נגישותית
      track.appendChild(dupChild);
    }
  
    host.appendChild(track);
  }
  
  
  


  
  