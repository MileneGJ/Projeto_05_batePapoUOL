let nomeObj = {}
let mensagem = {
    from:"",
    to:"",
    text:"",
    type:""
}
function entrarNaSala() {
    const nome = document.querySelector(".tela-entrada input").value;
    nomeObj = { name: nome };
    let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', nomeObj);
    promise.then(aparecerChat);
    promise.catch(tratarErro);
    document.querySelector(".tela-entrada input").value="";
}

function aparecerChat() {
    document.querySelector(".tela-entrada").classList.add("escondido");
    let IDinterval = setInterval(manterStatus, 4000);
    let IDinterval2 = setInterval(refrescarChat,3000);
}
function tratarErro(erro) {
    let codigo = erro.response.status;
    if (codigo === 400) {
        alert("Já existe um usuário online com esse nome.\nPor favor escolha outro nome.");
    }
}
function atualizarPagina(){
    window.location.reload();
}
function manterStatus() {
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status', nomeObj);
}
function refrescarChat() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(renderizarMsgs);
}
function renderizarMsgs(response) {
    let MsgPrevia = document.querySelector(".container > div:last-child > p");
    let chat = document.querySelector(".container");
    chat.innerHTML = "";
    for (let i = 0; i < response.data.length; i++) {
        let complemento = "";
        if (response.data[i].type === "message") {
            complemento = `para <strong>${response.data[i].to}</strong>:`;
        }
        if (response.data[i].type === "private_message") {
            complemento = `reservadamente para <strong>${response.data[i].to}</strong>:`;
        }
        chat.innerHTML += `<div class="${response.data[i].type}">
    <p class="tempo">(${response.data[i].time})</p> 
    <p>  <strong>${response.data[i].from}</strong> ${complemento} ${response.data[i].text}</p>        
</div>`
    }
    let MsgNova = document.querySelector(".container > div:last-child > p");
    if(MsgPrevia===null){
        MsgNova.scrollIntoView();
    }else if(MsgNova.innerHTML!==MsgPrevia.innerHTML){
        MsgNova.scrollIntoView();
    }
}
function enviarMensagem() {
    const conteudo = document.querySelector(".rodape input").value;
mensagem.from=nomeObj.name;
if(mensagem.to===""){mensagem.to="Todos"}
mensagem.text=conteudo;
if(mensagem.type===""){mensagem.type="message"}
let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', mensagem);
    promise.then(refrescarChat);
    promise.catch(atualizarPagina);
    document.querySelector(".rodape input").value="";
}
function aparecerMenu(){
    document.querySelector(".caixa-menu").classList.remove("escondido");
}
function desaparecerMenu(){
    document.querySelector(".caixa-menu").classList.add("escondido");
}

function selecionarContato(element){
    let listaContatos = document.querySelectorAll(".contatos .check");
    for(let i=0;i<listaContatos.length;i++){
    listaContatos[i].classList.add("escondido");
    }
    element.querySelector(".check").classList.remove("escondido");
    let novoContato = element.querySelector("p").innerHTML;
    mensagem.to=novoContato
}

function selecionarVisib(element){
    let listaVisib = document.querySelectorAll(".visibilidade .check");
    for(let i=0;i<listaVisib.length;i++){
        listaVisib[i].classList.add("escondido");
        }
        element.querySelector(".check").classList.remove("escondido");
        let novaVisib = element.querySelector("p").innerHTML;
        if(novaVisib==="Reservadamente"){mensagem.type="private_message"}
        if(novaVisib==="Público"){mensagem.type="message"}
    }