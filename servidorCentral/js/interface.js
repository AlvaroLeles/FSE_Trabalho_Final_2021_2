var mqtt;
var estadoAlarme = 0;

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
    mqtt.subscribe("fse2021/180096991/#");
    mqtt.subscribe("fse2021/180096991/dispositivos/#");
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
        trataMensagem(mensagem);
    }
}

function trataMensagem(mensagem) {
    // var selectBox = document.getElementById('esps');
    let selectBox = $("#esps")[0];
    for (let index = 0; index < selectBox.length; index++) {
        if (selectBox.options[index].text == mensagem) {
            return
        }        
    }
    selectBox.options.add(new Option(mensagem, mensagem));
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

    const topicoEstado = "fse2021/180096991/" + comodo + "/estado";

    enviaMensagem(topicoEstado, topico);

    adicionaDadoCsv(comodo, tipoDispositivo, "cadastra dispositivo")

    // var selectBox = document.getElementById('comodos');
    let selectBox = $("#comodos")[0];
    selectBox.options.add(new Option(idDispositivo, idDispositivo));
}

function desconectarDispositivo() {
    // const id = document.getElementsByName('esp-comodo')[0].value;
    const id = $('[name="esp-comodo"]')[0].value;

    $("#comodos option[value='"+ id.toString() + "']").remove();
    $("#esps option[value='"+ id.toString() + "']").remove();

    adicionaDadoCsv(" - ", " - ", "desconecta dispositivo")
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
        adicionaDadoCsv("banheiro", "lampada", "dispara alarme");
        let alarme = new Audio('somAlarme.mp3');
        alarme.play();
    }
}