
/*
const csvData = {
    data:,
    hora:,
    comodo:,
    dispositivo:,
    acao:
}
 */

var csvData = [{}]

function adicionaDadoCsv(comodo, dispositivo) {
    var dataHora = new Date();
    var data = dataHora.getDate() + '-' + (dataHora.getMonth()+1) + '-' + dataHora.getFullYear();
    var hora = dataHora.getHours() + "h" + dataHora.getMinutes() + "m" + dataHora.getSeconds() + "s";

    csvData.push({
        data: data,
        hora: hora,
        comodo: comodo,
        dispositivo: dispositivo,
        acao: "ligar alarme"
    })

}

function criaEBaixaCSV() {
    
    csvColunas = []
    const nomeColunas = ["data", "hora", "comodo", "dispositivo", "acao"];
    csvColunas.push(nomeColunas.join(','));

    csvData.forEach(element => {
        const valoresLinhas = Object.values(element).join(',');
        csvColunas.push(valoresLinhas)
    });

    data = csvColunas.join('\n')

    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', 'historico-acoes.csv');
    a.click()
}