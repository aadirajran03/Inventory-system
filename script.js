const loginForm=document.getElementById('login-form');
const loginScreen=document.getElementById('login-screen');
const app=document.getElementById('app');
loginForm.addEventListener('submit',e=>{e.preventDefault();
  const u=document.getElementById('login-user').value.trim();
  const p=document.getElementById('login-pass').value.trim();
  if(u==='admin'&&p==='1234'){loginScreen.style.display='none';app.style.display='block';load();}
  else alert('Invalid credentials');
});
document.getElementById('btn-logout').onclick=()=>{app.style.display='none';loginScreen.style.display='flex';};

let data=[];let editIndex=-1;

function save(){localStorage.setItem('inv-data',JSON.stringify(data));render();}
function load(){const s=localStorage.getItem('inv-data');if(s)data=JSON.parse(s);render();}

const form=document.getElementById('item-form');
form.onsubmit=e=>{e.preventDefault();const item={name:name.value,sku:sku.value,qty:+qty.value,price:+price.value,notes:notes.value};
  if(editIndex>=0){data[editIndex]=item;editIndex=-1;}else data.push(item);form.reset();save();};

function render(){const tbody=document.querySelector('#tbl tbody');tbody.innerHTML='';
  let q=document.getElementById('search').value.toLowerCase();let low=document.getElementById('lowstock').checked;
  data.forEach((it,i)=>{if((q&&!(it.name.toLowerCase().includes(q)||it.sku.toLowerCase().includes(q)))||(low&&it.qty>5))return;
    let tr=document.createElement('tr');
    tr.innerHTML=`<td><b>${it.name}</b><div class=small>${it.sku}</div></td>
    <td>${it.qty} <button onclick='chg(${i},1)'>+</button><button onclick='chg(${i},-1)'>-</button></td>
    <td>$${it.price.toFixed(2)}</td>
    <td><button onclick='edit(${i})'>Edit</button><button onclick='del(${i})'>Del</button><button onclick='qr(${i})'>QR</button></td>`;
    tbody.appendChild(tr);
  });}

function chg(i,d){data[i].qty=Math.max(0,data[i].qty+d);save();}
function edit(i){const it=data[i];name.value=it.name;sku.value=it.sku;qty.value=it.qty;price.value=it.price;notes.value=it.notes;editIndex=i;}
function del(i){if(confirm('Delete?')){data.splice(i,1);save();}}

function qr(i){const it=data[i];const url=`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(it.name+'|'+it.sku)}`;
  document.getElementById('qr-img').src=url;document.getElementById('qr-title').textContent=it.name;document.getElementById('qr-modal').style.display='flex';}
document.getElementById('qr-close').onclick=()=>document.getElementById('qr-modal').style.display='none';

document.getElementById('search').oninput=render;document.getElementById('lowstock').onchange=render;

document.getElementById('btn-export').onclick=()=>{const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='inventory.json';a.click();};
document.getElementById('import-file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{data=JSON.parse(r.result);save();};r.readAsText(f);};
document.getElementById('btn-clear').onclick=()=>{if(confirm('Clear all?')){data=[];save();}};