// Criando variáveis globais
let nomeUser = {}
let mensagem = {
    from: "",
    to: "",
    text: "",
    type: ""
}


// AÇÕES DA TELA DE ENTRADA


// Habilitando botões de entrada e mensagem para funcionar com Enter
const inputEntrada = document.querySelector(".tela-entrada input");
inputEntrada.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
        document.querySelector(".tela-entrada button").click();
    }
});
const inputMsg = document.querySelector(".rodape input");
inputMsg.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
        document.querySelector(".rodape ion-icon").click();
    }
});

// Para entrar na sala, mostrar imagem de 'Carregando' e enviar nome do usuário à API
function entrarNaSala() {
    let inputEntrada = document.querySelector(".tela-entrada input");
    const nome = inputEntrada.value;
    document.querySelector(".entrada").classList.add("escondido");
    document.querySelector(".carregando").classList.remove("escondido");
    nomeUser = { name: nome };
    let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', nomeUser);
    promise.then(aparecerChat);
    promise.catch(tratarErro);
    document.querySelector(".tela-entrada input").value = "";
}

// Caso nome do usuário seja enviado corretamente, esconder tela de entrada, mostrar chat e contatos e realizar as tarefas com repetições
function aparecerChat() {
    document.querySelector(".tela-entrada").classList.add("escondido");
    refrescarChat();
    atualizarContatos();
    let IDinterval = setInterval(manterStatus, 4000);
    let IDinterval2 = setInterval(refrescarChat, 3000);
    let IDinterval3 = setInterval(atualizarContatos, 10000);
}

// TRATAMENTO DO ERRO
// Caso nome do usuário não seja enviado corretamente, mostrar alerta de erro e voltar ao input inicial
function tratarErro(erro) {
    let codigo = erro.response.status;
    if (codigo === 400) {
        alert("Já existe um usuário online com esse nome.\nPor favor escolha outro nome.");
    }
    document.querySelector(".entrada").classList.remove("escondido");
    document.querySelector(".carregando").classList.add("escondido");

}


// TAREFAS QUE EXIGEM REPETIÇÃO

// Enviar nome do usuário para a seção de status
function manterStatus() {
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status', nomeUser);
}

// Obter conversa do chat mais recente
function refrescarChat() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(renderizarMsgs);
}

// Obter lista mais recente de contatos
function atualizarContatos() {
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    promise.then(renderizarContatos);
}


//AÇÕES DO CHAT


// Renderização das mensagens do chat obtidas na API
function renderizarMsgs(response) {

    // Guardar o horário em que a última mensagem foi enviada e limpar chat
    let MsgPrevia = document.querySelector(".container > div:last-child > p");
    let chat = document.querySelector(".container");
    chat.innerHTML = "";
    for (let i = 0; i < response.data.length; i++) {

        // Restringir visibilidade das mensagens privadas
        if (response.data[i].type === "private_message" &&
            (response.data[i].from !== nomeUser.name &&
                response.data[i].to !== nomeUser.name)) {
        } else {

            // Mudando texto conforme tipo de mensagem
            let complemento = "";
            if (response.data[i].type === "message") {
                complemento = `para <strong>${response.data[i].to}</strong>:`;
            }
            if (response.data[i].type === "private_message") {
                complemento = `reservadamente para <strong>${response.data[i].to}</strong>:`;
            }

            // Populando container
            chat.innerHTML += `<div class="${response.data[i].type}">
    <p class="tempo">(${response.data[i].time})</p> 
    <p>  <strong>${response.data[i].from}</strong> ${complemento} ${response.data[i].text}</p>        
</div>`
        }
    }

    // Obter novamente horário da última mensagem para comparar com o obtido antes de (re)popular o container
    let MsgNova = document.querySelector(".container > div:last-child > p");
    if (MsgPrevia === null) {
        MsgNova.scrollIntoView();

        // Caso haja uma mensagem nova com tempo diferente do anterior, então fazer o scroll automático
    } else if (MsgNova.innerHTML !== MsgPrevia.innerHTML) {
        MsgNova.scrollIntoView();
    }
}


// Enviar mensagem no chat
function enviarMensagem() {
    // Obter conteúdo do input de mensagem
    const conteudo = document.querySelector(".rodape input").value;
    // Não realizar ações caso o conteúdo seja nulo
    if (conteudo === null) { } else {

        // Preencher o objeto 'mensagem' com as informações atuais
        mensagem.from = nomeUser.name;
        if (mensagem.to === "") { mensagem.to = "Todos" }
        mensagem.text = conteudo;
        if (mensagem.type === "") { mensagem.type = "message" }

        //Enviar objeto 'mensagem' para fazer parte do chat
        let promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', mensagem);
        promise.then(refrescarChat);

        // Caso haja erro no envio da mensagem (provavelmente, usuário offline), refrescar página
        promise.catch(atualizarPagina);

        // Limpar campo de mensagem
        document.querySelector(".rodape input").value = "";
    }
}

// TRATAMENTO DE ERRO
// Refrescar página no caso de erro de envio de mensagem
function atualizarPagina() {
    window.location.reload();
}



// AÇÕES DO MENU LATERAL


// Renderização dos contatos na lista do menu lateral
function renderizarContatos(response) {

    // Buscar nome do contato que já estava selecionado para acrescentar a classe 'selecionado' ao (re)popular a lista
    let contatoSelect = document.querySelector(".contatos .selecionado");
    const nomeSelect = contatoSelect.parentNode.querySelector("p").innerHTML;
    let manterSelect = "";

    //O destinatário "Todos" é tratado e repopulado primeiro
    if (nomeSelect === "Todos") { manterSelect = " selecionado" }
    let contatos = document.querySelector(".contatos");
    contatos.innerHTML = `<div onclick="selecionarContato(this)">
<ion-icon name="people"></ion-icon>
<p>Todos</p>
<ion-icon class="check${manterSelect}" name="checkmark-outline"></ion-icon>
</div>`;

    // Tratamento e repopulação dos seguintes contatos da lista
    for (let i = 0; i < response.data.length; i++) {
        manterSelect = "";
        if (nomeSelect === response.data[i].name) { manterSelect = " selecionado" }
        contatos.innerHTML += `<div onclick="selecionarContato(this)">
<ion-icon name="person-circle"></ion-icon>
<p>${response.data[i].name}</p>
<ion-icon class="check${manterSelect}" name="checkmark-outline"></ion-icon>
</div>`
    }
}

// Ações de aparecer Menu ao clicar no ícone e desaparecer ao clicar no espaço vazio
function aparecerMenu() {
    atualizarContatos();
    document.querySelector(".caixa-menu").classList.remove("escondido");
}
function desaparecerMenu() {
    document.querySelector(".caixa-menu").classList.add("escondido");
}


// Modificar contato a quem enviar a mensagem
function selecionarContato(element) {
    // Limpar o contato selecionado previamente
    let ContatoAnterior = document.querySelector(".contatos .selecionado");
    ContatoAnterior.classList.remove("selecionado");

    // Selecionar o contato atual
    element.querySelector(".check").classList.add("selecionado");

    //Atualizar o objeto 'mensagem' e a descrição abaixo do input de mensagem
    let novoContato = element.querySelector("p").innerHTML;
    mensagem.to = novoContato;
    let descricao = document.querySelector(".rodape p");
    if (mensagem.to !== "Todos") {
        descricao.innerHTML = `Enviando para ${mensagem.to}`;
        if (mensagem.type === "private_message") {
            descricao.innerHTML += " (reservadamente)";
        }
    } else {
        descricao.innerHTML = " ";
    }
}

// Modificar a visibilidade da mensagem a ser enviada
function selecionarVisib(element) {
    // Limpar a seleção anterior
    let VisibAnterior = document.querySelector(".visibilidade .selecionado");
    VisibAnterior.classList.remove("selecionado");

    //Selecionar a visibilidade atual
    element.querySelector(".check").classList.add("selecionado");

    //Atualizar o objeto 'mensagem' e a descrição abaixo do input de mensagem
    let novaVisib = element.querySelector("p").innerHTML;
    let descricao = document.querySelector(".rodape p");
    if (novaVisib === "Reservadamente") {
        mensagem.type = "private_message";
        if (mensagem.to !== "Todos") {
            descricao.innerHTML += " (reservadamente)";
        }
    }
    if (novaVisib === "Público") {
        mensagem.type = "message";
        if (mensagem.to !== "Todos") {
            descricao.innerHTML = `Enviando para ${mensagem.to}`;
        }
    }
}