#ifndef MQTT_H
#define MQTT_H

void mqtt_start();

void mqtt_inicia_cliente();
void mqtt_inscreve_cliente(char *topico);
void mqtt_envia_mensagem(char * topico, char * mensagem);

#endif
