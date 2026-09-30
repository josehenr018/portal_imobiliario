import {Imovel} from '../domain/Imovel.js';
import {Simulacao,Agendamento,Favorito,Notificacao,StatusVisita} from '../domain/Negocio.js';

export class LunarService {
 constructor(repo){this.repo=repo;this.portfolio=this.repo.obter().map(x=>new Imovel(x));if(!this.portfolio.length){this.portfolio=this.dadosDemo();this.persistir();}this.agendamentos=[];this.favoritos=[];this.notificacoes=[];this.historico=[];}

 dadosDemo(){const dados=[['Apartamento Aurora',180000,2,1,'Apartamento'],['Casa Jardim',320000,3,2,'Casa'],['Studio Central',145000,1,1,'Loft'],['Residencial Horizonte',450000,3,3,'Apartamento'],['Casa Ipê',275000,3,2,'Casa']];return dados.map((d,i)=>new Imovel({id:i+1,titulo:d[0],preco:d[1],quartos:d[2],banheiros:d[3],tipo:d[4],areaTotal:70+i*18,imagens:[`https://images.unsplash.com/photo-${['1560448204-e02f11c3d0e2','1564013799919-ab600027ffc6','1522708323590-d24dbb6b0267','1512917774080-9991f1c4c750','1449844908441-8829872d2607'][i]}?auto=format&fit=crop&w=900&q=80`,],endereco:{cidade:'Birigui',estado:'SP',bairro:'Centro',logradouro:'Rua Exemplo',numero:String(100+i)}}));}

 persistir(){this.repo.salvar(this.portfolio);}

 validarEntrada({entrada,imovel,percentual=0.8}){
   if(!imovel || typeof imovel.preco!=='number')throw new Error('Imóvel inválido para validar a entrada.');
   if(Number(entrada)<0)throw new Error('A entrada não pode ser negativa.');
   const limite=Math.round(imovel.preco * percentual);
   if(Number(entrada)>limite){
     throw new Error(`A entrada não pode superar 80% do valor do imóvel (${limite.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0})}).`);
   }
   return true;
 }

 simular(cliente,entrada){
   if(!cliente || !cliente.id)throw new Error('Cliente inválido para simulação.');
   if(!Number.isFinite(Number(cliente.rendaMensal))||Number(cliente.rendaMensal)<=0)throw new Error('A renda mensal deve ser positiva.');
   if(!Number.isFinite(Number(cliente.idade))||cliente.idade<18||cliente.idade>70)throw new Error('A simulação exige idade entre 18 e 70 anos.');
   const valorEntrada=Number(entrada)||0;
   const s=new Simulacao({clienteId:cliente.id,renda:cliente.rendaMensal,idade:cliente.idade,entrada:valorEntrada,portfolio:this.portfolio});
   s.imoveisEncontrados=s.imoveisEncontrados.filter(imovel=>{
     try{this.validarEntrada({entrada:valorEntrada,imovel,percentual:0.8});return true;}
     catch{return false;}
   });
   this.historico.push(s);
   return s;
 }

 favoritar(clienteId,imovelId){if(!this.favoritos.some(f=>f.clienteId===clienteId&&f.imovelId===imovelId))this.favoritos.push(new Favorito(clienteId,imovelId));}

 listarFavoritosCliente(clienteId){return this.favoritos.filter(f=>f.clienteId===clienteId).map(f=>this.portfolio.find(i=>i.id===f.imovelId)).filter(Boolean);}

 cadastrarImovel(dados={},corretorId=1){
   const entrada={
     id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `imovel-${Date.now()}-${Math.random().toString(16).slice(2)}`,
     titulo:dados.titulo||'Imóvel sem título',
     descricao:dados.descricao||'',
     preco:Number(dados.preco||0),
     areaTotal:Number(dados.areaTotal||0),
     quartos:Number(dados.quartos||0),
     banheiros:Number(dados.banheiros||0),
     tipo:dados.tipo||'Casa',
     status:dados.status||'Disponível',
     corretorId:Number(dados.corretorId ?? corretorId),
     imagens:dados.imagens||[],
     endereco:dados.endereco||{}
   };
   if(entrada.preco<=0)throw new Error('O preço do imóvel deve ser maior que zero.');
   const imovel=new Imovel(entrada);
   this.portfolio.unshift(imovel);
   this.persistir();
   return imovel;
 }

 confirmarAgendamento(agendamentoId){
   const agendamento=this.agendamentos.find(a=>a.id===agendamentoId);
   if(!agendamento)throw new Error('Agendamento não encontrado.');
   agendamento.confirmar();
   return agendamento;
 }

 editarImovel(imovelId,dados={}){
   const imovel=this.portfolio.find(item=>String(item.id)===String(imovelId));
   if(!imovel)throw new Error('Imóvel não encontrado para edição.');
   if(dados.titulo!==undefined&&String(dados.titulo).trim())imovel.titulo=String(dados.titulo).trim();
   if(dados.descricao!==undefined)imovel.descricao=String(dados.descricao).trim();
   if(dados.tipo!==undefined)imovel.tipo=String(dados.tipo).trim()||imovel.tipo;
   if(dados.quartos!==undefined)imovel.quartos=Number(dados.quartos);
   if(dados.banheiros!==undefined)imovel.banheiros=Number(dados.banheiros);
   if(dados.areaTotal!==undefined)imovel.areaTotal=Number(dados.areaTotal);
   if(dados.preco!==undefined)imovel.atualizarPreco(Number(dados.preco));
   if(dados.corretorId!==undefined)imovel.corretorId=Number(dados.corretorId);
   if(dados.status!==undefined)this.atualizarStatusImovel(imovel.id,dados.status);
   if(dados.endereco)Object.assign(imovel.endereco,dados.endereco);
   this.persistir();
   return imovel;
 }

 atualizarStatusImovel(imovelId,status){
   const imovel=this.portfolio.find(item=>String(item.id)===String(imovelId));
   if(!imovel)throw new Error('Imóvel não encontrado para alteração de status.');
   const valor=String(status).trim();
   if(valor==='Disponível'){
     if(imovel.status==='Vendido')throw new Error('Imóveis vendidos não podem ser reativados no protótipo.');
     imovel.status='Disponível';
     return imovel;
   }
   if(valor==='Inativo'){
     imovel.inativar();
     return imovel;
   }
   if(valor==='Vendido'){
     imovel.marcarComoVendido();
     return imovel;
   }
   throw new Error('Status inválido para imóvel.');
 }

 atualizarStatusVisita(agendamentoId,status){
   const agendamento=this.agendamentos.find(a=>a.id===agendamentoId);
   if(!agendamento)throw new Error('Agendamento não encontrado.');
   const transicoes={
     [StatusVisita.PENDENTE]:()=>agendamento.reagendar(agendamento.dataVisita),
     [StatusVisita.CONFIRMADA]:()=>agendamento.confirmar(),
     [StatusVisita.REALIZADA]:()=>agendamento.realizar(),
     [StatusVisita.CANCELADA]:()=>agendamento.cancelar('Cancelado pelo corretor.')
   };
   if(!transicoes[status])throw new Error('Status inválido para agendamento.');
   try{transicoes[status]();}catch(error){throw new Error(`Não foi possível atualizar o status para ${status}: ${error.message}`);}
   return agendamento;
 }

 listarVisitasCorretor(corretorId){
   return this.agendamentos.filter(a=>{
     const imovel=this.portfolio.find(i=>i.id===a.imovelId);
     return Boolean(imovel && imovel.corretorId===Number(corretorId));
   });
 }

 obterDashboard(perfil,userId='demo-cliente'){
   const totalImoveis=this.portfolio.length;
   const disponiveis=this.portfolio.filter(i=>i.isDisponivel()).length;
   const inativos=this.portfolio.filter(i=>i.status==='Inativo').length;
   const pendentes=this.agendamentos.filter(a=>['Pendente','Confirmada'].includes(a.status)).length;
   const realizadas=this.agendamentos.filter(a=>a.status==='Realizada').length;
   const totalFavoritos=this.favoritos.filter(f=>f.clienteId===userId).length;
   const totalSimulacoes=this.historico.filter(s=>s.clienteId===userId).length;
   const imoveisDoCorretor=this.portfolio.filter(i=>i.corretorId===Number(userId)).length;
   const visitasDoCorretor=this.agendamentos.filter(a=>{
     const imovel=this.portfolio.find(i=>i.id===a.imovelId);
     return Boolean(imovel && imovel.corretorId===Number(userId));
   }).length;

   if(perfil==='cliente'){
     return {totalImoveis,disponiveis,favoritos:totalFavoritos,simulacoes:totalSimulacoes,visitas:realizadas,pendentes};
   }
   if(perfil==='corretor'){
     return {totalImoveis:imoveisDoCorretor,disponiveis:this.portfolio.filter(i=>i.corretorId===Number(userId)&&i.isDisponivel()).length,visitas:visitasDoCorretor,pendentes:pendentes,simulacoes:totalSimulacoes};
   }
   return {totalImoveis,disponiveis,inativos,pendentes,visitas:realizadas,simulacoes:this.historico.length,favoritos:this.favoritos.length};
 }

 solicitarVisita(clienteId,imovel,data){if(!imovel.isDisponivel())throw new Error('Imóvel indisponível.');const ativos=this.agendamentos.filter(a=>a.clienteId===clienteId&&a.imovelId===imovel.id&&['Pendente','Confirmada'].includes(a.status));if(ativos.length>=3)throw new Error('Limite de 3 solicitações ativas para esta unidade.');const novaData=new Date(data).getTime();const recente=this.agendamentos.some(a=>a.clienteId===clienteId&&a.imovelId===imovel.id&&a.status!=='Cancelada'&&Math.abs(new Date(a.dataVisita).getTime()-novaData)<7*864e5);if(recente)throw new Error('Já existe visita aberta ou solicitada nos últimos 7 dias.');const a=new Agendamento({clienteId,corretorId:imovel.corretorId,imovelId:imovel.id,dataVisita:data});this.agendamentos.push(a);this.notificacoes.push(new Notificacao(clienteId,'Solicitação registrada',`Visita solicitada para ${imovel.titulo}.`,'AGENDAMENTO'));return a;}
}
