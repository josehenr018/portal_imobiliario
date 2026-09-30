export const StatusVisita=Object.freeze({PENDENTE:'Pendente',CONFIRMADA:'Confirmada',REALIZADA:'Realizada',CANCELADA:'Cancelada'});
export class Simulacao {
 constructor({clienteId,renda,idade,entrada,portfolio,fator=.0082}){this.id=crypto.randomUUID();this.clienteId=clienteId;this.data=new Date().toISOString();this.renda=Number(renda);this.idade=Number(idade);this.entrada=Number(entrada);this.capacidade=0;this.imoveisEncontrados=[];this.calcularCapacidade(fator);this.imoveisEncontrados=portfolio.filter(i=>i.isDisponivel()&&i.preco<=this.capacidade);}
 calcularCapacidade(fator){if(this.idade<18||this.idade>70)throw new Error('A simulação exige idade entre 18 e 70 anos.');if(this.renda<=0||this.entrada<0)throw new Error('Informe renda positiva e entrada válida.');this.capacidade=(this.renda*.30/fator)+Math.min(this.entrada,Number.MAX_SAFE_INTEGER);}
}
export class Agendamento {
 constructor({clienteId,corretorId,imovelId,dataVisita}){this.id=crypto.randomUUID();Object.assign(this,{clienteId,corretorId,imovelId,dataVisita,status:StatusVisita.PENDENTE,motivo:''});this.dataSolicitacao=new Date().toISOString();}
 confirmar(){if(this.status!==StatusVisita.PENDENTE)throw new Error('Somente solicitações pendentes podem ser confirmadas.');this.status=StatusVisita.CONFIRMADA;}
 realizar(){if(this.status!==StatusVisita.CONFIRMADA)throw new Error('A visita precisa estar confirmada.');this.status=StatusVisita.REALIZADA;}
 cancelar(motivo){if([StatusVisita.REALIZADA,StatusVisita.CANCELADA].includes(this.status))throw new Error('Este agendamento já foi encerrado.');this.motivo=motivo||'Não informado';this.status=StatusVisita.CANCELADA;}
 reagendar(data){if(this.status!==StatusVisita.PENDENTE&&this.status!==StatusVisita.CONFIRMADA)throw new Error('Agendamento não pode ser reagendado.');this.dataVisita=data;this.status=StatusVisita.PENDENTE;}
}
export class Favorito {constructor(clienteId,imovelId){Object.assign(this,{id:crypto.randomUUID(),clienteId,imovelId,dataAdicao:new Date().toISOString()});}}
export class Notificacao {constructor(usuarioId,titulo,mensagem,tipo='SISTEMA'){Object.assign(this,{id:crypto.randomUUID(),usuarioId,titulo,mensagem,tipo,lida:false,dataEnvio:new Date().toISOString()});}marcarComoLida(){this.lida=true;}}
