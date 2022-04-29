var mqtt;

document.addEventListener("DOMContentLoaded", function(e) {
    conectaMQTT();
});

function conectaMQTT() {
    mqtt = new Paho.MQTT.Client("iot.eclipse.org", Number(8000), "/wss");
    var options = {
        timeout: 3,
        onSuccess: inscreveMQTT,
    };
    mqtt.onMessageArrived = recebeMensagem;
    mqtt.connect(options);
}

function inscreveMQTT() {
    mqtt.subscribe("fse2021/180096991/#");
    mqtt.subscribe("fse2021/180096991/dispositivos/#");
}

function recebeMensagem(msg) {
    let mensagem = msg.payloadString;
    console.log('mensagem: ',mensagem);
}