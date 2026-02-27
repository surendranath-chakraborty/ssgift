/**
 * SS GIFT — Admin Module
 * Fixed: orders rendering, responsive mobile, image crop
 */
const Admin = (() => {
  let _editId   = null;
  let _cropData = null;
  let _croppedImageB64 = null;

  /* ════════════════════════════════
     SECTION SWITCHING
     ════════════════════════════════ */
  const switchSection = (sec) => {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`adm-${sec}`)?.classList.add('active');
    document.querySelectorAll('.admin-menu a').forEach(a =>
      a.classList.toggle('active', a.dataset.sec === sec));
    document.querySelectorAll('.admin-tab-nav__item').forEach(b =>
      b.classList.toggle('active', b.dataset.sec === sec));
    const map = {
      dashboard: renderDashboard,
      products:  renderProducts,
      orders:    renderOrders,
      users:     renderUsers,
      coupons:   renderCoupons,
    };
    if (map[sec]) requestAnimationFrame(() => map[sec]());
  };

  /* ════════════════════════════════
     DASHBOARD
     ════════════════════════════════ */
  const renderDashboard = () => {
    const prods   = Store.getProducts();
    const orders  = Store.getOrders();
    const users   = Store.getUsers();
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

    const statsEl = document.getElementById('adminStats');
    if (statsEl) {
      statsEl.innerHTML = [
        { icon:'🎁', val: prods.length,   label:'Products' },
        { icon:'📦', val: orders.length,  label:'Orders'   },
        { icon:'👥', val: users.length,   label:'Users'    },
        { icon:'💰', val:`₹${revenue}`,  label:'Revenue'  },
      ].map(s => `
        <div class="stat-card fade-up">
          <div class="stat-card__icon">${s.icon}</div>
          <div class="stat-card__val">${s.val}</div>
          <div class="stat-card__label">${s.label}</div>
        </div>`).join('');
    }

    const tbody = document.getElementById('recentOrdersBody');
    if (tbody) {
      const recent = orders.slice(0, 5);
      tbody.innerHTML = recent.length
        ? recent.map(o => `
            <tr>
              <td><strong>#${o.id}</strong></td>
              <td>${o.customer || '—'}</td>
              <td>₹${o.total || 0}</td>
              <td><span class="badge-status badge-${(o.status||'processing').toLowerCase()}">${o.status || 'Processing'}</span></td>
              <td>${o.date || '—'}</td>
            </tr>`).join('')
        : `<tr><td colspan="5" style="text-align:center;color:var(--color-muted);padding:2rem">No orders yet</td></tr>`;
    }
  };

  /* ════════════════════════════════
     PRODUCTS
     ════════════════════════════════ */
  const _thumbHtml = (p) => {
    if (p.image) return `<div class="prod-thumb"><img src="${p.image}" alt="${p.name}"/></div>`;
    return `<div class="prod-thumb">${p.emoji}</div>`;
  };

  const renderProducts = () => {
    const q     = document.getElementById('admProdSearch')?.value?.toLowerCase() || '';
    const prods = Store.getProducts().filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
    const tbody = document.getElementById('adminProductsBody');
    if (!tbody) return;
    tbody.innerHTML = prods.map(p => `
      <tr>
        <td>${_thumbHtml(p)}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.cat}</td>
        <td>₹${p.price} <span style="text-decoration:line-through;color:var(--color-muted);font-size:var(--text-xs)">₹${p.original}</span></td>
        <td>${p.stock}</td>
        <td style="white-space:nowrap">
          <button class="action-btn action-btn--edit" onclick="Admin.openProductModal(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="action-btn action-btn--del"  onclick="Admin.deleteProduct(${p.id})"    title="Delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('') ||
      `<tr><td colspan="6" style="text-align:center;color:var(--color-muted);padding:2rem">No products found</td></tr>`;
  };

  /* ════════════════════════════════
     ORDERS — FIXED
     ════════════════════════════════ */
  const renderOrders = () => {
    const orders = Store.getOrders();
    const tbody  = document.getElementById('adminOrdersBody');
    if (!tbody) return;

    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--color-muted);padding:2rem">
        <div style="font-size:2rem;margin-bottom:.5rem">📦</div>
        No orders yet — orders appear here after customers checkout
      </td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong style="color:var(--color-rose)">#${o.id}</strong></td>
        <td>
          <div style="font-weight:600">${o.customer || '—'}</div>
          <div style="font-size:var(--text-xs);color:var(--color-muted)">${o.phone || ''}</div>
        </td>
        <td>
          <div style="font-size:var(--text-xs);color:var(--color-muted)">
            ${(o.items||[]).map(i => `${i.name} ×${i.qty}`).join('<br>')}
          </div>
        </td>
        <td><strong>₹${o.total || 0}</strong></td>
        <td>
          <select class="form-input" style="padding:.3rem .6rem;font-size:var(--text-xs);min-width:110px"
            onchange="Admin.updateOrderStatus('${o.id}',this.value)">
            ${['Processing','Shipped','Delivered','Cancelled'].map(s =>
              `<option value="${s}"${o.status===s?' selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td>
          <button class="action-btn action-btn--ok" onclick="Admin.notifyCustomer('${o.id}')" title="WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </button>
        </td>
      </tr>`).join('');
  };

  /* ════════════════════════════════
     USERS
     ════════════════════════════════ */
  const renderUsers = () => {
    const users = Store.getUsers();
    const tbody = document.getElementById('adminUsersBody');
    if (!tbody) return;
    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${u.email}">${u.email}</td>
        <td>${u.phone || '—'}</td>
        <td>${Store.getOrders().filter(o => o.userId === u.id).length}</td>
        <td><span class="badge-status ${u.blocked?'badge-blocked':'badge-active'}">${u.blocked?'Blocked':'Active'}</span></td>
        <td>
          <button class="action-btn ${u.blocked?'action-btn--ok':'action-btn--del'}"
            onclick="Admin.toggleUserBlock('${u.id}')">
            ${u.blocked?'Unblock':'Block'}
          </button>
        </td>
      </tr>`).join('') ||
      `<tr><td colspan="6" style="text-align:center;color:var(--color-muted);padding:2rem">No users yet</td></tr>`;
  };

  /* ════════════════════════════════
     COUPONS
     ════════════════════════════════ */
  const renderCoupons = () => {
    const coupons = Store.getCoupons();
    const tbody   = document.getElementById('adminCouponsBody');
    if (!tbody) return;
    tbody.innerHTML = coupons.map((c, i) => `
      <tr>
        <td><strong style="letter-spacing:.05em;font-family:monospace">${c.code}</strong></td>
        <td>${c.value}${c.type==='percent'?'%':' ₹'}</td>
        <td style="text-transform:capitalize">${c.type}</td>
        <td><span class="badge-status ${c.active?'badge-active':'badge-blocked'}">${c.active?'Active':'Inactive'}</span></td>
        <td style="white-space:nowrap">
          <button class="action-btn action-btn--edit" onclick="Admin.toggleCoupon(${i})">${c.active?'Deactivate':'Activate'}</button>
          <button class="action-btn action-btn--del"  onclick="Admin.deleteCoupon(${i})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('') ||
      `<tr><td colspan="5" style="text-align:center;color:var(--color-muted);padding:2rem">No coupons yet</td></tr>`;
  };

  /* ════════════════════════════════
     PRODUCT MODAL (with image crop)
     ════════════════════════════════ */
  const openProductModal = (id = null) => {
    _editId = id;
    _croppedImageB64 = null;
    const p    = id ? Store.getProductById(id) : null;
    const cats = CATEGORIES.map(c => c.name);

    const currentImgHtml = p ? `
      <div class="img-current-preview" id="currentImgPreview">
        ${p.image
          ? `<img src="${p.image}" alt="current" style="width:56px;height:56px;border-radius:var(--r-sm);object-fit:cover"/>`
          : `<div style="width:56px;height:56px;border-radius:var(--r-sm);background:var(--card-grad);display:flex;align-items:center;justify-content:center;font-size:2rem">${p.emoji}</div>`}
        <div style="flex:1">
          <div style="font-size:var(--text-xs);color:var(--color-muted)">Current image</div>
          <div style="font-weight:600;font-size:var(--text-sm)">${p.image ? 'Custom photo' : 'Emoji — ' + p.emoji}</div>
        </div>
        ${p.image ? `<button class="action-btn action-btn--del" onclick="Admin._removeCurrentImage()" title="Remove"><i class="fas fa-times"></i></button>` : ''}
      </div>` : '';

    Modal.open(id ? 'Edit Product' : 'Add New Product', `
      <div style="display:flex;flex-direction:column;gap:var(--s4)">
        <div class="form-grid">
          <div class="form-group">
            <label>Product Name *</label>
            <input class="form-input" type="text" id="mpName" placeholder="e.g. Love Letter Box" value="${p?p.name:''}"/>
          </div>
          <div class="form-group">
            <label>Emoji Icon</label>
            <input class="form-input" type="text" id="mpEmoji" placeholder="🎁" maxlength="2" value="${p?p.emoji:'🎁'}"/>
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select class="form-input" id="mpCat">
              ${cats.map(c=>`<option value="${c}"${p&&p.cat===c?' selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Price (₹) *</label>
            <input class="form-input" type="number" id="mpPrice" placeholder="499" value="${p?p.price:''}"/>
          </div>
          <div class="form-group">
            <label>Original Price (₹)</label>
            <input class="form-input" type="number" id="mpOriginal" placeholder="799" value="${p?p.original:''}"/>
          </div>
          <div class="form-group">
            <label>Stock</label>
            <input class="form-input" type="number" id="mpStock" placeholder="10" value="${p?p.stock:10}"/>
          </div>
          <div class="form-group form-group--full">
            <label>Description</label>
            <input class="form-input" type="text" id="mpDesc" placeholder="Short description…" value="${p?p.desc:''}"/>
          </div>
          <div class="form-group form-group--full">
            <label>Tags (comma separated)</label>
            <input class="form-input" type="text" id="mpTags" placeholder="gift, couple, romantic" value="${p?(p.tags||[]).join(', '):''}"/>
          </div>
        </div>

        <!-- Image Upload -->
        <div>
          <label style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-2);display:block;margin-bottom:var(--s2)">Product Image</label>
          ${currentImgHtml}
          <div class="img-upload-zone" id="imgUploadZone"
            ondragover="Admin._onDragOver(event)" ondragleave="Admin._onDragLeave(event)" ondrop="Admin._onDrop(event)">
            <input type="file" id="imgFileInput" accept="image/*" onchange="Admin._onFileSelect(event)"/>
            <div class="img-upload-zone__icon">📷</div>
            <div class="img-upload-zone__text">Click or drag photo here</div>
            <div class="img-upload-zone__sub">JPG, PNG, WebP — max 5MB</div>
          </div>

          <div id="cropEditor" style="display:none;margin-top:var(--s4)">
            <div style="font-size:var(--text-sm);font-weight:600;margin-bottom:var(--s3)">✂️ Crop &amp; Resize</div>
            <div style="margin-bottom:var(--s3)">
              <div style="font-size:var(--text-xs);color:var(--color-muted);margin-bottom:var(--s2)">ASPECT RATIO</div>
              <div class="crop-ratio-btns">
                <button class="crop-ratio-btn active" onclick="Admin._setAspect(1,this)">1:1 Square</button>
                <button class="crop-ratio-btn" onclick="Admin._setAspect(1.33,this)">4:3</button>
                <button class="crop-ratio-btn" onclick="Admin._setAspect(1.78,this)">16:9</button>
                <button class="crop-ratio-btn" onclick="Admin._setAspect(0.75,this)">3:4</button>
                <button class="crop-ratio-btn" onclick="Admin._setAspect(0,this)">Free</button>
              </div>
            </div>
            <div class="crop-wrap" id="cropWrap">
              <canvas id="cropCanvas" class="crop-canvas"></canvas>
            </div>
            <div class="crop-controls">
              <div class="crop-control-group">
                <label><i class="fas fa-search-plus"></i> Zoom</label>
                <input type="range" class="crop-slider" id="zoomSlider" min="0.1" max="3" step="0.01" value="1" oninput="Admin._onZoom(this.value)"/>
              </div>
              <div class="crop-control-group">
                <label><i class="fas fa-sync-alt"></i> Rotate</label>
                <input type="range" class="crop-slider" id="rotateSlider" min="-180" max="180" step="1" value="0" oninput="Admin._onRotate(this.value)"/>
              </div>
            </div>
            <div style="display:flex;gap:var(--s3);margin-top:var(--s3);flex-wrap:wrap;align-items:flex-end">
              <div class="form-group" style="flex:0 0 auto">
                <label>Width (px)</label>
                <input class="form-input" type="number" id="outWidth" value="600" style="width:90px;padding:.4rem .6rem"/>
              </div>
              <div class="form-group" style="flex:0 0 auto">
                <label>Height (px)</label>
                <input class="form-input" type="number" id="outHeight" value="600" style="width:90px;padding:.4rem .6rem"/>
              </div>
            </div>
            <div class="crop-action-btns">
              <button class="btn btn--primary btn--md" onclick="Admin._applyCrop()"><i class="fas fa-crop-alt"></i> Apply Crop</button>
              <button class="btn btn--outline btn--md" onclick="Admin._resetCrop()"><i class="fas fa-undo"></i> Reset</button>
              <button class="btn btn--ghost btn--md"   onclick="Admin._cancelCrop()"><i class="fas fa-times"></i> Cancel</button>
            </div>
            <div id="croppedPreview" style="display:none;margin-top:var(--s4)">
              <div style="font-size:var(--text-xs);color:var(--color-success);font-weight:600;margin-bottom:var(--s2)">✅ Crop applied — will save with product</div>
              <img id="croppedImg" style="max-width:160px;border-radius:var(--r-md);border:2px solid var(--color-success)"/>
            </div>
          </div>
        </div>

        <button class="btn btn--primary btn--full btn--lg" onclick="Admin.saveProduct()">
          <i class="fas fa-save"></i> ${id ? 'Update Product' : 'Add Product'}
        </button>
      </div>`);
  };

  /* ════════════════════════════════
     IMAGE CROP ENGINE
     ════════════════════════════════ */
  const _initCrop = () => {
    _cropData = { img:null, scale:1, rotation:0, aspect:1, panX:0, panY:0,
      dragging:false, lastX:0, lastY:0, resizing:false, resizeHandle:'',
      resizeStartX:0, resizeStartY:0, resizeCropStart:{},
      cropX:0, cropY:0, cropW:0, cropH:0, _panning:false };
  };
  const _onFileSelect = (e) => { const f = e.target.files[0]; if (f) _loadImageFile(f); };
  const _onDragOver   = (e) => { e.preventDefault(); document.getElementById('imgUploadZone')?.classList.add('drag-over'); };
  const _onDragLeave  = ()  => { document.getElementById('imgUploadZone')?.classList.remove('drag-over'); };
  const _onDrop       = (e) => { e.preventDefault(); _onDragLeave(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) _loadImageFile(f); };

  const _loadImageFile = (file) => {
    if (file.size > 5*1024*1024) { Toast.show('Image too large (max 5MB)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        _initCrop(); _cropData.img = img;
        document.getElementById('cropEditor').style.display    = 'block';
        document.getElementById('imgUploadZone').style.display = 'none';
        document.getElementById('croppedPreview').style.display= 'none';
        _croppedImageB64 = null;
        document.getElementById('zoomSlider').value   = 1;
        document.getElementById('rotateSlider').value = 0;
        document.querySelector('.crop-ratio-btn')?.classList.add('active');
        _setupCanvas(); _drawCrop();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const _setupCanvas = () => {
    const wrap = document.getElementById('cropWrap');
    const canvas = document.getElementById('cropCanvas');
    if (!wrap||!canvas||!_cropData?.img) return;
    const maxW = Math.min(wrap.offsetWidth||400, 500);
    const img = _cropData.img;
    canvas.width  = maxW;
    canvas.height = Math.min(maxW*(img.height/img.width), 360);
    _cropData.panX=0; _cropData.panY=0; _cropData.scale=1; _cropData.rotation=0;
    const asp = _cropData.aspect||1;
    const cW  = Math.min(canvas.width*0.8, canvas.height*asp*0.8);
    const cH  = asp===0 ? cW : cW/asp;
    _cropData.cropX=(canvas.width-cW)/2; _cropData.cropY=(canvas.height-cH)/2;
    _cropData.cropW=cW; _cropData.cropH=cH;
    _addCanvasEvents(canvas);
  };

  const _addCanvasEvents = (canvas) => {
    const c2 = canvas.cloneNode(false);
    canvas.parentNode.replaceChild(c2, canvas);
    const c = document.getElementById('cropCanvas');
    c.addEventListener('mousedown',  _onCanvasDown);
    window.addEventListener('mousemove', _onCanvasMove);
    window.addEventListener('mouseup',   _onCanvasUp);
    c.addEventListener('touchstart', _onTouchStart, {passive:false});
    window.addEventListener('touchmove',  _onTouchMove,  {passive:false});
    window.addEventListener('touchend',   _onTouchEnd);
  };

  const _getPos = (e, canvas) => {
    const r=canvas.getBoundingClientRect(), sx=canvas.width/r.width, sy=canvas.height/r.height;
    const cx=e.touches?e.touches[0].clientX:e.clientX, cy=e.touches?e.touches[0].clientY:e.clientY;
    return {x:(cx-r.left)*sx, y:(cy-r.top)*sy};
  };
  const _hitHandle = (px,py) => {
    const {cropX:x,cropY:y,cropW:w,cropH:h}=_cropData, hs=10;
    const handles={tl:{hx:x,hy:y},tr:{hx:x+w,hy:y},bl:{hx:x,hy:y+h},br:{hx:x+w,hy:y+h},
      tm:{hx:x+w/2,hy:y},bm:{hx:x+w/2,hy:y+h},ml:{hx:x,hy:y+h/2},mr:{hx:x+w,hy:y+h/2}};
    for(const[k,{hx,hy}]of Object.entries(handles)) if(Math.abs(px-hx)<hs&&Math.abs(py-hy)<hs) return k;
    return null;
  };
  const _inCropBox = (px,py) => {
    const{cropX:x,cropY:y,cropW:w,cropH:h}=_cropData;
    return px>=x&&px<=x+w&&py>=y&&py<=y+h;
  };
  const _onCanvasDown = (e) => {
    e.preventDefault();
    const c=document.getElementById('cropCanvas'), p=_getPos(e,c), h=_hitHandle(p.x,p.y);
    if(h){_cropData.resizing=true;_cropData.dragging=false;_cropData.resizeHandle=h;
      _cropData.resizeStartX=p.x;_cropData.resizeStartY=p.y;
      _cropData.resizeCropStart={x:_cropData.cropX,y:_cropData.cropY,w:_cropData.cropW,h:_cropData.cropH};}
    else if(_inCropBox(p.x,p.y)){_cropData.dragging=true;_cropData.resizing=false;_cropData.lastX=p.x;_cropData.lastY=p.y;}
    else{_cropData.dragging=false;_cropData.resizing=false;_cropData._panning=true;_cropData.lastX=p.x;_cropData.lastY=p.y;}
  };
  const _onCanvasMove = (e) => {
    const c=document.getElementById('cropCanvas'); if(!c||!_cropData) return;
    const p=_getPos(e,c);
    if(_cropData.resizing){
      const dx=p.x-_cropData.resizeStartX, dy=p.y-_cropData.resizeStartY, s=_cropData.resizeCropStart;
      const asp=_cropData.aspect; let{x,y,w,h}={x:s.x,y:s.y,w:s.w,h:s.h}; const hr=_cropData.resizeHandle;
      if(hr==='br'||hr==='bm') h=Math.max(30,s.h+dy);
      if(hr==='tr'||hr==='tm'){y=s.y+dy;h=Math.max(30,s.h-dy);}
      if(hr==='br'||hr==='mr') w=Math.max(30,s.w+dx);
      if(hr==='bl'||hr==='ml'){x=s.x+dx;w=Math.max(30,s.w-dx);}
      if(hr==='tl'){x=s.x+dx;y=s.y+dy;w=Math.max(30,s.w-dx);h=Math.max(30,s.h-dy);}
      if(asp&&asp!==0) h=w/asp;
      _cropData.cropX=x;_cropData.cropY=y;_cropData.cropW=w;_cropData.cropH=h; _drawCrop(); return;
    }
    if(_cropData.dragging){_cropData.cropX+=p.x-_cropData.lastX;_cropData.cropY+=p.y-_cropData.lastY;_cropData.lastX=p.x;_cropData.lastY=p.y;_drawCrop();return;}
    if(_cropData._panning){_cropData.panX+=p.x-_cropData.lastX;_cropData.panY+=p.y-_cropData.lastY;_cropData.lastX=p.x;_cropData.lastY=p.y;_drawCrop();}
    const h2=_hitHandle(p.x,p.y);
    const cur={tl:'nwse-resize',tr:'nesw-resize',bl:'nesw-resize',br:'nwse-resize',tm:'ns-resize',bm:'ns-resize',ml:'ew-resize',mr:'ew-resize'};
    c.style.cursor=h2?(cur[h2]||'crosshair'):_inCropBox(p.x,p.y)?'move':'crosshair';
  };
  const _onCanvasUp  = () => { if(_cropData){_cropData.dragging=false;_cropData.resizing=false;_cropData._panning=false;} };
  const _onTouchStart= (e) => { e.preventDefault(); _onCanvasDown(e); };
  const _onTouchMove = (e) => { e.preventDefault(); _onCanvasMove(e); };
  const _onTouchEnd  = ()  => _onCanvasUp();

  const _drawCrop = () => {
    const canvas=document.getElementById('cropCanvas'); if(!canvas||!_cropData?.img) return;
    const ctx=canvas.getContext('2d'), {img,scale,rotation,panX,panY,cropX,cropY,cropW,cropH}=_cropData;
    const W=canvas.width, H=canvas.height;
    ctx.clearRect(0,0,W,H);
    const drawW=H*(img.width/img.height)*scale, drawH=H*scale, cx=W/2+panX, cy=H/2+panY;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(rotation*Math.PI/180);
    ctx.drawImage(img,-drawW/2,-drawH/2,drawW,drawH); ctx.restore();
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);
    ctx.clearRect(cropX,cropY,cropW,cropH);
    ctx.save(); ctx.beginPath(); ctx.rect(cropX,cropY,cropW,cropH); ctx.clip();
    ctx.translate(cx,cy); ctx.rotate(rotation*Math.PI/180);
    ctx.drawImage(img,-drawW/2,-drawH/2,drawW,drawH); ctx.restore();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.strokeRect(cropX,cropY,cropW,cropH);
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=0.5;
    for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(cropX+cropW*i/3,cropY);ctx.lineTo(cropX+cropW*i/3,cropY+cropH);ctx.stroke();ctx.beginPath();ctx.moveTo(cropX,cropY+cropH*i/3);ctx.lineTo(cropX+cropW,cropY+cropH*i/3);ctx.stroke();}
    [[cropX,cropY],[cropX+cropW,cropY],[cropX,cropY+cropH],[cropX+cropW,cropY+cropH],[cropX+cropW/2,cropY],[cropX+cropW/2,cropY+cropH],[cropX,cropY+cropH/2],[cropX+cropW,cropY+cropH/2]].forEach(([hx,hy])=>{ctx.fillStyle='#fff';ctx.strokeStyle='#b5606a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(hx,hy,5,0,Math.PI*2);ctx.fill();ctx.stroke();});
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(cropX,cropY-22,90,20);
    ctx.fillStyle='#fff'; ctx.font='11px DM Sans,sans-serif';
    ctx.fillText(`${Math.round(cropW)} × ${Math.round(cropH)}`,cropX+6,cropY-7);
  };

  const _onZoom   = (v) => { if(_cropData){_cropData.scale=parseFloat(v);_drawCrop();} };
  const _onRotate = (v) => { if(_cropData){_cropData.rotation=parseFloat(v);_drawCrop();} };
  const _setAspect = (ratio, btn) => {
    document.querySelectorAll('.crop-ratio-btn').forEach(b=>b.classList.remove('active'));
    btn?.classList.add('active');
    if(!_cropData) return;
    _cropData.aspect=parseFloat(ratio)||0;
    if(_cropData.aspect&&_cropData.cropW) _cropData.cropH=_cropData.cropW/_cropData.aspect;
    _drawCrop();
  };
  const _applyCrop = () => {
    if(!_cropData?.img) return;
    const canvas=document.getElementById('cropCanvas');
    const outW=parseInt(document.getElementById('outWidth')?.value)||600;
    const outH=parseInt(document.getElementById('outHeight')?.value)||600;
    const{img,scale,rotation,panX,panY,cropX,cropY,cropW,cropH}=_cropData;
    const W=canvas.width, H=canvas.height;
    const out=document.createElement('canvas'); out.width=outW; out.height=outH;
    const ctx=out.getContext('2d');
    const drawW=H*(img.width/img.height)*scale, drawH=H*scale;
    ctx.save(); ctx.scale(outW/cropW,outH/cropH); ctx.translate(-cropX,-cropY);
    ctx.translate(W/2+panX,H/2+panY); ctx.rotate(rotation*Math.PI/180);
    ctx.drawImage(img,-drawW/2,-drawH/2,drawW,drawH); ctx.restore();
    _croppedImageB64=out.toDataURL('image/jpeg',0.88);
    const prev=document.getElementById('croppedPreview'), img2=document.getElementById('croppedImg');
    if(prev&&img2){img2.src=_croppedImageB64; prev.style.display='block';}
    Toast.show('Crop applied!','success');
  };
  const _resetCrop = () => {
    if(!_cropData?.img) return;
    document.getElementById('zoomSlider').value=1; document.getElementById('rotateSlider').value=0;
    _cropData.scale=1;_cropData.rotation=0;_cropData.panX=0;_cropData.panY=0;
    _setupCanvas(); _drawCrop(); _croppedImageB64=null;
    if(document.getElementById('croppedPreview')) document.getElementById('croppedPreview').style.display='none';
  };
  const _cancelCrop = () => {
    document.getElementById('cropEditor').style.display='none';
    document.getElementById('imgUploadZone').style.display='block';
    _croppedImageB64=null; _cropData=null;
    const fi=document.getElementById('imgFileInput'); if(fi) fi.value='';
  };
  const _removeCurrentImage = () => {
    document.getElementById('currentImgPreview')?.remove();
    _croppedImageB64='__remove__';
    Toast.show('Image will be removed when you save','info');
  };

  /* ════════════════════════════════
     SAVE PRODUCT
     ════════════════════════════════ */
  const saveProduct = () => {
    const name     = document.getElementById('mpName')?.value?.trim();
    const emoji    = document.getElementById('mpEmoji')?.value?.trim()||'🎁';
    const cat      = document.getElementById('mpCat')?.value;
    const price    = parseInt(document.getElementById('mpPrice')?.value||0);
    const original = parseInt(document.getElementById('mpOriginal')?.value||price);
    const stock    = parseInt(document.getElementById('mpStock')?.value||0);
    const desc     = document.getElementById('mpDesc')?.value?.trim()||'';
    const tags     = (document.getElementById('mpTags')?.value||'').split(',').map(t=>t.trim()).filter(Boolean);
    if(!name||!price){Toast.show('Name and price are required','error');return;}
    let products=Store.getProducts();
    const base={name,emoji,cat,price,original,stock,desc,tags};
    if(_croppedImageB64==='__remove__') base.image=null;
    else if(_croppedImageB64) base.image=_croppedImageB64;
    if(_editId){
      const idx=products.findIndex(p=>p.id===_editId);
      if(idx>=0) products[idx]={...products[idx],...base,...(_croppedImageB64!==null?{image:_croppedImageB64==='__remove__'?null:_croppedImageB64}:{})};
    } else {
      products.push({id:Date.now(),...base,image:_croppedImageB64||null,rating:5.0,reviews:0});
    }
    Store.setProducts(products); Modal.close(); renderProducts();
    _croppedImageB64=null; _cropData=null;
    Toast.show(_editId?'Product updated! ✅':'Product added! 🎁','success');
  };

  const deleteProduct = (id) => {
    if(!confirm('Delete this product permanently?')) return;
    Store.setProducts(Store.getProducts().filter(p=>p.id!==id));
    renderProducts(); Toast.show('Product deleted','info');
  };

  /* ════════════════════════════════
     COUPONS
     ════════════════════════════════ */
  const openCouponModal = () => {
    Modal.open('Add New Coupon',`
      <div class="form-grid">
        <div class="form-group">
          <label>Coupon Code *</label>
          <input class="form-input" type="text" id="mcCode" placeholder="LOVE10" style="text-transform:uppercase"/>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select class="form-input" id="mcType">
            <option value="percent">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        <div class="form-group form-group--full">
          <label>Value *</label>
          <input class="form-input" type="number" id="mcVal" placeholder="10 for 10% or ₹50"/>
        </div>
      </div>
      <button class="btn btn--primary btn--full btn--md" style="margin-top:var(--s6)" onclick="Admin.saveCoupon()">
        <i class="fas fa-tag"></i> Add Coupon
      </button>`);
  };
  const saveCoupon = () => {
    const code=document.getElementById('mcCode')?.value?.trim()?.toUpperCase();
    const type=document.getElementById('mcType')?.value;
    const value=parseInt(document.getElementById('mcVal')?.value||0);
    if(!code||!value){Toast.show('Please fill all fields','error');return;}
    const coupons=Store.getCoupons(); coupons.push({code,type,value,active:true});
    Store.setCoupons(coupons); Modal.close(); renderCoupons(); Toast.show('Coupon added!','success');
  };
  const toggleCoupon = (i) => {
    const c=Store.getCoupons(); c[i].active=!c[i].active; Store.setCoupons(c); renderCoupons();
    Toast.show(`Coupon ${c[i].active?'activated':'deactivated'}`,'info');
  };
  const deleteCoupon = (i) => {
    if(!confirm('Delete this coupon?')) return;
    const c=Store.getCoupons(); c.splice(i,1); Store.setCoupons(c); renderCoupons(); Toast.show('Coupon deleted','info');
  };

  /* ════════════════════════════════
     ORDER / USER ACTIONS
     ════════════════════════════════ */
  const updateOrderStatus = (id, status) => {
    const orders=Store.getOrders(), o=orders.find(x=>x.id===id);
    if(o){o.status=status;Store.setOrders(orders);Toast.show(`Order #${id} → ${status}`,'success');}
  };
  const notifyCustomer = (id) => {
    const o=Store.getOrders().find(x=>x.id===id); if(!o) return;
    const msg=`Dear ${o.customer},\n\nYour order *#${o.id}* from SS GIFT has been updated.\nStatus: *${o.status}* ✅\n\nThank you! 🎁\n— SS GIFT Team`;
    window.open(`https://wa.me/91${(o.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`);
  };
  const toggleUserBlock = (uid) => {
    const users=Store.getUsers(), u=users.find(x=>x.id===uid);
    if(u){u.blocked=!u.blocked;Store.setUsers(users);renderUsers();Toast.show(`User ${u.blocked?'blocked':'unblocked'}`,u.blocked?'warning':'success');}
  };

  return {
    switchSection,renderDashboard,renderProducts,renderOrders,renderUsers,renderCoupons,
    openProductModal,saveProduct,deleteProduct,
    openCouponModal,saveCoupon,toggleCoupon,deleteCoupon,
    updateOrderStatus,notifyCustomer,toggleUserBlock,
    _onFileSelect,_onDragOver,_onDragLeave,_onDrop,
    _onZoom,_onRotate,_setAspect,_applyCrop,_resetCrop,_cancelCrop,_removeCurrentImage,
  };
})();