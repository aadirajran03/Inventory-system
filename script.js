const loginForm=document.getElementById('login-form');
const loginScreen=document.getElementById('login-screen');
const app=document.getElementById('app');
loginForm.addEventListener('submit',e=>{
  e.preventDefault();
  const u=document.getElementById('login-user').value.trim();
  const p=document.getElementById('login-pass').value.trim();
  if(u==='admin'&&p==='1234'){
    loginScreen.style.display='none';
    app.style.display='block';
    load();
  } else alert('Invalid credentials');
});
document.getElementById('btn-logout').onclick=()=>{
  app.style.display='none';
  loginScreen.style.display='flex';
};

let data=[];let editIndex=-1;let chart=null;

function save(){localStorage.setItem('inv-data',JSON.stringify(data));render();}
function load(){
  const s=localStorage.getItem('inv-data');
  if(s){ 
    data=JSON.parse(s);
  } else {
    // ✅ Add some default sample data on first load
    data=[
      {name:"Milk Pack",sku:"MLK001",qty:12,price:25.50,notes:"Dairy product"},
      {name:"Bread Loaf",sku:"BRD002",qty:8,price:15.00,notes:"Bakery"},
      {name:"Rice Bag",sku:"RCE003",qty:5,price:480.00,notes:"5kg pack"},
      {name:"Soap Bar",sku:"SOP004",qty:20,price:35.00,notes:"Toiletry"},
      {name:"Shampoo Bottle",sku:"SHP005",qty:3,price:120.00,notes:"Cosmetic"}
    ];
    save();
  }
  render();
}

const form=document.getElementById('item-form');
form.onsubmit=e=>{
  e.preventDefault();
  const item={
    name:name.value,
    sku:sku.value,
    qty:+qty.value,
    price:+price.value,
    notes:notes.value
  };
  if(editIndex>=0){data[editIndex]=item;editIndex=-1;}
  else data.push(item);
  form.reset();
  save();
};

function updateSummary(){
  let items=data.length;
  let qty=data.reduce((a,b)=>a+b.qty,0);
  let value=data.reduce((a,b)=>a+(b.qty*b.price),0);
  document.getElementById('sum-items').textContent=items;
  document.getElementById('sum-qty').textContent=qty;
  document.getElementById('sum-value').textContent='$'+value.toFixed(2);
}

function render(){
  const tbody=document.querySelector('#tbl tbody');
  tbody.innerHTML='';
  let q=document.getElementById('search').value.toLowerCase();
  let low=document.getElementById('lowstock').checked;
  data.forEach((it,i)=>{
    if((q && !(it.name.toLowerCase().includes(q)||it.sku.toLowerCase().includes(q))) || (low && it.qty>5)) return;
    let tr=document.createElement('tr');
    if(it.qty<=5) tr.style.background='#ffe5e5';
    tr.innerHTML=`<td><b>${it.name}</b><div class=small>${it.sku}</div></td>
    <td>${it.qty} <button onclick='chg(${i},1)'>+</button><button onclick='chg(${i},-1)'>-</button></td>
    <td>$${it.price.toFixed(2)}</td>
    <td>
      <button onclick='edit(${i})'>Edit</button>
      <button onclick='del(${i})'>Del</button>
      <button onclick='qr(${i})'>QR</button>
    </td>`;
    tbody.appendChild(tr);
  });
  updateSummary();
  drawChart();
}

function chg(i,d){data[i].qty=Math.max(0,data[i].qty+d);save();}
function edit(i){
  const it=data[i];
  name.value=it.name;
  sku.value=it.sku;
  qty.value=it.qty;
  price.value=it.price;
  notes.value=it.notes;
  editIndex=i;
}
function del(i){if(confirm('Delete?')){data.splice(i,1);save();}}

function qr(i){
  const it=data[i];
  const content=`${it.name} | SKU:${it.sku} | Qty:${it.qty} | Price:$${it.price}`;
  const url=`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(content)}`;
  document.getElementById('qr-img').src=url;
  document.getElementById('qr-title').textContent=it.name;
  document.getElementById('qr-modal').style.display='flex';
}
document.getElementById('qr-close').onclick=()=>document.getElementById('qr-modal').style.display='none';

document.getElementById('search').oninput=render;
document.getElementById('lowstock').onchange=render;

document.getElementById('btn-export').onclick=()=>{
  const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='inventory.json';
  a.click();
};
document.getElementById('import-file').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    data=JSON.parse(r.result);
    save();
  };
  r.readAsText(f);
};

// Dark mode toggle
document.getElementById('toggle-dark').onclick=()=>document.body.classList.toggle('dark');
// Download QR
document.getElementById('qr-download').onclick=()=>{
  const img=document.getElementById('qr-img');
  const a=document.createElement('a');
  a.href=img.src;
  a.download=`qr_${document.getElementById('qr-title').textContent}.png`;
  a.click();
};

// Chart.js
function drawChart(){
  const ctx=document.getElementById('stockChart').getContext('2d');
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:'bar',
    data:{
      labels:data.map(x=>x.name),
      datasets:[{label:'Stock',data:data.map(x=>x.qty),backgroundColor:'#0077cc'}]
    },
    options:{responsive:true,plugins:{legend:{display:false}}}
  });
}

