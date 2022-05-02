var mqtt;
var estadoAlarme = 0;

$(function() {
    conectaMQTT();
});

function conectaMQTT() {
    mqtt = new Paho.MQTT.Client("broker.mqttdashboard.com", Number(8000), "clientALG");

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
    //trataMensagem(mensagem);
}

function trataMensagem(mensagem) {
    let mensagemJSON = JSON.parse(mensagem);
    console.log(mensagemJSON);
}

function toggleAlarme() {
    if (!estadoAlarme)
    {
        estadoAlarme = 1;
        $("#estadoAlarme").text("Ligado");
        tocaAlarme();
    }
    else
    {
        estadoAlarme = 0;
        $("#estadoAlarme").text("Desligado");
    }
    adicionaDadoCsv("banheiro", "lampada");
}

function tocaAlarme()
{
    if (estadoAlarme)
    {
        let alarme = new Audio('somAlarme.mp3');
        alarme.play();
    }
}