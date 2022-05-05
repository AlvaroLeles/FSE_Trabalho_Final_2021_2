var mqtt;
var estadoAlarme = 0;
var comodos = [];
var dispositivos = [];
var estadoDispositivo = 0;

$(function() {
    conectaMQTT();
});

function conectaMQTT() {
    mqtt = new Paho.MQTT.Client("broker.hivemq.com", Number(8000), "clientALG");

    mqtt.onConnectionLost = conexaoPerdida;
    mqtt.onMessageArrived = recebeMensagem;

    let options = {
        timeout: 3,
        onSuccess: inscreveMQTT,
    };
    mqtt.connect(options);
}

function conexaoPerdida(responseObject) {
    if (responseObject.errorCode !== 0)
        console.log("conexaoPerdida:" + responseObject.errorMessage);
}

function inscreveMQTT() {
    console.log("MQTT conectado");
    //mqtt.subscribe("testeALG")
    mqtt.subscribe("fse2021/180096991/dispositivos/#");
    mqtt.subscribe("fse2021/180096991/#");
}

function enviaMensagem(str, destination) {
    let msg = new Paho.MQTT.Message(str);
    msg.destinationName = destination;
    mqtt.send(msg);
}

function recebeMensagem(msg) {
    let mensagem = msg.payloadString;
    console.log("Mensagem:" + mensagem);
    if (!mensagem.includes("fse2021")) {
        if(!mensagem.includes("+") && mensagem.includes(":"))
            trataMensagemConfig(mensagem);
        else if (mensagem.includes("+"))
            trataMensagemEstado(mensagem);
    }
}

function trataMensagemConfig(mensagem) {
    let selectBox = $("#esps")[0];
    for (let index = 0; index < selectBox.length; index++) {
        if (selectBox.options[index].text == mensagem) {
            return
        }        
    }
    selectBox.options.add(new Option(mensagem, mensagem));
}

function trataMensagemEstado(mensagem) {
    const valor = mensagem.split("+");
    const idDispositivo = valor[0];
    const comodo = valor[2]
    estadoDispositivo = valor[1];
    let disp = dispositivos.find(d => d.id == idDispositivo);
    disp.estado = estadoDispositivo;

    // Remove Dispositivo
    dispositivos = $.grep(dispositivos, function(dispVez) {
        return dispVez.id != idDispositivo;
    });
    dispositivos.push(disp);
    populaDisps();
    console.log("Atualiza card: estadoDispositivo =", estadoDispositivo);
    let strLigaDesliga = estadoDispositivo === '1' ? 'liga dispositivo' : 'desliga dispositivo';
    adicionaDadoCsv(disp.comodo, disp.tipo, strLigaDesliga);

    if(estadoAlarme == 1 && disp.ativaAlarme === "y") {
        adicionaDadoCsv(disp.comodo, disp.tipo, "dispara alarme");
        tocaAlarme();
    }
}

function cadastrarDispositivo() {
    // const comodo = document.getElementsByName('room-name')[0].value;
    const comodo = $('[name="room-name"]')[0].value;
    // const tipoDispositivo = document.getElementsByName('output-name')[0].value;
    const tipoDispositivo = $('[name="output-name"]')[0].value;
    // const nomeDispositivo = document.getElementsByName('input-name')[0].value;
    const nomeDispositivo = $('[name="input-name"]')[0].value;
    // const ativaAlarme = document.getElementsByName('cbAtivaAlarme')[0].value;
    const ativaAlarme = $('#cbAtivaAlarme').is(":checked") === true ? 'y' : 'n';
    // const idDispositivo = document.getElementsByName('esp-id-name')[0].value;
    const idDispositivo = $('[name="esp-id-name"]')[0].value;
    const topico = "fse2021/180096991/dispositivos/" + idDispositivo;

    console.log("COMODO:", comodo);
    console.log("TIPO DISPOSITIVO:", tipoDispositivo);
    console.log("NOME:", nomeDispositivo);
    console.log("ATIVA ALARME:", ativaAlarme);

    // const topicoEstado = "fse2021/180096991/" + comodo + "/estado";

    enviaMensagem(comodo, topico);

    adicionaDadoCsv(comodo, tipoDispositivo, "cadastra dispositivo")

    // var selectBox = document.getElementById('comodos');
    let selectBoxDescDisp = $("#comodos")[0];
    selectBoxDescDisp.options.add(new Option(idDispositivo, idDispositivo));

    let selectBoxLigDes = $("#rooms")[0];
    selectBoxLigDes.options.add(new Option(idDispositivo, idDispositivo));

    let comodoExiste = comodos.find(cmd => cmd === comodo);
    if (comodoExiste === undefined)
        comodos.push(comodo);

    let dispositivo = {
        comodo: comodo,
        tipo: tipoDispositivo,
        nome: nomeDispositivo,
        ativaAlarme: ativaAlarme,
        id: idDispositivo,
        estado: '0'
    }

    dispositivos.push(dispositivo)

    populaDisps();
}

function desconectarDispositivo() {
    // const id = document.getElementsByName('esp-comodo')[0].value;
    const id = $('[name="esp-comodo"]')[0].value;

    let disp = dispositivos.find(d => d.id == id);

    $("#comodos option[value='"+ id.toString() + "']").remove();
    $("#esps option[value='"+ id.toString() + "']").remove();
    $("#rooms option[value='"+ id.toString() + "']").remove();

    adicionaDadoCsv(disp.comodo, disp.tipo, "desconecta dispositivo");

    dispositivos = $.grep(dispositivos, function(disp) {
        return disp.id != id;
    });

    populaDisps();
}

function toggleAlarme() {
    if (!estadoAlarme)
    {
        estadoAlarme = 1;
        $("#estadoAlarme").text("Ligado");
        adicionaDadoCsv(" - ", " - ", "ativa alarme");
    }
    else
    {
        estadoAlarme = 0;
        $("#estadoAlarme").text("Desligado");
        adicionaDadoCsv(" - ", " - ", "desativa alarme");
    }
}

function tocaAlarme()
{
    if (estadoAlarme)
    {
        let alarme = new Audio('somAlarme.mp3');
        alarme.play();
    }
}

function ligDesDisp()
{
    const idDispositivo = $('[name="comodo_nome"]')[0].value;
    const topico = "fse2021/180096991/dispositivos/" + idDispositivo;

    let disp = dispositivos.find(disp => disp.id == idDispositivo);

    let estadoEnviar = disp.estado === '1' ? '0' : '1';
    enviaMensagem(estadoEnviar, topico);

    // Remove Dispositivo
    dispositivos = $.grep(dispositivos, function(dispVez) {
        return dispVez.id != idDispositivo;
    });
    disp.estado = estadoEnviar;
    dispositivos.push(disp);
    populaDisps();

    let strLigaDesliga = estadoEnviar === '1' ? 'liga dispositivo' : 'desliga dispositivo';
    adicionaDadoCsv(disp.comodo, disp.tipo, strLigaDesliga);
}

function populaDisps()
{
    let divDisps = $("#disps")[0];
    divDisps.innerHTML = null;
    
    comodos.forEach(comodo => {
        let dispositivosComodo = dispositivos.filter(disp => disp.comodo === comodo);

        let htmlDispsComodo = "";

        dispositivosComodo.forEach(disp => {
            let htmlDispVez = `<div class="block">
                                    <p>Id: ${disp.id}</p>
                                    <p>Tipo: ${disp.tipo}</p>
                                    <p>Nome: ${disp.nome}</p>
                                    <p>Ativa alarme? ${disp.ativaAlarme === 'n' ? 'Não' : 'Sim'}</p>
                                    <p>Estado: ${disp.estado === '0' ? 'Desligado' : 'Ligado'}</p>
                                </div>`;
            htmlDispsComodo += htmlDispVez;
        });

        let comodoVez = `<div class="dispositivosConect" id="comodos">
                                <div class="dispositivosConect-title">
                                    <h3 id="local" class="title" name="local">${comodo}</h3>
                                    <h3 id="id_comodo" class="title">${comodo}</h3>
                                </div>
                                <div class="dispositivosConect-dados">
                                    ${htmlDispsComodo}
                                </div>
                            </div>`
        divDisps.innerHTML += comodoVez;
    })
}