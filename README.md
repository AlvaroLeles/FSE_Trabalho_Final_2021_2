# FSE-Trabalho Final - 2021-2_AlineLermen_AlvaroGuimaraes



## Alunos

- Aline Helena Lermen - 180011961
- Álvaro Leles Guimarães - 180096991

## Nome
Trabalho Final de Fundamentos de Sistemas Embarcados (2021/2)

## Descrição
Projeto que smimula um sistema de Automação Residencial utilizando um computador como sistema computacional central e microcontroladores ESP32 como dispositivos distribuídos, interconectados via Wifi através do protocolo MQTT.

Projeto referente ao Trabalho Final da matéria "Fundamentos de Sistemas Embarcados" da Universidade de Brasília.

O enunciado deste trabalho pode ser encontrado em https://gitlab.com/fse_fga/trabalhos-2021_2/trabalho-final-2021-2

### Informações técnicas
* Para a comunicação via MQTT foi utilizado o host **broker.hivemq.com**.

* A versão do framework ESP-IDF utilizada foi a **v5.0**.

## Processo de compilação
Deve-se primeiro executar o servidor central antes de executar o(s) servidor(es) distribuído(s)

### Execução do servidor CENTRAL
Deve-se executar o arquivo "**interface.html**" que se encontra na pasta "servidorCentral", pode-se utilizar o browser de sua preferência.

### Execução do servidor DISTRIBUÍDO
Para executar o servidor distribuído basta executar os seguintes comandos no terminando estando na pasta "clienteESP" deste repositório:

* Limpa dados da esp:
```
idf.py -p /dev/ttyUSB0 erase_flash
```

* Abre o menu de configurações da esp:
```
idf.py menuconfig
```
* Neste passo deve-se acessar a opção 'Configuração do Wifi' e inserir suas informações de nome de wifi e senha do wifi
* Depois basta pressionar as teclas 'Q' e depois 'Y' para salvar as mudanças

* Por fim, execute o seguinte comando para iniciar o servidor distribuído:
```
idf.py -p /dev/ttyUSB0 flash monitor
```

## Uso
A demonstração de como utilizar o sistema pode ser acessada em:
https://youtu.be/7a93Bbhn_kk